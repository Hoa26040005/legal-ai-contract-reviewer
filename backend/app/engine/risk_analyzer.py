import re
from typing import List, Dict, Any, Tuple
from app.models.schemas import (
    Clause, RiskItem, RiskLevel, ContractAnalysisReport,
    KnowledgeGraphData, GraphNode, GraphEdge
)
from app.core.config import settings

class LegalRiskAnalyzer:
    """
    Engine phân tích rủi ro pháp lý toàn diện, tích hợp đầy đủ hệ thống điều luật cho:
    1. HỢP ĐỒNG LAO ĐỘNG & QUAN HỆ LAO ĐỘNG (Bộ luật Lao động 2019, Luật BHXH, Luật An toàn vệ sinh lao động)
    2. HỢP ĐỒNG THƯƠNG MẠI & KINH DOANH (Luật Thương mại 2005, Luật Trọng tài thương mại 2010)
    3. HỢP ĐỒNG DÂN SỰ & NGHĨA VỤ (Bộ luật Dân sự 2015)
    4. SỞ HỮU TRÍ TUỆ & DỮ LIỆU CÔNG NGHỆ (Luật SHTT 2022, Nghị định 13/2023/NĐ-CP)
    """

    # Danh mục Thư viện Quy tắc Pháp luật Việt Nam Toàn Diện
    LEGAL_KNOWLEDGE_BASE = [
        # =========================================================================
        # KHỐI 1: BỘ LUẬT LAO ĐỘNG 2019 & HỢP ĐỒNG LAO ĐỘNG / LÀM VIỆC
        # =========================================================================
        {
            "code": "BLLD2019_D17_1",
            "law": "Điều 17.1, Bộ luật Lao động 2019",
            "topic": "Cấm giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ",
            "rule": "Người sử dụng lao động tuyệt đối không được giữ bản chính giấy tờ tuỳ thân, văn bằng, chứng chỉ của người lao động khi giao kết, thực hiện hợp đồng lao động.",
            "keywords": ["giữ bằng gốc", "giữ bản chính", "nộp bằng đại học gốc", "giữ cccd gốc", "giữ giấy tờ"]
        },
        {
            "code": "BLLD2019_D17_2",
            "law": "Điều 17.2, Bộ luật Lao động 2019",
            "topic": "Cấm yêu cầu người lao động đặt cọc, thế chấp tiền hoặc tài sản",
            "rule": "Nghiêm cấm yêu cầu người lao động phải thực hiện biện pháp bảo đảm bằng tiền hoặc tài sản khác cho việc thực hiện hợp đồng lao động (cấm bắt đóng tiền cọc, ký quỹ).",
            "keywords": ["đặt cọc tiền", "ký quỹ", "giữ tiền lương làm cọc", "thế chấp tài sản", "tiền bảo lãnh"]
        },
        {
            "code": "BLLD2019_D25",
            "law": "Điều 25, Bộ luật Lao động 2019",
            "topic": "Thời gian thử việc tối đa theo trình độ chuyên môn",
            "rule": "Thời gian thử việc không quá: 180 ngày đối với quản lý doanh nghiệp; 60 ngày đối với chức danh nghề nghiệp có trình độ cao đẳng trở lên; 30 ngày đối với trình độ trung cấp, công nhân kỹ thuật; 06 ngày làm việc đối với công việc khác. Không được thử việc quá 01 lần.",
            "keywords": ["thử việc 3 tháng", "thử việc 4 tháng", "thử việc 6 tháng", "gia hạn thử việc", "thử việc 120 ngày"]
        },
        {
            "code": "BLLD2019_D26",
            "law": "Điều 26, Bộ luật Lao động 2019",
            "topic": "Tiền lương trong thời gian thử việc tối thiểu 85%",
            "rule": "Tiền lương của người lao động trong thời gian thử việc do hai bên thoả thuận nhưng ít nhất phải bằng 85% mức lương của công việc đó.",
            "keywords": ["lương thử việc 50%", "lương thử việc 60%", "lương thử việc 70%", "dưới 85%"]
        },
        {
            "code": "BLLD2019_D127",
            "law": "Điều 127, Bộ luật Lao động 2019",
            "topic": "Cấm phạt tiền, trừ lương thay việc xử lý kỷ luật lao động",
            "rule": "Nghiêm cấm hành vi dùng hình thức phạt tiền, cắt lương thay việc xử lý kỷ luật lao động. Mọi quy định phạt tiền khi đi trễ, không đạt KPI trong HĐLĐ đều vô hiệu.",
            "keywords": ["phạt tiền khi vi phạm", "cắt lương", "trừ tiền lương", "phạt 500k", "phạt tiền mặt"]
        },
        {
            "code": "BLLD2019_D168",
            "law": "Điều 168, Bộ luật Lao động 2019 & Luật BHXH 2014",
            "topic": "Nghĩa vụ tham gia BHXH, BHYT, BHTN bắt buộc",
            "rule": "Người sử dụng lao động và người lao động phải tham gia bảo hiểm xã hội bắt buộc, bảo hiểm y tế, bảo hiểm thất nghiệp. Mọi thỏa thuận 'tự đóng bảo hiểm' hoặc 'chi trả tiền mặt thay đóng bảo hiểm' để trốn nghĩa vụ đều vô hiệu.",
            "keywords": ["không tham gia bhxh", "tự đóng bảo hiểm", "chi trả tiền mặt thay bhxh", "miễn đóng bhxh"]
        },
        {
            "code": "BLLD2019_D107",
            "law": "Điều 107 & Điều 98, Bộ luật Lao động 2019",
            "topic": "Giới hạn thời giờ làm thêm (OT) và tiền lương làm thêm giờ",
            "rule": "Thời giờ làm thêm không quá 50% số giờ làm việc bình thường/ngày, không quá 40 giờ/tháng và không quá 200 giờ/năm (hoặc 300 giờ ở ngành đặc thù). Tiền lương làm thêm giờ: ngày thường >=150%, ngày nghỉ hàng tuần >=200%, ngày lễ tết >=300%.",
            "keywords": ["làm thêm giờ không tính lương", "ot bắt buộc", "không trả lương ot", "vượt 40 giờ"]
        },
        {
            "code": "BLLD2019_D35",
            "law": "Điều 35, Bộ luật Lao động 2019",
            "topic": "Quyền đơn phương chấm dứt HĐLĐ của người lao động",
            "rule": "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động mà không cần lý do, chỉ cần báo trước: ít nhất 45 ngày (HĐ không xác định thời hạn); 30 ngày (HĐ từ 12-36 tháng); 03 ngày làm việc (HĐ dưới 12 tháng). Thỏa thuận cấm nghỉ việc hoặc phạt tiền nghỉ việc là trái luật.",
            "keywords": ["cấm nghỉ việc", "phạt nghỉ việc", "phải bồi thường khi nghỉ việc", "cam kết làm việc 5 năm"]
        },
        {
            "code": "BLLD2019_D21_NDA",
            "law": "Điều 21.2, Bộ luật Lao động 2019",
            "topic": "Thỏa thuận Không cạnh tranh (NCA) & Bảo mật (NDA) trong Lao động",
            "rule": "Thỏa thuận cấm làm việc cho đối thủ cạnh tranh sau khi nghỉ việc (Non-compete) phải có phạm vi địa lý và thời gian hợp lý (tối đa 1-2 năm) và bên sử dụng lao động phải có khoản bồi hoàn tài chính tương xứng cho người lao động trong thời gian bị hạn chế.",
            "keywords": ["cấm làm việc cho đối thủ 5 năm", "cấm làm ngành cntt", "non-compete không đền bù"]
        },

        # =========================================================================
        # KHỐI 2: LUẬT THƯƠNG MẠI 2005 (HỢP ĐỒNG KINH DOANH & B2B)
        # =========================================================================
        {
            "code": "LTM2005_D301",
            "law": "Điều 301, Luật Thương mại 2005",
            "topic": "Trần mức phạt vi phạm nghĩa vụ thương mại tối đa 8%",
            "rule": "Mức phạt đối với vi phạm nghĩa vụ hợp đồng do các bên thoả thuận, nhưng không quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm (trừ trường hợp kết quả giám định sai).",
            "keywords": ["phạt 10%", "phạt 15%", "phạt 20%", "phạt 30%", "phạt 50%", "tổng giá trị hợp đồng"]
        },
        {
            "code": "LTM2005_D307",
            "law": "Điều 307, Luật Thương mại 2005",
            "topic": "Quan hệ giữa Phạt vi phạm và Bồi thường thiệt hại",
            "rule": "Trường hợp không có thoả thuận phạt vi phạm thì chỉ được yêu cầu bồi thường thiệt hại. Nếu có thỏa thuận thì có quyền áp dụng cả hai.",
            "keywords": ["vừa phạt vừa bồi thường", "chỉ áp dụng", "không có thỏa thuận phạt"]
        },
        {
            "code": "LTM2005_D294_295",
            "law": "Điều 294 & 295, Luật Thương mại 2005",
            "topic": "Miễn trách nhiệm Bất khả kháng và thủ tục thông báo",
            "rule": "Miễn trách nhiệm khi có sự kiện bất khả kháng. Bên viện dẫn phải thông báo ngay bằng văn bản cho bên kia và áp dụng các biện pháp hạn chế thiệt hại.",
            "keywords": ["bất khả kháng", "thiên tai dịch bệnh", "thông báo văn bản", "miễn trừ trách nhiệm"]
        },
        {
            "code": "LTM2005_D318",
            "law": "Điều 318, Luật Thương mại 2005",
            "topic": "Thời hạn khiếu nại bắt buộc",
            "rule": "Thời hạn khiếu nại tối thiểu: 03 tháng kể từ ngày giao hàng đối với khiếu nại về số lượng, chất lượng; 06 tháng đối với khiếu nại khác. Cài cắm thời hạn khiếu nại chỉ 24h - 48h là bất hợp lý.",
            "keywords": ["khiếu nại 24 giờ", "khiếu nại 48 giờ", "khiếu nại 3 ngày", "sau 48h hết quyền"]
        },
        {
            "code": "LTM2005_D319",
            "law": "Điều 319, Luật Thương mại 2005",
            "topic": "Thời hiệu khởi kiện tranh chấp thương mại (02 năm)",
            "rule": "Thời hiệu khởi kiện áp dụng đối với các tranh chấp thương mại là 02 năm kể từ thời điểm quyền và lợi ích hợp pháp bị xâm phạm.",
            "keywords": ["thời hiệu khởi kiện 02 năm", "hết quyền khởi kiện"]
        },

        # =========================================================================
        # KHỐI 3: BỘ LUẬT DÂN SỰ 2015 (GIAO DỊCH DÂN SỰ & NGHĨA VỤ CHUNG)
        # =========================================================================
        {
            "code": "BLDS2015_D468",
            "law": "Điều 468 & Điều 357, Bộ luật Dân sự 2015",
            "topic": "Trần lãi suất vay và lãi phạt chậm trả tối đa 20%/năm",
            "rule": "Lãi suất theo thỏa thuận không được vượt quá 20%/năm. Các quy định tính lãi chậm trả 0.1% - 0.5%/ngày (tương đương 36.5% - 182.5%/năm) vượt quá mức trần này và phần vượt mức bị vô hiệu.",
            "keywords": ["0.1% mỗi ngày", "0.2% mỗi ngày", "0.5% mỗi ngày", "lãi phạt 30%/năm", "lãi suất chậm trả"]
        },
        {
            "code": "BLDS2015_D428",
            "law": "Điều 428, Bộ luật Dân sự 2015",
            "topic": "Đơn phương chấm dứt hợp đồng và nghĩa vụ thông báo",
            "rule": "Bên đơn phương chấm dứt thực hiện hợp đồng phải thông báo ngay cho bên kia biết; nếu không thông báo mà gây thiệt hại thì phải bồi thường.",
            "keywords": ["đơn phương chấm dứt ngay lập tức", "không cần báo trước", "hủy bỏ bất kỳ lúc nào"]
        },
        {
            "code": "BLDS2015_D360",
            "law": "Điều 360 & Điều 302 LTM 2005",
            "topic": "Bồi thường thiệt hại trực tiếp và Giới hạn trần trách nhiệm",
            "rule": "Bồi thường toàn bộ thiệt hại thực tế, trực tiếp. Bắt một bên gánh toàn bộ 'thiệt hại gián tiếp, mất cơ hội kinh doanh' mà không có mức trần trách nhiệm (Liability Cap) là rủi ro tài chính nghiêm trọng.",
            "keywords": ["thiệt hại gián tiếp", "mất cơ hội kinh doanh", "bồi thường toàn bộ không giới hạn"]
        },
        {
            "code": "BLDS2015_D405",
            "law": "Điều 405, Bộ luật Dân sự 2015",
            "topic": "Vô hiệu điều khoản bất bình đẳng trong hợp đồng theo mẫu",
            "rule": "Điều khoản trong hợp đồng theo mẫu miễn trách nhiệm của bên đưa ra mẫu, tăng trách nhiệm hoặc loại bỏ quyền lợi chính đáng của bên kia thì điều khoản đó vô hiệu.",
            "keywords": ["miễn trừ hoàn toàn trách nhiệm", "không chịu trách nhiệm trong mọi tình huống", "hợp đồng mẫu"]
        },
        {
            "code": "BLDS2015_D420",
            "law": "Điều 420, Bộ luật Dân sự 2015",
            "topic": "Thực hiện hợp đồng khi hoàn cảnh thay đổi cơ bản (Hardship Clause)",
            "rule": "Khi hoàn cảnh thay đổi cơ bản gây thiệt hại nghiêm trọng, bên bị ảnh hưởng có quyền yêu cầu đàm phán lại hợp đồng trong một thời hạn hợp lý.",
            "keywords": ["hoàn cảnh thay đổi cơ bản", "đàm phán lại giá trị", "biến động thị trường"]
        },

        # =========================================================================
        # KHỐI 4: DỮ LIỆU CÁ NHÂN & SỞ HỮU TRÍ TUỆ & TÀI PHÁN
        # =========================================================================
        {
            "code": "ND13_2023_NDCP",
            "law": "Điều 9, 11, 17, Nghị định 13/2023/NĐ-CP",
            "topic": "Bảo vệ Dữ liệu Cá nhân người lao động & khách hàng",
            "rule": "Việc xử lý dữ liệu cá nhân (kể cả thông tin nhân viên, khách hàng) bắt buộc phải có sự chấp thuận minh thị của chủ thể dữ liệu và tuân thủ các biện pháp bảo vệ kỹ thuật.",
            "keywords": ["dữ liệu cá nhân", "thông tin nhân viên", "thông tin khách hàng", "nghị định 13"]
        },
        {
            "code": "LSHTT_D20",
            "law": "Điều 20 & 45, Luật Sở hữu trí tuệ (sửa đổi 2022)",
            "topic": "Chuyển giao quyền tác giả đối với phần mềm, sáng chế",
            "rule": "Quyền tác giả và tài sản trí tuệ đối với phần mềm, thuật toán chỉ chuyển giao khi có thỏa thuận và bên nhận chuyển giao hoàn tất 100% nghĩa vụ thanh toán.",
            "keywords": ["mã nguồn thuộc bên a", "thuật toán sở hữu vô điều kiện", "bản quyền phần mềm"]
        },
        {
            "code": "BLTTDS_D39_LTTTM",
            "law": "Điều 39 BLTTDS 2015 & Luật Trọng tài thương mại 2010",
            "topic": "Thẩm quyền giải quyết tranh chấp công bằng",
            "rule": "Ưu tiên thương lượng hòa giải, giải quyết tại Trọng tài thương mại (VIAC) hoặc Tòa án nơi bị đơn cư trú thay vì áp đặt tòa án địa phương một chiều.",
            "keywords": ["tòa án nơi bên a", "tòa án nơi người sử dụng lao động", "thẩm quyền duy nhất"]
        }
    ]

    @classmethod
    def analyze_contract(cls, contract_id: str, title: str, contract_type: str, clauses: List[Clause]) -> ContractAnalysisReport:
        risks: List[RiskItem] = []
        
        for clause in clauses:
            clause_risks = cls._evaluate_clause(clause, contract_type)
            risks.extend(clause_risks)

        critical_count = sum(1 for r in risks if r.risk_level == RiskLevel.CRITICAL)
        high_count = sum(1 for r in risks if r.risk_level == RiskLevel.HIGH)
        medium_count = sum(1 for r in risks if r.risk_level == RiskLevel.MEDIUM)
        low_count = sum(1 for r in risks if r.risk_level == RiskLevel.LOW)

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
    def _evaluate_clause(cls, clause: Clause, contract_type: str = "") -> List[RiskItem]:
        content = clause.content.lower()
        items: List[RiskItem] = []

        # =====================================================================
        # NHÓM RỦI RO LAO ĐỘNG & HỢP ĐỒNG LÀM VIỆC (Bộ luật Lao động 2019)
        # =====================================================================

        # L1. Cấm giữ văn bằng, giấy tờ tùy thân gốc (Điều 17.1 BLLD 2019)
        if any(kw in content for kw in ["giữ bản chính", "giữ bằng gốc", "nộp bản gốc", "giữ giấy tờ gốc", "giữ bằng đại học"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_keep_diploma",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.CRITICAL,
                risk_title="Giữ văn bằng/giấy tờ gốc của người lao động (Vi phạm nghiêm trọng Điều 17.1 BLLD 2019)",
                risk_category="Pháp luật Lao động & Nhân sự",
                description="Hành vi yêu cầu người lao động nộp bản chính văn bằng, chứng chỉ hoặc giấy tờ tùy thân bị nghiêm cấm theo Điều 17.1 Bộ luật Lao động 2019. Doanh nghiệp có thể bị xử phạt vi phạm hành chính từ 20.000.000 đến 25.000.000 đồng theo Nghị định 12/2022/NĐ-CP.",
                legal_basis="Điều 17.1, Bộ luật Lao động 2019",
                original_text=clause.content,
                suggested_text="Người lao động chỉ có nghĩa vụ cung cấp bản sao có chứng thực của văn bằng, chứng chỉ và giấy tờ tùy thân để Người sử dụng lao động đối chiếu kiểm tra. Người sử dụng lao động không giữ bất kỳ bản chính giấy tờ tùy thân nào của Người lao động.",
                rationale="Loại bỏ hoàn toàn quy định giữ bằng gốc để tuân thủ pháp luật lao động và tránh bị xử phạt hành chính.",
                bounding_boxes=clause.bounding_boxes
            ))

        # L2. Cấm bắt người lao động đóng tiền cọc, ký quỹ (Điều 17.2 BLLD 2019)
        if any(kw in content for kw in ["đặt cọc tiền", "ký quỹ", "nộp tiền cọc", "giữ 20.000.000", "giữ tiền lương làm cọc", "tiền bảo lãnh"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_deposit_money",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.CRITICAL,
                risk_title="Bắt người lao động đặt cọc tiền/ký quỹ (Vi phạm điều cấm Điều 17.2 BLLD 2019)",
                risk_category="Pháp luật Lao động & Nhân sự",
                description="Yêu cầu người lao động nộp tiền cọc, ký quỹ hoặc giữ lại tiền lương để đảm bảo thực hiện hợp đồng bị nghiêm cấm tuyệt đối theo Điều 17.2 BLLD 2019. Điều khoản này hoàn toàn vô hiệu và bị phạt tiền từ 20.000.000 đến 25.000.000 đồng.",
                legal_basis="Điều 17.2, Bộ luật Lao động 2019",
                original_text=clause.content,
                suggested_text="Xóa bỏ hoàn toàn điều khoản yêu cầu đóng tiền cọc/ký quỹ. 'Người lao động cam kết thực hiện công việc với tinh thần trách nhiệm cao theo đúng nội quy lao động và thỏa ước lao động tập thể của Công ty.'",
                rationale="Hủy bỏ yêu cầu ký quỹ trái luật để bảo vệ quyền lợi người lao động và tránh chế tài xử phạt của Thanh tra lao động.",
                bounding_boxes=clause.bounding_boxes
            ))

        # L3. Thời gian thử việc vượt quá mức trần (Điều 25 BLLD 2019)
        if any(kw in content for kw in ["thử việc 3 tháng", "thử việc 4 tháng", "thử việc 120 ngày", "thử việc 90 ngày", "thử việc 6 tháng"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_probation_period",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Thời gian thử việc vượt mức trần tối đa 60 ngày theo Điều 25 BLLD 2019",
                risk_category="Pháp luật Lao động & Nhân sự",
                description="Theo Điều 25 BLLD 2019, thời gian thử việc tối đa cho vị trí công việc có trình độ cao đẳng, đại học trở lên (như kỹ sư phần mềm, nhân viên kinh doanh) chỉ là 60 ngày (chỉ có chức danh quản lý doanh nghiệp mới được thử việc tối đa 180 ngày). Quy định thử việc 3-4 tháng cho nhân viên là trái luật.",
                legal_basis="Điều 25, Bộ luật Lao động 2019",
                original_text=clause.content,
                suggested_text="Thời gian thử việc của Người lao động là 02 (hai) tháng (60 ngày) kể từ ngày bắt đầu làm việc. Hết thời gian thử việc, nếu đạt yêu cầu, hai bên sẽ ký kết Hợp đồng lao động chính thức.",
                rationale="Điều chỉnh thời gian thử việc về đúng mức trần tối đa 60 ngày cho người lao động có chuyên môn kỹ thuật.",
                bounding_boxes=clause.bounding_boxes
            ))

        # L4. Phạt tiền, cắt lương khi phạm lỗi (Điều 127 BLLD 2019)
        if any(kw in content for kw in ["phạt tiền 500", "phạt tiền", "phạt 200", "cắt lương", "trừ tiền lương khi vi phạm", "phạt tiền mặt"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_salary_penalty",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.CRITICAL,
                risk_title="Phạt tiền, trừ lương người lao động (Vi phạm nghiêm trọng Điều 127 BLLD 2019)",
                risk_category="Kỷ luật Lao động",
                description="Điều 127 BLLD 2019 nghiêm cấm dùng hình thức phạt tiền, cắt lương thay việc xử lý kỷ luật lao động. Doanh nghiệp chỉ được áp dụng 4 hình thức kỷ luật hợp pháp: Khiển trách, Kéo dài thời hạn nâng lương, Cách chức, Sa thải.",
                legal_basis="Điều 127, Bộ luật Lao động 2019",
                original_text=clause.content,
                suggested_text="Trường hợp Người lao động vi phạm kỷ luật lao động hoặc nội quy công ty, Người sử dụng lao động sẽ tiến hành xử lý kỷ luật theo đúng quy trình và các hình thức quy định tại Điều 124 Bộ luật Lao động 2019 (Khiển trách, Kéo dài thời hạn nâng lương tối đa 06 tháng, Cách chức hoặc Sa thải). Không áp dụng bất kỳ hình thức phạt tiền hoặc cắt lương nào.",
                rationale="Xóa bỏ chế tài phạt tiền trái pháp luật, tuân thủ đúng 4 hình thức kỷ luật lao động luật định.",
                bounding_boxes=clause.bounding_boxes
            ))

        # L5. Thỏa thuận cấm làm việc cho đối thủ (Non-compete) quá mức hoặc không đền bù
        if any(kw in content for kw in ["cấm làm việc cho bất kỳ công ty", "cấm làm việc cho đối thủ trong 5 năm", "cấm làm việc trong 3 năm", "không được làm trong ngành"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_non_compete",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Cam kết không cạnh tranh (NCA) thời hạn quá dài, xâm phạm quyền tự do việc làm",
                risk_category="Thỏa thuận Không cạnh tranh & NDA",
                description="Thỏa thuận cấm người lao động làm việc cho đối thủ trong 3-5 năm hoặc cấm làm trong toàn bộ ngành công nghệ là hạn chế quyền tự do làm việc của công dân theo Hiến pháp và BLLD 2019. Thỏa thuận NCA hợp lệ chỉ nên có thời hạn từ 12-24 tháng và Công ty phải trả khoản trợ cấp tài chính bù đắp cho người lao động trong thời gian này.",
                legal_basis="Điều 21.2 Bộ luật Lao động 2019 & Điều 35 Hiến pháp 2013",
                original_text=clause.content,
                suggested_text="Người lao động cam kết trong vòng 12 (mười hai) tháng kể từ ngày chấm dứt HĐLĐ không làm việc trực tiếp cho các đối thủ cạnh tranh trực tiếp của Công ty trong cùng phân khúc sản phẩm. Trong thời gian này, Công ty có trách nhiệm chi trả cho Người lao động khoản trợ cấp không cạnh tranh hàng tháng tương đương 50% mức lương bình quân 06 tháng gần nhất.",
                rationale="Rút ngắn thời hạn cấm cạnh tranh xuống 12 tháng và bổ sung khoản bù đắp tài chính hợp pháp cho người lao động.",
                bounding_boxes=clause.bounding_boxes
            ))

        # L6. Trốn đóng hoặc không tham gia BHXH (Điều 168 BLLD 2019)
        if any(kw in content for kw in ["không tham gia bhxh", "tự đóng bhxh", "tự chịu bảo hiểm", "chi trả tiền mặt thay vì đóng bhxh"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_social_insurance",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.CRITICAL,
                risk_title="Thỏa thuận không tham gia BHXH bắt buộc (Vi phạm nghiêm trọng Điều 168 BLLD 2019 & Luật BHXH)",
                risk_category="Bảo hiểm Xã hội & Chế độ",
                description="Tham gia BHXH, BHYT, BHTN là nghĩa vụ pháp lý bắt buộc của cả NSDLĐ và NLĐ khi ký HĐLĐ từ 01 tháng trở lên. Mọi thỏa thuận 'tự đóng' hoặc 'không tham gia' đều vô hiệu và doanh nghiệp sẽ bị truy thu, phạt chậm đóng và phạt hành chính nặng.",
                legal_basis="Điều 168, Bộ luật Lao động 2019 & Điều 2, 17 Luật Bảo hiểm xã hội 2014",
                original_text=clause.content,
                suggested_text="Người sử dụng lao động và Người lao động có trách nhiệm cùng tham gia và đóng đầy đủ các loại Bảo hiểm xã hội, Bảo hiểm y tế, Bảo hiểm thất nghiệp bắt buộc theo đúng tỷ lệ và mức lương đóng do pháp luật bảo hiểm xã hội quy định.",
                rationale="Tuân thủ chế độ bảo hiểm bắt buộc theo luật định để đảm bảo quyền lợi hưu trí, thai sản, ốm đau cho người lao động.",
                bounding_boxes=clause.bounding_boxes
            ))

        # =====================================================================
        # NHÓM RỦI RO THƯƠNG MẠI & DÂN SỰ (Luật Thương mại 2005 & BLDS 2015)
        # =====================================================================

        # C1. Phạt vi phạm vượt trần 8% (Điều 301 LTM 2005)
        penalty_match = re.search(r'phạt\s+(\d+)%\s*(?:giá trị|tổng)', content)
        if penalty_match:
            rate = int(penalty_match.group(1))
            if rate > 8:
                items.append(RiskItem(
                    id=f"risk_{clause.id}_penalty_cap",
                    clause_id=clause.id,
                    clause_number=clause.clause_number,
                    risk_level=RiskLevel.CRITICAL,
                    risk_title=f"Phạt vi phạm {rate}% vượt trần 8% theo Điều 301 Luật Thương mại 2005",
                    risk_category="Phạt vi phạm hợp đồng",
                    description=f"Điều khoản quy định mức phạt vi phạm là {rate}%, vượt quá mức trần tối đa 8% của Điều 301 Luật Thương mại 2005. Hội đồng Trọng tài hoặc Tòa án sẽ tuyên vô hiệu phần vượt quá mức trần này.",
                    legal_basis="Điều 301, Luật Thương mại 2005",
                    original_text=clause.content,
                    suggested_text=re.sub(r'phạt\s+\d+%\s*(giá trị|tổng)', 'phạt 8% giá trị phần nghĩa vụ bị vi phạm', clause.content, flags=re.IGNORECASE),
                    rationale="Khống chế mức phạt tối đa 8% theo luật định và chỉ tính trên phần nghĩa vụ vi phạm thực tế để đảm bảo hiệu lực thi hành.",
                    bounding_boxes=clause.bounding_boxes
                ))

        # C2. Lãi suất phạt chậm trả vượt trần 20%/năm (Điều 468 BLDS 2015)
        interest_match = re.search(r'(?:lãi\s+suất|lãi\s+chậm\s+trả|lãi\s+phạt)\s*(?:là|tương đương|cố định)?\s*(\d+(?:\.\d+)?)\s*%\s*(?:mỗi\s+ngày|/ngày|/tháng|/năm)', content)
        if interest_match or any(kw in content for kw in ["0.1% mỗi ngày", "0.2% mỗi ngày", "0.5% mỗi ngày", "30%/năm", "2%/tháng"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_interest_cap",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.CRITICAL,
                risk_title="Lãi phạt chậm trả vượt trần 20%/năm theo Điều 468 Bộ luật Dân sự 2015",
                risk_category="Lãi suất & Chậm thanh toán",
                description="Mức lãi phạt chậm trả tính theo ngày (0.1% - 0.5%/ngày tương đương 36.5% - 182.5%/năm) vượt xa mức trần 20%/năm của Điều 468 BLDS 2015. Phần lãi vượt mức bị vô hiệu.",
                legal_basis="Điều 468 & Điều 357, Bộ luật Dân sự 2015",
                original_text=clause.content,
                suggested_text=clause.content + "\n[Đề xuất sửa đổi]: 'Lãi suất chậm thanh toán được tính theo mức lãi suất nợ quá hạn bình quân trên thị trường nhưng trong mọi trường hợp không vượt quá mức trần 20%/năm theo Điều 468 Bộ luật Dân sự 2015.'",
                rationale="Khống chế mức trần lãi suất 20%/năm theo quy định để đảm bảo tính pháp lý hợp lệ.",
                bounding_boxes=clause.bounding_boxes
            ))

        # C3. Đơn phương chấm dứt hợp đồng ngay lập tức (Điều 428 BLDS 2015)
        if any(kw in content for kw in ["đơn phương chấm dứt", "ngay lập tức", "không cần thông báo trước", "không chịu bất kỳ trách nhiệm", "hủy bỏ hợp đồng bất kỳ lúc nào"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_unilateral_termination",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Đơn phương chấm dứt hợp đồng ngay lập tức, thiếu thời hạn báo trước",
                risk_category="Chấm dứt hợp đồng",
                description="Một bên tự cho mình quyền chấm dứt hợp đồng ngay lập tức mà không có thời hạn thông báo trước hợp lý (tối thiểu 30 ngày) và không quy định nghĩa vụ thanh toán phần khối lượng công việc đã hoàn thành.",
                legal_basis="Điều 428, Bộ luật Dân sự 2015",
                original_text=clause.content,
                suggested_text="Mỗi bên có quyền đơn phương chấm dứt Hợp đồng khi bên kia vi phạm nghiêm trọng nghĩa vụ và không khắc phục trong vòng 30 ngày kể từ ngày nhận được văn bản thông báo. Bên chấm dứt phải thanh toán đầy đủ cho khối lượng công việc đạt yêu cầu đã được nghiệm thu.",
                rationale="Đảm bảo nguyên tắc thiện chí, thời hạn chuẩn bị bàn giao và tránh gián đoạn hoạt động kinh doanh đột ngột.",
                bounding_boxes=clause.bounding_boxes
            ))

        # C4. Bồi thường không giới hạn & thiệt hại gián tiếp (Điều 360 BLDS 2015)
        if any(kw in content for kw in ["bồi thường toàn bộ thiệt hại phát sinh", "thiệt hại gián tiếp", "mất cơ hội kinh doanh", "tổn thất doanh thu", "không giới hạn trách nhiệm"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_unlimited_liability",
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

        # C5. Chiếm đoạt quyền SHTT / Mã nguồn (Luật SHTT sửa đổi 2022)
        if any(kw in content for kw in ["mã nguồn", "thuật toán", "sở hữu vô điều kiện", "thuộc toàn quyền sở hữu của bên a"]) and "bên b" in content:
            items.append(RiskItem(
                id=f"risk_{clause.id}_ip_takeover",
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

        # C6. Thời hạn khiếu nại quá ngắn (Điều 318 LTM 2005)
        if any(kw in content for kw in ["khiếu nại trong vòng 24 giờ", "khiếu nại trong vòng 48 giờ", "khiếu nại trong vòng 3 ngày", "sau 48h coi như đồng ý"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_claim_timeline",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Thời hạn khiếu nại 48 giờ quá ngắn (Điều 318 Luật Thương mại 2005)",
                risk_category="Khiếu nại & Bảo hành",
                description="Quy định thời hạn khiếu nại chỉ 24 - 48 giờ là quá ngắn đối với hợp đồng thương mại/dịch vụ phức tạp, tước bỏ quyền kiểm tra thực tế. Điều 318 LTM 2005 quy định thời hạn khiếu nại từ 3 đến 6 tháng.",
                legal_basis="Điều 318, Luật Thương mại 2005",
                original_text=clause.content,
                suggested_text="Thời hạn khiếu nại về số lượng, quy cách là 15 ngày làm việc; thời hạn khiếu nại về chất lượng, lỗi kỹ thuật tiềm ẩn là 03 tháng kể từ ngày bàn giao nghiệm thu.",
                rationale="Gia hạn thời hạn khiếu nại hợp lý để kịp phát hiện các lỗi vận hành tiềm ẩn.",
                bounding_boxes=clause.bounding_boxes
            ))

        # C7. Thiếu cam kết bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP)
        if any(kw in content for kw in ["dữ liệu cá nhân", "thông tin khách hàng", "cơ sở dữ liệu người dùng", "thông tin nhân viên"]):
            if not any(kw in content for kw in ["nghị định 13", "đồng ý của chủ thể", "biện pháp kỹ thuật bảo mật", "xử lý dữ liệu"]):
                items.append(RiskItem(
                    id=f"risk_{clause.id}_data_compliance",
                    clause_id=clause.id,
                    clause_number=clause.clause_number,
                    risk_level=RiskLevel.MEDIUM,
                    risk_title="Thiếu cam kết bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP",
                    risk_category="Bảo vệ Dữ liệu Cá nhân",
                    description="Hợp đồng có xử lý thông tin cá nhân nhưng chưa tích hợp các điều khoản bắt buộc về quyền của chủ thể dữ liệu và biện pháp bảo vệ theo Nghị định 13/2023/NĐ-CP.",
                    legal_basis="Điều 9, 11 & 17, Nghị định 13/2023/NĐ-CP",
                    original_text=clause.content,
                    suggested_text=clause.content + "\n[Đề xuất bổ sung]: 'Hai bên cam kết tuân thủ nghiêm ngặt các quy định về bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP, áp dụng các biện pháp bảo mật kỹ thuật thích hợp và chỉ xử lý dữ liệu trong phạm vi mục đích đã được chủ thể dữ liệu đồng ý.'",
                    rationale="Tránh rủi ro bị thanh tra và xử phạt vi phạm hành chính về an ninh dữ liệu.",
                    bounding_boxes=clause.bounding_boxes
                ))

        # C8. Thẩm quyền Tòa án áp đặt một chiều (Điều 39 BLTTDS 2015)
        if any(kw in content for kw in ["tòa án nơi bên a", "tòa án nơi bên b", "trụ sở của bên a", "trụ sở của bên b"]) and "trọng tài" not in content:
            items.append(RiskItem(
                id=f"risk_{clause.id}_jurisdiction_one_sided",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.MEDIUM,
                risk_title="Thẩm quyền Tòa án áp đặt một chiều, bất lợi về mặt địa lý",
                risk_category="Tranh chấp & Tài phán",
                description="Quy định giải quyết tranh chấp tại Tòa án theo địa điểm của bên soạn thảo hợp đồng gây tốn kém chi phí đi lại, luật sư và nguồn lực tố tụng nếu có tranh chấp.",
                original_text=clause.content,
                suggested_text="Mọi tranh chấp phát sinh từ Hợp đồng này trước hết sẽ được giải quyết bằng thương lượng, hòa giải trong thời hạn 30 ngày. Nếu không hòa giải được, tranh chấp sẽ được giải quyết tại Trung tâm Trọng tài Quốc tế Việt Nam (VIAC) theo Quy tắc tố tụng trọng tài của Trung tâm này.",
                rationale="Trọng tài thương mại VIAC đảm bảo tính trung lập, bảo mật bí mật kinh doanh và phán quyết có hiệu lực chung thẩm nhanh chóng.",
                bounding_boxes=clause.bounding_boxes
            ))

        # C9. Tích hợp nạp & quét quy tắc động từ Thư viện Luật (LegalLibraryManager)
        try:
            from app.engine.legal_library_manager import LegalLibraryManager
            dynamic_rules = LegalLibraryManager.get_active_rules()
            existing_bases = {r.legal_basis for r in items}
            for rule_item in dynamic_rules:
                law_name = rule_item.get("law", "")
                if law_name in existing_bases:
                    continue
                kws = [kw.lower().strip() for kw in rule_item.get("keywords", []) if len(kw.strip().split()) >= 2 or len(kw.strip()) >= 8]
                if any(kw in content for kw in kws):
                    lvl_str = rule_item.get("risk_level", "HIGH")
                    risk_lvl = RiskLevel.CRITICAL if lvl_str == "CRITICAL" else (RiskLevel.HIGH if lvl_str == "HIGH" else RiskLevel.MEDIUM)
                    items.append(RiskItem(
                        id=f"risk_{clause.id}_{rule_item.get('code')}",
                        clause_id=clause.id,
                        clause_number=clause.clause_number,
                        risk_level=risk_lvl,
                        risk_title=f"{rule_item.get('topic')} ({law_name})",
                        risk_category=rule_item.get("category", "Quy phạm Pháp luật"),
                        description=f"{rule_item.get('rule')} (Nguồn văn bản: {rule_item.get('statute_source', 'Thư viện luật')}).",
                        legal_basis=law_name,
                        original_text=clause.content,
                        suggested_text=f"[Khuyến nghị điều chỉnh theo {law_name}]: Đề nghị sửa đổi để phù hợp với quy phạm pháp luật tại {law_name} ({rule_item.get('rule')}).",
                        rationale=f"Tuân thủ nghiêm ngặt quy định tại {law_name}, phòng ngừa rủi ro bị tuyên vô hiệu.",
                        bounding_boxes=clause.bounding_boxes
                    ))
                    existing_bases.add(law_name)
        except Exception:
            pass

        return items

    @classmethod
    def _generate_executive_summary(cls, title: str, score: int, critical: int, high: int, medium: int, total_clauses: int) -> str:
        if score >= 80:
            status_text = "Hợp đồng có mức độ an toàn cao, cơ bản tương thích với hệ thống pháp luật Việt Nam (Lao động, Thương mại & Dân sự)."
        elif score >= 50:
            status_text = "Hợp đồng tiềm ẩn các điều khoản rủi ro bất cân xứng, cần đàm phán sửa đổi để cân bằng quyền lợi các bên."
        else:
            status_text = "CẢNH BÁO PHÁP LÝ CAO: Hợp đồng chứa các điều khoản vi phạm điều cấm của Bộ luật Lao động 2019, Luật Thương mại 2005 hoặc Bộ luật Dân sự 2015 có nguy cơ bị tuyên vô hiệu một phần hoặc toàn bộ."

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

        nodes.append(GraphNode(
            id=contract_id,
            label=title[:32] + "...",
            type="Contract",
            properties={"title": title}
        ))

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
