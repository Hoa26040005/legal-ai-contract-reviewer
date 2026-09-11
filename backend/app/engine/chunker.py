import re
from typing import List, Dict, Any
from app.models.schemas import Clause, BoundingBox

class VietnameseLegalChunker:
    """
    Bộ bẻ nhỏ hợp đồng ngữ nghĩa (Semantic Chunking) chuyên biệt cho thể thức văn bản
    pháp lý & hợp đồng tại Việt Nam.
    Tách chính xác theo Điều, Khoản và liên kết tọa độ Bounding Box.
    """
    
    # Regex nhận diện đầu đề Điều khoản: ví dụ: 'Điều 1.', 'Điều 1:', 'Điều 1 - Quy định chung', 'ĐIỀU 1: PHẠM VI'
    ARTICLE_PATTERN = re.compile(
        r'^(?:ĐIỀU|Điều)\s+([0-9A-Za-z]+)\s*[:.\-–]?\s*(.*)$',
        re.IGNORECASE | re.MULTILINE
    )
    
    # Regex nhận diện Khoản: ví dụ '1.1.', 'Khoản 1:', '1.'
    SUB_CLAUSE_PATTERN = re.compile(
        r'^(?:(?:Khoản\s+)?(\d+\.\d+|\d+)\s*[:.)\-–]\s*)(.*)$',
        re.MULTILINE
    )

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
                match = cls.ARTICLE_PATTERN.match(first_line)
                
                if match:
                    # Gặp một Điều mới -> Đóng gói Điều trước đó nếu có
                    if current_article_num or current_content_blocks:
                        clause_id = f"clause_{clause_counter}"
                        full_content = "\n".join(current_content_blocks)
                        
                        clauses.append(Clause(
                            id=clause_id,
                            clause_number=f"Điều {current_article_num}" if current_article_num else f"Mục {clause_counter}",
                            title=current_article_title or f"Điều khoản {clause_counter}",
                            content=full_content,
                            page_number=current_page,
                            bounding_boxes=current_boxes
                        ))
                        clause_counter += 1
                    
                    # Khởi tạo Điều mới
                    current_article_num = match.group(1).strip()
                    title_part = match.group(2).strip()
                    current_article_title = title_part if title_part else f"Nội dung Điều {current_article_num}"
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
                clause_number=f"Điều {current_article_num}" if current_article_num else f"Mục {clause_counter}",
                title=current_article_title or f"Điều khoản {clause_counter}",
                content=full_content,
                page_number=current_page,
                bounding_boxes=current_boxes
            ))
            
        # Fallback nếu không bắt được regex Điều X (ví dụ hợp đồng không theo format chuẩn)
        if not clauses:
            for idx, page in enumerate(pages_data):
                clauses.append(Clause(
                    id=f"clause_{idx+1}",
                    clause_number=f"Trang {page['page_number']}",
                    title=f"Nội dung phần {idx+1}",
                    content=page["full_text"],
                    page_number=page["page_number"],
                    bounding_boxes=[BoundingBox(
                        page=b["page"], x0=b["x0"], y0=b["y0"], x1=b["x1"], y1=b["y1"]
                    ) for b in page["blocks"]]
                ))
                
        return clauses
