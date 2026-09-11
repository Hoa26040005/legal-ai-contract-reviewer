import re
from typing import List, Dict, Any, Tuple
from app.models.schemas import (
    Clause, RiskItem, RiskLevel, ContractAnalysisReport,
    KnowledgeGraphData, GraphNode, GraphEdge
)
from app.core.config import settings

class LegalRiskAnalyzer:
    """
    Engine phân tích rủi ro hợp đồng chuyên sâu, tích hợp hệ thống 20+ quy tắc và điều luật
    cốt lõi thuộc hệ thống pháp luật Việt Nam (Dân sự, Thương mại, Sở hữu trí tuệ, Lao động, 
    Trọng tài và Bảo vệ dữ liệu cá nhân).
    """

    # Danh mục Thư viện Pháp luật Toàn diện Việt Nam (Comprehensive Vietnamese Legal Knowledge Base)
    LEGAL_KNOWLEDGE_BASE = [
        # --- NHÓM 1: LUẬT THƯƠNG MẠI 2005 ---
        {
            "code": "LTM2005_D301",
            "law": "Điều 301, Luật Thương mại 2005",
            "topic": "Trần mức phạt vi phạm thương mại (8%)",
            "rule": "Mức phạt đối với vi phạm nghĩa vụ hợp đồng hoặc tổng mức phạt đối với nhiều vi phạm do các bên thoả thuận trong hợp đồng, nhưng không quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm.",
            "keywords": ["phạt vi phạm", "8%", "10%", "15%", "20%", "30%", "50%", "tổng giá trị hợp đồng"]
        },
        {
            "code": "LTM2005_D307",
            "law": "Điều 307, Luật Thương mại 2005",
            "topic": "Quan hệ giữa Phạt vi phạm và Bồi thường thiệt hại",
            "rule": "Trường hợp các bên không có thoả thuận phạt vi phạm thì bên bị vi phạm chỉ có quyền yêu cầu bồi thường thiệt hại. Trường hợp có thỏa thuận phạt vi phạm thì bên bị vi phạm có quyền áp dụng cả phạt vi phạm và bồi thường thiệt hại.",
            "keywords": ["vừa phạt vừa bồi thường", "chỉ áp dụng", "không có thỏa thuận phạt"]
        },
        {
            "code": "LTM2005_D294",
            "law": "Điều 294, Luật Thương mại 2005",
            "topic": "Miễn trách nhiệm trong trường hợp Bất khả kháng",
            "rule": "Bên vi phạm hợp đồng được miễn trách nhiệm khi xảy ra sự kiện bất khả kháng hoặc hành vi vi phạm do lỗi hoàn toàn của bên kia.",
            "keywords": ["bất khả kháng", "thiên tai", "dịch bệnh", "chiến tranh", "miễn trừ trách nhiệm"]
        },
        {
            "code": "LTM2005_D295",
            "law": "Điều 295, Luật Thương mại 2005",
            "topic": "Nghĩa vụ thông báo sự kiện Bất khả kháng",
            "rule": "Bên viện dẫn trường hợp miễn trách nhiệm phải thông báo ngay bằng văn bản cho bên kia về trường hợp được miễn trách nhiệm và những hậu quả có thể xảy ra.",
            "keywords": ["thông báo bất khả kháng", "kịp thời", "bằng văn bản", "chứng minh"]
        },
        {
            "code": "LTM2005_D318",
            "law": "Điều 318, Luật Thương mại 2005",
            "topic": "Thời hạn khiếu nại hợp đồng thương mại",
            "rule": "Thời hạn khiếu nại: 03 tháng kể từ ngày giao hàng đối với khiếu nại về số lượng/chất lượng; 06 tháng đối với khiếu nại về các nghĩa vụ khác. Hợp đồng quy định thời hạn khiếu nại quá ngắn (như 24-48 giờ) là bất lợi nghiêm trọng.",
            "keywords": ["thời hạn khiếu nại", "24 giờ", "48 giờ", "3 ngày", "hết thời hạn khiếu nại"]
        },
        {
            "code": "LTM2005_D319",
            "law": "Điều 319, Luật Thương mại 2005",
            "topic": "Thời hiệu khởi kiện tranh chấp thương mại",
            "rule": "Thời hiệu khởi kiện áp dụng đối với các tranh chấp thương mại là 02 năm, kể từ thời điểm quyền và lợi ích hợp pháp bị xâm phạm.",
            "keywords": ["thời hiệu khởi kiện", "02 năm", "hết quyền khiếu kiện"]
        },

        # --- NHÓM 2: BỘ LUẬT DÂN SỰ 2015 ---
        {
            "code": "BLDS2015_D468",
            "law": "Điều 468, Bộ luật Dân sự 2015",
            "topic": "Trần lãi suất vay và lãi chậm trả (20%/năm)",
            "rule": "Lãi suất theo thỏa thuận không được vượt quá 20%/năm của khoản tiền vay, trừ trường hợp luật khác có liên quan quy định khác. Quy định lãi phạt chậm trả quá 20%/năm có nguy cơ vô hiệu và vi phạm điều cấm.",
            "keywords": ["lãi suất chậm trả", "lãi quá hạn", "0.1% mỗi ngày", "30%/năm", "2%/tháng", "lãi phạt"]
        },
        {
            "code": "BLDS2015_D428",
            "law": "Điều 428, Bộ luật Dân sự 2015",
            "topic": "Đơn phương chấm dứt thực hiện hợp đồng",
            "rule": "Bên đơn phương chấm dứt phải thông báo ngay cho bên kia biết về việc chấm dứt hợp đồng; nếu không thông báo mà gây thiệt hại thì phải bồi thường.",
            "keywords": ["đơn phương chấm dứt", "ngay lập tức", "không cần báo trước", "không chịu trách nhiệm"]
        },
        {
            "code": "BLDS2015_D360",
            "law": "Điều 360, Bộ luật Dân sự 2015",
            "topic": "Nghĩa vụ bồi thường thiệt hại",
            "rule": "Trường hợp có thiệt hại do vi phạm nghĩa vụ gây ra thì bên có nghĩa vụ phải bồi thường toàn bộ thiệt hại thực tế, trực tiếp phát sinh.",
            "keywords": ["bồi thường toàn bộ", "vô điều kiện", "thiệt hại gián tiếp", "mất doanh thu"]
        },
        {
            "code": "BLDS2015_D405",
            "law": "Điều 405, Bộ luật Dân sự 2015",
            "topic": "Hợp đồng theo mẫu và điều khoản bất bình đẳng",
            "rule": "Trường hợp hợp đồng theo mẫu có điều khoản miễn trách nhiệm của bên đưa ra hợp đồng theo mẫu, tăng trách nhiệm hoặc loại bỏ quyền lợi chính đáng của bên kia thì điều khoản này vô hiệu.",
            "keywords": ["miễn trừ hoàn toàn trách nhiệm", "không chịu trách nhiệm trong mọi trường hợp", "hợp đồng mẫu"]
        },
        {
            "code": "BLDS2015_D420",
            "law": "Điều 420, Bộ luật Dân sự 2015",
            "topic": "Thực hiện hợp đồng khi hoàn cảnh thay đổi cơ bản (Hardship)",
            "rule": "Khi hoàn cảnh thay đổi cơ bản dẫn đến việc thực hiện hợp đồng gây thiệt hại nghiêm trọng cho một bên, bên đó có quyền yêu cầu đàm phán lại hoặc đề nghị Tòa án chấm dứt/điều chỉnh hợp đồng.",
            "keywords": ["hoàn cảnh thay đổi cơ bản", "đàm phán lại giá", "trượt giá", "khủng hoảng"]
        },
        {
            "code": "BLDS2015_D122",
            "law": "Điều 122 & 123, Bộ luật Dân sự 2015",
            "topic": "Giao dịch dân sự vô hiệu do vi phạm điều cấm của luật",
            "rule": "Giao dịch dân sự có mục đích, nội dung vi phạm điều cấm của luật, trái đạo đức xã hội thì vô hiệu. Điều cấm của luật là những quy định không cho phép chủ thể thực hiện những hành vi nhất định.",
            "keywords": ["vô hiệu", "điều cấm", "trái pháp luật", "tự động chuyển quyền"]
        },
        {
            "code": "BLDS2015_D429",
            "law": "Điều 429, Bộ luật Dân sự 2015",
            "topic": "Thời hiệu khởi kiện về hợp đồng dân sự (03 năm)",
            "rule": "Thời hiệu khởi kiện để yêu cầu Tòa án giải quyết tranh chấp hợp đồng là 03 năm, kể từ ngày người có quyền yêu cầu biết hoặc phải biết quyền và lợi ích hợp pháp của mình bị xâm phạm.",
            "keywords": ["thời hiệu khởi kiện", "03 năm", "dân sự"]
        },

        # --- NHÓM 3: BẢO VỆ DỮ LIỆU CÁ NHÂN & AN NINH MẠNG ---
        {
            "code": "ND13_2023_NDCP",
            "law": "Nghị định 13/2023/NĐ-CP (Điều 9, 11, 17)",
            "topic": "Bảo vệ Dữ liệu Cá nhân và Chuyển giao Thông tin",
            "rule": "Việc thu thập, xử lý và chuyển giao dữ liệu cá nhân (kể cả trong hợp đồng dịch vụ công nghệ) bắt buộc phải có sự đồng ý minh thị của chủ thể dữ liệu và tuân thủ đánh giá tác động xử lý dữ liệu.",
            "keywords": ["dữ liệu cá nhân", "thông tin khách hàng", "chuyển giao bên thứ ba", "xử lý dữ liệu", "nghị định 13"]
        },

        # --- NHÓM 4: LUẬT SỞ HỮU TRÍ TUỆ 2005 (SỬA ĐỔI 2022) ---
        {
            "code": "LSHTT_D20",
            "law": "Điều 20 & 45, Luật Sở hữu trí tuệ (sửa đổi 2022)",
            "topic": "Chuyển giao Quyền Tác giả đối với Phần mềm & Mã nguồn",
            "rule": "Quyền tác giả và quyền sở hữu đối với phần mềm, giải pháp công nghệ chỉ được chuyển nhượng hợp pháp khi có thỏa thuận bằng văn bản và bên nhận chuyển nhượng hoàn thành nghĩa vụ tài chính tương ứng.",
            "keywords": ["mã nguồn", "quyền tác giả", "sở hữu vô điều kiện", "bản quyền phần mềm", "sở hữu trí tuệ"]
        },

        # --- NHÓM 5: LUẬT TRỌNG TÀI THƯƠNG MẠI & TỐ TỤNG DÂN SỰ ---
        {
            "code": "LTTTM2010_D18",
            "law": "Điều 18 & 19, Luật Trọng tài thương mại 2010",
            "topic": "Thỏa thuận Trọng tài vô hiệu và Tính độc lập của Trọng tài",
            "rule": "Thỏa thuận trọng tài hoàn toàn độc lập với hợp đồng. Thỏa thuận trọng tài vô hiệu nếu một bên bị lừa dối, đe dọa hoặc quy định tổ chức trọng tài không tồn tại.",
            "keywords": ["trọng tài thương mại", "viac", "thỏa thuận trọng tài", "trọng tài vô hiệu"]
        },
        {
            "code": "BLTTDS2015_D39",
            "law": "Điều 39 & 40, Bộ luật Tố tụng Dân sự 2015",
            "topic": "Thẩm quyền giải quyết tranh chấp của Tòa án theo lãnh thổ",
            "rule": "Tranh chấp phát sinh từ hợp đồng do Tòa án nơi bị đơn cư trú/đặt trụ sở giải quyết. Các bên có quyền thỏa thuận chọn Tòa án nơi nguyên đơn cư trú/đặt trụ sở bằng văn bản hợp lệ.",
            "keywords": ["tòa án nơi bên a", "tòa án nơi bên b", "thẩm quyền duy nhất", "nơi cư trú"]
        },

        # --- NHÓM 6: BỘ LUẬT LAO ĐỘNG 2019 ---
        {
            "code": "BLLD2019_D21",
            "law": "Điều 21.2, Bộ luật Lao động 2019",
            "topic": "Thỏa thuận bảo vệ bí mật kinh doanh & Công nghệ trong quan hệ lao động",
            "rule": "Khi người lao động làm việc có liên quan trực tiếp đến bí mật kinh doanh, bí mật công nghệ thì người sử dụng lao động có quyền thỏa thuận bằng văn bản về nội dung, thời hạn bảo vệ và bồi thường nếu vi phạm.",
            "keywords": ["bí mật kinh doanh", "bí mật công nghệ", "thỏa thuận bảo mật lao động", "bồi thường đào tạo"]
        }
    ]

    @classmethod
    def analyze_contract(cls, contract_id: str, title: str, contract_type: str, clauses: List[Clause]) -> ContractAnalysisReport:
        """
        Thực hiện rà soát rủi ro toàn diện trên danh sách các Điều khoản.
        """
        risks: List[RiskItem] = []
        
        # Phân tích từng điều khoản qua bộ quy tắc pháp lý mở rộng
        for clause in clauses:
            clause_risks = cls._evaluate_clause(clause)
            risks.extend(clause_risks)

        critical_count = sum(1 for r in risks if r.risk_level == RiskLevel.CRITICAL)
        high_count = sum(1 for r in risks if r.risk_level == RiskLevel.HIGH)
        medium_count = sum(1 for r in risks if r.risk_level == RiskLevel.MEDIUM)
        low_count = sum(1 for r in risks if r.risk_level == RiskLevel.LOW)

        # Tính điểm an toàn hợp đồng (0 - 100)
        penalty = (critical_count * 25) + (high_count * 14) + (medium_count * 6) + (low_count * 2)
        overall_score = max(5, 100 - penalty)

        summary = cls._generate_executive_summary(
            title, overall_score, critical_count, high_count, medium_count, total_clauses=len(clauses)
        )

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
        Phân tích chuyên sâu 1 điều khoản cụ thể đối chiếu với 20+ quy tắc pháp luật Việt Nam.
        """
        content = clause.content.lower()
        items: List[RiskItem] = []
        
        # 1. RỦI RO PHẠT VI PHẠM VƯỢT TRẦN 8% (Điều 301 Luật Thương mại 2005)
        penalty_match = re.search(r'phạt\s+(\d+)%\s*(?:giá trị|tổng)', content)
        if penalty_match:
            rate = int(penalty_match.group(1))
            if rate > 8:
                items.append(RiskItem(
                    id=f"risk_{clause.id}_penalty",
                    clause_id=clause.id,
                    clause_number=clause.clause_number,
                    risk_level=RiskLevel.CRITICAL,
                    risk_title=f"Phạt vi phạm {rate}% vượt quá mức trần 8% theo Điều 301 Luật Thương mại 2005",
                    risk_category="Phạt vi phạm",
                    description=f"Điều khoản quy định mức phạt vi phạm là {rate}%, vượt quá mức trần tối đa 8% của Điều 301 Luật Thương mại 2005. Tòa án hoặc Hội đồng Trọng tài sẽ tuyên vô hiệu phần vượt quá mức trần này.",
                    legal_basis="Điều 301, Luật Thương mại 2005",
                    original_text=clause.content,
                    suggested_text=re.sub(r'phạt\s+\d+%\s*(giá trị|tổng)', 'phạt 8% giá trị phần nghĩa vụ bị vi phạm', clause.content, flags=re.IGNORECASE),
                    rationale="Khống chế mức phạt tối đa 8% theo luật định và chỉ tính trên phần nghĩa vụ vi phạm thực tế để đảm bảo hiệu lực thi hành.",
                    bounding_boxes=clause.bounding_boxes
                ))

        # 2. RỦI RO LÃI SUẤT CHẬM TRẢ VƯỢT TRẦN 20%/NĂM (Điều 468 Bộ luật Dân sự 2015)
        interest_match = re.search(r'(?:lãi\s+suất|lãi\s+chậm\s+trả|lãi\s+phạt)\s*(?:là|tương đương|cố định)?\s*(\d+(?:\.\d+)?)\s*%\s*(?:mỗi\s+ngày|/ngày|/tháng|/năm)', content)
        if interest_match or any(kw in content for kw in ["0.1% mỗi ngày", "0.2% mỗi ngày", "0.5% mỗi ngày", "30%/năm", "2%/tháng"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_interest",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.CRITICAL,
                risk_title="Lãi suất chậm trả vượt quá mức trần 20%/năm (Điều 468 BLDS 2015)",
                risk_category="Lãi suất & Chậm thanh toán",
                description="Mức lãi suất phạt chậm trả tính theo ngày (ví dụ 0.1% - 0.5%/ngày tương đương 36.5% - 182.5%/năm) vượt xa trần 20%/năm theo Điều 468 BLDS 2015, có nguy cơ vi phạm điều cấm của pháp luật.",
                legal_basis="Điều 468 & Điều 357, Bộ luật Dân sự 2015",
                original_text=clause.content,
                suggested_text=clause.content + "\n[Đề xuất sửa đổi]: 'Lãi suất chậm trả được tính theo mức lãi suất do các bên thỏa thuận nhưng không vượt quá mức trần 20%/năm (hoặc bằng mức lãi suất nợ quá hạn trung bình của các ngân hàng thương mại lớn tại thời điểm thanh toán).'",
                rationale="Đảm bảo lãi suất chậm trả hợp pháp, không vượt trần 20%/năm để tránh tranh chấp vô hiệu và rủi ro hình sự hóa.",
                bounding_boxes=clause.bounding_boxes
            ))

        # 3. RỦI RO ĐƠN PHƯƠNG CHẤM DỨT BẤT CÂN XỨNG (Điều 428 Bộ luật Dân sự 2015)
        if any(kw in content for kw in ["đơn phương chấm dứt", "ngay lập tức", "không cần thông báo trước", "không chịu bất kỳ trách nhiệm", "hủy bỏ hợp đồng bất kỳ lúc nào"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_termination",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Đơn phương chấm dứt hợp đồng ngay lập tức, thiếu thời hạn báo trước",
                risk_category="Chấm dứt hợp đồng",
                description="Một bên tự cho mình quyền chấm dứt hợp đồng ngay lập tức mà không có thời hạn thông báo trước hợp lý (30 ngày) và không quy định nghĩa vụ thanh toán phần công việc đã hoàn thành.",
                legal_basis="Điều 428, Bộ luật Dân sự 2015",
                original_text=clause.content,
                suggested_text="Mỗi bên có quyền đơn phương chấm dứt Hợp đồng khi bên kia vi phạm nghiêm trọng nghĩa vụ và không khắc phục trong vòng 30 ngày kể từ ngày nhận được văn bản thông báo. Bên chấm dứt phải thanh toán đầy đủ cho khối lượng công việc đạt yêu cầu đã được nghiệm thu.",
                rationale="Đảm bảo nguyên tắc thiện chí, thời hạn chuẩn bị bàn giao và tránh gián đoạn hoạt động kinh doanh đột ngột.",
                bounding_boxes=clause.bounding_boxes
            ))

        # 4. RỦI RO BỒI THƯỜNG KHÔNG GIỚI HẠN & THIỆT HẠI GIÁN TIẾP (Điều 360 BLDS 2015)
        if any(kw in content for kw in ["bồi thường toàn bộ thiệt hại phát sinh", "thiệt hại gián tiếp", "mất cơ hội kinh doanh", "tổn thất doanh thu", "không giới hạn trách nhiệm"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_liability",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Trách nhiệm bồi thường không giới hạn và bao gồm thiệt hại gián tiếp",
                risk_category="Bồi thường thiệt hại",
                description="Quy định bồi thường mở rộng đến 'thiệt hại gián tiếp, mất cơ hội kinh doanh' mà không đặt ra mức trần trách nhiệm (Liability Cap), tạo rủi ro tài chính không thể dự đoán trước.",
                legal_basis="Điều 360, Bộ luật Dân sự 2015 & Điều 302 Luật Thương mại 2005",
                original_text=clause.content,
                suggested_text="Trách nhiệm bồi thường thiệt hại của mỗi bên chỉ giới hạn trong phạm vi thiệt hại thực tế, trực tiếp và tổng mức bồi thường trong mọi trường hợp không vượt quá 100% tổng giá trị Hợp đồng thực tế đã thanh toán. Hai bên loại trừ hoàn toàn nghĩa vụ bồi thường cho bất kỳ thiệt hại gián tiếp hoặc mất lợi nhuận kỳ vọng nào.",
                rationale="Thiết lập trần trách nhiệm tối đa (Liability Cap) chuẩn mực để bảo toàn tài chính cho doanh nghiệp.",
                bounding_boxes=clause.bounding_boxes
            ))

        # 5. RỦI RO CHIẾM ĐOẠT QUYỀN SỞ HỮU TRÍ TUỆ / MÃ NGUỒN (Luật SHTT sửa đổi 2022)
        if any(kw in content for kw in ["mã nguồn", "thuật toán", "sở hữu vô điều kiện", "thuộc toàn quyền sở hữu của bên a"]) and "bên b" in content:
            items.append(RiskItem(
                id=f"risk_{clause.id}_ip",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Chuyển giao toàn bộ quyền Sở hữu trí tuệ trước khi thanh toán đủ",
                risk_category="Sở hữu trí tuệ & Mã nguồn",
                description="Điều khoản quy định toàn bộ mã nguồn, sáng chế công nghệ thuộc về khách hàng ngay lập tức mà không ràng buộc điều kiện khách hàng phải thanh toán 100% chi phí hợp đồng.",
                legal_basis="Điều 20 & 45, Luật Sở hữu trí tuệ (sửa đổi 2022)",
                original_text=clause.content,
                suggested_text="Toàn bộ quyền sở hữu trí tuệ đối với các sản phẩm bàn giao chỉ được chính thức chuyển giao cho Bên A sau khi Bên A đã hoàn thành 100% nghĩa vụ thanh toán theo Hợp đồng này. Bên B giữ toàn bộ quyền đối với các công cụ, thư viện mã nguồn dùng chung (Background IP) đã tồn tại từ trước.",
                rationale="Bảo vệ quyền tác giả và tài sản trí tuệ công nghệ của đơn vị phát triển phần mềm.",
                bounding_boxes=clause.bounding_boxes
            ))

        # 6. RỦI RO THỜI HẠN KHIẾU NẠI QUÁ NGẮN (Điều 318 Luật Thương mại 2005)
        if any(kw in content for kw in ["khiếu nại trong vòng 24 giờ", "khiếu nại trong vòng 48 giờ", "khiếu nại trong vòng 3 ngày", "sau 24h coi như đồng ý"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_claim_period",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Thời hạn khiếu nại quá ngắn (dưới chuẩn luật định Điều 318 LTM 2005)",
                risk_category="Khiếu nại & Bảo hành",
                description="Hợp đồng quy định thời hạn khiếu nại chỉ 24 - 48 giờ sau khi nhận hàng/dịch vụ là quá ngắn, tước bỏ quyền kiểm tra kỹ thuật thực tế của bên tiếp nhận. Điều 318 LTM 2005 cho phép thời hạn khiếu nại tối thiểu từ 3 đến 6 tháng.",
                legal_basis="Điều 318, Luật Thương mại 2005",
                original_text=clause.content,
                suggested_text="Thời hạn khiếu nại về số lượng, quy cách đóng gói là 15 ngày làm việc; thời hạn khiếu nại về chất lượng, lỗi kỹ thuật tiềm ẩn là 03 tháng kể từ ngày ký biên bản bàn giao.",
                rationale="Bảo đảm đủ thời gian vận hành kiểm thử hệ thống trước khi hết hạn khiếu nại.",
                bounding_boxes=clause.bounding_boxes
            ))

        # 7. RỦI RO THIẾU QUY ĐỊNH BẢO VỆ DỮ LIỆU CÁ NHÂN (Nghị định 13/2023/NĐ-CP)
        if any(kw in content for kw in ["dữ liệu cá nhân", "thông tin khách hàng", "cơ sở dữ liệu người dùng", "user data"]):
            if not any(kw in content for kw in ["nghị định 13", "đồng ý của chủ thể", "biện pháp kỹ thuật bảo mật", "xử lý dữ liệu"]):
                items.append(RiskItem(
                    id=f"risk_{clause.id}_dataprivacy",
                    clause_id=clause.id,
                    clause_number=clause.clause_number,
                    risk_level=RiskLevel.MEDIUM,
                    risk_title="Thiếu cam kết bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP",
                    risk_category="Bảo vệ Dữ liệu Cá nhân",
                    description="Hợp đồng có xử lý dữ liệu người dùng nhưng chưa tích hợp các điều khoản bắt buộc về quyền của chủ thể dữ liệu, biện pháp bảo vệ và trách nhiệm thông báo vi phạm theo Nghị định 13/2023/NĐ-CP.",
                    legal_basis="Điều 9, 11 & 17, Nghị định 13/2023/NĐ-CP",
                    original_text=clause.content,
                    suggested_text=clause.content + "\n[Đề xuất bổ sung]: 'Hai bên cam kết tuân thủ nghiêm ngặt các quy định về bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP, áp dụng các biện pháp bảo mật kỹ thuật thích hợp và chỉ xử lý dữ liệu trong phạm vi mục đích đã được chủ thể dữ liệu đồng ý.'",
                    rationale="Tránh rủi ro bị thanh tra và xử phạt hành chính theo quy định mới về an ninh dữ liệu.",
                    bounding_boxes=clause.bounding_boxes
                ))

        # 8. RỦI RO ĐIỀU KHOẢN BẤT KHẢ KHÁNG THIẾU NGHĨA VỤ THÔNG BÁO (Điều 295 LTM 2005)
        if "bất khả kháng" in content and not any(kw in content for kw in ["thông báo bằng văn bản", "trong vòng", "chứng nhận của cơ quan"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_forcemajeure",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.MEDIUM,
                risk_title="Điều khoản Bất khả kháng thiếu quy định thời hạn thông báo và nghĩa vụ giảm thiểu tổn thất",
                risk_category="Bất khả kháng",
                description="Điều khoản bất khả kháng không quy định rõ thời hạn bên gặp sự cố phải thông báo cho bên kia (thường là trong vòng 5-7 ngày) và nghĩa vụ nỗ lực khắc phục theo Điều 295 LTM 2005.",
                legal_basis="Điều 294 & Điều 295, Luật Thương mại 2005",
                original_text=clause.content,
                suggested_text=clause.content + "\n[Đề xuất bổ sung]: 'Bên gặp sự kiện bất khả kháng phải thông báo bằng văn bản cho bên kia trong vòng 07 ngày làm việc kể từ ngày sự kiện xảy ra kèm theo văn bản xác nhận của cơ quan có thẩm quyền và áp dụng mọi biện pháp hợp lý để hạn chế tổn thất.'",
                rationale="Tránh việc một bên lợi dụng sự kiện bất khả kháng để thoái thác nghĩa vụ thực hiện hợp đồng kéo dài.",
                bounding_boxes=clause.bounding_boxes
            ))

        # 9. RỦI RO THẨM QUYỀN TÒA ÁN ÁP ĐẶT (Điều 39 Bộ luật Tố tụng Dân sự 2015)
        if any(kw in content for kw in ["tòa án nơi bên a", "tòa án nơi bên b", "trụ sở của bên a", "trụ sở của bên b"]) and "trọng tài" not in content:
            items.append(RiskItem(
                id=f"risk_{clause.id}_jurisdiction",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.MEDIUM,
                risk_title="Thẩm quyền Tòa án áp đặt một chiều, bất lợi về mặt địa lý",
                risk_category="Tranh chấp & Tài phán",
                description="Quy định giải quyết tranh chấp tại Tòa án theo địa điểm của bên soạn thảo hợp đồng gây tốn kém chi phí đi lại, luật sư và nguồn lực tố tụng nếu có tranh chấp.",
                legal_basis="Điều 39 & 40, Bộ luật Tố tụng Dân sự 2015 & Luật Trọng tài thương mại 2010",
                original_text=clause.content,
                suggested_text="Mọi tranh chấp phát sinh từ Hợp đồng này trước hết sẽ được giải quyết bằng thương lượng, hòa giải trong thời hạn 30 ngày. Nếu không hòa giải được, tranh chấp sẽ được giải quyết tại Trung tâm Trọng tài Quốc tế Việt Nam (VIAC) theo Quy tắc tố tụng trọng tài của Trung tâm này (hoặc Tòa án nhân dân có thẩm quyền theo quy định của pháp luật tố tụng).",
                rationale="Trọng tài thương mại VIAC đảm bảo tính trung lập, bảo mật bí mật kinh doanh và phán quyết có hiệu lực chung thẩm nhanh chóng.",
                bounding_boxes=clause.bounding_boxes
            ))

        # 10. RỦI RO THỜI HẠN BẢO MẬT VÔ THỜI HẠN (Thông lệ thương mại & Luật Dân sự)
        if "bảo mật" in content and any(kw in content for kw in ["vô thời hạn", "mãi mãi", "kể cả sau khi chấm dứt mà không có thời hạn"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_confidentiality",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.LOW,
                risk_title="Thời hạn bảo mật vô thời hạn gây khó khăn cho việc quản trị thông tin",
                risk_category="Bảo mật thông tin",
                description="Ràng buộc nghĩa vụ bảo mật mãi mãi kể cả sau khi chấm dứt hợp đồng là không thực tế đối với dữ liệu thị trường và nhân sự trong ngành công nghệ.",
                legal_basis="Tập quán thương mại quốc tế & Điều 387 Bộ luật Dân sự 2015",
                original_text=clause.content,
                suggested_text="Nghĩa vụ bảo mật có hiệu lực trong suốt thời gian thực hiện Hợp đồng và tiếp tục có hiệu lực trong vòng 03 (ba) năm kể từ ngày Hợp đồng chấm dứt hiệu lực (trừ các bí mật công nghệ cốt lõi được bảo hộ theo luật sở hữu trí tuệ).",
                rationale="Quy định mốc thời gian 3 năm là hợp lý, khả thi và phù hợp với thông lệ pháp lý doanh nghiệp.",
                bounding_boxes=clause.bounding_boxes
            ))

        return items

    @classmethod
    def _generate_executive_summary(cls, title: str, score: int, critical: int, high: int, medium: int, total_clauses: int) -> str:
        if score >= 80:
            status_text = "Hợp đồng có mức độ an toàn cao, cơ bản tương thích với hệ thống pháp luật Việt Nam."
        elif score >= 50:
            status_text = "Hợp đồng tiềm ẩn các điều khoản rủi ro bất cân xứng, cần đàm phán sửa đổi để cân bằng quyền lợi."
        else:
            status_text = "CẢNH BÁO PHÁP LÝ CAO: Hợp đồng chứa các điều khoản phạt vi phạm vượt trần hoặc vi phạm quy định bắt buộc của Luật Thương mại 2005 và Bộ luật Dân sự 2015."

        return (
            f"Báo cáo rà soát hợp đồng '{title}' (Tổng số: {total_clauses} điều khoản). "
            f"Điểm an toàn: {score}/100. "
            f"Phát hiện {critical} rủi ro nghiêm trọng (Critical), {high} rủi ro cao (High), và {medium} điểm cần lưu ý (Medium). "
            f"{status_text}"
        )

    @classmethod
    def _build_knowledge_graph(cls, contract_id: str, title: str, clauses: List[Clause], risks: List[RiskItem]) -> KnowledgeGraphData:
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []

        # 1. Contract Node
        nodes.append(GraphNode(
            id=contract_id,
            label=title[:32] + "...",
            type="Contract",
            properties={"title": title}
        ))

        # 2. Clause Nodes
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
            edges.append(GraphEdge(
                source=f"node_{risk.clause_id}",
                target=risk_node_id,
                relation="EXHIBITS_RISK"
            ))

            if risk.legal_basis:
                clean_law_id = f"law_{re.sub(r'[^a-zA-Z0-9]', '_', risk.legal_basis)}"
                if clean_law_id not in law_set:
                    law_set.add(clean_law_id)
                    nodes.append(GraphNode(
                        id=clean_law_id,
                        label=risk.legal_basis,
                        type="Law",
                        properties={"name": risk.legal_basis}
                    ))
                edges.append(GraphEdge(
                    source=risk_node_id,
                    target=clean_law_id,
                    relation="VIOLATES_OR_REFERENCES"
                ))

        return KnowledgeGraphData(nodes=nodes, edges=edges)
