from typing import List, Dict
from app.models.schemas import Clause, BoundingBox, ContractSummaryItem, ContractAnalysisReport
from app.engine.risk_analyzer import LegalRiskAnalyzer

def get_sample_contracts_summary() -> List[ContractSummaryItem]:
    return [
        ContractSummaryItem(
            id="sample_it_service",
            title="Hợp đồng Dịch vụ Phát triển Phần mềm & Triển khai Hệ thống AI",
            contract_type="Hợp đồng Dịch vụ CNTT",
            page_count=3,
            created_at="2026-08-25",
            score=42,
            status="ready"
        ),
        ContractSummaryItem(
            id="sample_nda",
            title="Thỏa thuận Bảo mật Thông tin Không Tiết lộ (NDA Song phương)",
            contract_type="Thỏa thuận Bảo mật",
            page_count=2,
            created_at="2026-08-20",
            score=78,
            status="ready"
        ),
        ContractSummaryItem(
            id="sample_commercial_sale",
            title="Hợp đồng Mua bán Thiết bị Phần cứng & Máy chủ Máy chủ Doanh nghiệp",
            contract_type="Hợp đồng Mua bán Hàng hóa",
            page_count=4,
            created_at="2026-08-15",
            score=58,
            status="ready"
        )
    ]

def get_sample_contract_analysis(sample_id: str) -> ContractAnalysisReport:
    if sample_id == "sample_nda":
        title = "Thỏa thuận Bảo mật Thông tin Không Tiết lộ (NDA Song phương)"
        contract_type = "Thỏa thuận Bảo mật"
        clauses = [
            Clause(
                id="clause_1",
                clause_number="Điều 1",
                title="Định nghĩa Thông tin Bảo mật",
                content="Thông tin bảo mật bao gồm toàn bộ dữ liệu kinh doanh, mã nguồn phần mềm, chiến lược tiếp thị, thông tin khách hàng và bí mật công nghệ do Bên Tiết lộ cung cấp cho Bên Nhận dưới bất kỳ hình thức nào (văn bản, lời nói, điện tử).",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.25, x1=0.9, y1=0.35)]
            ),
            Clause(
                id="clause_2",
                clause_number="Điều 2",
                title="Nghĩa vụ Bảo mật & Thời hạn",
                content="Bên Nhận cam kết bảo mật tuyệt đối các thông tin đã nhận và không cung cấp cho bất kỳ bên thứ ba nào. Nghĩa vụ bảo mật này có hiệu lực mãi mãi và vô thời hạn, kể cả sau khi hai bên chấm dứt mọi quan hệ hợp tác kinh doanh.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.40, x1=0.9, y1=0.52)]
            ),
            Clause(
                id="clause_3",
                clause_number="Điều 3",
                title="Phạt Vi phạm & Bồi thường Thiệt hại",
                content="Trường hợp Bên Nhận làm lộ thông tin bảo mật, Bên Nhận phải chịu mức phạt vi phạm cố định tương đương 500.000.000 VNĐ và bồi thường toàn bộ thiệt hại gián tiếp, mất mát cơ hội kinh doanh thực tế phát sinh.",
                page_number=2,
                bounding_boxes=[BoundingBox(page=2, x0=0.1, y0=0.20, x1=0.9, y1=0.35)]
            ),
            Clause(
                id="clause_4",
                clause_number="Điều 4",
                title="Luật Áp dụng & Thẩm quyền Giải quyết Tranh chấp",
                content="Thỏa thuận này chịu sự điều chỉnh của pháp luật Việt Nam. Mọi tranh chấp nếu không hòa giải được sẽ được đưa ra giải quyết tại Tòa án nhân dân nơi Bên Tiết lộ đặt trụ sở chính.",
                page_number=2,
                bounding_boxes=[BoundingBox(page=2, x0=0.1, y0=0.40, x1=0.9, y1=0.50)]
            )
        ]
    elif sample_id == "sample_commercial_sale":
        title = "Hợp đồng Mua bán Thiết bị Phần cứng & Máy chủ Doanh nghiệp"
        contract_type = "Hợp đồng Mua bán Hàng hóa"
        clauses = [
            Clause(
                id="clause_1",
                clause_number="Điều 1",
                title="Đối tượng Hợp đồng & Tiêu chuẩn Kỹ thuật",
                content="Bên Bán đồng ý cung cấp và Bên Mua đồng ý mua hệ thống máy chủ GPU Cluster và thiết bị mạng kèm theo thông số kỹ thuật chi tiết tại Phụ lục 01 đính kèm Hợp đồng này.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.25, x1=0.9, y1=0.38)]
            ),
            Clause(
                id="clause_2",
                clause_number="Điều 2",
                title="Thời hạn Giao hàng & Bàn giao",
                content="Bên Bán có trách nhiệm giao hàng trong vòng 45 ngày kể từ ngày nhận được tiền tạm ứng. Trường hợp chậm giao hàng, Bên Bán chịu phạt 0.5% mỗi ngày chậm trễ.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.45, x1=0.9, y1=0.55)]
            ),
            Clause(
                id="clause_3",
                clause_number="Điều 3",
                title="Phạt Vi phạm Nghĩa vụ Hợp đồng",
                content="Bất kỳ bên nào vi phạm nghĩa vụ hợp đồng dẫn đến hủy bỏ hợp đồng sẽ phải chịu phạt 20% tổng giá trị hợp đồng và bồi thường toàn bộ chi phí phát sinh cho bên bị vi phạm.",
                page_number=2,
                bounding_boxes=[BoundingBox(page=2, x0=0.1, y0=0.20, x1=0.9, y1=0.35)]
            ),
            Clause(
                id="clause_4",
                clause_number="Điều 4",
                title="Đơn phương Chấm dứt Hợp đồng",
                content="Bên Mua có quyền đơn phương chấm dứt hợp đồng ngay lập tức mà không cần thông báo trước nếu Bên Bán chậm giao hàng quá 10 ngày làm việc và yêu cầu hoàn trả 100% tiền cọc.",
                page_number=2,
                bounding_boxes=[BoundingBox(page=2, x0=0.1, y0=0.40, x1=0.9, y1=0.52)]
            )
        ]
    else: # sample_it_service (Default)
        title = "Hợp đồng Dịch vụ Phát triển Phần mềm & Triển khai Hệ thống AI"
        contract_type = "Hợp đồng Dịch vụ CNTT"
        clauses = [
            Clause(
                id="clause_1",
                clause_number="Điều 1",
                title="Phạm vi Công việc & Tiến độ Triển khai",
                content="Bên B (Nhà phát triển) nhận cung cấp dịch vụ xây dựng phần mềm phân tích văn bản AI và tích hợp API cho Bên A (Khách hàng) theo đúng các mốc tiến độ quy định tại Phụ lục A.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.22, x1=0.9, y1=0.34)]
            ),
            Clause(
                id="clause_2",
                clause_number="Điều 2",
                title="Thanh toán & Nghiệm thu",
                content="Bên A thanh toán cho Bên B thành 3 đợt. Đợt 1: Tạm ứng 30% khi ký hợp đồng. Đợt 2: 40% khi bàn giao phiên bản Beta. Đợt 3: 30% sau khi nghiệm thu chính thức và chạy thử 15 ngày.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.38, x1=0.9, y1=0.50)]
            ),
            Clause(
                id="clause_3",
                clause_number="Điều 3",
                title="Phạt Vi phạm Hợp đồng",
                content="Nếu Bên B chậm tiến độ bàn giao quá 7 ngày, Bên B phải chịu mức phạt vi phạm là 15% tổng giá trị hợp đồng đối với mỗi tuần chậm trễ và Bên A có quyền khấu trừ trực tiếp vào đợt thanh toán tiếp theo.",
                page_number=2,
                bounding_boxes=[BoundingBox(page=2, x0=0.1, y0=0.20, x1=0.9, y1=0.35)]
            ),
            Clause(
                id="clause_4",
                clause_number="Điều 4",
                title="Đơn phương Chấm dứt & Quyền sở hữu Trí tuệ",
                content="Bên A có quyền đơn phương chấm dứt hợp đồng ngay lập tức bất kỳ lúc nào mà không cần thông báo trước và không chịu bất kỳ trách nhiệm tài chính nào. Toàn bộ mã nguồn, tài liệu thiết kế và thuật toán AI do Bên B sáng tạo trong thời gian thực hiện đều thuộc quyền sở hữu vô điều kiện của Bên A.",
                page_number=2,
                bounding_boxes=[BoundingBox(page=2, x0=0.1, y0=0.40, x1=0.9, y1=0.55)]
            ),
            Clause(
                id="clause_5",
                clause_number="Điều 5",
                title="Trách nhiệm Bồi thường Thiệt hại Toàn bộ",
                content="Bên B cam kết bồi thường toàn bộ thiệt hại phát sinh bao gồm thiệt hại trực tiếp, thiệt hại gián tiếp và tổn thất doanh thu nếu hệ thống phần mềm gặp sự cố gián đoạn trong thời gian vận hành thử nghiệm.",
                page_number=3,
                bounding_boxes=[BoundingBox(page=3, x0=0.1, y0=0.22, x1=0.9, y1=0.38)]
            ),
            Clause(
                id="clause_6",
                clause_number="Điều 6",
                title="Giải quyết Tranh chấp & Cơ quan Tài phán",
                content="Mọi tranh chấp phát sinh sẽ được giải quyết duy nhất tại Tòa án nhân dân nơi Bên A đặt trụ sở. Mọi chi phí tố tụng và luật sư do Bên thua kiện gánh chịu toàn bộ.",
                page_number=3,
                bounding_boxes=[BoundingBox(page=3, x0=0.1, y0=0.45, x1=0.9, y1=0.58)]
            )
        ]

    return LegalRiskAnalyzer.analyze_contract(
        contract_id=sample_id,
        title=title,
        contract_type=contract_type,
        clauses=clauses
    )
