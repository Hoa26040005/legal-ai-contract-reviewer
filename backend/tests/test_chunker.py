from app.engine.chunker import VietnameseLegalChunker

def test_vietnamese_legal_chunker():
    """Kiểm tra bẻ chunk Điều/Khoản ngữ nghĩa tiếng Việt"""
    sample_pages = [
        {
            "page_number": 1,
            "width": 595,
            "height": 842,
            "blocks": [
                {
                    "page": 1,
                    "x0": 0.1,
                    "y0": 0.1,
                    "x1": 0.9,
                    "y1": 0.2,
                    "text": "Điều 1: Phạm vi công việc\nBên B cung cấp dịch vụ AI cho Bên A.",
                    "raw_coords": [0, 0, 0, 0]
                },
                {
                    "page": 1,
                    "x0": 0.1,
                    "y0": 0.3,
                    "x1": 0.9,
                    "y1": 0.4,
                    "text": "Điều 2: Thời hạn thanh toán\nBên A thanh toán trong 30 ngày.",
                    "raw_coords": [0, 0, 0, 0]
                }
            ],
            "full_text": "Điều 1: Phạm vi công việc\nBên B cung cấp dịch vụ AI cho Bên A.\nĐiều 2: Thời hạn thanh toán\nBên A thanh toán trong 30 ngày."
        }
    ]

    clauses = VietnameseLegalChunker.chunk_document_layout(sample_pages)
    assert len(clauses) == 2
    assert "Điều 1" in clauses[0].clause_number
    assert "Phạm vi công việc" in clauses[0].title
    assert "Điều 2" in clauses[1].clause_number
