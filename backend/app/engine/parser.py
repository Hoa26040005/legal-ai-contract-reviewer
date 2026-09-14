import io
from typing import List, Dict, Any
import fitz # PyMuPDF
from PIL import Image, ImageEnhance, ImageFilter
from app.models.schemas import BoundingBox

class DocumentParser:
    """
    Parser tài liệu hợp đồng chuyên sâu:
    - Xử lý PDF có sẵn lớp text (Digital PDF).
    - Xử lý ảnh chụp từ điện thoại (.jpg, .jpeg, .png, .webp) và PDF dạng scan.
    - Tiền xử lý ảnh: Tăng độ tương phản, chuyển xám, làm nét chữ mờ.
    - Trích xuất layout và tọa độ Bounding Box (x0, y0, x1, y1) chuẩn hóa 0.0 - 1.0.
    """
    
    @staticmethod
    def extract_layout_from_bytes(file_bytes: bytes, filename: str = "") -> List[Dict[str, Any]]:
        """
        Trích xuất toàn bộ text cùng tọa độ bounding boxes theo từng trang (hỗ trợ cả PDF và Ảnh).
        """
        is_image = any(filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"])

        if is_image:
            return DocumentParser._process_image_file(file_bytes)
        else:
            return DocumentParser._process_pdf_file(file_bytes)

    @staticmethod
    def _process_pdf_file(pdf_bytes: bytes) -> List[Dict[str, Any]]:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages_data = []
        
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_rect = page.rect
            page_width = page_rect.width
            page_height = page_rect.height
            
            blocks = page.get_text("blocks")
            page_blocks = []
            
            for b in blocks:
                if len(b) >= 7 and b[6] == 0:
                    text = b[4].strip()
                    if text:
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

            # Fallback nếu PDF scan không có sẵn text block
            full_text = page.get_text("text")
            if not page_blocks and full_text.strip():
                lines = [l.strip() for l in full_text.split("\n") if l.strip()]
                for idx, line in enumerate(lines):
                    y_ratio = idx / max(len(lines), 1)
                    page_blocks.append({
                        "page": page_idx + 1,
                        "x0": 0.1,
                        "y0": round(y_ratio, 4),
                        "x1": 0.9,
                        "y1": round(y_ratio + 0.05, 4),
                        "text": line,
                        "raw_coords": [0, 0, 0, 0]
                    })
            
            pages_data.append({
                "page_number": page_idx + 1,
                "width": page_width,
                "height": page_height,
                "blocks": page_blocks,
                "full_text": full_text
            })
            
        doc.close()
        return pages_data

    @staticmethod
    def _process_image_file(image_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Tiền xử lý ảnh chụp điện thoại / scan mờ và trích xuất layout qua PyMuPDF Image Engine.
        """
        # 1. Image Enhancement with PIL (Contrast & Sharpness for blurry phone photos)
        try:
            img = Image.open(io.BytesIO(image_bytes))
            # Chuyển sang Grayscale
            img_gray = img.convert("L")
            # Tăng độ tương phản để làm nổi bật chữ scan mờ
            enhancer = ImageEnhance.Contrast(img_gray)
            img_enhanced = enhancer.enhance(1.8)
            # Làm sắc nét nét chữ
            img_sharp = img_enhanced.filter(ImageFilter.SHARPEN)

            # Lưu vào bộ nhớ đệm dạng PNG để PyMuPDF đọc
            enhanced_buffer = io.BytesIO()
            img_sharp.save(enhanced_buffer, format="PNG")
            proc_bytes = enhanced_buffer.getvalue()
        except Exception:
            proc_bytes = image_bytes

        # 2. Mở ảnh bằng PyMuPDF và convert thành document
        img_doc = fitz.open(stream=proc_bytes, filetype="png")
        pdf_bytes = img_doc.convert_to_pdf()
        img_doc.close()

        # Parse document
        return DocumentParser._process_pdf_file(pdf_bytes)
