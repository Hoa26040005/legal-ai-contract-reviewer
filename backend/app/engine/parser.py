import io
from typing import List, Dict, Any
import fitz # PyMuPDF
from app.models.schemas import BoundingBox

class DocumentParser:
    """
    Parser tài liệu hợp đồng PDF sử dụng PyMuPDF.
    Trích xuất text theo từng khối (block), dòng (line) kèm tọa độ Bounding Box (x0, y0, x1, y1)
    để hỗ trợ highlight trực tiếp lên trang PDF trên Frontend.
    """
    
    @staticmethod
    def extract_layout_from_bytes(pdf_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Trích xuất toàn bộ text cùng tọa độ bounding boxes theo từng trang.
        """
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages_data = []
        
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_rect = page.rect
            page_width = page_rect.width
            page_height = page_rect.height
            
            # Trích xuất dạng blocks hoặc words với tọa độ
            # 'blocks': (x0, y0, x1, y1, text, block_no, block_type)
            blocks = page.get_text("blocks")
            page_blocks = []
            
            for b in blocks:
                # b[6] == 0 nghĩa là block chứa text
                if len(b) >= 7 and b[6] == 0:
                    text = b[4].strip()
                    if text:
                        # Chuẩn hóa tọa độ theo tỉ lệ 0.0 - 1.0 để Frontend render responsive
                        norm_box = {
                            "page": page_idx + 1,
                            "x0": round(b[0] / page_width, 4),
                            "y0": round(b[1] / page_height, 4),
                            "x1": round(b[2] / page_width, 4),
                            "y1": round(b[3] / page_height, 4),
                            "text": text,
                            "raw_coords": [b[0], b[1], b[2], b[3]]
                        }
                        page_blocks.append(norm_box)
            
            pages_data.append({
                "page_number": page_idx + 1,
                "width": page_width,
                "height": page_height,
                "blocks": page_blocks,
                "full_text": page.get_text("text")
            })
            
        doc.close()
        return pages_data

    @staticmethod
    def search_text_bounding_boxes(pdf_bytes: bytes, search_phrase: str) -> List[BoundingBox]:
        """
        Tìm kiếm cụm từ trong tài liệu PDF và trả về tọa độ chính xác của các vùng khớp.
        """
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        results = []
        clean_phrase = search_phrase.strip()[:60] # Lấy đoạn mào đầu để tìm
        
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            rects = page.search_for(clean_phrase)
            page_width = page.rect.width
            page_height = page.rect.height
            
            for r in rects:
                results.append(BoundingBox(
                    page=page_idx + 1,
                    x0=round(r.x0 / page_width, 4),
                    y0=round(r.y0 / page_height, 4),
                    x1=round(r.x1 / page_width, 4),
                    y1=round(r.y1 / page_height, 4)
                ))
                
        doc.close()
        return results
