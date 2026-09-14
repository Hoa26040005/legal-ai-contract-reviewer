from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from typing import List, Optional
from app.models.schemas import (
    LegalRuleItem, LegalRuleCreate, LegalRuleUpdate,
    LegalLibraryStats, StatuteUploadResponse
)
from app.engine.legal_library_manager import LegalLibraryManager

router = APIRouter(prefix="/laws", tags=["Legal Library & Statutes"])

@router.get("", response_model=List[LegalRuleItem])
async def get_legal_rules(
    category: Optional[str] = Query(None, description="Lọc theo lĩnh vực luật"),
    query: Optional[str] = Query(None, description="Từ khóa tìm kiếm")
):
    """
    Lấy danh sách điều luật trong thư viện tri thức, hỗ trợ tìm kiếm và lọc danh mục.
    """
    return LegalLibraryManager.get_all_laws(category=category, query=query)

@router.get("/stats", response_model=LegalLibraryStats)
async def get_library_stats():
    """
    Thống kê tổng quan về thư viện luật (tổng số điều luật, số lĩnh vực, số văn bản toàn văn đã nạp).
    """
    return LegalLibraryManager.get_stats()

@router.get("/{code}", response_model=LegalRuleItem)
async def get_rule_detail(code: str):
    """
    Chi tiết một điều luật theo mã code.
    """
    rule = LegalLibraryManager.get_rule_by_code(code)
    if not rule:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy điều luật với mã '{code}'")
    return rule

@router.post("", response_model=LegalRuleItem, status_code=201)
async def create_legal_rule(rule_in: LegalRuleCreate):
    """
    Thêm điều luật mới vào thư viện tri thức.
    """
    try:
        return LegalLibraryManager.add_law(rule_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu điều luật: {str(e)}")

@router.put("/{code}", response_model=LegalRuleItem)
async def update_legal_rule(code: str, updates: LegalRuleUpdate):
    """
    Cập nhật điều luật hiện có.
    """
    updated = LegalLibraryManager.update_law(code, updates)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy điều luật với mã '{code}'")
    return updated

@router.delete("/{code}")
async def delete_legal_rule(code: str):
    """
    Xóa điều luật khỏi thư viện.
    """
    success = LegalLibraryManager.delete_law(code)
    if not success:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy điều luật với mã '{code}'")
    return {"message": f"Đã xóa thành công điều luật '{code}' khỏi thư viện", "deleted_code": code}

@router.post("/upload-statute", response_model=StatuteUploadResponse)
async def upload_statute_document(
    file: UploadFile = File(...),
    statute_title: str = Form(..., description="Tên văn bản luật (ví dụ: Luật Đất đai 2024, Nghị định 13/2023...)"),
    category: str = Form("Đất đai & BĐS", description="Lĩnh vực của văn bản luật")
):
    """
    Nạp tệp văn bản quy phạm pháp luật toàn văn (PDF/DOCX/TXT),
    tự động bóc tách từng Điều khoản và nạp vào thư viện tri thức phục vụ soi hợp đồng.
    """
    content_bytes = await file.read()
    filename = file.filename or "statute_doc.txt"

    # Giải mã văn bản
    text = ""
    if filename.lower().endswith(".txt"):
        try:
            text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = content_bytes.decode("latin-1", errors="ignore")
    elif filename.lower().endswith(".docx"):
        try:
            import io
            import docx
            doc = docx.Document(io.BytesIO(content_bytes))
            text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        except Exception:
            text = content_bytes.decode("utf-8", errors="ignore")
    elif filename.lower().endswith(".pdf"):
        try:
            import io
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            text = "\n".join([page.extract_text() or "" for page in reader.pages])
        except Exception:
            text = content_bytes.decode("utf-8", errors="ignore")
    else:
        text = content_bytes.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Không thể trích xuất nội dung văn bản từ tệp đã tải lên.")

    response = LegalLibraryManager.ingest_statute_text(
        filename=filename,
        text=text,
        statute_title=statute_title,
        category=category
    )

    return response
