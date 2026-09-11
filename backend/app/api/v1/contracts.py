import uuid
from typing import List, Dict
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import (
    ContractSummaryItem, ContractAnalysisReport, KnowledgeGraphData
)
from app.engine.parser import DocumentParser
from app.engine.chunker import VietnameseLegalChunker
from app.engine.risk_analyzer import LegalRiskAnalyzer
from app.engine.sample_contracts import get_sample_contracts_summary, get_sample_contract_analysis

router = APIRouter(prefix="/contracts", tags=["Contracts"])

# In-memory store for uploaded contracts during runtime
CONTRACTS_DB: Dict[str, ContractAnalysisReport] = {}

@router.get("/samples", response_model=List[ContractSummaryItem])
async def list_sample_contracts():
    """
    Lấy danh sách các hợp đồng mẫu tiếng Việt có sẵn.
    """
    return get_sample_contracts_summary()

@router.get("/{contract_id}/report", response_model=ContractAnalysisReport)
async def get_contract_report(contract_id: str):
    """
    Lấy chi tiết báo cáo rà soát rủi ro của một hợp đồng (kèm danh sách điều khoản và tọa độ highlight).
    """
    # 1. Kiểm tra xem có phải hợp đồng mẫu
    if contract_id.startswith("sample_"):
        return get_sample_contract_analysis(contract_id)
    
    # 2. Kiểm tra trong kho hợp đồng đã upload
    if contract_id in CONTRACTS_DB:
        return CONTRACTS_DB[contract_id]
        
    raise HTTPException(status_code=404, detail="Không tìm thấy hợp đồng được yêu cầu.")

@router.get("/{contract_id}/graph", response_model=KnowledgeGraphData)
async def get_contract_knowledge_graph(contract_id: str):
    """
    Lấy dữ liệu Knowledge Graph (Đồ thị tri thức: Hợp đồng -> Điều khoản -> Rủi ro -> Căn cứ Luật).
    """
    report = await get_contract_report(contract_id)
    if report.graph_data:
        return report.graph_data
    raise HTTPException(status_code=404, detail="Hợp đồng chưa có dữ liệu đồ thị tri thức.")

@router.post("/upload", response_model=ContractAnalysisReport)
async def upload_contract_pdf(file: UploadFile = File(...)):
    """
    Tải lên file PDF hợp đồng, tự động bẻ chunk ngữ nghĩa điều khoản pháp lý và chạy rà soát rủi ro AI.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Hệ thống chỉ hỗ trợ định dạng tệp PDF.")
        
    try:
        content_bytes = await file.read()
        
        # 1. Parse Layout và trích xuất Bounding Boxes bằng PyMuPDF
        pages_data = DocumentParser.extract_layout_from_bytes(content_bytes)
        
        # 2. Semantic Clause Chunking theo cấu trúc pháp lý Việt Nam
        clauses = VietnameseLegalChunker.chunk_document_layout(pages_data)
        
        # 3. Phân tích rủi ro & Đối chiếu Luật Việt Nam
        contract_id = f"contract_{uuid.uuid4().hex[:8]}"
        title = file.filename.replace(".pdf", "")
        
        report = LegalRiskAnalyzer.analyze_contract(
            contract_id=contract_id,
            title=title,
            contract_type="Hợp đồng Tải lên",
            clauses=clauses
        )
        
        # Lưu vào bộ nhớ runtime
        CONTRACTS_DB[contract_id] = report
        return report

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi trong quá trình xử lý tệp PDF: {str(e)}")
