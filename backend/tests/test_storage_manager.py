from app.engine.storage_manager import ContractStorageManager
from app.engine.sample_contracts import get_sample_contract_analysis

def test_archive_list():
    """Kiểm tra danh sách hồ sơ trong Tủ Hồ Sơ"""
    items = ContractStorageManager.get_archive_list()
    assert len(items) >= 4

    # Kiểm tra các trường dữ liệu
    first = items[0]
    assert first.contract_id != ""
    assert first.title != ""
    assert first.category != ""
    assert first.overall_score >= 0
    assert first.status_label in ["AN TOÀN", "ĐANG ĐÀM PHÁN", "CẦN SỬA ĐỔI"]
    assert first.has_docx is True

def test_category_filter():
    """Kiểm tra lọc theo thư mục phòng ban"""
    labor_items = ContractStorageManager.get_archive_list(category="Lao động & Nhân sự")
    for item in labor_items:
        assert item.category == "Lao động & Nhân sự"

def test_save_and_delete_archive():
    """Kiểm tra lưu trữ hồ sơ mới và xóa khỏi kho"""
    report = get_sample_contract_analysis("sample_it_service")
    report.contract_id = "test_archive_new_id"
    report.contract_title = "Hợp đồng Lưu trữ Mới"

    # 1. Lưu hồ sơ
    saved = ContractStorageManager.save_to_archive(report, "test_file.pdf", b"fake file content bytes")
    assert saved.contract_id == "test_archive_new_id"
    assert saved.title == "Hợp đồng Lưu trữ Mới"

    # Kiểm tra tồn tại trong kho
    items = ContractStorageManager.get_archive_list()
    assert any(i.contract_id == "test_archive_new_id" for i in items)

    # 2. Xóa hồ sơ
    deleted = ContractStorageManager.delete_from_archive("test_archive_new_id")
    assert deleted is True

    # Kiểm tra không còn tồn tại
    items_after = ContractStorageManager.get_archive_list()
    assert not any(i.contract_id == "test_archive_new_id" for i in items_after)
