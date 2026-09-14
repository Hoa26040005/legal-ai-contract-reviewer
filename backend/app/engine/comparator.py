import re
from typing import List, Dict, Optional
from app.models.schemas import (
    Clause, ContractAnalysisReport, ContractComparisonReport,
    ClauseDiffItem, DiffStatus, RiskLevel
)
from app.engine.risk_analyzer import LegalRiskAnalyzer

class ContractComparator:
    """
    Engine so sánh đối chiếu giữa 2 phiên bản hợp đồng (Version Diff):
    - Khớp nối các điều khoản tương ứng giữa Bản V1 và Bản V2.
    - Phân loại trạng thái thay đổi: MODIFIED, ADDED, REMOVED, UNCHANGED.
    - Định lượng mức độ cải thiện điểm an toàn pháp lý (Score Delta).
    - Tự động ghi nhận các thắng lợi đàm phán (Resolved Risks).
    """

    @classmethod
    def compare_contracts(
        cls,
        title_v1: str,
        clauses_v1: List[Clause],
        title_v2: str,
        clauses_v2: List[Clause],
        contract_type: str = "Hợp đồng So sánh"
    ) -> ContractComparisonReport:
        # 1. Chạy thẩm định rủi ro độc lập trên cả 2 phiên bản
        report_v1 = LegalRiskAnalyzer.analyze_contract("v1", title_v1, contract_type, clauses_v1)
        report_v2 = LegalRiskAnalyzer.analyze_contract("v2", title_v2, contract_type, clauses_v2)

        # 2. Xây dựng bản đồ ánh xạ theo số Điều khoản
        map_v1 = {cls._normalize_num(c.clause_number): c for c in clauses_v1}
        map_v2 = {cls._normalize_num(c.clause_number): c for c in clauses_v2}

        all_keys = list(dict.fromkeys(list(map_v1.keys()) + list(map_v2.keys())))
        diff_items: List[ClauseDiffItem] = []
        resolved_count = 0

        # Lấy danh mục rủi ro của từng bản
        risks_v1_by_clause = {r.clause_id: r for r in report_v1.risks}
        risks_v2_by_clause = {r.clause_id: r for r in report_v2.risks}

        for key in all_keys:
            c1 = map_v1.get(key)
            c2 = map_v2.get(key)

            if c1 and not c2:
                # Điều khoản bị xóa bỏ trong V2
                resolved_risk_text = None
                r1 = risks_v1_by_clause.get(c1.id)
                if r1:
                    resolved_count += 1
                    resolved_risk_text = f"Đã loại bỏ hoàn toàn rủi ro: {r1.risk_title}"

                diff_items.append(ClauseDiffItem(
                    clause_number=c1.clause_number,
                    title=c1.title,
                    status=DiffStatus.REMOVED,
                    text_v1=c1.content,
                    text_v2=None,
                    resolved_risk=resolved_risk_text,
                    legal_impact="Đã hủy bỏ điều khoản bất lợi trong bản thảo V2."
                ))

            elif not c1 and c2:
                # Điều khoản mới bổ sung trong V2
                diff_items.append(ClauseDiffItem(
                    clause_number=c2.clause_number,
                    title=c2.title,
                    status=DiffStatus.ADDED,
                    text_v1=None,
                    text_v2=c2.content,
                    resolved_risk=None,
                    legal_impact="Điều khoản mới bổ sung trong bản thảo V2."
                ))

            else:
                # Cả hai đều có -> Kiểm tra thay đổi nội dung
                text1_clean = " ".join(c1.content.split())
                text2_clean = " ".join(c2.content.split())

                if text1_clean == text2_clean:
                    diff_items.append(ClauseDiffItem(
                        clause_number=c1.clause_number,
                        title=c1.title,
                        status=DiffStatus.UNCHANGED,
                        text_v1=c1.content,
                        text_v2=c2.content,
                        resolved_risk=None,
                        legal_impact="Nội dung được giữ nguyên không thay đổi."
                    ))
                else:
                    # Đã sửa đổi (MODIFIED)
                    r1 = risks_v1_by_clause.get(c1.id)
                    r2 = risks_v2_by_clause.get(c2.id)
                    resolved_risk_text = None
                    legal_impact_text = "Đã chỉnh sửa câu chữ điều khoản."

                    if r1 and not r2:
                        resolved_count += 1
                        resolved_risk_text = f"Đàm phán thành công: Đã sửa đổi hợp pháp và gỡ bỏ rủi ro '{r1.risk_title}'"
                        legal_impact_text = f"Tuân thủ căn cứ pháp luật: {r1.legal_basis}"
                    elif r1 and r2:
                        legal_impact_text = "Đã có sửa đổi nhưng vẫn còn điểm cần tiếp tục đàm phán."

                    diff_items.append(ClauseDiffItem(
                        clause_number=c2.clause_number,
                        title=c2.title,
                        status=DiffStatus.MODIFIED,
                        text_v1=c1.content,
                        text_v2=c2.content,
                        resolved_risk=resolved_risk_text,
                        legal_impact=legal_impact_text
                    ))

        score_delta = report_v2.overall_score - report_v1.overall_score

        if score_delta > 0:
            summary = (
                f"KẾT QUẢ ĐÀM PHÁN XUẤT SẮC: Bản V2 an toàn hơn đáng kể (+{score_delta} điểm). "
                f"Điểm an toàn tăng từ {report_v1.overall_score}/100 lên {report_v2.overall_score}/100. "
                f"Đã triệt tiêu thành công {resolved_count} rủi ro pháp lý/vi phạm điều cấm so với bản dự thảo ban đầu."
            )
        elif score_delta == 0:
            summary = "Hai phiên bản có mức độ an toàn tương đương nhau, chưa có sự cải thiện đáng kể về mặt pháp lý."
        else:
            summary = f"CẢNH BÁO: Bản V2 có mức độ rủi ro tăng lên ({score_delta} điểm) so với bản V1 ban đầu."

        return ContractComparisonReport(
            title_v1=title_v1,
            title_v2=title_v2,
            score_v1=report_v1.overall_score,
            score_v2=report_v2.overall_score,
            score_delta=score_delta,
            summary=summary,
            resolved_risks_count=resolved_count,
            diff_items=diff_items
        )

    @staticmethod
    def _normalize_num(num_str: str) -> str:
        # Chuẩn hóa 'Điều 1', 'Điều 1.', 'Điều 1:' -> 'dieu_1'
        match = re.search(r'\d+', num_str)
        if match:
            return f"dieu_{match.group(0)}"
        return num_str.lower().strip()

    @classmethod
    def get_sample_comparison(cls) -> ContractComparisonReport:
        """Bộ so sánh mẫu thực tế: HĐ Lao Động V1 (chứa bẫy) vs HĐ Lao Động V2 (đã đàm phán thành công)"""
        title_v1 = "HĐ Lao Động V1 (Dự thảo đối tác gửi - Chứa nhiều bẫy)"
        title_v2 = "HĐ Lao Động V2 (Bản sau khi đàm phán pháp lý thành công)"

        clauses_v1 = [
            Clause(
                id="c1", clause_number="Điều 1", title="Hồ sơ nhân sự",
                content="Người lao động phải nộp bản gốc bằng tốt nghiệp đại học và giấy tờ tùy thân gốc để Công ty lưu giữ trong suốt thời hạn hợp đồng.",
                page_number=1, bounding_boxes=[]
            ),
            Clause(
                id="c2", clause_number="Điều 2", title="Thời gian Thử việc & Ký quỹ",
                content="Thời gian thử việc là 04 tháng (120 ngày). Người lao động phải nộp tiền đặt cọc ký quỹ là 20.000.000 VNĐ vào ngày đầu nhận việc.",
                page_number=1, bounding_boxes=[]
            ),
            Clause(
                id="c3", clause_number="Điều 3", title="Chế độ Bảo hiểm Xã hội",
                content="Công ty không tham gia BHXH bắt buộc cho Người lao động mà cộng thêm 500.000 VNĐ/tháng để Người lao động tự lo.",
                page_number=2, bounding_boxes=[]
            ),
            Clause(
                id="c4", clause_number="Điều 4", title="Kỷ luật & Chế tài Phạt tiền",
                content="Nếu đi làm trễ quá 15 phút hoặc không đạt KPI tuần, Công ty sẽ phạt tiền 500.000 VNĐ trừ trực tiếp vào lương.",
                page_number=2, bounding_boxes=[]
            ),
            Clause(
                id="c5", clause_number="Điều 5", title="Cam kết Không Cạnh tranh",
                content="Sau khi nghỉ việc, Người lao động cấm làm việc cho bất kỳ công ty nào trong ngành CNTT trong thời hạn 03 năm kể từ ngày nghỉ việc.",
                page_number=3, bounding_boxes=[]
            )
        ]

        clauses_v2 = [
            Clause(
                id="c1", clause_number="Điều 1", title="Hồ sơ nhân sự",
                content="Người lao động xuất trình bản chính văn bằng để Công ty đối chiếu và nộp 01 bản sao có chứng thực. Công ty không lưu giữ bất kỳ bản chính giấy tờ tùy thân nào của Người lao động theo Điều 17.1 BLLD 2019.",
                page_number=1, bounding_boxes=[]
            ),
            Clause(
                id="c2", clause_number="Điều 2", title="Thời gian Thử việc",
                content="Thời gian thử việc là 60 (sáu mươi) ngày theo đúng Điều 25 BLLD 2019. Lương thử việc bằng 85% mức lương chính thức. Hủy bỏ hoàn toàn yêu cầu đặt cọc tiền ký quỹ.",
                page_number=1, bounding_boxes=[]
            ),
            Clause(
                id="c3", clause_number="Điều 3", title="Chế độ Bảo hiểm Xã hội",
                content="Công ty và Người lao động cùng đóng đầy đủ Bảo hiểm xã hội, Bảo hiểm y tế, Bảo hiểm thất nghiệp bắt buộc theo đúng quy định của Luật BHXH.",
                page_number=2, bounding_boxes=[]
            ),
            Clause(
                id="c4", clause_number="Điều 4", title="Kỷ luật Lao động",
                content="Mọi hành vi vi phạm kỷ luật được xử lý theo đúng 4 hình thức luật định (Khiển trách, Kéo dài nâng lương, Cách chức, Sa thải theo Điều 124 BLLD 2019). Không áp dụng chế tài phạt tiền hoặc cắt lương.",
                page_number=2, bounding_boxes=[]
            ),
            Clause(
                id="c5", clause_number="Điều 5", title="Cam kết Bảo mật & Không Cạnh tranh",
                content="Người lao động cam kết trong vòng 12 tháng không làm việc cho các đối thủ cạnh tranh trực tiếp. Công ty chi trả khoản trợ cấp không cạnh tranh hàng tháng tương đương 50% mức lương bình quân theo quy định.",
                page_number=3, bounding_boxes=[]
            )
        ]

        return cls.compare_contracts(title_v1, clauses_v1, title_v2, clauses_v2, "Hợp đồng Lao động (BLLD 2019)")
