from app.models.schemas import Clause, BoundingBox, RiskLevel
from app.engine.risk_analyzer import LegalRiskAnalyzer

def test_detect_labor_diploma_retention():
    """Kiểm tra phát hiện hành vi giữ bằng đại học gốc theo Điều 17.1 BLLD 2019"""
    clause = Clause(
        id="c1",
        clause_number="Điều 1",
        title="Hồ sơ nhân sự",
        content="Người lao động phải nộp bản gốc bằng tốt nghiệp đại học để Công ty lưu giữ trong suốt thời hạn hợp đồng.",
        page_number=1,
        bounding_boxes=[]
    )
    risks = LegalRiskAnalyzer._evaluate_clause(clause, "Hợp đồng Lao động")
    assert len(risks) >= 1
    diploma_risk = next((r for r in risks if "17.1" in (r.legal_basis or "")), None)
    assert diploma_risk is not None
    assert diploma_risk.risk_level == RiskLevel.CRITICAL
    assert "Điều 17.1, Bộ luật Lao động 2019" in diploma_risk.legal_basis

def test_detect_labor_deposit_money():
    """Kiểm tra phát hiện bắt đặt cọc tiền ký quỹ theo Điều 17.2 BLLD 2019"""
    clause = Clause(
        id="c2",
        clause_number="Điều 2",
        title="Ký quỹ bảo đảm",
        content="Người lao động phải đặt cọc tiền là 20.000.000 VNĐ vào tài khoản công ty để bảo đảm thực hiện hợp đồng.",
        page_number=1,
        bounding_boxes=[]
    )
    risks = LegalRiskAnalyzer._evaluate_clause(clause, "Hợp đồng Lao động")
    assert any("17.2" in (r.legal_basis or "") for r in risks)
    deposit_risk = next(r for r in risks if "17.2" in (r.legal_basis or ""))
    assert deposit_risk.risk_level == RiskLevel.CRITICAL

def test_detect_commercial_penalty_cap():
    """Kiểm tra phát hiện phạt vi phạm vượt mức trần 8% theo Điều 301 Luật Thương mại 2005"""
    clause = Clause(
        id="c3",
        clause_number="Điều 3",
        title="Phạt vi phạm",
        content="Bên nào vi phạm nghĩa vụ hợp đồng phải chịu phạt 15% tổng giá trị hợp đồng.",
        page_number=1,
        bounding_boxes=[]
    )
    risks = LegalRiskAnalyzer._evaluate_clause(clause, "Hợp đồng Thương mại")
    assert any("301" in (r.legal_basis or "") for r in risks)
    penalty_risk = next(r for r in risks if "301" in (r.legal_basis or ""))
    assert penalty_risk.risk_level == RiskLevel.CRITICAL
    assert "phạt 8%" in penalty_risk.suggested_text.lower()

def test_detect_interest_rate_cap():
    """Kiểm tra phát hiện lãi phạt chậm trả vượt mức trần 20%/năm theo Điều 468 BLDS 2015"""
    clause = Clause(
        id="c4",
        clause_number="Điều 4",
        title="Chậm thanh toán",
        content="Bên chậm thanh toán phải chịu lãi suất phạt là 0.1% mỗi ngày trên số tiền chậm trả.",
        page_number=1,
        bounding_boxes=[]
    )
    risks = LegalRiskAnalyzer._evaluate_clause(clause, "Hợp đồng Dịch vụ")
    interest_risk = next((r for r in risks if "468" in (r.legal_basis or "")), None)
    assert interest_risk is not None
    assert interest_risk.risk_level == RiskLevel.CRITICAL

def test_detect_social_insurance_evasion():
    """Kiểm tra phát hiện thỏa thuận trốn đóng BHXH theo Điều 168 BLLD 2019"""
    clause = Clause(
        id="c5",
        clause_number="Điều 5",
        title="Bảo hiểm",
        content="Hai bên thỏa thuận người lao động không tham gia BHXH mà công ty chi trả tiền mặt để tự lo bảo hiểm.",
        page_number=1,
        bounding_boxes=[]
    )
    risks = LegalRiskAnalyzer._evaluate_clause(clause, "Hợp đồng Lao động")
    insurance_risk = next((r for r in risks if "168" in (r.legal_basis or "")), None)
    assert insurance_risk is not None
    assert insurance_risk.risk_level == RiskLevel.CRITICAL

def test_overall_contract_analysis_score():
    """Kiểm tra thuật toán tính điểm và sinh Knowledge Graph"""
    clauses = [
        Clause(
            id="c1", clause_number="Điều 1", title="Bằng gốc",
            content="Người lao động nộp bản gốc bằng tốt nghiệp đại học.", page_number=1, bounding_boxes=[]
        ),
        Clause(
            id="c2", clause_number="Điều 2", title="Phạt 20%",
            content="Phạt 20% tổng giá trị hợp đồng.", page_number=1, bounding_boxes=[]
        )
    ]
    report = LegalRiskAnalyzer.analyze_contract("test_id", "Hợp đồng thử nghiệm", "Lao động", clauses)
    assert report.total_clauses == 2
    assert report.critical_count >= 2
    assert report.overall_score <= 50
    assert report.graph_data is not None
    assert len(report.graph_data.nodes) > 2
    assert len(report.graph_data.edges) > 2
