import io
from app.models.schemas import Clause, ContractAnalysisReport, RiskItem, RiskLevel
from app.engine.docx_generator import ContractDocxGenerator
from docx import Document

def test_generate_redline_docx():
    """Kiểm tra module tạo tệp Word chứa Track Changes Redline"""
    report = ContractAnalysisReport(
        contract_id="test_contract",
        contract_title="Hợp đồng thử nghiệm Word",
        contract_type="Hợp đồng Thử nghiệm",
        overall_score=40,
        summary="Báo cáo thử nghiệm tệp docx.",
        total_clauses=1,
        critical_count=1,
        high_count=0,
        medium_count=0,
        low_count=0,
        clauses=[
            Clause(
                id="c1",
                clause_number="Điều 1",
                title="Phạt vi phạm",
                content="Phạt vi phạm 20% tổng giá trị hợp đồng.",
                page_number=1,
                bounding_boxes=[]
            )
        ],
        risks=[
            RiskItem(
                id="r1",
                clause_id="c1",
                clause_number="Điều 1",
                risk_level=RiskLevel.CRITICAL,
                risk_title="Phạt 20% vượt trần",
                risk_category="Phạt vi phạm",
                description="Vi phạm Điều 301 LTM",
                legal_basis="Điều 301, Luật Thương mại 2005",
                original_text="Phạt vi phạm 20% tổng giá trị hợp đồng.",
                suggested_text="Phạt vi phạm 8% giá trị phần nghĩa vụ bị vi phạm.",
                rationale="Khống chế trần 8% theo luật định.",
                bounding_boxes=[]
            )
        ]
    )

    docx_buffer = ContractDocxGenerator.generate_redline_docx(report)
    assert docx_buffer is not None
    assert docx_buffer.getbuffer().nbytes > 0

    # Read back generated docx to verify structure
    doc = Document(docx_buffer)
    full_text = "\n".join([p.text for p in doc.paragraphs])
    assert "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" in full_text
    assert "BẢN SỬA ĐỔI ĐIỀU KHOẢN HỢP ĐỒNG" in full_text
    assert "Điều 1: Phạt vi phạm" in full_text
