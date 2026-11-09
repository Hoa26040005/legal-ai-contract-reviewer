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
        },

        # =========================================================================
        # KHỐI 5: BẤT ĐỘNG SẢN, ĐẶT CỌC, THUÊ MẶT BẰNG & ỦY QUYỀN (MỞ RỘNG)
        # =========================================================================
        {
            "code": "LKDBDS2023_D23_5",
            "law": "Điều 23.5, Luật Kinh doanh Bất động sản 2023",
            "topic": "Trần tiền đặt cọc nhà ở, công trình hình thành trong tương lai tối đa 5%",
            "rule": "Chủ đầu tư dự án bất động sản chỉ được thu tiền đặt cọc không quá 5% giá bán, cho thuê mua nhà ở, công trình xây dựng hình thành trong tương lai khi đã đủ điều kiện đưa vào kinh doanh.",
            "keywords": ["đặt cọc căn hộ", "đặt cọc nhà ở hình thành trong tương lai", "vượt quá 5% giá bán"]
        },
        {
            "code": "LDD2024_D45_LNO2023_D164",
            "law": "Điều 45 Luật Đất đai 2024 & Điều 160, 164 Luật Nhà ở 2023",
            "topic": "Bắt buộc công chứng hợp đồng nhà đất & Điều kiện pháp lý BĐS",
            "rule": "Hợp đồng mua bán, chuyển nhượng nhà đất giữa cá nhân phải được công chứng/chứng thực; giao dịch bằng giấy viết tay hoặc vi bằng thừa phát lại là vô hiệu. Nhà ở hình thành trong tương lai phải có nghiệm thu móng và bảo lãnh ngân hàng.",
            "keywords": ["giấy viết tay", "lập vi bằng mua bán nhà", "không công chứng", "chưa có sổ đỏ", "không có bảo lãnh ngân hàng"]
        },
        {
            "code": "BLDS2015_D328",
            "law": "Điều 328, Bộ luật Dân sự 2015",
            "topic": "Chế tài phạt cọc song phương công bằng trong Hợp đồng Đặt cọc",
            "rule": "Nếu bên đặt cọc từ chối giao kết hợp đồng thì tài sản đặt cọc thuộc về bên nhận đặt cọc; nếu bên nhận đặt cọc từ chối giao kết thì phải trả cho bên đặt cọc tài sản đặt cọc và một khoản tiền tương đương giá trị tài sản đặt cọc.",
            "keywords": ["chỉ hoàn trả lại tiền cọc", "miễn phạt cọc", "không chịu phạt cọc"]
        },
        {
            "code": "BLDS2015_D472_481",
            "law": "Điều 472, 474 & 481, Bộ luật Dân sự 2015",
            "topic": "Bảo vệ quyền lợi bên thuê trong Hợp đồng Thuê mặt bằng / Thuê nhà",
            "rule": "Giá thuê và lộ trình điều chỉnh giá thuê phải cố định hoặc giới hạn biên độ hợp lý (<= 10-15%/năm); bên cho thuê không được tự ý lấy lại mặt bằng đột ngột mà không báo trước tối thiểu 30-90 ngày và phải bồi hoàn khấu hao chi phí cải tạo hợp pháp.",
            "keywords": ["tự ý tăng giá thuê", "lấy lại mặt bằng báo trước 7 ngày", "không bồi thường chi phí cải tạo"]
        },
        {
            "code": "BLDS2015_D562_569",
            "law": "Điều 142 & Điều 562 - 569, Bộ luật Dân sự 2015",
            "topic": "Thời hạn, phạm vi Ủy quyền, Ủy quyền lại và Thẩm quyền người ký",
            "rule": "Ủy quyền phải xác định rõ phạm vi và thời hạn; bên ủy quyền luôn có quyền đơn phương chấm dứt ủy quyền theo Điều 569. Bên được ủy quyền chỉ được ủy quyền lại cho người thứ ba nếu bên ủy quyền đồng ý (Điều 564). Người ký hợp đồng không có thẩm quyền đại diện hoặc thiếu Giấy ủy quyền hợp lệ làm giao dịch vô hiệu (Điều 142).",
            "keywords": ["ủy quyền vô thời hạn", "không được hủy ngang ủy quyền", "tự ý ủy quyền lại", "không có giấy ủy quyền"]
        }
    ]

    @classmethod
    def detect_contract_type(cls, filename: str, clauses: List[Clause]) -> str:
        """Tự động nhận diện chuyên sâu loại giấy tờ / hợp đồng từ tên tệp và nội dung các điều khoản."""
        lower_name = (filename or "").lower()
        full_text = (lower_name + " " + " ".join(f"{c.title} {c.content}" for c in clauses[:6])).lower()

        if any(k in full_text for k in ["giấy ủy quyền", "hợp đồng ủy quyền", "bên ủy quyền", "bên được ủy quyền", "phạm vi ủy quyền", "uy quyen"]):
            return "Giấy Ủy quyền / Hợp đồng Ủy quyền (BLDS 2015)"
        if any(k in full_text for k in ["bất động sản", "căn hộ chung cư", "nhà ở hình thành trong tương lai", "quyền sử dụng đất", "chuyển nhượng thửa đất", "sổ đỏ", "bat dong san", "can ho"]):
            return "Hợp đồng Bất động sản & Nhà ở (Luật KDBĐS 2023 & Đất đai 2024)"
        if any(k in full_text for k in ["thuê mặt bằng", "thuê nhà", "thuê văn phòng", "bên cho thuê", "tiền thuê mặt bằng", "thue mat bang", "thue nha"]):
            return "Hợp đồng Đặt cọc & Thuê mặt bằng (BLDS 2015)"
        if any(k in lower_name for k in ["lao động", "labor", "viec", "nhan su", "thử việc"]) or any(
            k in full_text for k in ["hợp đồng lao động", "người lao động", "người sử dụng lao động", "thời gian thử việc", "bảo hiểm xã hội"]
        ):
            return "Hợp đồng Lao động (BLLD 2019)"
        if any(k in lower_name for k in ["nda", "bao mat", "confidential"]) or any(
            k in full_text for k in ["thỏa thuận bảo mật", "thông tin mật", "bên tiết lộ", "bên nhận thông tin"]
        ):
            return "Thỏa thuận Bảo mật Thông tin"
        if any(k in lower_name for k in ["mua ban", "sale", "thuong mai", "commercial"]) or "mua bán hàng hóa" in full_text:
            return "Hợp đồng Mua bán Hàng hóa"
        return "Hợp đồng Dịch vụ Thương mại"

    @classmethod
    def evaluate_contract_completeness(cls, clauses: List[Clause], contract_type: str = "") -> List[RiskItem]:
        """
        Bộ kiểm tra Cấu trúc Toàn Hợp đồng & Hiệu lực Hình thức (Contract-Level Completeness & Formal Validity Check):
        1. Kiểm tra thông tin Người đại diện theo pháp luật / Giấy ủy quyền ký kết (Điều 134, 142 BLDS 2015 & Điều 12 Luật Doanh nghiệp 2020).
        2. Kiểm tra sự tồn tại của Điều khoản Sự kiện Bất khả kháng (Điều 156 BLDS 2015 & Điều 294 LTM 2005).
        3. Kiểm tra sự tồn tại của Điều khoản Giải quyết tranh chấp & Cơ quan tài phán (Điều 317 LTM 2005 & Điều 39 BLTTDS 2015).
        """
        if not clauses:
            return []

        structural_risks: List[RiskItem] = []
        full_text = " ".join(f"{c.clause_number} {c.title} {c.content}" for c in clauses).lower()
        anchor_clause = clauses[-1]
        ctype_lower = (contract_type or "").lower()
        is_poa = any(k in ctype_lower for k in ["ủy quyền", "uy quyen"]) or "giấy ủy quyền" in full_text

        # 1. Kiểm tra thiếu thông tin Đại diện theo pháp luật / Giấy ủy quyền khi có chủ thể doanh nghiệp hoặc cấp phó ký
        has_subordinate_title = any(
            t in full_text for t in ["phó giám đốc", "phó tổng giám đốc", "trưởng phòng", "giám đốc chi nhánh", "ký thay", "kt. giám đốc"]
        )
        has_valid_poa_ref = bool(
            re.search(r'(?:giấy\s+ủy\s+quyền|văn\s+bản\s+ủy\s+quyền|quyết\s+định\s+ủy\s+quyền)\s*(?:số|ngày|:)', full_text)
        )
        has_any_rep_identity = any(
            k in full_text
            for k in [
                "đại diện theo pháp luật", "người đại diện", "giấy ủy quyền", "văn bản ủy quyền",
                "mã số thuế", "mã số doanh nghiệp", "cccd", "cmnd", "căn cước công dân", "chức vụ:"
            ]
        )

        if has_subordinate_title and not has_valid_poa_ref:
            structural_risks.append(RiskItem(
                id=f"risk_{anchor_clause.id}_missing_poa_reference",
                clause_id=anchor_clause.id,
                clause_number=anchor_clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Người ký không phải Đại diện theo pháp luật nhưng thiếu số Giấy ủy quyền hợp lệ",
                risk_category="Hiệu lực Hình thức & Thẩm quyền Ký kết",
                description="Văn bản ghi nhận người đại diện ký kết là cấp phó (Phó Giám đốc, Trưởng phòng, Giám đốc chi nhánh hoặc Ký thay) nhưng không dẫn chiếu rõ Số, Ngày của Giấy ủy quyền từ Người đại diện theo pháp luật. Theo Điều 142 Bộ luật Dân sự 2015, hợp đồng do người không có quyền đại diện xác lập có nguy cơ bị Tòa án tuyên vô hiệu.",
                legal_basis="Điều 134, Điều 142 Bộ luật Dân sự 2015 & Điều 12 Luật Doanh nghiệp 2020",
                original_text=anchor_clause.content,
                suggested_text=anchor_clause.content + "\n[Bổ sung thông tin Thẩm quyền Ký kết]: 'Đại diện bởi Ông/Bà: [...], Chức vụ: [...], theo Giấy ủy quyền số [...]/GUQ ngày [...]/[...]/[...] của Người đại diện theo pháp luật Công ty (Đính kèm bản sao hợp lệ Giấy ủy quyền là bộ phận không tách rời của Hợp đồng).'",
                rationale="Đảm bảo tính hợp pháp về thẩm quyền chủ thể ký kết, ngăn chặn rủi ro một bên rũ bỏ trách nhiệm với lý do người ký vượt thẩm quyền.",
                bounding_boxes=anchor_clause.bounding_boxes
            ))
        elif len(clauses) >= 4 and not has_any_rep_identity:
            structural_risks.append(RiskItem(
                id=f"risk_{anchor_clause.id}_missing_signatory_info",
                clause_id=anchor_clause.id,
                clause_number=anchor_clause.clause_number,
                risk_level=RiskLevel.MEDIUM,
                risk_title="Thiếu thông tin định danh Chủ thể & Người đại diện theo pháp luật / Giấy ủy quyền",
                risk_category="Hiệu lực Hình thức & Thẩm quyền Ký kết",
                description="Toàn bộ văn bản hợp đồng chưa ghi nhận thông tin định danh pháp lý của các bên (Mã số doanh nghiệp/CCCD, Người đại diện theo pháp luật hoặc số Giấy ủy quyền hợp lệ). Đây là yếu tố bắt buộc để xác định năng lực chủ thể theo Điều 117 Bộ luật Dân sự 2015.",
                legal_basis="Điều 117 & Điều 134, Bộ luật Dân sự 2015",
                original_text=anchor_clause.content,
                suggested_text=anchor_clause.content + "\n[Khuyến nghị bổ sung Phần Chủ thể Hợp đồng]: Ghi rõ Tên pháp nhân, Mã số doanh nghiệp, Địa chỉ trụ sở, Họ tên & Chức vụ Người đại diện theo pháp luật (hoặc số Giấy ủy quyền kèm theo) của cả hai bên trước phần Điều khoản nội dung.",
                rationale="Xác lập rõ tư cách pháp nhân và thẩm quyền đại diện để đảm bảo hiệu lực bắt buộc thực hiện của hợp đồng.",
                bounding_boxes=anchor_clause.bounding_boxes
            ))

        # 2. Kiểm tra thiếu Điều khoản Sự kiện Bất khả kháng (chỉ áp dụng cho hợp đồng >= 4 điều khoản, trừ Giấy ủy quyền)
        has_force_majeure = any(
            k in full_text for k in ["bất khả kháng", "thiên tai", "dịch bệnh", "sự kiện khách quan", "force majeure", "Điều 156", "điều 294"]
        )
        if len(clauses) >= 4 and not is_poa and not has_force_majeure:
            structural_risks.append(RiskItem(
                id=f"risk_{anchor_clause.id}_missing_force_majeure",
                clause_id=anchor_clause.id,
                clause_number=anchor_clause.clause_number,
                risk_level=RiskLevel.MEDIUM,
                risk_title="Cấu trúc Hợp đồng thiếu hoàn toàn Điều khoản Sự kiện Bất khả kháng",
                risk_category="Cấu trúc Toàn Hợp đồng (Missing Clause)",
                description="Rà soát toàn văn cho thấy hợp đồng chưa có điều khoản quy định về Sự kiện Bất khả kháng (thiên tai, dịch bệnh, thay đổi chính sách pháp luật) và thủ tục thông báo miễn trừ trách nhiệm theo Điều 156 BLDS 2015 và Điều 294, 295 Luật Thương mại 2005.",
                legal_basis="Điều 156 Bộ luật Dân sự 2015 & Điều 294, 295 Luật Thương mại 2005",
                original_text=anchor_clause.content,
                suggested_text=anchor_clause.content + "\n[Đề xuất bổ sung Điều khoản Bất khả kháng]: 'Các bên được miễn trách nhiệm do không thực hiện hoặc thực hiện chậm nghĩa vụ nếu nguyên nhân trực tiếp do Sự kiện Bất khả kháng theo Điều 156 Bộ luật Dân sự 2015, với điều kiện bên bị ảnh hưởng phải thông báo bằng văn bản cho bên kia trong vòng 05 ngày làm việc và nỗ lực tối đa hạn chế thiệt hại.'",
                rationale="Bảo vệ các bên khỏi trách nhiệm phạt vi phạm và bồi thường khi xảy ra biến cố khách quan không thể lường trước.",
                bounding_boxes=anchor_clause.bounding_boxes
            ))

        # 3. Kiểm tra thiếu Điều khoản Giải quyết tranh chấp & Cơ quan tài phán
        has_dispute_clause = any(
            k in full_text for k in ["tranh chấp", "tòa án", "trọng tài", "hòa giải", "thương lượng", "viac", "cơ quan tài phán"]
        )
        if len(clauses) >= 4 and not is_poa and not has_dispute_clause:
            structural_risks.append(RiskItem(
                id=f"risk_{anchor_clause.id}_missing_dispute_resolution",
                clause_id=anchor_clause.id,
                clause_number=anchor_clause.clause_number,
                risk_level=RiskLevel.MEDIUM,
                risk_title="Cấu trúc Hợp đồng thiếu hoàn toàn Điều khoản Giải quyết tranh chấp",
                risk_category="Cấu trúc Toàn Hợp đồng (Missing Clause)",
                description="Hợp đồng chưa quy định cơ chế thương lượng, hòa giải và cơ quan có thẩm quyền phán quyết (Tòa án Nhân dân có thẩm quyền hoặc Trọng tài Thương mại) khi phát sinh tranh chấp theo Điều 317 Luật Thương mại 2005 và Điều 39 BLTTDS 2015.",
                legal_basis="Điều 317 Luật Thương mại 2005 & Điều 39 Bộ luật Tố tụng Dân sự 2015",
                original_text=anchor_clause.content,
                suggested_text=anchor_clause.content + "\n[Đề xuất bổ sung Điều khoản Giải quyết Tranh chấp]: 'Mọi tranh chấp phát sinh từ hoặc liên quan đến Hợp đồng này trước hết sẽ được giải quyết thông qua thương lượng thiện chí trong vòng 30 ngày. Trường hợp không đạt được thỏa thuận, tranh chấp sẽ được đưa ra giải quyết tại Trung tâm Trọng tài Quốc tế Việt Nam (VIAC) hoặc Tòa án nhân dân có thẩm quyền theo quy định của pháp luật Việt Nam.'",
                rationale="Xác định rõ lộ trình xử lý bất đồng và cơ quan tài phán để tránh bế tắc tố tụng khi có vi phạm.",
                bounding_boxes=anchor_clause.bounding_boxes
            ))

        return structural_risks

    @classmethod
    def analyze_contract(cls, contract_id: str, title: str, contract_type: str, clauses: List[Clause]) -> ContractAnalysisReport:
        risks: List[RiskItem] = []
        
        for clause in clauses:
            clause_risks = cls._evaluate_clause(clause, contract_type)
            risks.extend(clause_risks)

        # Chạy kiểm tra Cấu trúc Toàn Hợp đồng (Completeness & Formal Validity) cho hợp đồng tải lên / phân tích thực tế
        if not contract_id.startswith("sample_") and contract_id not in ("v1", "v2"):
            risks.extend(cls.evaluate_contract_completeness(clauses, contract_type))

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
        if any(kw in content for kw in ["giữ bản chính", "giữ bằng gốc", "nộp bản gốc", "giữ giấy tờ gốc", "giữ bằng đại học", "bằng đại học gốc", "nộp bằng gốc", "giữ bằng tốt nghiệp", "giữ văn bằng", "giữ chứng chỉ gốc", "giữ cccd", "giữ cmnd", "giữ chứng minh"]):
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
        if any(kw in content for kw in ["đặt cọc tiền", "ký quỹ", "nộp tiền cọc", "giữ 20.000.000", "giữ tiền lương làm cọc", "tiền bảo lãnh", "đóng tiền cọc"]):
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
        # Theo Điều 25 BLLD 2019: Mức trần cao nhất cho lao động có trình độ CĐ/ĐH trở lên CHỈ LÀ 60 NGÀY.
        # Luật Việt Nam KHÔNG CÓ MỨC 90 NGÀY! Mọi quy định thử việc > 60 ngày (như 70 ngày, 90 ngày, quá 90 ngày, 3 tháng, 4 tháng, 120 ngày) đều TRÁI PHÁP LUẬT!
        prob_days_match = re.search(r'(?:thử\s+việc|thời\s+gian\s+thử\s+việc|thời\s+hạn\s+thử\s+việc)(?:\s+\w+){0,6}\s+(\d+)\s*ngày', content) or re.search(r'(\d+)\s*ngày(?:\s+\w+){0,4}\s*thử\s+việc', content)
        prob_months_match = re.search(r'(?:thử\s+việc|thời\s+gian\s+thử\s+việc|thời\s+hạn\s+thử\s+việc)(?:\s+\w+){0,6}\s+(?:0?([3-9])|(\d{2,}))\s*tháng', content) or re.search(r'(?:0?([3-9])|(\d{2,}))\s*tháng(?:\s+\w+){0,4}\s*thử\s+việc', content)
        
        is_probation_violation = False
        has_explicit_valid_probation = False
        duration_desc = ""

        if prob_days_match:
            days_val = int(prob_days_match.group(1))
            if days_val > 60:
                is_probation_violation = True
                duration_desc = f"{days_val} ngày"
            else:
                has_explicit_valid_probation = True

        if not is_probation_violation and prob_months_match:
            m_val = int(prob_months_match.group(1) or prob_months_match.group(2))
            if m_val > 2:
                is_probation_violation = True
                duration_desc = f"{m_val} tháng"
            else:
                has_explicit_valid_probation = True

        if not is_probation_violation and not has_explicit_valid_probation and any(kw in content for kw in [
            "thử việc 90", "thời gian thử việc là 90", "thử việc quá 60 ngày", "thử việc quá 90 ngày",
            "thử việc 3 tháng", "thử việc 03 tháng", "thử việc 4 tháng", "thử việc 04 tháng",
            "thử việc 120 ngày", "thử việc 6 tháng", "thử việc 06 tháng",
            "thử việc kéo dài", "thử việc không quá 90"
        ]):
            is_probation_violation = True
            duration_desc = "trên 60 ngày (90 ngày / 3 tháng)"

        if is_probation_violation:
            items.append(RiskItem(
                id=f"risk_{clause.id}_probation_period",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title=f"Thời gian thử việc ({duration_desc}) vượt quá mức trần tối đa 60 ngày theo Điều 25 BLLD 2019",
                risk_category="Pháp luật Lao động & Nhân sự",
                description=f"Theo Điều 25 Bộ luật Lao động 2019, thời gian thử việc tối đa cho vị trí công việc có trình độ cao đẳng, đại học trở lên (như kỹ sư, nhân viên chuyên môn, cử nhân) CHỈ ĐƯỢC PHÉP TỐI ĐA 60 NGÀY. Pháp luật Việt Nam KHÔNG HỀ CÓ MỨC THỬ VIỆC 90 NGÀY hay 3-4 tháng (mức 180 ngày chỉ áp dụng độc quyền cho chức danh Người quản lý doanh nghiệp theo Luật Doanh nghiệp). Do đó, quy định thử việc {duration_desc} là vi phạm pháp luật lao động và bị coi là vô hiệu.",
                legal_basis="Điều 25, Bộ luật Lao động 2019",
                original_text=clause.content,
                suggested_text="Thời gian thử việc của Người lao động là 60 (sáu mươi) ngày kể từ ngày bắt đầu nhận việc. Hết thời gian thử việc 60 ngày, nếu đạt yêu cầu, hai bên sẽ tiến hành giao kết Hợp đồng lao động chính thức.",
                rationale="Điều chỉnh thời gian thử việc về đúng mức trần tối đa 60 ngày theo quy định bắt buộc tại Điều 25 BLLD 2019.",
                bounding_boxes=clause.bounding_boxes
            ))

        # L3B. Gia hạn thời gian thử việc / Thử việc nhiều lần (Khoản 2 Điều 25 BLLD 2019)
        if any(kw in content for kw in ["gia hạn thử việc", "kéo dài thử việc", "thử việc thêm", "thử việc lại", "thử việc lần 2"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_probation_multiple",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Thỏa thuận gia hạn hoặc thử việc nhiều lần (Vi phạm Khoản 2 Điều 25 BLLD 2019)",
                risk_category="Pháp luật Lao động & Nhân sự",
                description="Khoản 2 Điều 25 BLLD 2019 quy định nguyên tắc bất di bất dịch: 'Chỉ được thử việc một lần đối với một công việc'. Mọi điều khoản trao quyền cho Người sử dụng lao động được gia hạn thêm thử việc hoặc bắt người lao động thử việc lại đều trái pháp luật.",
                legal_basis="Khoản 2 Điều 25, Bộ luật Lao động 2019",
                original_text=clause.content,
                suggested_text="Chỉ thực hiện thử việc 01 (một) lần duy nhất. Hết thời gian thử việc, Công ty phải có văn bản thông báo kết quả thử việc cho Người lao động và tiến hành ký Hợp đồng lao động nếu đạt yêu cầu.",
                rationale="Xóa bỏ quyền gia hạn thử việc trái luật, tuân thủ nguyên tắc thử việc một lần duy nhất của BLLD 2019.",
                bounding_boxes=clause.bounding_boxes
            ))

        # L4. Phạt tiền, cắt lương khi phạm lỗi (Điều 127 BLLD 2019)
        is_labor_context = (
            "lao động" in contract_type.lower()
            or any(w in content for w in ["người lao động", "nhân viên", "lương", "kỷ luật", "nội quy", "đi muộn", "nghỉ tự do"])
        )
        has_direct_salary_deduction = any(
            kw in content for kw in ["cắt lương", "trừ tiền lương", "trừ lương", "khấu trừ lương", "phạt tiền thay kỷ luật"]
        )
        has_labor_cash_fine = is_labor_context and any(
            kw in content for kw in ["phạt tiền 500", "phạt tiền", "phạt 200", "phạt tiền mặt"]
        )
        if has_direct_salary_deduction or has_labor_cash_fine:
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

        # L7. Chậm trả lương quá hạn không đền bù lãi suất (Điều 97.4 BLLD 2019)
        if any(kw in content for kw in ["chậm trả lương", "hoãn trả lương", "chậm lương không tính lãi", "chậm thanh toán lương quá 30 ngày", "chậm trả lương không bồi thường"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_delayed_salary",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Chậm trả lương không tính lãi suất đền bù (Vi phạm Điều 97.4 BLLD 2019)",
                risk_category="Tiền lương & Thanh toán",
                description="Theo Khoản 4 Điều 97 BLLD 2019, trường hợp vì lý do bất khả kháng mà chậm trả lương từ 14 ngày trở lên thì Người sử dụng lao động phải đền bù cho Người lao động một khoản tiền ít nhất bằng số tiền lãi của số tiền trả chậm theo lãi suất huy động tiền gửi có kỳ hạn 01 tháng do ngân hàng nơi mở tài khoản trả lương công bố. Quy định chậm trả lương không có chế tài đền bù là trái luật.",
                legal_basis="Điều 97.4, Bộ luật Lao động 2019",
                original_text=clause.content,
                suggested_text="Công ty có nghĩa vụ trả lương đúng hạn vào ngày thỏa thuận hàng tháng. Trường hợp bất khả kháng chậm trả lương từ 14 ngày trở lên, Công ty có trách nhiệm thanh toán thêm khoản tiền đền bù lãi suất theo mức lãi suất tiền gửi kỳ hạn 01 tháng của Ngân hàng theo đúng quy định tại Điều 97.4 Bộ luật Lao động 2019.",
                rationale="Bảo vệ quyền lợi tiền lương người lao động và ràng buộc trách nhiệm chi trả lãi suất chậm trả luật định.",
                bounding_boxes=clause.bounding_boxes
            ))

        # L8. Phạt bồi hoàn chi phí đào tạo nghề vô căn cứ (Điều 62 BLLD 2019)
        if any(kw in content for kw in ["bồi thường gấp 3 lần chi phí đào tạo", "bồi thường gấp 5 lần", "phạt đào tạo", "bồi thường chi phí tuyển dụng khi nghỉ việc", "hoàn trả chi phí đào tạo vô điều kiện"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_training_cost_penalty",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Yêu cầu bồi hoàn chi phí đào tạo gấp nhiều lần trái quy định Điều 62 BLLD 2019",
                risk_category="Đào tạo & Phát triển nghề nghiệp",
                description="Điều 62 BLLD 2019 quy định chi phí đào tạo chỉ bao gồm các khoản chi có chứng từ hợp lệ về chi phí thực tế trả cho người dạy, tài liệu, địa điểm, tiền lương trong thời gian đi học. Việc đặt ra mức phạt bồi thường gấp 2-5 lần chi phí hoặc bắt bồi thường chi phí tuyển dụng, quản lý chung là vô hiệu.",
                legal_basis="Điều 62, Bộ luật Lao động 2019",
                original_text=clause.content,
                suggested_text="Trường hợp Người lao động đơn phương chấm dứt HĐLĐ trái pháp luật trong thời gian cam kết làm việc sau đào tạo, Người lao động chỉ có nghĩa vụ hoàn trả phần chi phí đào tạo thực tế (có hóa đơn, chứng từ hợp lệ) tương ứng với tỷ lệ thời gian chưa phục vụ cam kết theo quy định tại Điều 62 BLLD 2019.",
                rationale="Khống chế mức hoàn trả chi phí đào tạo theo tỷ lệ thời gian thực tế đã cống hiến, loại bỏ chế tài phạt tiền đào tạo trái luật.",
                bounding_boxes=clause.bounding_boxes
            ))

        # L9. Án lệ số 20/2018/AL của TANDTC - Xác lập HĐLĐ khi hết thời gian thử việc
        if any(kw in content for kw in ["tiếp tục thử việc cho đến khi có thông báo", "kết thúc thử việc chưa được coi là nhân viên chính thức", "hết thử việc nếu chưa ký hđ"]):
            items.append(RiskItem(
                id=f"risk_{clause.id}_precedent_20_probation",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Điều khoản kéo dài thử việc trái Án lệ số 20/2018/AL của Tòa án nhân dân Tối cao",
                risk_category="Án lệ TANDTC & Quan hệ Lao động",
                description="Theo Án lệ số 20/2018/AL được Hội đồng Thẩm phán TANDTC thông qua: Khi hết thời gian thử việc mà Người lao động vẫn tiếp tục làm việc và NSDLĐ không có thông báo chấm dứt thì mặc nhiên quan hệ lao động giữa hai bên đã chuyển hóa thành Hợp đồng lao động chính thức. Thỏa thuận cho phép kéo dài trạng thái thử việc vô thời hạn là trái với thực tiễn xét xử của TANDTC.",
                legal_basis="Án lệ số 20/2018/AL của Hội đồng Thẩm phán TANDTC",
                original_text=clause.content,
                suggested_text="Hết thời gian thử việc, Công ty có trách nhiệm thông báo bằng văn bản kết quả thử việc cho Người lao động. Nếu Người lao động đạt yêu cầu và tiếp tục làm việc, hai bên mặc nhiên xác lập Hợp đồng lao động chính thức với đầy đủ quyền lợi, chế độ theo quy định pháp luật.",
                rationale="Áp dụng chuẩn mực xét xử của Án lệ số 20/2018/AL, ngăn chặn tình trạng người sử dụng lao động lạm dụng kéo dài giai đoạn thử việc.",
                bounding_boxes=clause.bounding_boxes
            ))

        # C1. Phạt vi phạm vượt trần 8% (Điều 301 LTM 2005)
        penalty_match = re.search(
            r'phạt(?:\s+vi\s+phạm)?(?:\s+hợp\s+đồng)?(?:\s+là|\s+ở\s+mức|\s+mức)?\s+(\d+(?:[\.,]\d+)?)\s*%\s*(?:giá\s+trị|tổng)',
            content
        )
        if penalty_match:
            rate_val = float(penalty_match.group(1).replace(',', '.'))
            if rate_val > 8.0:
                rate_display = int(rate_val) if rate_val.is_integer() else rate_val
                items.append(RiskItem(
                    id=f"risk_{clause.id}_penalty_cap",
                    clause_id=clause.id,
                    clause_number=clause.clause_number,
                    risk_level=RiskLevel.CRITICAL,
                    risk_title=f"Phạt vi phạm {rate_display}% vượt trần 8% theo Điều 301 Luật Thương mại 2005",
                    risk_category="Phạt vi phạm hợp đồng",
                    description=f"Điều khoản quy định mức phạt vi phạm là {rate_display}%, vượt quá mức trần tối đa 8% của Điều 301 Luật Thương mại 2005. Hội đồng Trọng tài hoặc Tòa án sẽ tuyên vô hiệu phần vượt quá mức trần này.",
                    legal_basis="Điều 301, Luật Thương mại 2005",
                    original_text=clause.content,
                    suggested_text=re.sub(r'phạt(?:\s+vi\s+phạm)?(?:\s+hợp\s+đồng)?(?:\s+là|\s+ở\s+mức|\s+mức)?\s+\d+(?:[\.,]\d+)?\s*%\s*(giá\s+trị|tổng)', 'phạt 8% giá trị phần nghĩa vụ bị vi phạm', clause.content, flags=re.IGNORECASE),
                    rationale="Khống chế mức phạt tối đa 8% theo luật định và chỉ tính trên phần nghĩa vụ vi phạm thực tế để đảm bảo hiệu lực thi hành.",
                    bounding_boxes=clause.bounding_boxes
                ))

        # C2. Lãi suất phạt chậm trả vượt trần 20%/năm (Điều 468 BLDS 2015)
        interest_match = re.search(
            r'(?:lãi\s+suất(?:\s+chậm\s+(?:trả|thanh\s+toán)|\s+quá\s+hạn|\s+phạt)?|lãi\s+chậm\s+(?:trả|thanh\s+toán)|lãi\s+phạt|chậm\s+thanh\s+toán(?:\s+\w+){0,4})\s*(?:là|tương\s+đương|cố\s+định|ở\s+mức|bằng)?\s*(\d+(?:[\.,]\d+)?)\s*%\s*/?\s*(mỗi\s+ngày|ngày|mỗi\s+tháng|tháng|mỗi\s+năm|năm)',
            content
        )
        is_interest_violation = False
        if interest_match:
            rate_num = float(interest_match.group(1).replace(',', '.'))
            unit_str = interest_match.group(2)
            if "ngày" in unit_str:
                annualized = rate_num * 365.0
            elif "tháng" in unit_str:
                annualized = rate_num * 12.0
            else:
                annualized = rate_num
            if annualized > 20.0:
                is_interest_violation = True
        elif any(kw in content for kw in ["0.1% mỗi ngày", "0.2% mỗi ngày", "0.5% mỗi ngày", "0.1%/ngày", "0.2%/ngày", "0.5%/ngày", "30%/năm", "2%/tháng"]):
            is_interest_violation = True

        if is_interest_violation:
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
        has_termination_intent = any(t in content for t in ["đơn phương chấm dứt", "chấm dứt hợp đồng", "hủy bỏ hợp đồng", "đình chỉ hợp đồng"])
        has_unfair_termination_cond = any(c in content for c in ["ngay lập tức", "không cần thông báo trước", "không cần báo trước", "không chịu bất kỳ trách nhiệm", "bất kỳ lúc nào", "không bồi thường"])
        if has_termination_intent and has_unfair_termination_cond:
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
        has_payment_protection = any(p in content for p in [
            "sau khi thanh toán đủ", "sau khi bên a thanh toán đủ", "hoàn thành 100% nghĩa vụ thanh toán",
            "thanh toán đủ 100%", "thanh toán đầy đủ 100%"
        ])
        has_unconditional_ip_grab = any(kw in content for kw in [
            "sở hữu vô điều kiện", "thuộc toàn quyền sở hữu của bên a", "chuyển giao toàn bộ quyền tác giả",
            "thuộc sở hữu độc quyền của bên a ngay khi", "kể cả khi chưa thanh toán"
        ]) or (any(kw in content for kw in ["mã nguồn", "thuật toán"]) and any(u in content for u in ["thuộc về bên a", "thuộc sở hữu của bên a", "toàn quyền sở hữu"]) and not has_payment_protection)
        if has_unconditional_ip_grab and not has_payment_protection:
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

        # =====================================================================
        # NHÓM MỞ RỘNG: BẤT ĐỘNG SẢN, ĐẶT CỌC, THUÊ MẶT BẰNG & GIẤY ỦY QUYỀN
        # =====================================================================

        # R1. Toán học định lượng: Trần đặt cọc nhà ở/công trình hình thành trong tương lai > 5% (Điều 23.5 Luật KDBĐS 2023)
        is_re_context = any(
            k in content or k in (contract_type or "").lower()
            for k in [
                "bất động sản", "căn hộ", "nhà ở", "hình thành trong tương lai",
                "dự án", "chủ đầu tư", "thửa đất", "lô đất", "quyền sử dụng đất", "nhà đất"
            ]
        )
        if is_re_context and ("đặt cọc" in content or "tiền cọc" in content or "khoản cọc" in content):
            re_dep_match = re.search(
                r'(?:đặt\s+cọc|tiền\s+cọc|khoản\s+cọc|mức\s+cọc)[^.;\n]{0,60}?(\d+(?:[.,]\d+)?)\s*%'
                r'|(\d+(?:[.,]\d+)?)\s*%[^.;\n]{0,40}?(?:giá\s+bán|giá\s+trị\s+căn\s+hộ|giá\s+trị\s+nhà|giá\s+trị\s+hợp\s+đồng|tiền\s+đặt\s+cọc)',
                content
            )
            re_dep_pct = 0.0
            if re_dep_match:
                raw_pct = re_dep_match.group(1) or re_dep_match.group(2)
                re_dep_pct = float(raw_pct.replace(",", "."))
            if re_dep_pct > 5.0:
                items.append(RiskItem(
                    id=f"risk_{clause.id}_re_deposit_cap",
                    clause_id=clause.id,
                    clause_number=clause.clause_number,
                    risk_level=RiskLevel.CRITICAL,
                    risk_title=f"Tiền đặt cọc bất động sản ({re_dep_pct:g}%) vượt trần 5% theo Luật Kinh doanh Bất động sản 2023",
                    risk_category="Pháp luật Đất đai & Bất động sản",
                    description=f"Điều khoản quy định mức tiền đặt cọc lên tới {re_dep_pct:g}% giá bán. Theo khoản 5 Điều 23 Luật Kinh doanh Bất động sản 2023, chủ đầu tư chỉ được thu tiền đặt cọc không quá 5% giá bán, cho thuê mua nhà ở, công trình xây dựng hình thành trong tương lai khi đã đủ điều kiện đưa vào kinh doanh.",
                    legal_basis="Điều 23.5, Luật Kinh doanh Bất động sản 2023",
                    original_text=clause.content,
                    suggested_text="Bên Mua đặt cọc cho Chủ đầu tư số tiền tương đương 5% (năm phần trăm) giá bán căn hộ/nhà ở sau khi dự án đã có đủ văn bản thông báo đủ điều kiện bán nhà ở hình thành trong tương lai của Sở Xây dựng và cam kết bảo lãnh ngân hàng theo Điều 23.5 Luật Kinh doanh Bất động sản 2023.",
                    rationale="Khống chế mức trần đặt cọc <= 5% để bảo vệ dòng tiền của bên mua và tuân thủ điều cấm của Luật Kinh doanh Bất động sản 2023.",
                    bounding_boxes=clause.bounding_boxes
                ))

        # R2. Giao dịch mua bán, chuyển nhượng nhà đất không công chứng / vi bằng / chưa đủ pháp lý (Luật Đất đai 2024 & Luật Nhà ở 2023)
        has_re_transfer_violation = any(
            kw in content
            for kw in [
                "giấy viết tay", "hợp đồng viết tay", "lập vi bằng", "vi bằng thừa phát lại",
                "không cần công chứng", "không công chứng", "miễn công chứng",
                "chưa có sổ đỏ", "chưa được cấp giấy chứng nhận", "chưa nghiệm thu phần móng",
                "chưa xong móng", "không có bảo lãnh ngân hàng"
            ]
        )
        if has_re_transfer_violation and (is_re_context or any(k in content for k in ["mua bán nhà", "chuyển nhượng đất", "thửa đất", "sổ đỏ", "công chứng"])):
            items.append(RiskItem(
                id=f"risk_{clause.id}_re_notarization_and_legal",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.CRITICAL,
                risk_title="Giao dịch nhà đất không công chứng hoặc chưa đủ điều kiện pháp lý (Nguy cơ vô hiệu tuyệt đối)",
                risk_category="Pháp luật Đất đai & Bất động sản",
                description="Giao dịch mua bán, chuyển nhượng nhà ở/quyền sử dụng đất bằng giấy viết tay, lập vi bằng hoặc khi chưa có Giấy chứng nhận (Sổ đỏ) / chưa nghiệm thu móng và bảo lãnh ngân hàng vi phạm nghiêm trọng Điều 45 Luật Đất đai 2024 và Điều 160, 164 Luật Nhà ở 2023.",
                legal_basis="Điều 45 Luật Đất đai 2024 & Điều 160, 164 Luật Nhà ở 2023",
                original_text=clause.content,
                suggested_text="Hợp đồng mua bán, chuyển nhượng nhà ở và quyền sử dụng đất phải được lập thành văn bản có công chứng/chứng thực hợp pháp tại Tổ chức hành nghề công chứng theo Điều 164 Luật Nhà ở 2023 sau khi Bên Bán cung cấp đầy đủ bản chính Giấy chứng nhận quyền sử dụng đất (hoặc văn bản nghiệm thu phần móng và thư bảo lãnh ngân hàng đối với nhà ở hình thành trong tương lai).",
                rationale="Loại bỏ rủi ro hợp đồng bị Tòa án tuyên vô hiệu do vi phạm điều kiện hình thức công chứng bắt buộc và điều kiện tài sản giao dịch.",
                bounding_boxes=clause.bounding_boxes
            ))

        # D1. Hợp đồng Đặt cọc: Bẫy phạt cọc một chiều / miễn phạt cọc cho Bên Nhận Cọc (Điều 328 BLDS 2015)
        has_deposit_kw = any(k in content for k in ["đặt cọc", "tiền cọc", "tài sản đặt cọc", "bên nhận cọc", "bên đặt cọc"])
        has_one_sided_deposit_waiver = any(
            w in content
            for w in [
                "chỉ hoàn trả lại tiền cọc", "chỉ trả lại tiền cọc", "chỉ phải hoàn trả lại số tiền đặt cọc",
                "trả lại đúng số tiền cọc", "mà không chịu phạt cọc", "không phải chịu phạt cọc",
                "miễn phạt cọc", "không phải bồi thường cọc"
            ]
        )
        # Bắt cả bẫy phạt cọc gấp >= 3 lần (300%+) bất cân xứng
        excessive_deposit_mult = re.search(r'phạt\s+cọc\s+gấp\s+(\d+)\s*lần', content)
        is_excessive_mult = bool(excessive_deposit_mult and int(excessive_deposit_mult.group(1)) >= 3)

        if has_deposit_kw and (has_one_sided_deposit_waiver or is_excessive_mult):
            items.append(RiskItem(
                id=f"risk_{clause.id}_one_sided_deposit",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Bẫy chế tài Đặt cọc bất cân xứng (Trái nguyên tắc cân bằng tại Điều 328 BLDS 2015)",
                risk_category="Hợp đồng Đặt cọc & Bảo đảm",
                description="Điều khoản đặt cọc quy định Bên Đặt Cọc vi phạm thì mất toàn bộ tiền cọc, nhưng Bên Nhận Cọc vi phạm lại chỉ hoàn trả tiền gốc mà không chịu phạt cọc tương đương (hoặc áp mức phạt cọc gấp nhiều lần bất hợp lý).",
                legal_basis="Điều 328, Bộ luật Dân sự 2015",
                original_text=clause.content,
                suggested_text="Trường hợp Bên Đặt Cọc từ chối việc giao kết, thực hiện hợp đồng thì tài sản đặt cọc thuộc về Bên Nhận Đặt Cọc. Trường hợp Bên Nhận Đặt Cọc từ chối việc giao kết, thực hiện hợp đồng thì phải hoàn trả cho Bên Đặt Cọc toàn bộ tiền đặt cọc và một khoản tiền phạt cọc tương đương 100% giá trị tiền đặt cọc theo đúng Điều 328 Bộ luật Dân sự 2015.",
                rationale="Thiết lập chế tài phạt cọc song phương đối xứng (1:1) để ngăn chặn bên nhận cọc chiếm dụng vốn hoặc tự ý hủy kèo không mất chi phí.",
                bounding_boxes=clause.bounding_boxes
            ))

        # D2. Hợp đồng Thuê mặt bằng / Thuê nhà: Tăng giá thuê tùy ý (> 15%) hoặc lấy lại mặt bằng báo trước < 30 ngày (Điều 472, 474, 481 BLDS 2015)
        is_lease_context = any(
            k in content or k in (contract_type or "").lower()
            for k in ["thuê mặt bằng", "thuê nhà", "thuê văn phòng", "bên cho thuê", "bên thuê", "giá thuê", "mặt bằng thuê"]
        )
        if is_lease_context:
            rent_hike_match = re.search(r'(?:tăng|điều\s+chỉnh)\s+giá\s+thuê[^.;\n]{0,50}?(\d+(?:[.,]\d+)?)\s*%', content)
            rent_hike_pct = float(rent_hike_match.group(1).replace(",", ".")) if rent_hike_match else 0.0
            has_arbitrary_rent_hike = any(
                w in content
                for w in [
                    "tự ý tăng giá thuê", "tăng giá thuê bất kỳ lúc nào", "điều chỉnh giá thuê theo quyết định của bên cho thuê",
                    "tăng giá thuê không cần sự đồng ý"
                ]
            ) or (rent_hike_pct > 15.0)

            short_eviction_match = re.search(
                r'(?:lấy\s+lại\s+mặt\s+bằng|thu\s+hồi\s+mặt\s+bằng|chấm\s+dứt\s+hợp\s+đồng\s+thuê)[^.;\n]{0,50}?báo\s+trước\s+(\d+)\s*ngày',
                content
            )
            short_eviction_days = int(short_eviction_match.group(1)) if short_eviction_match else None
            has_unfair_eviction = (
                (short_eviction_days is not None and short_eviction_days < 30)
                or any(
                    w in content
                    for w in [
                        "lấy lại mặt bằng bất kỳ lúc nào", "thu hồi mặt bằng ngay lập tức",
                        "không bồi thường chi phí cải tạo", "không hoàn trả chi phí đầu tư mặt bằng"
                    ]
                )
            )

            if has_arbitrary_rent_hike or has_unfair_eviction:
                items.append(RiskItem(
                    id=f"risk_{clause.id}_lease_unfair_terms",
                    clause_id=clause.id,
                    clause_number=clause.clause_number,
                    risk_level=RiskLevel.HIGH,
                    risk_title="Điều khoản Thuê mặt bằng bất lợi: Tăng giá thuê vượt trần (>15%) hoặc thu hồi mặt bằng đột ngột",
                    risk_category="Hợp đồng Thuê mặt bằng & BĐS",
                    description="Hợp đồng cho phép Bên Cho Thuê tự ý tăng giá thuê vượt biên độ thị trường (>15%/năm) hoặc đơn phương thu hồi mặt bằng với thời gian báo trước quá ngắn (<30 ngày) và không bồi hoàn khấu hao chi phí đầu tư cải tạo của Bên Thuê.",
                    legal_basis="Điều 472, 474 & 481, Bộ luật Dân sự 2015",
                    original_text=clause.content,
                    suggested_text="Giá thuê được giữ cố định trong tối thiểu 02 năm đầu; từ năm tiếp theo, biên độ điều chỉnh giá thuê (nếu có) không vượt quá 10%/năm theo thỏa thuận bằng văn bản. Trường hợp Bên Cho Thuê lấy lại mặt bằng trước hạn không do lỗi của Bên Thuê, Bên Cho Thuê phải thông báo trước tối thiểu 60 ngày, hoàn trả tiền cọc và bồi thường 100% giá trị khấu hao còn lại của chi phí đầu tư, cải tạo mặt bằng.",
                    rationale="Bảo vệ chi phí đầu tư cơ sở vật chất (CAPEX) và sự ổn định kinh doanh của bên thuê mặt bằng.",
                    bounding_boxes=clause.bounding_boxes
                ))

        # U1. Giấy Ủy Quyền / Hợp đồng Ủy quyền: Ủy quyền vô thời hạn, không giới hạn phạm vi hoặc cấm đơn phương chấm dứt (Điều 563 & 569 BLDS 2015)
        has_poa_kw = any(k in content for k in ["ủy quyền", "bên ủy quyền", "bên được ủy quyền", "người được ủy quyền", "giấy ủy quyền"])
        has_poa_unlimited_or_irrevocable = any(
            w in content
            for w in [
                "ủy quyền vô thời hạn", "có hiệu lực vĩnh viễn", "không giới hạn phạm vi",
                "toàn quyền định đoạt mọi tài sản", "không được hủy ngang", "ủy quyền không hủy ngang",
                "không được đơn phương chấm dứt ủy quyền", "từ bỏ quyền chấm dứt ủy quyền"
            ]
        )
        if has_poa_kw and has_poa_unlimited_or_irrevocable:
            items.append(RiskItem(
                id=f"risk_{clause.id}_poa_unlimited_or_irrevocable",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.CRITICAL,
                risk_title="Ủy quyền vô thời hạn / không giới hạn phạm vi hoặc tước quyền đơn phương chấm dứt (Trái Điều 563 & 569 BLDS 2015)",
                risk_category="Giấy Ủy quyền & Đại diện",
                description="Điều khoản quy định ủy quyền toàn quyền không giới hạn phạm vi/thời hạn hoặc cấm Bên Ủy Quyền đơn phương chấm dứt ('ủy quyền không hủy ngang'). Theo Điều 569 Bộ luật Dân sự 2015, Bên Ủy Quyền luôn có quyền đơn phương chấm dứt thực hiện hợp đồng ủy quyền bất cứ lúc nào.",
                legal_basis="Điều 563 & Điều 569, Bộ luật Dân sự 2015",
                original_text=clause.content,
                suggested_text="Thời hạn ủy quyền là 12 tháng kể từ ngày ký văn bản này (hoặc chấm dứt ngay khi công việc ủy quyền hoàn thành). Bên được ủy quyền chỉ được nhân danh Bên ủy quyền thực hiện đúng các công việc liệt kê cụ thể tại Điều 1. Mỗi bên có quyền đơn phương chấm dứt ủy quyền theo quy định tại Điều 569 Bộ luật Dân sự 2015 với điều kiện thông báo bằng văn bản trước 15 ngày.",
                rationale="Giới hạn chặt chẽ phạm vi đại diện và bảo toàn quyền thu hồi ủy quyền theo luật định nhằm tránh rủi ro bị lạm dụng định đoạt tài sản.",
                bounding_boxes=clause.bounding_boxes
            ))

        # U2. Tự ý Ủy quyền lại cho bên thứ ba không có sự đồng ý bằng văn bản của Bên Ủy Quyền (Điều 564 BLDS 2015)
        has_consent_for_subdelegation = any(
            c in content
            for c in [
                "khi có sự đồng ý bằng văn bản của bên ủy quyền",
                "được bên ủy quyền đồng ý",
                "nếu được bên ủy quyền chấp thuận",
                "không được ủy quyền lại"
            ]
        )
        has_unauthorized_subdelegation = any(
            w in content
            for w in [
                "tự ý ủy quyền lại", "toàn quyền ủy quyền lại cho bên thứ ba",
                "được phép ủy quyền lại cho bất kỳ bên thứ ba nào mà không cần",
                "ủy quyền lại không cần thông báo", "ủy quyền lại mà không cần sự đồng ý"
            ]
        )
        if has_poa_kw and has_unauthorized_subdelegation and not has_consent_for_subdelegation:
            items.append(RiskItem(
                id=f"risk_{clause.id}_poa_subdelegation",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.HIGH,
                risk_title="Cho phép tự ý ủy quyền lại cho bên thứ ba trái Điều 564 Bộ luật Dân sự 2015",
                risk_category="Giấy Ủy quyền & Đại diện",
                description="Điều khoản cho phép Bên được ủy quyền tự ý chuyển giao quyền đại diện (ủy quyền lại) cho người thứ ba mà không cần sự chấp thuận của Bên ủy quyền, vi phạm khoản 1 Điều 564 Bộ luật Dân sự 2015.",
                legal_basis="Điều 564 & Điều 142, Bộ luật Dân sự 2015",
                original_text=clause.content,
                suggested_text="Bên được ủy quyền phải trực tiếp thực hiện công việc được ủy quyền và tuyệt đối không được ủy quyền lại cho bất kỳ bên thứ ba nào, trừ trường hợp có sự chấp thuận trước bằng văn bản của Bên ủy quyền hoặc do sự kiện bất khả kháng theo đúng Điều 564 Bộ luật Dân sự 2015.",
                rationale="Ngăn chặn việc quyền đại diện pháp lý rơi vào tay bên thứ ba không kiểm soát được năng lực và uy tín.",
                bounding_boxes=clause.bounding_boxes
            ))

        # U3. Người ký hợp đồng không có thẩm quyền đại diện / Ký thay không có Giấy ủy quyền (Điều 142 BLDS 2015)
        if any(
            w in content
            for w in [
                "ký thay nhưng không có giấy ủy quyền", "chưa có giấy ủy quyền hợp lệ",
                "ủy quyền bằng lời nói", "ủy quyền miệng", "ký kết khi chưa được ủy quyền",
                "không cần giấy ủy quyền của người đại diện"
            ]
        ):
            items.append(RiskItem(
                id=f"risk_{clause.id}_unauthorized_signatory",
                clause_id=clause.id,
                clause_number=clause.clause_number,
                risk_level=RiskLevel.CRITICAL,
                risk_title="Giao dịch do người không có thẩm quyền đại diện ký kết (Nguy cơ vô hiệu theo Điều 142 BLDS 2015)",
                risk_category="Hiệu lực Hình thức & Thẩm quyền Ký kết",
                description="Người ký kết hợp đồng không phải là Người đại diện theo pháp luật của doanh nghiệp và không có Giấy ủy quyền bằng văn bản hợp lệ. Theo Điều 142 Bộ luật Dân sự 2015, giao dịch dân sự do người không có quyền đại diện xác lập không làm phát sinh quyền, nghĩa vụ đối với pháp nhân được đại diện.",
                legal_basis="Điều 134, Điều 142 Bộ luật Dân sự 2015 & Điều 12 Luật Doanh nghiệp 2020",
                original_text=clause.content,
                suggested_text="Hợp đồng này chỉ có hiệu lực khi được ký bởi Người đại diện theo pháp luật đăng ký trên Giấy chứng nhận đăng ký doanh nghiệp, hoặc Người đại diện theo ủy quyền có Giấy ủy quyền bằng văn bản hợp lệ còn hiệu lực (Bản sao có đóng dấu Giấy ủy quyền phải được đính kèm làm Phụ lục Hợp đồng).",
                rationale="Đảm bảo hiệu lực pháp lý của chữ ký và con dấu trên hợp đồng, tránh rủi ro hợp đồng bị Tòa án tuyên vô hiệu toàn bộ.",
                bounding_boxes=clause.bounding_boxes
            ))
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
