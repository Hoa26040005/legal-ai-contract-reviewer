from app.engine.precedent_engine import PrecedentLitigationEngine
from app.engine.sample_contracts import get_sample_contract_analysis

def test_precedents_library():
    """Kiểm tra thư viện Án lệ TANDTC chuẩn hóa theo Nghị quyết 04/2019/NQ-HĐTP"""
    library = PrecedentLitigationEngine.get_precedents_library()
    assert len(library) >= 5

    case_codes = [c.case_code for c in library]
    assert "Án lệ số 09/2017/AL" in case_codes
    assert "Án lệ số 42/2021/AL" in case_codes
    assert "Án lệ số 25/2018/AL" in case_codes

    for case in library:
        assert case.court == "Hội đồng Thẩm phán Tòa án nhân dân tối cao"
        assert len(case.summary_situation) > 10
        assert len(case.ruling) > 10


def test_predict_litigation_risk():
    """Kiểm tra thuật toán dự đoán tỷ lệ thua kiện và hậu quả tố tụng"""
    sample_report = get_sample_contract_analysis("sample_labor_contract")
    prediction = PrecedentLitigationEngine.predict_contract_litigation_risk(sample_report)

    assert prediction.contract_id == sample_report.contract_id
    assert prediction.overall_litigation_risk >= 50
    assert prediction.risk_assessment in ["CỰC KỲ NGUY HIỂM", "RỦI RO CAO"]
    assert prediction.total_disputed_clauses > 0
    assert len(prediction.clauses_risks) > 0

    # Kiểm tra điều khoản có rủi ro thua kiện cao
    first_clause = prediction.clauses_risks[0]
    assert first_clause.loss_probability >= 50
    assert len(first_clause.court_ruling_forecast) > 10
    assert len(first_clause.estimated_court_fee) > 0
    assert len(first_clause.recommendation) > 0
