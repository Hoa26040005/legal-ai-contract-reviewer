import uuid
import io
from typing import List, Dict
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import (
    ContractSummaryItem, ContractAnalysisReport, KnowledgeGraphData,
    ContractComparisonReport, PrecedentCase, LitigationPredictionReport
)
from app.engine.parser import DocumentParser
from app.engine.chunker import VietnameseLegalChunker
from app.engine.risk_analyzer import LegalRiskAnalyzer
from app.engine.sample_contracts import get_sample_contracts_summary, get_sample_contract_analysis
from app.engine.docx_generator import ContractDocxGenerator
from app.engine.comparator import ContractComparator
from app.engine.annex_generator import ContractAnnexGenerator
from app.engine.precedent_engine import PrecedentLitigationEngine

router = APIRouter(prefix="/contracts", tags=["Contracts"])

# In-memory store for uploaded contracts during runtime
CONTRACTS_DB: Dict[str, ContractAnalysisReport] = {}

SUPPORTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"]

@router.get("/samples", response_model=List[ContractSummaryItem])
async def list_sample_contracts():
    """
    Lấy danh sách các hợp đồng mẫu tiếng Việt có sẵn (HĐ Lao động, Thương mại, CNTT, NDA).
    """
    return get_sample_contracts_summary()

@router.get("/{contract_id}/report", response_model=ContractAnalysisReport)
async def get_contract_report(contract_id: str):
    """
    Lấy chi tiết báo cáo rà soát rủi ro của một hợp đồng (kèm danh sách điều khoản và tọa độ highlight).
    """
    if contract_id.startswith("sample_"):
        return get_sample_contract_analysis(contract_id)
    
    if contract_id in CONTRACTS_DB:
        return CONTRACTS_DB[contract_id]
        
    raise HTTPException(status_code=404, detail="Không tìm thấy hợp đồng được yêu cầu.")

@router.get("/{contract_id}/graph", response_model=KnowledgeGraphData)
async def get_contract_knowledge_graph(contract_id: str):
    """
    Lấy dữ liệu Knowledge Graph (Hợp đồng -> Điều khoản -> Rủi ro -> Căn cứ Luật Việt Nam).
    """
    report = await get_contract_report(contract_id)
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
async def upload_contract_file(file: UploadFile = File(...)):
    """
    Tải lên hợp đồng dạng PDF hoặc Ảnh chụp điện thoại (.jpg, .png, .jpeg, .webp).
    Tự động tiền xử lý khử mờ, OCR, bẻ chunk Điều/Khoản ngữ nghĩa và rà soát luật.
    """
    filename = file.filename or "contract.pdf"
    is_valid = any(filename.lower().endswith(ext) for ext in SUPPORTED_EXTENSIONS)
    
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=f"Hệ thống chỉ hỗ trợ tệp PDF hoặc hình ảnh ({', '.join(SUPPORTED_EXTENSIONS)})"
        )
        
    try:
        content_bytes = await file.read()
        
        # 1. Parse Layout và trích xuất Bounding Boxes (Hỗ trợ cả PDF và Ảnh chụp điện thoại)
        pages_data = DocumentParser.extract_layout_from_bytes(content_bytes, filename=filename)
        
        # 2. Semantic Clause Chunking theo cấu trúc pháp lý Việt Nam
        clauses = VietnameseLegalChunker.chunk_document_layout(pages_data)
        
        # 3. Phân loại loại hợp đồng
        lower_name = filename.lower()
        if any(k in lower_name for k in ["lao động", "labor", "viec", "nhan su"]):
            contract_type = "Hợp đồng Lao động (BLLD 2019)"
        elif any(k in lower_name for k in ["mua ban", "sale", "thuong mai", "commercial"]):
            contract_type = "Hợp đồng Mua bán Hàng hóa"
        elif any(k in lower_name for k in ["nda", "bao mat", "confidential"]):
            contract_type = "Thỏa thuận Bảo mật Thông tin"
        else:
            contract_type = "Hợp đồng Dịch vụ Thương mại"

        contract_id = f"contract_{uuid.uuid4().hex[:8]}"
        title = filename.rsplit(".", 1)[0]
        
        # 4. Phân tích rủi ro chuyên sâu đối chiếu luật Việt Nam
        report = LegalRiskAnalyzer.analyze_contract(
            contract_id=contract_id,
            title=title,
            contract_type=contract_type,
            clauses=clauses
        )
        
        CONTRACTS_DB[contract_id] = report
        return report

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi trong quá trình xử lý tệp: {str(e)}")

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
    bytes_v1 = await file_v1.read()
    bytes_v2 = await file_v2.read()

    pages_v1 = DocumentParser.extract_layout_from_bytes(bytes_v1, filename=file_v1.filename or "v1.pdf")
    pages_v2 = DocumentParser.extract_layout_from_bytes(bytes_v2, filename=file_v2.filename or "v2.pdf")

    clauses_v1 = VietnameseLegalChunker.chunk_document_layout(pages_v1)
    clauses_v2 = VietnameseLegalChunker.chunk_document_layout(pages_v2)

    title_v1 = (file_v1.filename or "Bản V1").rsplit(".", 1)[0]
    title_v2 = (file_v2.filename or "Bản V2").rsplit(".", 1)[0]

    return ContractComparator.compare_contracts(title_v1, clauses_v1, title_v2, clauses_v2)

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


