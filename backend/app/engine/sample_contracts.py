from typing import List, Dict
from app.models.schemas import Clause, BoundingBox, ContractSummaryItem, ContractAnalysisReport
from app.engine.risk_analyzer import LegalRiskAnalyzer

def get_sample_contracts_summary() -> List[ContractSummaryItem]:
    return [
        ContractSummaryItem(
            id="sample_labor_contract",
            title="Hợp đồng Lao động & Cam kết Làm việc (Vị trí Kỹ sư Phần mềm AI)",
            contract_type="Hợp đồng Lao động (BLLD 2019)",
            page_count=3,
            created_at="2026-08-28",
            score=28,
            status="ready"
        ),
        ContractSummaryItem(
            id="sample_it_service",
            title="Hợp đồng Dịch vụ Phát triển Phần mềm & Triển khai Hệ thống AI",
            contract_type="Hợp đồng Dịch vụ CNTT",
            page_count=3,
            created_at="2026-08-25",
            score=35,
            status="ready"
        ),
        ContractSummaryItem(
            id="sample_commercial_sale",
            title="Hợp đồng Mua bán Thiết bị Phần cứng & Máy chủ Doanh nghiệp",
            contract_type="Hợp đồng Mua bán Hàng hóa",
            page_count=4,
            created_at="2026-08-15",
            score=52,
            status="ready"
        ),
        ContractSummaryItem(
            id="sample_nda",
            title="Thỏa thuận Bảo mật Thông tin Không Tiết lộ (NDA Song phương)",
            contract_type="Thỏa thuận Bảo mật",
            page_count=2,
            created_at="2026-08-20",
            score=72,
            status="ready"
        )
    ]

def get_sample_contract_analysis(sample_id: str) -> ContractAnalysisReport:
    if sample_id == "sample_labor_contract":
        title = "Hợp đồng Lao động & Cam kết Làm việc (Vị trí Kỹ sư Phần mềm AI)"
        contract_type = "Hợp đồng Lao động (BLLD 2019)"
        clauses = [
            Clause(
                id="clause_1",
                clause_number="Điều 1",
                title="Vị trí Công việc & Hồ sơ Tiếp nhận",
                content="Người sử dụng lao động tuyển dụng Người lao động làm việc tại vị trí Kỹ sư Phần mềm AI. Khi ký hợp đồng, Người lao động phải nộp bản gốc bằng tốt nghiệp đại học và giấy tờ tùy thân gốc để Công ty lưu giữ trong suốt thời hạn hợp đồng.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.22, x1=0.9, y1=0.35)]
            ),
            Clause(
                id="clause_2",
                clause_number="Điều 2",
                title="Thời gian Thử việc & Tiền ký quỹ Bảo đảm",
                content="Thời gian thử việc là 04 tháng (120 ngày). Để bảo đảm việc thực hiện hợp đồng và không tự ý bỏ việc, Người lao động phải nộp tiền đặt cọc ký quỹ là 20.000.000 VNĐ vào tài khoản Công ty ngay trong ngày đầu nhận việc.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.38, x1=0.9, y1=0.52)]
            ),
            Clause(
                id="clause_3",
                clause_number="Điều 3",
                title="Tiền lương & Chế độ Bảo hiểm Xã hội",
                content="Mức lương chính thức là 30.000.000 VNĐ/tháng. Hai bên thỏa thuận Công ty không tham gia BHXH, BHYT, BHTN bắt buộc cho Người lao động mà sẽ cộng thêm 500.000 VNĐ/tháng vào lương để Người lao động tự lo các loại bảo hiểm.",
                page_number=2,
                bounding_boxes=[BoundingBox(page=2, x0=0.1, y0=0.20, x1=0.9, y1=0.36)]
            ),
            Clause(
                id="clause_4",
                clause_number="Điều 4",
                title="Kỷ luật Lao động & Chế tài Phạt tiền",
                content="Nếu Người lao động đi làm trễ quá 15 phút hoặc không hoàn thành KPI tuần, Công ty sẽ áp dụng chế tài phạt tiền 500.000 VNĐ cho mỗi lần vi phạm và trừ trực tiếp vào tiền lương của tháng đó.",
                page_number=2,
                bounding_boxes=[BoundingBox(page=2, x0=0.1, y0=0.40, x1=0.9, y1=0.54)]
            ),
            Clause(
                id="clause_5",
                clause_number="Điều 5",
                title="Thỏa thuận Không Cạnh tranh (Non-Compete)",
                content="Sau khi chấm dứt hợp đồng lao động vì bất kỳ lý do gì, Người lao động cam kết cấm làm việc cho bất kỳ công ty nào trong ngành công nghệ thông tin hoặc đối thủ cạnh tranh trong thời hạn 03 năm kể từ ngày nghỉ việc.",
                page_number=3,
                bounding_boxes=[BoundingBox(page=3, x0=0.1, y0=0.22, x1=0.9, y1=0.38)]
            ),
            Clause(
                id="clause_6",
                clause_number="Điều 6",
                title="Quyền Đơn phương Chấm dứt & Thẩm quyền Tòa án",
                content="Người lao động cam kết làm việc tối thiểu 03 năm và không được đơn phương nghỉ việc. Nếu nghỉ việc trước hạn phải bồi thường 06 tháng tiền lương. Mọi tranh chấp phát sinh sẽ được giải quyết duy nhất tại Tòa án nơi Công ty đặt trụ sở.",
                page_number=3,
                bounding_boxes=[BoundingBox(page=3, x0=0.1, y0=0.42, x1=0.9, y1=0.56)]
            )
        ]
    elif sample_id == "sample_nda":
        title = "Thỏa thuận Bảo mật Thông tin Không Tiết lộ (NDA Song phương)"
        contract_type = "Thỏa thuận Bảo mật"
        clauses = [
            Clause(
                id="clause_1",
                clause_number="Điều 1",
                title="Định nghĩa Thông tin Bảo mật",
                content="Thông tin bảo mật bao gồm toàn bộ dữ liệu kinh doanh, mã nguồn phần mềm, chiến lược tiếp thị, thông tin khách hàng và bí mật công nghệ do Bên Tiết lộ cung cấp cho Bên Nhận.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.25, x1=0.9, y1=0.35)]
            ),
            Clause(
                id="clause_2",
                clause_number="Điều 2",
                title="Nghĩa vụ Bảo mật & Thời hạn",
                content="Bên Nhận cam kết bảo mật tuyệt đối các thông tin đã nhận. Nghĩa vụ bảo mật này có hiệu lực mãi mãi và vô thời hạn, kể cả sau khi hai bên chấm dứt mọi quan hệ hợp tác.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.40, x1=0.9, y1=0.52)]
            ),
            Clause(
                id="clause_3",
                clause_number="Điều 3",
                title="Phạt Vi phạm & Bồi thường Thiệt hại",
                content="Trường hợp Bên Nhận làm lộ thông tin bảo mật, Bên Nhận phải chịu mức phạt vi phạm cố định tương đương 500.000.000 VNĐ và bồi thường toàn bộ thiệt hại gián tiếp, mất cơ hội kinh doanh.",
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
                content="Bên Bán đồng ý cung cấp và Bên Mua đồng ý mua hệ thống máy chủ GPU Cluster và thiết bị mạng kèm theo thông số kỹ thuật chi tiết tại Phụ lục 01 đính kèm.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.25, x1=0.9, y1=0.38)]
            ),
            Clause(
                id="clause_2",
                clause_number="Điều 2",
                title="Thời hạn Giao hàng & Lãi phạt Chậm trả",
                content="Bên Bán có trách nhiệm giao hàng trong vòng 45 ngày. Nếu Bên Mua chậm thanh toán, Bên Mua phải chịu lãi suất chậm trả là 0.1% mỗi ngày trên số tiền chậm trả.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.45, x1=0.9, y1=0.55)]
            ),
            Clause(
                id="clause_3",
                clause_number="Điều 3",
                title="Phạt Vi phạm Hợp đồng",
                content="Bất kỳ bên nào vi phạm nghĩa vụ hợp đồng dẫn đến hủy bỏ hợp đồng sẽ phải chịu phạt 20% tổng giá trị hợp đồng và bồi thường toàn bộ chi phí phát sinh cho bên bị vi phạm.",
                page_number=2,
                bounding_boxes=[BoundingBox(page=2, x0=0.1, y0=0.20, x1=0.9, y1=0.35)]
            ),
            Clause(
                id="clause_4",
                clause_number="Điều 4",
                title="Đơn phương Chấm dứt & Thời hạn Khiếu nại",
                content="Bên Mua có quyền đơn phương chấm dứt hợp đồng ngay lập tức mà không cần thông báo trước nếu Bên Bán chậm giao hàng quá 10 ngày. Thời hạn khiếu nại chất lượng hàng hóa chỉ trong vòng 48 giờ sau khi nhận hàng.",
                page_number=2,
                bounding_boxes=[BoundingBox(page=2, x0=0.1, y0=0.40, x1=0.9, y1=0.52)]
            )
        ]
    else: # sample_it_service
        title = "Hợp đồng Dịch vụ Phát triển Phần mềm & Triển khai Hệ thống AI"
        contract_type = "Hợp đồng Dịch vụ CNTT"
        clauses = [
            Clause(
                id="clause_1",
                clause_number="Điều 1",
                title="Phạm vi Công việc & Dữ liệu",
                content="Bên B (Nhà phát triển) nhận cung cấp dịch vụ xây dựng phần mềm phân tích văn bản AI và tích hợp API cho Bên A (Khách hàng). Hai bên có xử lý dữ liệu khách hàng và thông tin cá nhân.",
                page_number=1,
                bounding_boxes=[BoundingBox(page=1, x0=0.1, y0=0.22, x1=0.9, y1=0.34)]
            ),
            Clause(
                id="clause_2",
                clause_number="Điều 2",
                title="Thanh toán & Lãi phạt Chậm trả",
                content="Bên A thanh toán cho Bên B thành 3 đợt. Nếu bên nào chậm thanh toán, bên vi phạm phải chịu lãi suất phạt chậm trả là 0.1% mỗi ngày (tương đương 36.5%/năm) trên số tiền chậm trả.",
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
                content="Bên A có quyền đơn phương chấm dứt hợp đồng ngay lập tức bất kỳ lúc nào mà không cần thông báo trước. Toàn bộ mã nguồn, tài liệu thiết kế và thuật toán AI do Bên B sáng tạo đều thuộc quyền sở hữu vô điều kiện của Bên A.",
                page_number=2,
                bounding_boxes=[BoundingBox(page=2, x0=0.1, y0=0.40, x1=0.9, y1=0.55)]
            ),
            Clause(
                id="clause_5",
                clause_number="Điều 5",
                title="Trách nhiệm Bồi thường Thiệt hại Toàn bộ",
                content="Bên B cam kết bồi thường toàn bộ thiệt hại phát sinh bao gồm thiệt hại trực tiếp, thiệt hại gián tiếp và tổn thất doanh thu nếu hệ thống phần mềm gặp sự cố gián đoạn.",
                page_number=3,
                bounding_boxes=[BoundingBox(page=3, x0=0.1, y0=0.22, x1=0.9, y1=0.38)]
            ),
            Clause(
                id="clause_6",
                clause_number="Điều 6",
                title="Thời hạn Khiếu nại & Giải quyết Tranh chấp",
                content="Bên A có quyền khiếu nại trong vòng 48 giờ sau khi nghiệm thu. Mọi tranh chấp phát sinh sẽ được giải quyết duy nhất tại Tòa án nhân dân nơi Bên A đặt trụ sở.",
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
