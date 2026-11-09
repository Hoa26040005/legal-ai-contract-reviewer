import uuid
import io
from typing import List, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import (
    ContractSummaryItem, ContractAnalysisReport, KnowledgeGraphData,
    ContractComparisonReport, PrecedentCase, LitigationPredictionReport,
    ArchiveContractItem
)
from app.engine.parser import DocumentParser
from app.engine.chunker import VietnameseLegalChunker
from app.engine.risk_analyzer import LegalRiskAnalyzer
from app.engine.sample_contracts import get_sample_contracts_summary, get_sample_contract_analysis
from app.engine.docx_generator import ContractDocxGenerator
from app.engine.comparator import ContractComparator
from app.engine.annex_generator import ContractAnnexGenerator
from app.engine.precedent_engine import PrecedentLitigationEngine
from app.engine.storage_manager import ContractStorageManager

import re
from sqlalchemy.orm import Session
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from app.core.database import get_db
from app.core.cache_service import CacheService
from app.engine.repository import ContractRepository
from app.engine.neo4j_service import Neo4jGraphService

router = APIRouter(prefix="/contracts", tags=["Contracts"])

MAX_UPLOAD_SIZE = 25 * 1024 * 1024  # 25 MB

def sanitize_filename(name: str) -> str:
    """Loại bỏ ký tự lạ và ngăn chặn tấn công Path Traversal"""
    clean = re.sub(r'[\x00-\x1f\\/:*?"<>|]', '_', name)
    clean = clean.replace('..', '_')
    return clean.strip() or "contract_upload.pdf"

@router.get("/graph/cypher-presets")
async def get_cypher_presets():
    """Lấy danh mục các câu truy vấn Cypher đa bậc chuyên sâu nạp sẵn cho Multi-hop Graph-RAG"""
    return Neo4jGraphService.get_preset_queries()

@router.post("/graph/query")
async def execute_cypher_query(payload: Dict[str, Any]):
    """Thực thi câu truy vấn Cypher đa bậc (Read-Only) trên Đồ thị Tri thức Neo4j"""
    query = payload.get("query", "")
    if not isinstance(query, str) or not query.strip():
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp câu truy vấn Cypher.")
    try:
        return Neo4jGraphService.execute_multi_hop_query(query)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("/samples", response_model=List[ContractSummaryItem])
async def list_sample_contracts(db: Session = Depends(get_db)):
    """
    Lấy danh sách các hợp đồng mẫu tiếng Việt có sẵn và các hợp đồng đã lưu trong Database.
    """
    saved_contracts = ContractRepository.list_contracts(db, limit=50)
    saved_ids = {c.id for c in saved_contracts}
    samples = get_sample_contracts_summary()
    combined = saved_contracts + [s for s in samples if s.id not in saved_ids]
    return combined

@router.get("/{contract_id}/report", response_model=ContractAnalysisReport)
async def get_contract_report(contract_id: str, db: Session = Depends(get_db)):
    """
    Lấy chi tiết báo cáo rà soát rủi ro (kết hợp Cache Redis -> Sample -> Database chuẩn ACID).
    """
    # 1. Kiểm tra Cache tầng 1 (Redis / Fast Memory)
    cached = CacheService.get(f"report:{contract_id}")
    if cached:
        return ContractAnalysisReport(**cached)

    # 2. Kiểm tra Sample Contracts có sẵn
    if contract_id.startswith("sample_"):
        report = get_sample_contract_analysis(contract_id)
        CacheService.set(f"report:{contract_id}", report.model_dump(), ttl=86400)
        return report

    # 3. Truy vấn Cơ sở Dữ liệu bền vững (PostgreSQL / SQLite)
    report = ContractRepository.get_report(db, contract_id)
    if report:
        CacheService.set(f"report:{contract_id}", report.model_dump(), ttl=86400)
        return report
        
    raise HTTPException(status_code=404, detail="Không tìm thấy hợp đồng được yêu cầu trong cơ sở dữ liệu.")

@router.get("/{contract_id}/graph", response_model=KnowledgeGraphData)
async def get_contract_knowledge_graph(contract_id: str, db: Session = Depends(get_db)):
    """
    Lấy dữ liệu Knowledge Graph (Hợp đồng -> Điều khoản -> Rủi ro -> Căn cứ Luật Việt Nam).
    """
    report = await get_contract_report(contract_id, db=db)
    if report.graph_data:
        return report.graph_data
    raise HTTPException(status_code=404, detail="Hợp đồng chưa có dữ liệu đồ thị tri thức.")

@router.get("/{contract_id}/export/docx")
async def export_contract_redline_docx(contract_id: str):
    """
    Xuất file Word (.docx) chứa Track Changes Redline (vạch gạch đỏ xóa bỏ, chữ xanh sửa đổi và căn cứ luật).
    """
    report = await get_contract_report(contract_id)
    docx_stream = ContractDocxGenerator.generate_redline_docx(report)
    
    clean_title = "".join(c for c in report.contract_title if c.isalnum() or c in (" ", "_", "-")).rstrip()[:30]
    filename = f"LegalAI_Redline_{clean_title}.docx"

    return StreamingResponse(
        docx_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/{contract_id}/annex/preview")
async def preview_contract_annex(contract_id: str):
    """
    Xem trước dữ liệu cấu trúc Phụ lục sửa đổi bổ sung hợp đồng (Điều 403 BLDS 2015).
    """
    report = await get_contract_report(contract_id)
    return ContractAnnexGenerator.generate_annex_data(report)

@router.get("/{contract_id}/export/annex")
async def export_contract_annex_docx(
    contract_id: str,
    party_a: str = "BÊN GIAO VIỆC / BÊN A",
    party_b: str = "BÊN THỰC HIỆN / BÊN B",
    annex_no: str = "01",
    contract_no: str = "HĐ-2026/01"
):
    """
    Xuất file Word (.docx) PHỤ LỤC HỢP ĐỒNG SỬA ĐỔI, BỔ SUNG chuẩn văn bản hành chính Việt Nam (NĐ 30/2020/NĐ-CP).
    Có sẵn khung ký tên đóng dấu 2 bên để in ra ký ngay.
    """
    report = await get_contract_report(contract_id)
    docx_stream = ContractAnnexGenerator.generate_annex_docx(
        report=report,
        party_a_name=party_a,
        party_b_name=party_b,
        annex_number=annex_no,
        contract_number=contract_no
    )

    clean_title = "".join(c for c in report.contract_title if c.isalnum() or c in (" ", "_", "-")).rstrip()[:30]
    filename = f"LegalAI_PhuLucSuaDoi_{clean_title}.docx"

    return StreamingResponse(
        docx_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.post("/upload", response_model=ContractAnalysisReport)
async def upload_contract_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Tải lên hợp đồng dạng PDF hoặc Ảnh chụp điện thoại (.jpg, .png, .jpeg, .webp).
    Tự động tiền xử lý khử mờ, OCR, bẻ chunk Điều/Khoản ngữ nghĩa và rà soát luật.
    Lưu trữ bền vững chuẩn ACID vào PostgreSQL/SQLite, đệm Redis và đồng bộ Neo4j.
    """
    raw_filename = file.filename or "contract.pdf"
    filename = sanitize_filename(raw_filename)
    is_valid = any(filename.lower().endswith(ext) for ext in [".pdf", ".png", ".jpg", ".jpeg", ".webp"])
    
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Hệ thống chỉ hỗ trợ tệp PDF hoặc hình ảnh (.pdf, .png, .jpg, .jpeg, .webp)"
        )
        
    try:
        content_bytes = await file.read()
        
        # Kiểm tra giới hạn dung lượng tệp tải lên (Security Guard chống DoS RAM)
        if len(content_bytes) > MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Dung lượng tệp vượt quá giới hạn cho phép ({MAX_UPLOAD_SIZE // (1024 * 1024)}MB)."
            )
            
        if len(content_bytes) == 0:
            raise HTTPException(status_code=400, detail="Tệp tải lên rỗng không có nội dung.")
        
        # 1. Parse Layout và trích xuất Bounding Boxes (Hỗ trợ cả PDF và Ảnh chụp điện thoại)
        pages_data = DocumentParser.extract_layout_from_bytes(content_bytes, filename=filename)
        
        # 2. Semantic Clause Chunking theo cấu trúc pháp lý Việt Nam
        clauses = VietnameseLegalChunker.chunk_document_layout(pages_data)
        
        # 3. Phân loại loại hợp đồng tự động dựa trên tên tệp và nội dung điều khoản
        contract_type = LegalRiskAnalyzer.detect_contract_type(filename, clauses)

        contract_id = f"contract_{uuid.uuid4().hex[:8]}"
        title = filename.rsplit(".", 1)[0]
        
        # 4. Phân tích rủi ro chuyên sâu đối chiếu luật Việt Nam
        report = LegalRiskAnalyzer.analyze_contract(
            contract_id=contract_id,
            title=title,
            contract_type=contract_type,
            clauses=clauses
        )
        
        # 5. Lưu trữ Bền vững vào Cơ sở Dữ liệu chuẩn ACID (PostgreSQL / SQLite)
        ContractRepository.save_report(db, report, raw_filename=filename)

        # 6. Đệm dữ liệu vào Cache (Redis / High-Speed Cache)
        CacheService.set(f"report:{contract_id}", report.model_dump(), ttl=86400)

        # 7. Đồng bộ đồ thị tri thức đa bậc vào Neo4j Bolt Server
        Neo4jGraphService.sync_contract_report(report)

        # Lưu bản sao raw file vào archive
        ContractStorageManager.save_to_archive(report, filename, content_bytes)
        return report

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception:
        raise HTTPException(status_code=500, detail="Không thể xử lý tệp tải lên. Vui lòng kiểm tra lại định dạng tệp.")

@router.get("/compare/sample", response_model=ContractComparisonReport)
async def get_sample_contract_comparison():
    """
    Lấy dữ liệu so sánh mẫu giữa 2 phiên bản hợp đồng (V1 dự thảo rủi ro cao vs V2 sau đàm phán).
    """
    return ContractComparator.get_sample_comparison()

@router.post("/compare", response_model=ContractComparisonReport)
async def compare_two_contracts(
    file_v1: UploadFile = File(...),
    file_v2: UploadFile = File(...)
):
    """
    So sánh đối soát trực tiếp giữa 2 file hợp đồng (V1 và V2).
    """
    allowed_exts = (".pdf", ".png", ".jpg", ".jpeg", ".webp")
    name_v1 = sanitize_filename(file_v1.filename or "v1.pdf")
    name_v2 = sanitize_filename(file_v2.filename or "v2.pdf")

    if not name_v1.lower().endswith(allowed_exts) or not name_v2.lower().endswith(allowed_exts):
        raise HTTPException(
            status_code=400,
            detail="Hệ thống chỉ hỗ trợ so sánh tệp PDF hoặc hình ảnh (.pdf, .png, .jpg, .jpeg, .webp)."
        )

    bytes_v1 = await file_v1.read()
    bytes_v2 = await file_v2.read()

    if len(bytes_v1) > MAX_UPLOAD_SIZE or len(bytes_v2) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Dung lượng tệp vượt quá giới hạn cho phép ({MAX_UPLOAD_SIZE // (1024 * 1024)}MB)."
        )

    if len(bytes_v1) == 0 or len(bytes_v2) == 0:
        raise HTTPException(status_code=400, detail="Tệp tải lên để so sánh không được rỗng.")

    try:
        pages_v1 = DocumentParser.extract_layout_from_bytes(bytes_v1, filename=name_v1)
        pages_v2 = DocumentParser.extract_layout_from_bytes(bytes_v2, filename=name_v2)

        clauses_v1 = VietnameseLegalChunker.chunk_document_layout(pages_v1)
        clauses_v2 = VietnameseLegalChunker.chunk_document_layout(pages_v2)

        title_v1 = name_v1.rsplit(".", 1)[0]
        title_v2 = name_v2.rsplit(".", 1)[0]

        return ContractComparator.compare_contracts(title_v1, clauses_v1, title_v2, clauses_v2)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception:
        raise HTTPException(status_code=500, detail="Không thể đối chiếu hai tệp hợp đồng đã tải lên.")

@router.get("/precedents/library", response_model=List[PrecedentCase])
async def list_court_precedents():
    """
    Tra cứu thư viện Án lệ chính thức của Hội đồng Thẩm phán TANDTC (Nghị quyết 04/2019/NQ-HĐTP).
    """
    return PrecedentLitigationEngine.get_precedents_library()

@router.get("/{contract_id}/litigation-prediction", response_model=LitigationPredictionReport)
async def predict_contract_litigation_risk(contract_id: str):
    """
    Dự đoán tỷ lệ thua kiện / tuyên vô hiệu điều khoản và đối chiếu Án lệ TANDTC cho hợp đồng.
    """
    report = await get_contract_report(contract_id)
    return PrecedentLitigationEngine.predict_contract_litigation_risk(report)

@router.get("/archive/list", response_model=List[ArchiveContractItem])
async def list_archived_contracts(category: str = "Tất cả", db: Session = Depends(get_db)):
    """
    Lấy danh sách toàn bộ tài liệu và hồ sơ hợp đồng trong Tủ Hồ Sơ (kết hợp Database bền vững).
    """
    return ContractStorageManager.get_archive_list(category=category, db=db)

@router.delete("/archive/{contract_id}")
async def delete_archived_contract(contract_id: str, db: Session = Depends(get_db)):
    """
    Xóa tài liệu khỏi Tủ Hồ Sơ và Cơ sở dữ liệu bền vững.
    """
    deleted_db = ContractRepository.delete_contract(db, contract_id)
    CacheService.delete(f"report:{contract_id}")
    deleted_arch = ContractStorageManager.delete_from_archive(contract_id)
    if not deleted_db and not deleted_arch:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy hồ sơ hợp đồng '{contract_id}' trong kho lưu trữ.")
    return {"message": "Đã xóa hồ sơ thành công", "contract_id": contract_id}



