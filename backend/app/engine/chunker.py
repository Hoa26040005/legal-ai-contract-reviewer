import re
from typing import List, Dict, Any
from app.models.schemas import Clause, BoundingBox

class VietnameseLegalChunker:
    """
    Bộ bẻ nhỏ hợp đồng ngữ nghĩa (Semantic Chunking) chuyên biệt cho thể thức văn bản
    pháp lý & hợp đồng tại Việt Nam.
    Tách chính xác theo Điều, Khoản và liên kết tọa độ Bounding Box.
    """
    
    # Các mẫu Regex nhận diện đầu đề Điều khoản / Phân đoạn văn bản pháp lý Việt Nam & Song ngữ
    PATTERNS = [
        # Mẫu 1: Điều X, ĐIỀU X (VD: 'Điều 1.', 'Điều 1:', 'ĐIỀU 1 - QUY ĐỊNH CHUNG')
        re.compile(r'^(?:ĐIỀU|Điều)\s+([0-9A-Za-z]+)\s*[:.\-–]?\s*(.*)$', re.IGNORECASE),
        # Mẫu 2: Mục X, Chương X, Phần X (VD: 'Mục 1.', 'Mục I:', 'Chương II', 'PHẦN 1')
        re.compile(r'^(?:MỤC|Mục|CHƯƠNG|Chương|PHẦN|Phần)\s+([0-9A-Za-zIVXLCDM]+)\s*[:.\-–]?\s*(.*)$', re.IGNORECASE),
        # Mẫu 3: Song ngữ Anh - Việt (VD: 'Article 1:', 'Section 1.', 'Clause 1 -')
        re.compile(r'^(?:ARTICLE|Article|SECTION|Section|CLAUSE|Clause)\s+([0-9A-Za-z]+)\s*[:.\-–]?\s*(.*)$', re.IGNORECASE),
        # Mẫu 4: Số La Mã đứng đầu dòng kèm tiêu đề (VD: 'I. QUY ĐỊNH CHUNG', 'II. TIỀN LƯƠNG VÀ THỬ VIỆC')
        re.compile(r'^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.\s+(.+)$'),
        # Mẫu 5: Số thứ tự đầu dòng in hoa (VD: '1. ĐỐI TƯỢNG HỢP ĐỒNG', '2. QUYỀN VÀ NGHĨA VỤ')
        re.compile(r'^(\d{1,2})\.\s+([A-ZÀ-Ỹ\s]{3,}[A-Za-zÀ-ỹ0-9\s]*)$')
    ]

    @classmethod
    def _match_heading(cls, line: str) -> tuple:
        """
        Kiểm tra xem dòng văn bản có khớp với bất kỳ mẫu đầu đề Điều khoản nào không.
        Trả về (is_match, number, title)
        """
        cleaned = line.strip()
        for pat in cls.PATTERNS:
            m = pat.match(cleaned)
            if m:
                num = m.group(1).strip()
                title = m.group(2).strip() if len(m.groups()) >= 2 and m.group(2) else f"Điều {num}"
                return True, num, title
        return False, "", ""

    @classmethod
    def chunk_document_layout(cls, pages_data: List[Dict[str, Any]]) -> List[Clause]:
        """
        Duyệt qua layout các trang để gom các blocks văn bản thành từng Điều khoản hoàn chỉnh.
        """
        clauses: List[Clause] = []
        current_article_num = ""
        current_article_title = ""
        current_content_blocks = []
        current_page = 1
        current_boxes: List[BoundingBox] = []
        
        clause_counter = 1
        
        for page in pages_data:
            page_num = page["page_number"]
            blocks = page["blocks"]
            
            for block in blocks:
                text = block["text"].strip()
                lines = [line.strip() for line in text.split("\n") if line.strip()]
                if not lines:
                    continue
                
                first_line = lines[0]
                is_match, num, title = cls._match_heading(first_line)
                
                if is_match:
                    # Gặp một Điều mới -> Đóng gói Điều trước đó nếu có
                    if current_article_num or current_content_blocks:
                        clause_id = f"clause_{clause_counter}"
                        full_content = "\n".join(current_content_blocks)
                        
                        clauses.append(Clause(
                            id=clause_id,
                            clause_number=f"Điều {current_article_num}" if (current_article_num and not current_article_num.startswith("Mục") and not current_article_num.startswith("Chương")) else (f"Mục {current_article_num}" if current_article_num else f"Điều {clause_counter}"),
                            title=current_article_title or f"Điều khoản {clause_counter}",
                            content=full_content,
                            page_number=current_page,
                            bounding_boxes=current_boxes
                        ))
                        clause_counter += 1
                    
                    # Khởi tạo Điều mới
                    current_article_num = num
                    current_article_title = title if title else f"Nội dung {num}"
                    current_page = page_num
                    
                    # Nội dung còn lại của block sau dòng tiêu đề
                    rest_of_block = "\n".join(lines[1:])
                    current_content_blocks = [first_line]
                    if rest_of_block:
                        current_content_blocks.append(rest_of_block)
                        
                    current_boxes = [BoundingBox(
                        page=block["page"],
                        x0=block["x0"],
                        y0=block["y0"],
                        x1=block["x1"],
                        y1=block["y1"]
                    )]
                else:
                    # Là nội dung tiếp diễn của Điều hiện tại
                    current_content_blocks.append(text)
                    current_boxes.append(BoundingBox(
                        page=block["page"],
                        x0=block["x0"],
                        y0=block["y0"],
                        x1=block["x1"],
                        y1=block["y1"]
                    ))
                    
        # Đóng gói Điều cuối cùng
        if current_article_num or current_content_blocks:
            clause_id = f"clause_{clause_counter}"
            full_content = "\n".join(current_content_blocks)
            clauses.append(Clause(
                id=clause_id,
                clause_number=f"Điều {current_article_num}" if current_article_num else f"Điều {clause_counter}",
                title=current_article_title or f"Điều khoản {clause_counter}",
                content=full_content,
                page_number=current_page,
                bounding_boxes=current_boxes
            ))
            
        # Fallback nâng cao: Nếu văn bản hoàn toàn không theo cấu trúc chuẩn (không có đề mục),
        # chia thành các đoạn ngữ nghĩa (Semantic Paragraph Clusters) theo cụm blocks thay vì gom toàn bộ trang thành 1 cục
        if len(clauses) <= 1 and any(len(p.get("blocks", [])) > 2 for p in pages_data):
            fallback_clauses = []
            f_counter = 1
            for page in pages_data:
                blocks = page.get("blocks", [])
                # Gom mỗi 2-3 blocks thành 1 phân đoạn pháp lý
                chunk_size = 2
                for i in range(0, len(blocks), chunk_size):
                    chunk_blocks = blocks[i:i + chunk_size]
                    chunk_text = "\n".join(b["text"].strip() for b in chunk_blocks if b["text"].strip())
                    if not chunk_text:
                        continue
                    first_sentence = chunk_text.split(".")[0].strip()[:40]
                    fallback_clauses.append(Clause(
                        id=f"clause_{f_counter}",
                        clause_number=f"Phần {f_counter}",
                        title=first_sentence if len(first_sentence) > 5 else f"Điều khoản {f_counter}",
                        content=chunk_text,
                        page_number=page["page_number"],
                        bounding_boxes=[BoundingBox(
                            page=b["page"], x0=b["x0"], y0=b["y0"], x1=b["x1"], y1=b["y1"]
                        ) for b in chunk_blocks]
                    ))
                    f_counter += 1
            if fallback_clauses:
                clauses = fallback_clauses

        return clauses
