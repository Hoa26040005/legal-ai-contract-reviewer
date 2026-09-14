import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.engine.auto_ingest_engine import AutoIngestEngine
from app.models.schemas import AutoIngestRequest, Clause
from app.engine.risk_analyzer import LegalRiskAnalyzer
from app.engine.legal_library_manager import LegalLibraryManager

def test_national_catalog():
    catalog = AutoIngestEngine.get_national_catalog()
    assert len(catalog) >= 5, "Kho văn bản quốc gia phải có ít nhất 5 đạo luật lớn"
    
    titles = [s.title for s in catalog]
    assert any("Luật Đất đai" in t for t in titles)
    assert any("Luật Nhà ở" in t for t in titles)
    assert any("Giao dịch điện tử" in t for t in titles)
    print("test_national_catalog: PASSED")

def test_auto_ingest_by_id_and_detection():
    # 1. Tự động nạp Luật Giao dịch điện tử 2023 bằng 1-Click ID
    req = AutoIngestRequest(statute_id="statute_e_transaction_2023")
    res = AutoIngestEngine.auto_ingest(req)

    assert res.articles_ingested >= 2, f"Phải nạp được ít nhất 2 điều luật, nạp được: {res.articles_ingested}"
    assert "Giao dịch điện tử" in res.statute_title

    # 2. Kiểm tra LegalRiskAnalyzer phát hiện điều khoản phủ nhận hợp đồng điện tử
    test_clause = Clause(
        id="c_auto_test_1",
        clause_number="Điều 15",
        title="Phương thức giao kết",
        content="Hai bên chỉ chấp nhận hợp đồng bản giấy có chữ ký tươi; hợp đồng điện tử không có giá trị pháp lý trong bất kỳ trường hợp nào."
    )

    analysis = LegalRiskAnalyzer.analyze_contract(
        contract_id="contract_auto_test",
        title="Hợp đồng kiểm tra Auto Ingest",
        contract_type="Dịch vụ",
        clauses=[test_clause]
    )

    detected = any("LGDDT" in r.id or "Giao dịch điện tử" in r.legal_basis for r in analysis.risks)
    assert detected, "LegalRiskAnalyzer phải nhận diện được quy tắc từ Luật Giao dịch điện tử vừa nạp tự động!"

    # 3. Dọn dẹp các quy tắc test
    for code in res.ingested_codes:
        LegalLibraryManager.delete_law(code)
    f1 = os.path.join(os.path.dirname(__file__), "..", "data", "legal_library", "documents", "LGDDT_auto_ingested.txt")
    if os.path.exists(f1): os.remove(f1)

    print("test_auto_ingest_by_id_and_detection: PASSED")

def test_auto_ingest_by_search_query():
    # Tự động tìm kiếm & nạp Nghị định 12/2022
    req = AutoIngestRequest(search_query="Nghị định 12/2022")
    res = AutoIngestEngine.auto_ingest(req)

    assert res.articles_ingested >= 1
    assert "12/2022" in res.statute_title or "12" in res.statute_title

    # Dọn dẹp
    for code in res.ingested_codes:
        LegalLibraryManager.delete_law(code)
    f2 = os.path.join(os.path.dirname(__file__), "..", "data", "legal_library", "documents", "ND12_2022_auto_ingested.txt")
    if os.path.exists(f2): os.remove(f2)

    print("test_auto_ingest_by_search_query: PASSED")

if __name__ == "__main__":
    test_national_catalog()
    test_auto_ingest_by_id_and_detection()
    test_auto_ingest_by_search_query()
    print("ALL AUTO-INGEST TESTS PASSED 100%!")
