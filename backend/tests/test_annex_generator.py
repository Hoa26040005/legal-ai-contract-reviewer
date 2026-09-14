import io
from app.engine.annex_generator import ContractAnnexGenerator
from app.engine.sample_contracts import get_sample_contract_analysis

def test_annex_generator_data_structure():
    """Kiểm tra trích xuất dữ liệu cấu trúc Phụ lục sửa đổi hợp đồng"""
    sample_report = get_sample_contract_analysis("sample_labor_contract")
    annex_data = ContractAnnexGenerator.generate_annex_data(sample_report)

    assert "PHỤ LỤC" in annex_data["annex_title"]
    assert annex_data["contract_title"] == sample_report.contract_title
    assert annex_data["total_changes"] > 0
    assert len(annex_data["modified_items"]) + len(annex_data["revoked_items"]) > 0

    # Kiểm tra điều khoản bãi bỏ (ví dụ: giữ bằng gốc, đặt cọc)
    if annex_data["revoked_items"]:
        rev = annex_data["revoked_items"][0]
        assert "clause_number" in rev
        assert "reason" in rev

    # Kiểm tra điều khoản sửa đổi
    if annex_data["modified_items"]:
        mod = annex_data["modified_items"][0]
        assert "new_text" in mod
        assert "legal_basis" in mod


def test_annex_docx_generation():
    """Kiểm tra sinh file Word .docx Phụ lục sửa đổi hợp đồng"""
    sample_report = get_sample_contract_analysis("sample_labor_contract")
    docx_stream = ContractAnnexGenerator.generate_annex_docx(
        report=sample_report,
        party_a_name="CÔNG TY CỔ PHẦN CÔNG NGHỆ ALPHA",
        party_b_name="NGUYỄN VĂN A",
        annex_number="01/2026",
        contract_number="HĐLĐ-2026/08"
    )

    assert isinstance(docx_stream, io.BytesIO)
    content = docx_stream.getvalue()
    assert len(content) > 5000  # File Word hợp lệ có kích thước > 5KB
    assert content.startswith(b"PK")  # Chữ ký file nén ZIP của định dạng Office OpenXML (.docx)
