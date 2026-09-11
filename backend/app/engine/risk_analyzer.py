import re
from typing import List, Dict, Any, Tuple
from app.models.schemas import (
    Clause, RiskItem, RiskLevel, ContractAnalysisReport,
    KnowledgeGraphData, GraphNode, GraphEdge
)
from app.core.config import settings

class LegalRiskAnalyzer:
    """
    Engine phân tích rủi ro hợp đồng kết hợp Luật Việt Nam, Rule-based Legal Checking
    và Hybrid LLM Reasoning.
    """

    # Danh mục các quy định pháp luật Việt Nam cốt lõi
    LEGAL_KNOWLEDGE_BASE = [
        {
            "code": "LTM2005_D301",
            "law": "Điều 301, Luật Thương mại 2005",
            "topic": "Mức phạt vi phạm",
            "rule": "Mức phạt đối với vi phạm nghĩa vụ hợp đồng thương mại do các bên thỏa thuận, nhưng không quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm (trừ trường hợp giám định sai).",
            "keywords": ["phạt vi phạm", "8%", "10%", "15%", "20%", "30%", "50%", "tổng giá trị hợp đồng"]
        },
        {
            "code": "BLDS2015_D428",
            "law": "Điều 428, Bộ luật Dân sự 2015",
            "topic": "Đơn phương chấm dứt thực hiện hợp đồng",
            "rule": "Bên đơn phương chấm dứt phải thông báo ngay cho bên kia biết. Nếu không thông báo mà gây thiệt hại thì phải bồi thường.",
            "keywords": ["đơn phương chấm dứt", "ngay lập tức", "không cần báo trước", "không chịu trách nhiệm"]
        },
        {
            "code": "BLDS2015_D360",
            "law": "Điều 360, Bộ luật Dân sự 2015",
            "topic": "Nghĩa vụ bồi thường thiệt hại",
            "rule": "Trường hợp có thiệt hại do vi phạm nghĩa vụ gây ra thì bên có nghĩa vụ phải bồi thường toàn bộ thiệt hại thực tế, trực tiếp.",
            "keywords": ["bồi thường toàn bộ", "vô điều kiện", "thiệt hại gián tiếp", "mất doanh thu"]
        },
        {
            "code": "ND13_2023_NDCP",
            "law": "Nghị định 13/2023/NĐ-CP",
            "topic": "Bảo vệ dữ liệu cá nhân",
            "rule": "Việc xử lý dữ liệu cá nhân phải có sự đồng ý của chủ thể dữ liệu và tuân thủ các biện pháp bảo vệ dữ liệu bắt buộc.",
            "keywords": ["dữ liệu cá nhân", "thông tin khách hàng", "chuyển giao cho bên thứ ba"]
        },
        {
            "code": "BLTTDS2015_D39",
            "law": "Điều 39, Bộ luật Tố tụng Dân sự 2015",
            "topic": "Thẩm quyền giải quyết tranh chấp",
            "rule": "Tranh chấp phát sinh từ hợp đồng do Tòa án nơi bị đơn cư trú hoặc nơi thực hiện hợp đồng giải quyết, trừ khi có thỏa thuận trọng tài hợp lệ.",
            "keywords": ["tòa án", "trọng tài", "nơi nguyên đơn đặt trụ sở", "thẩm quyền duy nhất"]
        }
    ]

    @classmethod
    def analyze_contract(cls, contract_id: str, title: str, contract_type: str, clauses: List[Clause]) -> ContractAnalysisReport:
        """
        Thực hiện rà soát rủi ro toàn diện trên danh sách các Điều khoản.
        """
        risks: List[RiskItem] = []
        
        # Phân tích từng điều khoản
        for clause in clauses:
            clause_risks = cls._evaluate_clause(clause)
            risks.extend(clause_risks)

        # Đếm số lượng rủi ro theo cấp độ
        critical_count = sum(1 for r in risks if r.risk_level == RiskLevel.CRITICAL)
        high_count = sum(1 for r in risks if r.risk_level == RiskLevel.HIGH)
        medium_count = sum(1 for r in risks if r.risk_level == RiskLevel.MEDIUM)
        low_count = sum(1 for r in risks if r.risk_level == RiskLevel.LOW)

        # Tính điểm an toàn hợp đồng (0 - 100)
        # Công thức: Điểm xuất phát 100, trừ điểm theo mức độ nghiêm trọng
        penalty = (critical_count * 25) + (high_count * 15) + (medium_count * 7) + (low_count * 2)
        overall_score = max(5, 100 - penalty)

        # Sinh tóm tắt tổng quan
        summary = cls._generate_executive_summary(
            title, overall_score, critical_count, high_count, medium_count, total_clauses=len(clauses)
        )

        # Xây dựng đồ thị Knowledge Graph
        graph_data = cls._build_knowledge_graph(contract_id, title, clauses, risks)

        return ContractAnalysisReport(
            contract_id=contract_id,
            contract_title=title,
            contract_type=contract_type,
            overall_score=overall_score,
            summary=summary,
            total_clauses=len(clauses),
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            clauses=clauses,
            risks=risks,
            graph_data=graph_data
        )

    @classmethod
    def _evaluate_clause(cls, clause: Clause) -> List[RiskItem]:
        """
        Phân tích chuyên sâu 1 điều khoản cụ thể dựa trên quy tắc pháp lý và ngữ nghĩa.
        """
        content = clause.content.lower()
        items: List[RiskItem] = []
        
        # 1. Rủi ro Phạt vi phạm vượt trần 8% theo Luật Thương mại 2005
        penalty_match = re.search(r'phạt\s+(\d+)%\s*(?:giá trị|tổng)', content)
        if penalty_match:
            rate = int(penalty_match.group(1))
            if rate > 8:
                items.append(RiskItem(
                    id=f"risk_{clause.id}_penalty",
                    clause_id=clause.id,
                    clause_number=clause.clause_number,
                    risk_level=RiskLevel.CRITICAL,
                    risk_title="Phạt vi phạm vượt trần 8% trái quy định Luật Thương mại",
                    risk_category="Phạt vi phạm",
                    description=f"Điều khoản quy định mức phạt vi phạm là {rate}%, vượt quá mức trần 8% theo quy định bắt buộc của Điều 301 Luật Thương mại 2005. Phần vượt quá có nguy cơ bị Tòa án/Trọng tài tuyên vô hiệu.",
                    legal_basis="Điều 301, Luật Thương mại 2005",
                    original_text=clause.content,
                    suggested_text=re.sub(r'phạt\s+\d+%\s*(giá trị|tổng)', 'phạt 8% giá trị phần nghĩa vụ bị vi phạm', clause.content, flags=re.IGNORECASE),
                    rationale="Điều chỉnh mức phạt về tối đa 8% theo đúng luật định để đảm bảo hiệu lực thi hành và tránh tranh chấp vô hiệu điều khoản.",
                    bounding_boxes=clause.bounding_boxes
                ))

        # 2. Rủi ro Đơn phương chấm dứt hợp đồng không báo trước
        if any(kw in content for kw in ["đơn phương chấm dứt", "ngay lập tức", "không cần thông báo trước", "không chịu bất kỳ trách nhiệm"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_termination",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Quyền đơn phương chấm dứt bất cân xứng, thiếu thời hạn báo trước",
                risk_category="Chấm dứt hợp đồng",
                description="Một bên có quyền đơn phương chấm dứt hợp đồng ngay lập tức mà không quy định nghĩa vụ thông báo trước tối thiểu (ví dụ 15 - 30 ngày) và không quy định cơ chế hoàn trả chi phí đã thực hiện.",
                legal_basis="Điều 428, Bộ luật Dân sự 2015",
                original_text=clause.content,
                suggested_text=clause.content + "\n[Đề xuất bổ sung]: 'Bên muốn chấm dứt phải thông báo bằng văn bản trước ít nhất 30 ngày và hai bên tiến hành đối soát, thanh toán các chi phí/khối lượng công việc đã hoàn thành tính đến thời điểm chấm dứt.'",
                rationale="Đảm bảo nguyên tắc thiện chí, có thời gian bàn giao và không bị gián đoạn hoạt động kinh doanh đột ngột.",
                bounding_boxes=clause.bounding_boxes
            ))

        # 3. Rủi ro Bồi thường thiệt hại gián tiếp hoặc không giới hạn
        if any(kw in content for kw in ["bồi thường toàn bộ thiệt hại phát sinh", "thiệt hại gián tiếp", "mất cơ hội kinh doanh", "không giới hạn"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_liability",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Trách nhiệm bồi thường không giới hạn và bao gồm thiệt hại gián tiếp",
                risk_category="Bồi thường thiệt hại",
                description="Quy định bồi thường mở rộng đến các thiệt hại gián tiếp, mất cơ hội kinh doanh hoặc không có mức trần trách nhiệm (Liability Cap), tạo rủi ro tài chính khôn lường.",
                legal_basis="Điều 360, Bộ luật Dân sự 2015",
                original_text=clause.content,
                suggested_text=clause.content + "\n[Đề xuất bổ sung]: 'Tổng trách nhiệm bồi thường thiệt hại của mỗi bên theo Hợp đồng này trong mọi trường hợp không vượt quá 100% tổng giá trị Hợp đồng thực tế đã thanh toán và loại trừ mọi thiệt hại gián tiếp, mất lợi nhuận kỳ vọng.'",
                rationale="Thiết lập trần trách nhiệm (Liability Cap) để kiểm soát rủi ro pháp lý và tài chính tối đa.",
                bounding_boxes=clause.bounding_boxes
            ))

        # 4. Rủi ro Thẩm quyền Tòa án áp đặt một chiều
        if any(kw in content for kw in ["tòa án nơi bên a", "tòa án nơi bên b", "trụ sở của bên"]) and "trọng tài" not in content:
            items.append(RiskItem(
                id=f"risk_{clause.id}_jurisdiction",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.MEDIUM,
                risk_title="Điều khoản giải quyết tranh chấp nghiêng về một bên",
                risk_category="Tranh chấp & Tài phán",
                description="Quy định tranh chấp giải quyết tại Tòa án theo trụ sở của một bên có thể gây bất lợi lớn về chi phí đi lại, nguồn lực pháp lý nếu có tranh chấp xảy ra.",
                legal_basis="Điều 39, Bộ luật Tố tụng Dân sự 2015",
                original_text=clause.content,
                suggested_text="Tranh chấp phát sinh trước hết được giải quyết thông qua thương lượng hòa giải trong thời hạn 30 ngày. Trường hợp không hòa giải được, tranh chấp sẽ được đưa ra Trung tâm Trọng tài Quốc tế Việt Nam (VIAC) hoặc Tòa án nhân dân có thẩm quyền theo quy định của pháp luật.",
                rationale="Đảm bảo sự công bằng, bảo mật và tính khả thi cao khi giải quyết tranh chấp thương mại.",
                bounding_boxes=clause.bounding_boxes
            ))

        # 5. Rủi ro Thời hạn bảo mật vô thời hạn / không rõ ràng
        if "bảo mật" in content and any(kw in content for kw in ["vô thời hạn", "mãi mãi", "kể cả sau khi chấm dứt mà không có thời hạn"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_confidentiality",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.LOW,
                risk_title="Thời hạn bảo mật thông tin quá dài hoặc vô thời hạn",
                risk_category="Bảo mật thông tin",
                description="Nghĩa vụ bảo mật không giới hạn thời gian sau khi hợp đồng kết thúc có thể gây khó khăn trong việc quản lý và tuyển dụng nhân sự sau này.",
                legal_basis="Tập quán thương mại & Thỏa thuận bảo mật thông tin",
                original_text=clause.content,
                suggested_text="Nghĩa vụ bảo mật có hiệu lực trong suốt thời gian thực hiện Hợp đồng và kéo dài 03 (ba) năm kể từ ngày Hợp đồng chấm dứt hiệu lực.",
                rationale="Thời hạn bảo mật 2-3 năm là chuẩn thông lệ quốc tế và thương mại tại Việt Nam.",
                bounding_boxes=clause.bounding_boxes
            ))

        return items

    @classmethod
    def _generate_executive_summary(cls, title: str, score: int, critical: int, high: int, medium: int, total_clauses: int) -> str:
        if score >= 80:
            status_text = "Hợp đồng có mức độ an toàn tốt, các điều khoản cơ bản tuân thủ pháp luật Việt Nam."
        elif score >= 50:
            status_text = "Hợp đồng có một số điều khoản bất đối xứng và tiềm ẩn rủi ro pháp lý cần đàm phán sửa đổi."
        else:
            status_text = "CẢNH BÁO: Hợp đồng chứa các điều khoản rủi ro nghiêm trọng và có dấu hiệu vi phạm điều cấm của Luật Thương mại/Dân sự Việt Nam."

        return (
            f"Báo cáo rà soát hợp đồng '{title}' (Tổng số: {total_clauses} điều khoản). "
            f"Đánh giá điểm an toàn: {score}/100. "
            f"Phát hiện {critical} rủi ro nghiêm trọng (Critical), {high} rủi ro cao (High), và {medium} điểm cần lưu ý (Medium). "
            f"{status_text}"
        )

    @classmethod
    def _build_knowledge_graph(cls, contract_id: str, title: str, clauses: List[Clause], risks: List[RiskItem]) -> KnowledgeGraphData:
        """
        Tạo dữ liệu Knowledge Graph biểu diễn mối quan hệ Hợp đồng -> Điều khoản -> Rủi ro -> Căn cứ Luật.
        """
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []

        # 1. Contract Node
        nodes.append(GraphNode(
            id=contract_id,
            label=title[:30] + "...",
            type="Contract",
            properties={"title": title}
        ))

        # 2. Clause Nodes & HAS_CLAUSE edges
        for clause in clauses:
            clause_node_id = f"node_{clause.id}"
            nodes.append(GraphNode(
                id=clause_node_id,
                label=clause.clause_number,
                type="Clause",
                properties={"title": clause.title, "page": clause.page_number}
            ))
            edges.append(GraphEdge(
                source=contract_id,
                target=clause_node_id,
                relation="HAS_CLAUSE"
            ))

        # 3. Risk Nodes & Law Nodes
        law_set = set()
        for risk in risks:
            risk_node_id = f"node_{risk.id}"
            nodes.append(GraphNode(
                id=risk_node_id,
                label=f"[{risk.risk_level.value}] {risk.risk_category}",
                type="Risk",
                properties={"level": risk.risk_level.value, "title": risk.risk_title}
            ))
            # Edge: Clause -> Risk
            edges.append(GraphEdge(
                source=f"node_{risk.clause_id}",
                target=risk_node_id,
                relation="EXHIBITS_RISK"
            ))

            # Law Node
            if risk.legal_basis:
                law_id = f"law_{re.sub(r'[^a-zA-Z0-9]', '_', risk.legal_basis)}"
                if law_id not in law_set:
                    law_set.add(law_id)
                    nodes.append(GraphNode(
                        id=law_id,
                        label=risk.legal_basis,
                        type="Law",
                        properties={"name": risk.legal_basis}
                    ))
                # Edge: Risk -> Law
                edges.append(GraphEdge(
                    source=risk_node_id,
                    target=law_id,
                    relation="VIOLATES_OR_REFERENCES"
                ))

        return KnowledgeGraphData(nodes=nodes, edges=edges)
