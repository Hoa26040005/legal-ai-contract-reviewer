import os
import json
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    LegalRuleItem, LegalRuleCreate, LegalRuleUpdate,
    LegalLibraryStats, StatuteUploadResponse
)

ARCHIVE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "legal_library")
LAWS_FILE = os.path.join(ARCHIVE_DIR, "laws.json")
DOCS_DIR = os.path.join(ARCHIVE_DIR, "documents")

# Danh mục điều luật hạt nhân chuẩn Việt Nam
DEFAULT_SEEDED_RULES = [
    # --- LAO ĐỘNG ---
    {
        "code": "BLLD2019_D17_1",
        "law": "Điều 17.1, Bộ luật Lao động 2019",
        "topic": "Cấm giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ",
        "rule": "Người sử dụng lao động tuyệt đối không được giữ bản chính giấy tờ tuỳ thân, văn bằng, chứng chỉ của người lao động khi giao kết, thực hiện hợp đồng lao động.",
        "category": "Lao động",
        "keywords": ["giữ bằng gốc", "giữ bản chính", "nộp bằng đại học gốc", "giữ cccd gốc", "giữ giấy tờ"],
        "risk_level": "CRITICAL",
        "statute_source": "Bộ luật Lao động số 45/2019/QH14",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "BLLD2019_D17_2",
        "law": "Điều 17.2, Bộ luật Lao động 2019",
        "topic": "Cấm yêu cầu người lao động đặt cọc, thế chấp tiền hoặc tài sản",
        "rule": "Nghiêm cấm yêu cầu người lao động phải thực hiện biện pháp bảo đảm bằng tiền hoặc tài sản khác cho việc thực hiện hợp đồng lao động (cấm bắt đóng tiền cọc, ký quỹ).",
        "category": "Lao động",
        "keywords": ["đặt cọc tiền", "ký quỹ", "giữ tiền lương làm cọc", "thế chấp tài sản", "tiền bảo lãnh"],
        "risk_level": "CRITICAL",
        "statute_source": "Bộ luật Lao động số 45/2019/QH14",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "BLLD2019_D25",
        "law": "Điều 25, Bộ luật Lao động 2019",
        "topic": "Thời gian thử việc tối đa theo trình độ chuyên môn",
        "rule": "Thời gian thử việc không quá: 180 ngày đối với quản lý doanh nghiệp; 60 ngày đối với chức danh trình độ cao đẳng trở lên; 30 ngày đối với trung cấp, công nhân kỹ thuật; 06 ngày làm việc đối với việc khác. Không thử việc quá 01 lần.",
        "category": "Lao động",
        "keywords": ["thử việc 3 tháng", "thử việc 4 tháng", "thử việc 6 tháng", "gia hạn thử việc", "thử việc 120 ngày"],
        "risk_level": "HIGH",
        "statute_source": "Bộ luật Lao động số 45/2019/QH14",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "BLLD2019_D26",
        "law": "Điều 26, Bộ luật Lao động 2019",
        "topic": "Tiền lương trong thời gian thử việc tối thiểu 85%",
        "rule": "Tiền lương của người lao động trong thời gian thử việc do hai bên thoả thuận nhưng ít nhất phải bằng 85% mức lương của công việc đó.",
        "category": "Lao động",
        "keywords": ["lương thử việc 50%", "lương thử việc 60%", "lương thử việc 70%", "dưới 85%"],
        "risk_level": "HIGH",
        "statute_source": "Bộ luật Lao động số 45/2019/QH14",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "BLLD2019_D127",
        "law": "Điều 127, Bộ luật Lao động 2019",
        "topic": "Cấm phạt tiền, trừ lương thay việc xử lý kỷ luật lao động",
        "rule": "Nghiêm cấm hành vi dùng hình thức phạt tiền, cắt lương thay việc xử lý kỷ luật lao động. Mọi quy định phạt tiền khi đi trễ, không đạt KPI trong HĐLĐ đều vô hiệu.",
        "category": "Lao động",
        "keywords": ["phạt tiền khi vi phạm", "cắt lương", "trừ tiền lương", "phạt 500k", "phạt tiền mặt"],
        "risk_level": "CRITICAL",
        "statute_source": "Bộ luật Lao động số 45/2019/QH14",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "BLLD2019_D168",
        "law": "Điều 168, Bộ luật Lao động 2019 & Luật BHXH 2014",
        "topic": "Nghĩa vụ tham gia BHXH, BHYT, BHTN bắt buộc",
        "rule": "Người sử dụng lao động và người lao động phải tham gia bảo hiểm xã hội bắt buộc, bảo hiểm y tế, bảo hiểm thất nghiệp. Mọi thỏa thuận trốn nghĩa vụ đều vô hiệu.",
        "category": "Lao động",
        "keywords": ["không tham gia bhxh", "tự đóng bảo hiểm", "chi trả tiền mặt thay bhxh", "miễn đóng bhxh"],
        "risk_level": "CRITICAL",
        "statute_source": "Bộ luật Lao động số 45/2019/QH14",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "BLLD2019_D107",
        "law": "Điều 107 & Điều 98, Bộ luật Lao động 2019",
        "topic": "Giới hạn thời giờ làm thêm (OT) và tiền lương làm thêm giờ",
        "rule": "Thời giờ làm thêm không quá 50% số giờ làm việc bình thường/ngày, không quá 40 giờ/tháng và không quá 200 giờ/năm. Lương OT: ngày thường >=150%, ngày nghỉ hàng tuần >=200%, lễ tết >=300%.",
        "category": "Lao động",
        "keywords": ["làm thêm giờ không tính lương", "ot bắt buộc", "không trả lương ot", "vượt 40 giờ"],
        "risk_level": "HIGH",
        "statute_source": "Bộ luật Lao động số 45/2019/QH14",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "BLLD2019_D35",
        "law": "Điều 35, Bộ luật Lao động 2019",
        "topic": "Quyền đơn phương chấm dứt HĐLĐ của người lao động",
        "rule": "Người lao động có quyền đơn phương chấm dứt hợp đồng lao động mà không cần lý do, chỉ cần báo trước đủ thời hạn luật định (45 ngày, 30 ngày hoặc 3 ngày làm việc).",
        "category": "Lao động",
        "keywords": ["cấm nghỉ việc", "phạt nghỉ việc", "phải bồi thường khi nghỉ việc", "cam kết làm việc 5 năm"],
        "risk_level": "HIGH",
        "statute_source": "Bộ luật Lao động số 45/2019/QH14",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "BLLD2019_D21_NDA",
        "law": "Điều 21.2, Bộ luật Lao động 2019",
        "topic": "Thỏa thuận Không cạnh tranh (NCA) & Bảo mật (NDA)",
        "rule": "Thỏa thuận cấm làm việc cho đối thủ cạnh tranh sau khi nghỉ việc phải có phạm vi địa lý và thời gian hợp lý (tối đa 1-2 năm) và có đền bù tài chính tương xứng.",
        "category": "Lao động",
        "keywords": ["cấm làm việc cho đối thủ 5 năm", "cấm làm ngành cntt", "non-compete không đền bù"],
        "risk_level": "HIGH",
        "statute_source": "Bộ luật Lao động số 45/2019/QH14",
        "created_at": "2026-01-01T00:00:00"
    },

    # --- THƯƠNG MẠI ---
    {
        "code": "LTM2005_D301",
        "law": "Điều 301, Luật Thương mại 2005",
        "topic": "Trần mức phạt vi phạm nghĩa vụ thương mại tối đa 8%",
        "rule": "Mức phạt đối với vi phạm nghĩa vụ hợp đồng do các bên thoả thuận, nhưng không quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm (trừ trường hợp kết quả giám định sai).",
        "category": "Thương mại",
        "keywords": ["phạt 10%", "phạt 15%", "phạt 20%", "phạt 30%", "phạt 50%", "tổng giá trị hợp đồng"],
        "risk_level": "CRITICAL",
        "statute_source": "Luật Thương mại số 36/2005/QH11",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "LTM2005_D307",
        "law": "Điều 307, Luật Thương mại 2005",
        "topic": "Quan hệ giữa Phạt vi phạm và Bồi thường thiệt hại",
        "rule": "Trường hợp không có thoả thuận phạt vi phạm thì chỉ được yêu cầu bồi thường thiệt hại. Nếu có thỏa thuận thì có quyền áp dụng cả hai.",
        "category": "Thương mại",
        "keywords": ["vừa phạt vừa bồi thường", "chỉ áp dụng", "không có thỏa thuận phạt"],
        "risk_level": "HIGH",
        "statute_source": "Luật Thương mại số 36/2005/QH11",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "LTM2005_D294_295",
        "law": "Điều 294 & 295, Luật Thương mại 2005",
        "topic": "Miễn trách nhiệm Bất khả kháng và thủ tục thông báo",
        "rule": "Miễn trách nhiệm khi có sự kiện bất khả kháng. Bên viện dẫn phải thông báo ngay bằng văn bản cho bên kia và áp dụng các biện pháp hạn chế thiệt hại.",
        "category": "Thương mại",
        "keywords": ["bất khả kháng", "thiên tai dịch bệnh", "thông báo văn bản", "miễn trừ trách nhiệm"],
        "risk_level": "MEDIUM",
        "statute_source": "Luật Thương mại số 36/2005/QH11",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "LTM2005_D318",
        "law": "Điều 318, Luật Thương mại 2005",
        "topic": "Thời hạn khiếu nại bắt buộc trong thương mại",
        "rule": "Thời hạn khiếu nại tối thiểu: 03 tháng kể từ ngày giao hàng đối với khiếu nại về số lượng, chất lượng; 06 tháng đối với khiếu nại khác. Không được ép thời hạn dưới 48 giờ.",
        "category": "Thương mại",
        "keywords": ["khiếu nại 24 giờ", "khiếu nại 48 giờ", "khiếu nại 3 ngày", "sau 48h hết quyền"],
        "risk_level": "HIGH",
        "statute_source": "Luật Thương mại số 36/2005/QH11",
        "created_at": "2026-01-01T00:00:00"
    },

    # --- DÂN SỰ ---
    {
        "code": "BLDS2015_D468",
        "law": "Điều 468 & Điều 357, Bộ luật Dân sự 2015",
        "topic": "Trần lãi suất vay và lãi phạt chậm trả tối đa 20%/năm",
        "rule": "Lãi suất theo thỏa thuận không được vượt quá 20%/năm. Các quy định tính lãi chậm trả 0.1% - 0.5%/ngày (tương đương 36.5% - 182.5%/năm) vượt quá mức trần này và phần vượt mức bị vô hiệu.",
        "category": "Dân sự",
        "keywords": ["0.1% mỗi ngày", "0.2% mỗi ngày", "0.5% mỗi ngày", "lãi phạt 30%/năm", "lãi suất chậm trả"],
        "risk_level": "CRITICAL",
        "statute_source": "Bộ luật Dân sự số 91/2015/QH13",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "BLDS2015_D405",
        "law": "Điều 405, Bộ luật Dân sự 2015",
        "topic": "Vô hiệu điều khoản bất bình đẳng trong hợp đồng theo mẫu",
        "rule": "Điều khoản trong hợp đồng theo mẫu miễn trách nhiệm của bên đưa ra mẫu, tăng trách nhiệm hoặc loại bỏ quyền lợi chính đáng của bên kia thì điều khoản đó vô hiệu.",
        "category": "Dân sự",
        "keywords": ["miễn trừ hoàn toàn trách nhiệm", "không chịu trách nhiệm trong mọi tình huống", "hợp đồng mẫu"],
        "risk_level": "HIGH",
        "statute_source": "Bộ luật Dân sự số 91/2015/QH13",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "BLDS2015_D360",
        "law": "Điều 360 & Điều 302 LTM 2005",
        "topic": "Bồi thường thiệt hại trực tiếp và Giới hạn trần trách nhiệm",
        "rule": "Bồi thường toàn bộ thiệt hại thực tế, trực tiếp. Bắt một bên gánh toàn bộ thiệt hại gián tiếp, mất cơ hội kinh doanh mà không có mức trần trách nhiệm (Liability Cap) là rủi ro tài chính nghiêm trọng.",
        "category": "Dân sự",
        "keywords": ["thiệt hại gián tiếp", "mất cơ hội kinh doanh", "bồi thường toàn bộ không giới hạn"],
        "risk_level": "HIGH",
        "statute_source": "Bộ luật Dân sự số 91/2015/QH13",
        "created_at": "2026-01-01T00:00:00"
    },

    # --- ĐẤT ĐAI & BẤT ĐỘNG SẢN ---
    {
        "code": "LDD2024_D45",
        "law": "Điều 45, Luật Đất đai 2024",
        "topic": "Điều kiện thực hiện quyền chuyển nhượng, cho thuê quyền sử dụng đất",
        "rule": "Chuyển nhượng quyền sử dụng đất bắt buộc phải có Giấy chứng nhận quyền sử dụng đất (Sổ đỏ), đất không có tranh chấp, quyền sử dụng đất không bị kê biên, trong thời hạn sử dụng đất và phải đăng ký tại cơ quan đăng ký đất đai.",
        "category": "Đất đai & BĐS",
        "keywords": ["chưa có sổ đỏ", "đang tranh chấp đất", "giấy tờ tay", "đang bị kê biên"],
        "risk_level": "CRITICAL",
        "statute_source": "Luật Đất đai số 31/2024/QH15",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "LNO2023_D160",
        "law": "Điều 160, Luật Nhà ở 2023",
        "topic": "Điều kiện của nhà ở tham gia giao dịch mua bán, cho thuê",
        "rule": "Giao dịch mua bán nhà ở thương mại hình thành trong tương lai bắt buộc phải có bảo lãnh của ngân hàng thương mại và biên bản nghiệm thu hoàn thành xây dựng phần móng.",
        "category": "Đất đai & BĐS",
        "keywords": ["nhà ở tương lai", "chưa xong móng", "không có bảo lãnh ngân hàng", "mua bán dự án chưa nghiệm thu"],
        "risk_level": "CRITICAL",
        "statute_source": "Luật Nhà ở số 27/2023/QH15",
        "created_at": "2026-01-01T00:00:00"
    },

    # --- SỞ HỮU TRÍ TUỆ & CÔNG NGHỆ ---
    {
        "code": "LSHTT_D20",
        "law": "Điều 20 & 45, Luật Sở hữu trí tuệ (sửa đổi 2022)",
        "topic": "Chuyển giao quyền tác giả đối với phần mềm, sáng chế",
        "rule": "Quyền tác giả và tài sản trí tuệ đối với phần mềm, thuật toán chỉ chuyển giao khi có thỏa thuận văn bản và bên nhận chuyển giao hoàn tất 100% nghĩa vụ thanh toán.",
        "category": "Sở hữu trí tuệ",
        "keywords": ["mã nguồn thuộc bên a", "thuật toán sở hữu vô điều kiện", "bản quyền phần mềm"],
        "risk_level": "HIGH",
        "statute_source": "Luật Sở hữu trí tuệ số 07/2022/QH15",
        "created_at": "2026-01-01T00:00:00"
    },
    {
        "code": "ND13_2023_NDCP",
        "law": "Điều 9, 11, 17, Nghị định 13/2023/NĐ-CP",
        "topic": "Bảo vệ Dữ liệu Cá nhân người lao động & khách hàng",
        "rule": "Việc xử lý dữ liệu cá nhân (kể cả thông tin nhân viên, khách hàng) bắt buộc phải có sự chấp thuận minh thị của chủ thể dữ liệu và tuân thủ các biện pháp bảo vệ kỹ thuật.",
        "category": "Công nghệ & Dữ liệu",
        "keywords": ["dữ liệu cá nhân", "thông tin nhân viên", "thông tin khách hàng", "nghị định 13"],
        "risk_level": "HIGH",
        "statute_source": "Nghị định số 13/2023/NĐ-CP",
        "created_at": "2026-01-01T00:00:00"
    }
]


class LegalLibraryManager:
    """
    Quản lý kho tri thức quy phạm pháp luật (Dynamic Legal Rule Engine & Statute Repository).
    Cho phép thêm, sửa, xóa, tìm kiếm điều luật và bóc tách văn bản quy phạm pháp luật toàn văn.
    """

    @classmethod
    def _ensure_storage(cls):
        os.makedirs(ARCHIVE_DIR, exist_ok=True)
        os.makedirs(DOCS_DIR, exist_ok=True)

        if not os.path.exists(LAWS_FILE):
            with open(LAWS_FILE, "w", encoding="utf-8") as f:
                json.dump(DEFAULT_SEEDED_RULES, f, ensure_ascii=False, indent=2)

    @classmethod
    def get_all_laws(cls, category: Optional[str] = None, query: Optional[str] = None) -> List[LegalRuleItem]:
        cls._ensure_storage()
        try:
            with open(LAWS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = DEFAULT_SEEDED_RULES

        results = []
        q = (query or "").lower().strip()
        cat = (category or "").strip()

        for item in data:
            if cat and cat != "Tất cả" and item.get("category") != cat:
                continue

            if q:
                match_law = q in item.get("law", "").lower()
                match_topic = q in item.get("topic", "").lower()
                match_code = q in item.get("code", "").lower()
                match_kw = any(q in kw.lower() for kw in item.get("keywords", []))
                if not (match_law or match_topic or match_code or match_kw):
                    continue

            results.append(LegalRuleItem(**item))

        return results

    @classmethod
    def get_rule_by_code(cls, code: str) -> Optional[LegalRuleItem]:
        laws = cls.get_all_laws()
        for l in laws:
            if l.code == code:
                return l
        return None

    @classmethod
    def add_law(cls, rule_in: LegalRuleCreate) -> LegalRuleItem:
        cls._ensure_storage()
        laws = cls.get_all_laws()

        # Kiểm tra trùng mã
        for l in laws:
            if l.code.strip() == rule_in.code.strip():
                raise ValueError(f"Mã điều luật '{rule_in.code}' đã tồn tại trong thư viện!")

        new_item = LegalRuleItem(
            code=rule_in.code.strip(),
            law=rule_in.law.strip(),
            topic=rule_in.topic.strip(),
            rule=rule_in.rule.strip(),
            category=rule_in.category.strip(),
            keywords=[k.strip() for k in rule_in.keywords if k.strip()],
            risk_level=rule_in.risk_level or "HIGH",
            statute_source=rule_in.statute_source or "Cập nhật thủ công",
            created_at=datetime.now().isoformat()
        )

        all_dicts = [l.model_dump() for l in laws]
        all_dicts.insert(0, new_item.model_dump())

        with open(LAWS_FILE, "w", encoding="utf-8") as f:
            json.dump(all_dicts, f, ensure_ascii=False, indent=2)

        return new_item

    @classmethod
    def update_law(cls, code: str, updates: LegalRuleUpdate) -> Optional[LegalRuleItem]:
        cls._ensure_storage()
        laws = cls.get_all_laws()
        found = False
        updated_item = None

        all_dicts = []
        for l in laws:
            if l.code == code:
                found = True
                d = l.model_dump()
                if updates.law is not None: d["law"] = updates.law
                if updates.topic is not None: d["topic"] = updates.topic
                if updates.rule is not None: d["rule"] = updates.rule
                if updates.category is not None: d["category"] = updates.category
                if updates.keywords is not None: d["keywords"] = updates.keywords
                if updates.risk_level is not None: d["risk_level"] = updates.risk_level
                updated_item = LegalRuleItem(**d)
                all_dicts.append(d)
            else:
                all_dicts.append(l.model_dump())

        if not found:
            return None

        with open(LAWS_FILE, "w", encoding="utf-8") as f:
            json.dump(all_dicts, f, ensure_ascii=False, indent=2)

        return updated_item

    @classmethod
    def delete_law(cls, code: str) -> bool:
        cls._ensure_storage()
        laws = cls.get_all_laws()
        initial_len = len(laws)
        remaining = [l.model_dump() for l in laws if l.code != code]

        if len(remaining) == initial_len:
            return False

        with open(LAWS_FILE, "w", encoding="utf-8") as f:
            json.dump(remaining, f, ensure_ascii=False, indent=2)

        return True

    @classmethod
    def get_stats(cls) -> LegalLibraryStats:
        cls._ensure_storage()
        laws = cls.get_all_laws()
        categories_count: Dict[str, int] = {}

        for l in laws:
            cat = l.category or "Khác"
            categories_count[cat] = categories_count.get(cat, 0) + 1

        cat_list = [{"category": k, "count": v} for k, v in categories_count.items()]

        statute_files = [f for f in os.listdir(DOCS_DIR) if os.path.isfile(os.path.join(DOCS_DIR, f))]

        return LegalLibraryStats(
            total_rules=len(laws),
            total_categories=len(cat_list),
            total_statutes=len(statute_files),
            categories=cat_list,
            rag_active=True
        )

    @classmethod
    def ingest_statute_text(cls, filename: str, text: str, statute_title: str, category: str) -> StatuteUploadResponse:
        """
        Phân tích văn bản quy phạm pháp luật toàn văn, bóc tách các Điều/Khoản
        và tự động tạo các bản ghi quy tắc pháp lý vào thư viện.
        """
        cls._ensure_storage()

        # Lưu tệp văn bản vào kho lưu trữ
        doc_path = os.path.join(DOCS_DIR, filename)
        with open(doc_path, "w", encoding="utf-8") as f:
            f.write(text)

        # Regex phát hiện các điều khoản: Điều X. Tiêu đề \n Nội dung (hỗ trợ cả lề trắng đầu dòng và dấu chấm/hai chấm)
        pattern = re.compile(r"[ \t]*(Điều\s+(\d+[\w\.]*)[\.\:\-]\s*([^\n\r]+))\n+([\s\S]*?)(?=(?:\n[ \t]*Điều\s+\d+)|\Z)", re.IGNORECASE)
        matches = list(pattern.finditer(text))

        extracted_count = 0
        now_iso = datetime.now().isoformat()
        current_laws = {l.code: l for l in cls.get_all_laws()}

        clean_statute_code = re.sub(r'[^a-zA-Z0-9]', '', statute_title)[:8].upper() or "LUAT"

        for match in matches:
            full_header = match.group(1).strip()
            article_num = match.group(2).strip()
            article_title = match.group(3).strip()
            article_body = match.group(4).strip()

            rule_code = f"{clean_statute_code}_D{article_num}"
            law_citation = f"Điều {article_num}, {statute_title}"

            # Tự sinh keywords từ cụm từ khóa có nghĩa (cụm từ tiêu đề điều luật)
            clean_title = article_title.lower().strip()
            auto_keywords = [clean_title]
            # Thêm cụm từ 2 chữ nếu có
            sub_phrases = [p.strip() for p in re.split(r'[,;.]', clean_title) if len(p.strip().split()) >= 2]
            if sub_phrases:
                auto_keywords.extend(sub_phrases[:3])

            rule_summary = article_body[:250].replace("\n", " ").strip()
            if len(article_body) > 250:
                rule_summary += "..."

            new_rule = LegalRuleItem(
                code=rule_code,
                law=law_citation,
                topic=article_title,
                rule=rule_summary,
                category=category or "Khác",
                keywords=auto_keywords,
                risk_level="HIGH",
                statute_source=f"{statute_title} ({filename})",
                created_at=now_iso
            )

            current_laws[rule_code] = new_rule
            extracted_count += 1

        # Lưu lại file
        with open(LAWS_FILE, "w", encoding="utf-8") as f:
            json.dump([item.model_dump() for item in current_laws.values()], f, ensure_ascii=False, indent=2)

        return StatuteUploadResponse(
            statute_title=statute_title,
            filename=filename,
            articles_extracted=extracted_count,
            category=category,
            message=f"Đã nạp thành công {extracted_count} điều luật từ văn bản '{statute_title}' vào hệ thống tri thức RAG!"
        )

    @classmethod
    def get_active_rules(cls) -> List[Dict[str, Any]]:
        """
        Hàm cung cấp danh mục quy tắc pháp lý cho LegalRiskAnalyzer.
        Tự động lấy toàn bộ quy tắc động hiện tại.
        """
        laws = cls.get_all_laws()
        return [l.model_dump() for l in laws]
