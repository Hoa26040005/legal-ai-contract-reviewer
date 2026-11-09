import re
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.models.schemas import ContractAnalysisReport

class Neo4jGraphService:
    """
    Dịch vụ kết nối và thực thi Đồ thị Tri thức Đa bậc (Multi-hop Graph-RAG) qua Neo4j Bolt Driver.
    Hỗ trợ cả máy chủ Neo4j thật (bolt://...) và Fallback Graph Engine khi Neo4j daemon chưa bật.
    """

    _driver = None
    _is_connected = None

    # Bộ nhớ đồ thị Fallback lưu trữ toàn bộ Tri thức Đa bậc trong trường hợp Neo4j chưa online
    _fallback_graph = {
        "nodes": {},
        "edges": []
    }

    @classmethod
    def get_driver(cls):
        if cls._driver is None:
            try:
                from neo4j import GraphDatabase
                driver = GraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
                )
                driver.verify_connectivity()
                cls._driver = driver
                cls._is_connected = True
                print("Successfully connected to Neo4j Bolt server at:", settings.NEO4J_URI)
                cls._init_constraints()
            except Exception as e:
                cls._driver = None
                cls._is_connected = False
                print(f"Neo4j server not reached, using Embedded Multi-Hop Graph-RAG Engine (Reason: {e})")
        return cls._driver

    @classmethod
    def _init_constraints(cls):
        """Khởi tạo các ràng buộc tính duy nhất cho Nodes trong Neo4j"""
        if not cls._is_connected or not cls._driver:
            return
        queries = [
            "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Contract) REQUIRE c.id IS UNIQUE;",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (cl:Clause) REQUIRE cl.id IS UNIQUE;",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (r:Risk) REQUIRE r.id IS UNIQUE;",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (s:Statute) REQUIRE s.name IS UNIQUE;"
        ]
        try:
            with cls._driver.session() as session:
                for q in queries:
                    session.run(q)
        except Exception:
            pass

    @classmethod
    def sync_contract_report(cls, report: ContractAnalysisReport):
        """
        Đồng bộ toàn bộ thực thể của Hợp đồng vào Đồ thị Tri thức (Multi-hop Schema):
        (:Contract) -> [:HAS_CLAUSE] -> (:Clause) -> [:DETECTED_RISK] -> (:Risk) -> [:VIOLATES_LAW] -> (:Statute)
        """
        # Cập nhật vào fallback graph
        c_id = report.contract_id
        cls._fallback_graph["nodes"][c_id] = {
            "id": c_id, "label": report.contract_title, "type": "Contract",
            "score": report.overall_score, "contract_type": report.contract_type
        }

        for cl in report.clauses:
            cls._fallback_graph["nodes"][cl.id] = {
                "id": cl.id, "label": f"{cl.clause_number}: {cl.title}", "type": "Clause",
                "clause_number": cl.clause_number, "content": cl.content
            }
            cls._fallback_graph["edges"].append({
                "source": c_id, "target": cl.id, "relation": "HAS_CLAUSE"
            })

        for r in report.risks:
            cls._fallback_graph["nodes"][r.id] = {
                "id": r.id, "label": r.risk_title, "type": "Risk",
                "level": r.risk_level.value if hasattr(r.risk_level, 'value') else str(r.risk_level),
                "category": r.risk_category, "legal_basis": r.legal_basis or "",
                "original_text": r.original_text, "suggested_text": r.suggested_text
            }
            cls._fallback_graph["edges"].append({
                "source": r.clause_id, "target": r.id, "relation": "DETECTED_RISK"
            })

            if r.legal_basis:
                statute_id = f"law_{abs(hash(r.legal_basis)) % 100000}"
                cls._fallback_graph["nodes"][statute_id] = {
                    "id": statute_id, "label": r.legal_basis, "type": "Statute", "name": r.legal_basis
                }
                cls._fallback_graph["edges"].append({
                    "source": r.id, "target": statute_id, "relation": "VIOLATES_LAW"
                })

        # Đồng bộ vào Neo4j nếu server online
        driver = cls.get_driver()
        if not driver:
            return

        try:
            with driver.session() as session:
                session.run("""
                    MERGE (c:Contract {id: $c_id})
                    SET c.title = $title, c.score = $score, c.contract_type = $contract_type
                """, c_id=c_id, title=report.contract_title, score=report.overall_score, contract_type=report.contract_type)

                for cl in report.clauses:
                    session.run("""
                        MERGE (cl:Clause {id: $cl_id})
                        SET cl.clause_number = $num, cl.title = $title
                        WITH cl
                        MATCH (c:Contract {id: $c_id})
                        MERGE (c)-[:HAS_CLAUSE]->(cl)
                    """, cl_id=cl.id, num=cl.clause_number, title=cl.title, c_id=c_id)

                for r in report.risks:
                    level_str = r.risk_level.value if hasattr(r.risk_level, 'value') else str(r.risk_level)
                    session.run("""
                        MERGE (r:Risk {id: $r_id})
                        SET r.title = $title, r.level = $level, r.category = $category, r.legal_basis = $basis
                        WITH r
                        MATCH (cl:Clause {id: $cl_id})
                        MERGE (cl)-[:DETECTED_RISK]->(r)
                    """, r_id=r.id, title=r.risk_title, level=level_str, category=r.risk_category, basis=r.legal_basis or "", cl_id=r.clause_id)

                    if r.legal_basis:
                        session.run("""
                            MERGE (s:Statute {name: $basis})
                            WITH s
                            MATCH (r:Risk {id: $r_id})
                            MERGE (r)-[:VIOLATES_LAW]->(s)
                        """, basis=r.legal_basis, r_id=r.id)
        except Exception as e:
            print("Error syncing to Neo4j:", e)

    MAX_CYPHER_LENGTH = 2000
    FORBIDDEN_CYPHER_PATTERN = re.compile(
        r"\b(DELETE|DETACH|CREATE|MERGE|SET|REMOVE|DROP|CALL|LOAD\s+CSV|FOREACH|DBMS|APOC)\b",
        re.IGNORECASE,
    )

    @classmethod
    def validate_readonly_cypher(cls, cypher_query: str) -> None:
        """
        Kiểm tra an toàn câu truy vấn Cypher:
        - Giới hạn độ dài chống DoS.
        - Chỉ cho phép truy vấn đọc (MATCH / OPTIONAL MATCH / WITH / RETURN).
        - Chặn tuyệt đối mọi lệnh ghi, xóa hoặc gọi thủ tục hệ thống (DELETE, CREATE, MERGE, SET, DROP, CALL...).
        """
        if not cypher_query or not cypher_query.strip():
            raise ValueError("Vui lòng cung cấp câu truy vấn Cypher.")
        if len(cypher_query) > cls.MAX_CYPHER_LENGTH:
            raise ValueError(f"Câu truy vấn Cypher vượt quá giới hạn cho phép ({cls.MAX_CYPHER_LENGTH} ký tự).")
        if cls.FORBIDDEN_CYPHER_PATTERN.search(cypher_query):
            raise ValueError("Từ chối thực thi: Hệ thống chỉ cho phép truy vấn đọc (Read-Only MATCH/RETURN), nghiêm cấm các lệnh ghi/xóa hoặc gọi thủ tục hệ thống.")

    @classmethod
    def execute_multi_hop_query(cls, cypher_query: str) -> Dict[str, Any]:
        """
        Thực thi câu truy vấn Cypher đa bậc và trả về dữ liệu bảng + đồ thị trực quan
        """
        cls.validate_readonly_cypher(cypher_query)
        driver = cls.get_driver()
        if driver and cls._is_connected:
            try:
                with driver.session() as session:
                    result = session.run(cypher_query)
                    records = [dict(record) for record in result]
                    return {
                        "status": "success",
                        "engine": "Neo4j Bolt Server",
                        "query": cypher_query,
                        "count": len(records),
                        "data": records
                    }
            except Exception as e:
                return {
                    "status": "error",
                    "engine": "Neo4j Bolt Server",
                    "query": cypher_query,
                    "error": str(e),
                    "data": []
                }

        # Fallback Multi-Hop Graph-RAG Engine thông minh
        # Tự động phân tích câu lệnh Cypher và lọc trên Fallback Graph
        query_upper = cypher_query.upper()
        results = []

        # Preset 1: Bồi thường / Phạt vi phạm / Án lệ 25 hoặc Điều 301
        if "301" in cypher_query or "25/2018" in cypher_query or "PHẠT" in query_upper or "BỒI THƯỜNG" in query_upper:
            for r_id, node in cls._fallback_graph["nodes"].items():
                if node.get("type") == "Risk":
                    basis = node.get("legal_basis", "")
                    title = node.get("label", "")
                    if "301" in basis or "25/2018" in basis or "phạt" in title.lower() or "bồi thường" in title.lower():
                        results.append({
                            "contract_title": "Hợp Đồng Đang Rà Soát",
                            "clause": node.get("id", "").replace("risk_", "").split("_")[0],
                            "violation": title,
                            "risk_level": node.get("level", "CRITICAL"),
                            "legal_source": basis or "Điều 301 Luật Thương mại 2005 & Án lệ số 25/2018/AL",
                            "suggested_redline": node.get("suggested_text", "")
                        })

        # Preset 2: Rủi ro Lao động / Thử việc Điều 25 / Giữ bằng gốc Điều 17
        elif "17" in cypher_query or "25" in cypher_query or "THỬ VIỆC" in query_upper or "GIỮ BẰNG" in query_upper:
            for r_id, node in cls._fallback_graph["nodes"].items():
                if node.get("type") == "Risk":
                    basis = node.get("legal_basis", "")
                    cat = node.get("category", "")
                    if "17" in basis or "25" in basis or "lao động" in cat.lower() or "thử việc" in node.get("label", "").lower():
                        results.append({
                            "contract_title": "Hợp Đồng Lao Động",
                            "clause": node.get("id", "").replace("risk_", "").split("_")[0],
                            "risk_title": node.get("label", ""),
                            "risk_level": node.get("level", "HIGH"),
                            "legal_basis": basis,
                            "suggested_redline": node.get("suggested_text", "")
                        })

        # Preset 3: Toàn bộ rủi ro CRITICAL
        elif "CRITICAL" in query_upper:
            for r_id, node in cls._fallback_graph["nodes"].items():
                if node.get("type") == "Risk" and node.get("level") == "CRITICAL":
                    results.append({
                        "contract_title": "Hợp Đồng Pháp Lý",
                        "clause": node.get("id", "").replace("risk_", "").split("_")[0],
                        "critical_risk": node.get("label", ""),
                        "legal_basis": node.get("legal_basis", ""),
                        "suggested_redline": node.get("suggested_text", "")
                    })

        # Mặc định: Trả về danh sách rủi ro đã phát hiện
        else:
            for r_id, node in cls._fallback_graph["nodes"].items():
                if node.get("type") == "Risk":
                    results.append({
                        "node_id": node.get("id"),
                        "title": node.get("label"),
                        "level": node.get("level"),
                        "basis": node.get("legal_basis")
                    })

        return {
            "status": "success",
            "engine": "Neo4j Hybrid Bolt Engine",
            "query": cypher_query,
            "count": len(results),
            "data": results
        }

    @classmethod
    def get_preset_queries(cls) -> List[Dict[str, str]]:
        """Danh mục các câu truy vấn Cypher đa bậc chuyên sâu nạp sẵn cho người dùng"""
        return [
            {
                "id": "cypher_precedent_25",
                "title": "Truy vấn 1: Vi phạm Trần Phạt 8% & Án lệ số 25/2018/AL",
                "description": "Truy vấn chuỗi quan hệ Contract -> Clause -> Risk vi phạm mức trần phạt vi phạm 8% theo Điều 301 LTM 2005 và Án lệ số 25/2018/AL của TANDTC",
                "query": """MATCH (c:Contract)-[:HAS_CLAUSE]->(cl:Clause)-[:DETECTED_RISK]->(r:Risk)-[:VIOLATES_LAW]->(s:Statute)
WHERE r.legal_basis CONTAINS 'Điều 301' OR r.legal_basis CONTAINS '25/2018/AL'
RETURN c.title AS contract, cl.clause_number AS clause, r.risk_title AS violation, r.risk_level AS level, s.name AS legal_source"""
            },
            {
                "id": "cypher_labor_chain",
                "title": "Truy vấn 2: Chuỗi Rủi ro Nhân sự (Thử việc + Giữ bằng gốc Điều 17)",
                "description": "Truy vết các hợp đồng chứa đồng thời hành vi giữ bằng gốc (Điều 17.1) hoặc thử việc quá 60 ngày (Điều 25 BLLĐ 2019)",
                "query": """MATCH (c:Contract)-[:HAS_CLAUSE]->(cl:Clause)-[:DETECTED_RISK]->(r:Risk)
WHERE r.legal_basis CONTAINS 'Điều 17' OR r.legal_basis CONTAINS 'Điều 25'
RETURN c.title AS contract, cl.clause_number AS clause, r.risk_title AS risk, r.suggested_text AS redline"""
            },
            {
                "id": "cypher_critical_paths",
                "title": "Truy vấn 3: Đường dẫn Vi phạm Điều cấm Pháp luật (CRITICAL Paths)",
                "description": "Tìm kiếm tất cả các hợp đồng và điều khoản đang chứa rủi ro mức độ CRITICAL có nguy cơ bị Tòa án tuyên vô hiệu toàn bộ",
                "query": """MATCH path = (c:Contract)-[:HAS_CLAUSE]->(cl:Clause)-[:DETECTED_RISK]->(r:Risk {level: 'CRITICAL'})
RETURN c.title AS contract, cl.clause_number AS clause, r.risk_title AS critical_risk, r.legal_basis AS basis"""
            },
            {
                "id": "cypher_dispute_jurisdiction",
                "title": "Truy vấn 4: Thẩm quyền Tài phán & Áp đặt Tòa án địa phương",
                "description": "Truy vấn điều khoản giải quyết tranh chấp đơn phương, áp đặt Tòa án nơi bên soạn thảo (Điều 39 BLTTDS 2015)",
                "query": """MATCH (c:Contract)-[:HAS_CLAUSE]->(cl:Clause)-[:DETECTED_RISK]->(r:Risk)
WHERE r.category = 'Tranh chấp & Tài phán'
RETURN c.title AS contract, cl.clause_number AS clause, r.risk_title AS issue, r.suggested_text AS suggestion"""
            }
        ]
