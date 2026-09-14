import pytest
from app.engine.comparator import ContractComparator
from app.models.schemas import Clause, BoundingBox, ContractAnalysisReport, RiskItem, RiskLevel

def test_comparator_sample_data():
    """Kiểm tra báo cáo so sánh mẫu Labor Contract V1 vs V2"""
    sample = ContractComparator.get_sample_comparison()
    
    assert sample.title_v1 != ""
    assert sample.title_v2 != ""
    assert sample.score_v1 == 22
    assert sample.score_v2 == 88
    assert sample.score_delta == 66
    assert sample.resolved_risks_count >= 5
    assert len(sample.diff_items) >= 6

    # Verify statuses exist
    statuses = [item.status for item in sample.diff_items]
    assert "MODIFIED" in statuses
    assert "ADDED" in statuses
    assert "UNCHANGED" in statuses


def test_compare_contracts_logic():
    """Kiểm tra logic bóc tách so sánh 2 bản hợp đồng thực tế"""
    # Contract 1: Original with risky clauses
    clauses_v1 = [
        Clause(
            id="c1",
            clause_number="Điều 1",
            title="Nhiệm vụ",
            content="Người lao động làm việc theo phân công của Giám đốc.",
            page_number=1,
            bounding_boxes=[]
        ),
        Clause(
            id="c2",
            clause_number="Điều 2",
            title="Giữ văn bằng",
            content="Người lao động phải nộp bằng đại học gốc cho công ty giữ.",
            page_number=1,
            bounding_boxes=[]
        ),
        Clause(
            id="c3",
            clause_number="Điều 3",
            title="Thời hạn hợp đồng",
            content="Hợp đồng xác định thời hạn 12 tháng.",
            page_number=1,
            bounding_boxes=[]
        )
    ]
    risks_v1 = [
        RiskItem(
            id="r1",
            clause_id="c2",
            clause_number="Điều 2",
            risk_level=RiskLevel.CRITICAL,
            risk_title="Giữ văn bằng gốc trái Điều 17 BLLĐ",
            risk_category="Pháp lý",
            description="Công ty không được giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ.",
            original_text="Người lao động phải nộp bằng đại học gốc",
            suggested_text="Chỉ nộp bản sao chứng thực",
            rationale="Khoản 1 Điều 17 Bộ luật Lao động 2019 cấm tuyệt đối",
            bounding_boxes=[]
        )
    ]
    report_v1 = ContractAnalysisReport(
        contract_id="c_v1",
        contract_title="Hợp Đồng Lao Động V1",
        contract_type="Hợp đồng lao động",
        overall_score=35,
        summary="Nhiều rủi ro",
        total_clauses=3,
        critical_count=1,
        high_count=0,
        medium_count=0,
        low_count=0,
        clauses=clauses_v1,
        risks=risks_v1
    )

    # Contract 2: Negotiated version
    # Điều 1: unchanged
    # Điều 2: modified (removed withholding of original diploma)
    # Điều 4: added (bảo mật thông tin NDA)
    # Điều 3: omitted (removed)
    clauses_v2 = [
        Clause(
            id="c1_v2",
            clause_number="Điều 1",
            title="Nhiệm vụ",
            content="Người lao động làm việc theo phân công của Giám đốc.",
            page_number=1,
            bounding_boxes=[]
        ),
        Clause(
            id="c2_v2",
            clause_number="Điều 2",
            title="Văn bằng chứng chỉ",
            content="Người lao động nộp bản sao có chứng thực để công ty đối chiếu.",
            page_number=1,
            bounding_boxes=[]
        ),
        Clause(
            id="c4_v2",
            clause_number="Điều 4",
            title="Bảo mật",
            content="Hai bên cam kết bảo vệ thông tin bí mật kinh doanh.",
            page_number=1,
            bounding_boxes=[]
        )
    ]
    report_v2 = ContractAnalysisReport(
        contract_id="c_v2",
        contract_title="Hợp Đồng Lao Động V2 (Đã Đàm Phán)",
        contract_type="Hợp đồng lao động",
        overall_score=90,
        summary="Đạt chuẩn pháp lý",
        total_clauses=3,
        critical_count=0,
        high_count=0,
        medium_count=0,
        low_count=0,
        clauses=clauses_v2,
        risks=[]
    )

    comp = ContractComparator.compare_contracts(report_v1, report_v2)

    assert comp.score_v1 == 35
    assert comp.score_v2 == 90
    assert comp.score_delta == 55  # 90 - 35
    assert comp.resolved_risks_count == 1

    diff_map = {item.clause_number: item for item in comp.diff_items}

    # Check Điều 1 is UNCHANGED
    assert "Điều 1" in diff_map
    assert diff_map["Điều 1"].status == "UNCHANGED"

    # Check Điều 2 is MODIFIED with resolved risk
    assert "Điều 2" in diff_map
    assert diff_map["Điều 2"].status == "MODIFIED"
    assert diff_map["Điều 2"].resolved_risk is not None

    # Check Điều 3 is REMOVED
    assert "Điều 3" in diff_map
    assert diff_map["Điều 3"].status == "REMOVED"

    # Check Điều 4 is ADDED
    assert "Điều 4" in diff_map
    assert diff_map["Điều 4"].status == "ADDED"
