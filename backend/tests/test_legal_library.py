import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.engine.legal_library_manager import LegalLibraryManager
from app.models.schemas import LegalRuleCreate, LegalRuleUpdate, Clause
from app.engine.risk_analyzer import LegalRiskAnalyzer

def test_legal_library_crud():
    # 1. Lấy danh sách ban đầu
    initial_laws = LegalLibraryManager.get_all_laws()
    assert len(initial_laws) > 0, "Thư viện phải có các điều luật hạt nhân khởi tạo"

    # 2. Thêm điều luật mới (Ví dụ: Quy tắc cấm sa thải lao động nữ mang thai)
    test_code = "TEST_BLLD_D137_PREGNANCY"
    rule_in = LegalRuleCreate(
        code=test_code,
        law="Điều 137.3, Bộ luật Lao động 2019",
        topic="Cấm sa thải hoặc đơn phương chấm dứt HĐLĐ với lao động nữ mang thai",
        rule="Người sử dụng lao động không được sa thải hoặc đơn phương chấm dứt hợp đồng lao động đối với người lao động vì lý do kết hôn, mang thai, nghỉ thai sản.",
        category="Lao động",
        keywords=["sa thải lao động mang thai", "đuổi việc có bầu", "chấm dứt khi có thai"],
        risk_level="CRITICAL",
        statute_source="Bộ luật Lao động số 45/2019/QH14"
    )

    created = LegalLibraryManager.add_law(rule_in)
    assert created.code == test_code
    assert created.topic == rule_in.topic

    # Kiểm tra lấy lại theo code
    fetched = LegalLibraryManager.get_rule_by_code(test_code)
    assert fetched is not None
    assert fetched.code == test_code

    # 3. Thử nghiệm Dynamic Risk Analyzer nhận diện điều luật mới
    test_clause = Clause(
        id="clause_test_pregnancy",
        clause_number="Điều 99",
        title="Chấm dứt hợp đồng khi mang thai",
        content="Công ty có quyền đơn phương chấm dứt khi có thai đối với nhân viên nữ mà không cần bồi thường."
    )
    analysis = LegalRiskAnalyzer.analyze_contract(
        contract_id="test_contract_dyn",
        title="Hợp đồng thử nghiệm dynamic rule",
        contract_type="Lao động",
        clauses=[test_clause]
    )

    detected_risk = any(test_code in r.id or "Điều 137.3" in r.legal_basis for r in analysis.risks)
    assert detected_risk, "LegalRiskAnalyzer phải phát hiện rủi ro dựa trên điều luật động vừa thêm vào thư viện!"

    # 4. Cập nhật điều luật
    update_in = LegalRuleUpdate(topic="Bảo vệ đặc biệt lao động nữ mang thai")
    updated = LegalLibraryManager.update_law(test_code, update_in)
    assert updated.topic == "Bảo vệ đặc biệt lao động nữ mang thai"

    # 5. Xóa điều luật test dọn dẹp
    deleted = LegalLibraryManager.delete_law(test_code)
    assert deleted is True
    assert LegalLibraryManager.get_rule_by_code(test_code) is None
    print("test_legal_library_crud: PASSED")

def test_statute_text_ingestion():
    # Thử nghiệm bóc tách văn bản quy phạm pháp luật
    sample_statute_text = """
    LUẬT KINH DOANH BẤT ĐỘNG SẢN 2023
    
    Điều 14. Nguyên tắc kinh doanh nhà ở, công trình xây dựng
    Hoạt động kinh doanh bất động sản phải công khai, minh bạch; bảo vệ quyền và lợi ích hợp pháp của tổ chức, cá nhân.
    
    Điều 24. Đặt cọc trong kinh doanh nhà ở, công trình xây dựng hình thành trong tương lai
    Chủ đầu tư dự án bất động sản chỉ được thu tiền đặt cọc không quá 5% giá bán, cho thuê mua nhà ở khi đã đủ điều kiện đưa vào kinh doanh.
    """

    res = LegalLibraryManager.ingest_statute_text(
        filename="test_statute_sample.txt",
        text=sample_statute_text,
        statute_title="Luật Kinh doanh Bất động sản 2023",
        category="Đất đai & BĐS"
    )

    assert res.articles_extracted >= 2, f"Phải bóc tách được ít nhất 2 điều luật, trích xuất được: {res.articles_extracted}"

    # Dọn dẹp các rule vừa tạo từ test
    LegalLibraryManager.delete_law("LUATKINH_D14")
    LegalLibraryManager.delete_law("LUATKINH_D24")
    LegalLibraryManager.delete_law("LUTKINHD_D14")
    LegalLibraryManager.delete_law("LUTKINHD_D24")
    sample_doc = os.path.join(os.path.dirname(__file__), "..", "data", "legal_library", "documents", "test_statute_sample.txt")
    if os.path.exists(sample_doc):
        os.remove(sample_doc)
    print("test_statute_text_ingestion: PASSED")

if __name__ == "__main__":
    test_legal_library_crud()
    test_statute_text_ingestion()
    print("ALL LEGAL LIBRARY TESTS PASSED!")
