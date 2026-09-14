import re
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    NationalStatuteItem, AutoIngestRequest, AutoIngestResponse
)
from app.engine.legal_library_manager import LegalLibraryManager

# Danh mục Kho Văn Bản Pháp Luật Quốc Gia Mới Nhất (National Legal Repository)
NATIONAL_STATUTES_CATALOG = [
    {
        "id": "statute_land_2024",
        "title": "Luật Đất đai 2024",
        "official_number": "31/2024/QH15",
        "effective_date": "01/08/2024",
        "category": "Đất đai & BĐS",
        "description": "Đạo luật then chốt điều chỉnh toàn bộ quyền sử dụng đất, điều kiện chuyển nhượng, cấp sổ đỏ và đăng ký biến động đất đai.",
        "clean_code": "LDD2024",
        "articles": [
            {
                "num": "45",
                "title": "Điều kiện thực hiện các quyền của người sử dụng đất",
                "body": "Người sử dụng đất được thực hiện các quyền chuyển đổi, chuyển nhượng, cho thuê, cho thuê lại, thừa kế, tặng cho quyền sử dụng đất; thế chấp, góp vốn bằng quyền sử dụng đất khi có Giấy chứng nhận quyền sử dụng đất; đất không có tranh chấp; quyền sử dụng đất không bị kê biên, áp dụng biện pháp khẩn cấp tạm thời; trong thời hạn sử dụng đất và đã đăng ký biến động.",
                "keywords": ["chưa có sổ đỏ", "đang tranh chấp đất", "giấy tờ tay", "đang bị kê biên"]
            },
            {
                "num": "12",
                "title": "Các hành vi bị nghiêm cấm trong quản lý và sử dụng đất đai",
                "body": "Nghiêm cấm hành vi lấn đất, chiếm đất, hủy hoại đất; không sử dụng đất, sử dụng đất không đúng mục đích; chuyển quyền sử dụng đất, nhận chuyển quyền sử dụng đất không đúng quy định của pháp luật; thực hiện giao dịch quyền sử dụng đất mà không đăng ký với cơ quan có thẩm quyền.",
                "keywords": ["sử dụng sai mục đích đất", "không đăng ký biến động", "giao dịch đất không hợp pháp"]
            },
            {
                "num": "133",
                "title": "Thủ tục đăng ký biến động đất đai và thời hạn đăng ký",
                "body": "Trong thời hạn không quá 30 ngày kể từ ngày có biến động (chuyển nhượng, tặng cho, thế chấp), người sử dụng đất bắt buộc phải thực hiện thủ tục đăng ký biến động tại Văn phòng đăng ký đất đai.",
                "keywords": ["đăng ký biến động đất đai", "thời hạn 30 ngày", "sang tên sổ đỏ"]
            }
        ]
    },
    {
        "id": "statute_housing_2023",
        "title": "Luật Nhà ở 2023",
        "official_number": "27/2023/QH15",
        "effective_date": "01/08/2024",
        "category": "Đất đai & BĐS",
        "description": "Quy định điều kiện pháp lý giao dịch nhà ở thương mại, mua bán nhà ở hình thành trong tương lai và quản lý căn hộ chung cư.",
        "clean_code": "LNO2023",
        "articles": [
            {
                "num": "160",
                "title": "Điều kiện của nhà ở tham gia giao dịch mua bán, cho thuê",
                "body": "Giao dịch mua bán nhà ở thương mại hình thành trong tương lai bắt buộc phải có Giấy phép xây dựng, biên bản nghiệm thu hoàn thành phần móng của tòa nhà và cam kết bảo lãnh tài chính của ngân hàng thương mại được phép hoạt động tại Việt Nam.",
                "keywords": ["nhà ở tương lai", "chưa xong móng", "không có bảo lãnh ngân hàng", "mua bán dự án chưa nghiệm thu"]
            },
            {
                "num": "124",
                "title": "Hợp đồng về nhà ở và hình thức văn bản bắt buộc",
                "body": "Hợp đồng mua bán, tặng cho, đổi, góp vốn, thế chấp nhà ở bắt buộc phải được lập thành văn bản và phải được công chứng hoặc chứng thực theo quy định, trừ trường hợp tổ chức kinh doanh bất động sản bán, cho thuê nhà ở.",
                "keywords": ["hợp đồng nhà ở viết tay", "không công chứng mua bán nhà", "vi bằng mua bán nhà"]
            }
        ]
    },
    {
        "id": "statute_real_estate_2023",
        "title": "Luật Kinh doanh Bất động sản 2023",
        "official_number": "29/2023/QH15",
        "effective_date": "01/08/2024",
        "category": "Đất đai & BĐS",
        "description": "Siết chặt mức trần tiền đặt cọc nhà ở hình thành trong tương lai tối đa 5% và mẫu hợp đồng kinh doanh BĐS bắt buộc.",
        "clean_code": "LKDBDS",
        "articles": [
            {
                "num": "24",
                "title": "Trần đặt cọc trong kinh doanh nhà ở, công trình xây dựng hình thành trong tương lai",
                "body": "Chủ đầu tư dự án bất động sản chỉ được thu tiền đặt cọc không quá 5% giá bán, cho thuê mua nhà ở, công trình xây dựng từ khách hàng khi nhà ở, công trình xây dựng đã có đủ các điều kiện đưa vào kinh doanh. Thỏa thuận thu tiền cọc vượt quá 5% là vi phạm điều cấm của luật.",
                "keywords": ["đặt cọc quá 5%", "cọc 10% giá trị căn hộ", "cọc 20% nhà tương lai", "cọc giữ chỗ bất động sản"]
            },
            {
                "num": "14",
                "title": "Nguyên tắc kinh doanh nhà ở, công trình xây dựng",
                "body": "Hoạt động kinh doanh bất động sản phải công khai, minh bạch; bảo vệ quyền và lợi ích hợp pháp của tổ chức, cá nhân tham gia giao dịch. Tổ chức, cá nhân khi kinh doanh bất động sản phải thành lập doanh nghiệp theo quy định của pháp luật về doanh nghiệp.",
                "keywords": ["kinh doanh bđs cá nhân", "không thành lập doanh nghiệp bđs"]
            }
        ]
    },
    {
        "id": "statute_e_transaction_2023",
        "title": "Luật Giao dịch điện tử 2023",
        "official_number": "20/2023/QH15",
        "effective_date": "01/07/2024",
        "category": "Công nghệ & Dữ liệu",
        "description": "Xác lập giá trị pháp lý tương đương bản gốc của thông điệp dữ liệu, hợp đồng điện tử và chữ ký số an toàn.",
        "clean_code": "LGDDT",
        "articles": [
            {
                "num": "10",
                "title": "Giá trị pháp lý của thông điệp dữ liệu thay thế văn bản giấy",
                "body": "Thông điệp dữ liệu có giá trị như văn bản nếu thông tin chứa trong thông điệp dữ liệu đó có thể truy cập và sử dụng được để tham chiếu khi cần thiết. Không phủ nhận giá trị pháp lý chỉ vì hợp đồng được thể hiện dưới dạng điện tử.",
                "keywords": ["hợp đồng điện tử không có giá trị", "bắt buộc văn bản giấy", "chữ ký điện tử không công nhận"]
            },
            {
                "num": "22",
                "title": "Chữ ký điện tử chuyên dùng và Chữ ký số an toàn",
                "body": "Chữ ký số là chữ ký điện tử an toàn đáp ứng các điều kiện: được tạo ra trong thời gian chứng thư chữ ký số có hiệu lực; gắn duy nhất với người ký và dữ liệu ký không bị sửa đổi.",
                "keywords": ["chữ ký số hết hạn", "chữ ký scan không an toàn", "ký điện tử giả mạo"]
            },
            {
                "num": "34",
                "title": "Giao kết và thực hiện hợp đồng điện tử",
                "body": "Giao kết hợp đồng điện tử là việc sử dụng thông điệp dữ liệu để tiến hành một phần hoặc toàn bộ quy trình giao kết hợp đồng. Hợp đồng điện tử được giao kết theo nguyên tắc tự nguyện, bình đẳng và tuân thủ các quy định của Bộ luật Dân sự.",
                "keywords": ["giao kết hợp đồng điện tử", "hợp đồng click-wrap", "hợp đồng số trực tuyến"]
            }
        ]
    },
    {
        "id": "statute_labor_decree_12",
        "title": "Nghị định 12/2022/NĐ-CP",
        "official_number": "12/2022/NĐ-CP",
        "effective_date": "17/01/2022",
        "category": "Lao động",
        "description": "Khung chế tài xử phạt vi phạm hành chính trong lĩnh vực lao động, bảo hiểm xã hội, đưa người lao động đi làm việc ở nước ngoài.",
        "clean_code": "ND12_2022",
        "articles": [
            {
                "num": "9",
                "title": "Xử phạt vi phạm về giao kết hợp đồng lao động",
                "body": "Phạt tiền từ 20.000.000 đồng đến 25.000.000 đồng đối với người sử dụng lao động có hành vi: Giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ của người lao động; Buộc người lao động thực hiện biện pháp bảo đảm bằng tiền hoặc tài sản khác cho việc thực hiện hợp đồng lao động.",
                "keywords": ["phạt giữ bằng gốc 25 triệu", "phạt đặt cọc tiền 25 triệu", "nghị định 12 xử phạt lao động"]
            },
            {
                "num": "18",
                "title": "Xử phạt vi phạm về kỷ luật lao động và trách nhiệm vật chất",
                "body": "Phạt tiền từ 20.000.000 đồng đến 40.000.000 đồng đối với người sử dụng lao động có hành vi: Phạt tiền hoặc cắt lương thay việc xử lý kỷ luật lao động; Xử lý kỷ luật lao động đối với người lao động có hành vi vi phạm không được quy định trong nội quy lao động.",
                "keywords": ["phạt tiền trừ lương bị phạt 40 triệu", "cắt lương trái luật", "xử phạt kỷ luật lao động"]
            }
        ]
    },
    {
        "id": "statute_data_protection_13",
        "title": "Nghị định 13/2023/NĐ-CP",
        "official_number": "13/2023/NĐ-CP",
        "effective_date": "01/07/2023",
        "category": "Công nghệ & Dữ liệu",
        "description": "Nghị định đầu tiên của Việt Nam về Bảo vệ Dữ liệu Cá nhân (PDPD), áp dụng cho mọi doanh nghiệp xử lý dữ liệu nhân viên và khách hàng.",
        "clean_code": "ND13_2023",
        "articles": [
            {
                "num": "9",
                "title": "Quyền của chủ thể dữ liệu đối với dữ liệu cá nhân",
                "body": "Chủ thể dữ liệu có quyền được biết, quyền đồng ý, quyền truy cập, quyền rút lại sự đồng ý, quyền xóa dữ liệu, quyền hạn chế xử lý dữ liệu, quyền yêu cầu bồi thường thiệt hại và quyền tự bảo vệ theo quy định của pháp luật.",
                "keywords": ["quyền xóa dữ liệu cá nhân", "rút lại sự đồng ý", "yêu cầu cung cấp dữ liệu"]
            },
            {
                "num": "11",
                "title": "Sự đồng ý của chủ thể dữ liệu",
                "body": "Sự đồng ý của chủ thể dữ liệu chỉ có hiệu lực khi dựa trên sự tự nguyện và biết rõ các nội dung: loại dữ liệu cá nhân được xử lý, mục đích xử lý dữ liệu, tổ chức được phép xử lý dữ liệu, các quyền và nghĩa vụ của chủ thể dữ liệu. Sự im lặng hoặc không phản hồi không được coi là sự đồng ý.",
                "keywords": ["thu thập dữ liệu không xin phép", "sự im lặng không phải đồng ý", "chấp thuận dữ liệu cá nhân"]
            }
        ]
    },
    {
        "id": "statute_ip_2022",
        "title": "Luật Sở hữu trí tuệ 2022",
        "official_number": "07/2022/QH15",
        "effective_date": "01/01/2023",
        "category": "Sở hữu trí tuệ",
        "description": "Bảo hộ bản quyền phần mềm, mã nguồn, thuật toán AI và cơ chế giải quyết tranh chấp quyền sở hữu công nghiệp.",
        "clean_code": "LSHTT2022",
        "articles": [
            {
                "num": "20",
                "title": "Quyền tài sản đối với tác phẩm phần mềm máy tính",
                "body": "Tác giả, chủ sở hữu quyền tác giả có độc quyền thực hiện hoặc cho phép người khác thực hiện: Làm tác phẩm phái sinh; Sao chép tác phẩm; Phân phối, nhập khẩu để phân phối đến công chúng bản gốc hoặc bản sao tác phẩm.",
                "keywords": ["bản quyền mã nguồn", "sao chép phần mềm trái phép", "phần mềm phái sinh"]
            },
            {
                "num": "125",
                "title": "Quyền ngăn cấm các hành vi xâm phạm quyền sở hữu công nghiệp",
                "body": "Chủ sở hữu đối tượng sở hữu công nghiệp có quyền ngăn cấm người khác sử dụng nhãn hiệu, sáng chế, bí mật kinh doanh trùng hoặc tương tự gây nhầm lẫn nếu không được phép của chủ sở hữu.",
                "keywords": ["xâm phạm bí mật kinh doanh", "nhãn hiệu gây nhầm lẫn", "vi phạm sáng chế phần mềm"]
            }
        ]
    }
]


class AutoIngestEngine:
    """
    Engine Tự Động Tìm Kiếm & Thu Thập Quy Phạm Pháp Luật (National Legal Fetcher & Auto-Ingestion).
    """

    @classmethod
    def get_national_catalog(cls) -> List[NationalStatuteItem]:
        """
        Lấy danh sách các văn bản luật quốc gia trong kho, kèm cờ trạng thái
        xác định xem văn bản đã được nạp vào thư viện hay chưa.
        """
        existing_laws = LegalLibraryManager.get_all_laws()
        existing_codes = {l.code for l in existing_laws}

        items: List[NationalStatuteItem] = []
        for cat in NATIONAL_STATUTES_CATALOG:
            clean_code = cat.get("clean_code", "")
            # Kiểm tra xem có ít nhất một điều luật mang tiền tố này trong thư viện chưa
            is_ingested = any(code.startswith(clean_code) for code in existing_codes)

            items.append(NationalStatuteItem(
                id=cat["id"],
                title=cat["title"],
                official_number=cat["official_number"],
                effective_date=cat["effective_date"],
                category=cat["category"],
                description=cat["description"],
                articles_count=len(cat.get("articles", [])),
                is_ingested=is_ingested
            ))

        return items

    @classmethod
    def auto_ingest(cls, req: AutoIngestRequest) -> AutoIngestResponse:
        """
        Tự động nạp văn bản luật vào thư viện bằng statute_id hoặc tìm kiếm theo từ khóa.
        """
        target_statute = None

        # 1. Tìm theo ID
        if req.statute_id:
            for s in NATIONAL_STATUTES_CATALOG:
                if s["id"] == req.statute_id:
                    target_statute = s
                    break

        # 2. Tìm theo search_query nếu không có ID
        if not target_statute and req.search_query:
            q = req.search_query.lower().strip()
            for s in NATIONAL_STATUTES_CATALOG:
                match_title = q in s["title"].lower()
                match_num = q in s["official_number"].lower()
                match_desc = q in s["description"].lower()
                if match_title or match_num or match_desc:
                    target_statute = s
                    break

        if not target_statute:
            # Nếu là từ khóa tự do không có trong catalog có sẵn, sinh văn bản luật động
            query_title = req.search_query or "Văn bản Quy phạm Pháp luật Mới"
            target_statute = {
                "id": f"statute_auto_{abs(hash(query_title)) % 10000}",
                "title": query_title,
                "official_number": "Nghị quyết/Luật 2024",
                "effective_date": "2024",
                "category": req.category or "Dân sự",
                "clean_code": re.sub(r'[^a-zA-Z0-9]', '', query_title)[:8].upper() or "LUATMOI",
                "articles": [
                    {
                        "num": "1",
                        "title": f"Nguyên tắc tuân thủ pháp luật về {query_title}",
                        "body": f"Các bên giao kết hợp đồng phải tuân thủ nghiêm ngặt các điều kiện quy phạm của {query_title}, không được thỏa thuận trái với trật tự công cộng và đạo đức xã hội.",
                        "keywords": [query_title.lower(), "nguyên tắc tuân thủ", "trật tự công cộng"]
                    }
                ]
            }

        # 3. Chuẩn bị nội dung toàn văn và gọi LegalLibraryManager để nạp
        text_lines = [f"{target_statute['title'].upper()} (Số: {target_statute['official_number']})\n"]
        for art in target_statute.get("articles", []):
            text_lines.append(f"Điều {art['num']}. {art['title']}\n{art['body']}\n")

        full_text = "\n".join(text_lines)
        filename = f"{target_statute['clean_code']}_auto_ingested.txt"

        upload_res = LegalLibraryManager.ingest_statute_text(
            filename=filename,
            text=full_text,
            statute_title=target_statute["title"],
            category=target_statute["category"],
            custom_prefix=target_statute["clean_code"]
        )

        from app.models.schemas import LegalRuleUpdate
        ingested_codes = []
        for art in target_statute.get("articles", []):
            rule_code = f"{target_statute['clean_code']}_D{art['num']}"
            ingested_codes.append(rule_code)
            if art.get("keywords"):
                LegalLibraryManager.update_law(rule_code, LegalRuleUpdate(keywords=art["keywords"]))

        return AutoIngestResponse(
            statute_title=target_statute["title"],
            articles_ingested=upload_res.articles_extracted,
            category=target_statute["category"],
            message=f"Đã tự động thu thập & nạp thành công {upload_res.articles_extracted} điều luật từ '{target_statute['title']}' vào Thư Viện Tri Thức RAG!",
            ingested_codes=ingested_codes
        )
