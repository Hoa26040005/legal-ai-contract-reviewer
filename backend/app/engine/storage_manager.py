from typing import List, Dict, Optional
from datetime import datetime
from app.models.schemas import ArchiveContractItem, ContractAnalysisReport

class ContractStorageManager:
    """
    Module quản lý kho lưu trữ và Tủ Hồ Sơ Hợp Đồng (Contract Document Repository):
    - Tự động lưu trữ tệp gốc, tệp Word Track Changes và Phụ lục sửa đổi hợp đồng.
    - Phân loại thư mục theo phòng ban: Lao động, Mua bán, Dịch vụ CNTT, Bảo mật NDA.
    - Cung cấp tính năng tìm kiếm, trích xuất và xóa tài liệu trong kho.
    """

    # Danh mục hồ sơ lưu trữ mặc định
    ARCHIVE_REGISTRY: Dict[str, ArchiveContractItem] = {
        "sample_it_service": ArchiveContractItem(
            contract_id="sample_it_service",
            title="Hợp Đồng Dịch Vụ Phát Triển Phần Mềm AI & Tích Hợp Hệ Thống",
            contract_type="Hợp đồng Dịch vụ Thương mại",
            category="Dịch vụ CNTT",
            overall_score=38,
            status_label="CẦN SỬA ĐỔI",
            created_at="2026-09-14 09:30",
            page_count=4,
            total_clauses=6,
            critical_count=2,
            file_size_kb=345.5,
            original_filename="Hop_Dong_Dich_Vu_AI_Alpha.pdf",
            has_docx=True,
            has_annex=True
        ),
        "sample_labor_contract": ArchiveContractItem(
            contract_id="sample_labor_contract",
            title="Hợp Đồng Lao Động Xác Định Thời Hạn (Mẫu Nhân Sự TechCorp)",
            contract_type="Hợp đồng Lao động (BLLD 2019)",
            category="Lao động & Nhân sự",
            overall_score=25,
            status_label="CẦN SỬA ĐỔI",
            created_at="2026-09-14 10:15",
            page_count=3,
            total_clauses=5,
            critical_count=3,
            file_size_kb=280.2,
            original_filename="HDLD_NhanVien_TechCorp_2026.pdf",
            has_docx=True,
            has_annex=True
        ),
        "sample_sales_contract": ArchiveContractItem(
            contract_id="sample_sales_contract",
            title="Hợp Đồng Mua Bán Thiết Bị Máy Chủ & Hạ Tầng Trung Tâm Dữ Liệu",
            contract_type="Hợp đồng Mua bán Hàng hóa (LTM 2005)",
            category="Mua bán & Thương mại",
            overall_score=82,
            status_label="AN TOÀN",
            created_at="2026-09-13 14:20",
            page_count=6,
            total_clauses=8,
            critical_count=0,
            file_size_kb=520.8,
            original_filename="HD_MuaBan_Server_Cloud_2026.pdf",
            has_docx=True,
            has_annex=False
        ),
        "sample_nda_agreement": ArchiveContractItem(
            contract_id="sample_nda_agreement",
            title="Thỏa Thuận Không Tiết Lộ & Bảo Mật Dữ Liệu Bí Mật Kinh Doanh (NDA)",
            contract_type="Thỏa thuận Bảo mật Thông tin",
            category="Bảo mật NDA",
            overall_score=70,
            status_label="ĐANG ĐÀM PHÁN",
            created_at="2026-09-12 16:45",
            page_count=3,
            total_clauses=4,
            critical_count=0,
            file_size_kb=195.0,
            original_filename="NDA_BaoMat_DoiTacChiLenh.pdf",
            has_docx=True,
            has_annex=True
        )
    }

    @classmethod
    def get_archive_list(cls, category: Optional[str] = None) -> List[ArchiveContractItem]:
        """Lấy danh sách tất cả tài liệu trong Tủ Hồ Sơ"""
        items = list(cls.ARCHIVE_REGISTRY.values())
        if category and category != "Tất cả":
            items = [item for item in items if item.category == category]
        # Sắp xếp theo ngày mới nhất lên đầu
        return sorted(items, key=lambda x: x.created_at, reverse=True)

    @classmethod
    def save_to_archive(
        cls,
        report: ContractAnalysisReport,
        filename: str,
        file_bytes: Optional[bytes] = None
    ) -> ArchiveContractItem:
        """Lưu trữ một hợp đồng mới vào Tủ Hồ Sơ"""
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
        file_size_kb = round(len(file_bytes) / 1024, 1) if file_bytes else 250.0

        # Xác định danh mục
        ctype = report.contract_type.lower()
        if "lao động" in ctype or "labor" in ctype:
            cat = "Lao động & Nhân sự"
        elif "mua bán" in ctype or "thương mại" in ctype or "sale" in ctype:
            cat = "Mua bán & Thương mại"
        elif "nda" in ctype or "bảo mật" in ctype:
            cat = "Bảo mật NDA"
        else:
            cat = "Dịch vụ CNTT"

        # Xác định nhãn trạng thái
        if report.overall_score >= 75:
            status = "AN TOÀN"
        elif report.overall_score >= 40:
            status = "ĐANG ĐÀM PHÁN"
        else:
            status = "CẦN SỬA ĐỔI"

        item = ArchiveContractItem(
            contract_id=report.contract_id,
            title=report.contract_title,
            contract_type=report.contract_type,
            category=cat,
            overall_score=report.overall_score,
            status_label=status,
            created_at=now_str,
            page_count=max(c.page_number for c in report.clauses) if report.clauses else 1,
            total_clauses=report.total_clauses,
            critical_count=report.critical_count,
            file_size_kb=file_size_kb,
            original_filename=filename,
            has_docx=True,
            has_annex=True
        )

        cls.ARCHIVE_REGISTRY[report.contract_id] = item
        return item

    @classmethod
    def delete_from_archive(cls, contract_id: str) -> bool:
        """Xóa hồ sơ khỏi kho lưu trữ"""
        if contract_id in cls.ARCHIVE_REGISTRY:
            del cls.ARCHIVE_REGISTRY[contract_id]
            return True
        return False
