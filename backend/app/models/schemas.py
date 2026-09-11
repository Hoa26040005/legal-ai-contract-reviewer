from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RiskLevel(str, Enum):
    CRITICAL = "CRITICAL" # Nghiêm trọng / Vi phạm luật
    HIGH = "HIGH"         # Rủi ro cao / Điều khoản bất đối xứng nghiêm trọng
    MEDIUM = "MEDIUM"     # Rủi ro trung bình / Cần bổ sung làm rõ
    LOW = "LOW"           # Rủi ro thấp / An toàn

class BoundingBox(BaseModel):
    page: int = Field(..., description="Số trang (1-indexed)")
    x0: float = Field(..., description="Tọa độ x bắt đầu (tỉ lệ 0.0 - 1.0 hoặc pt)")
    y0: float = Field(..., description="Tọa độ y bắt đầu")
    x1: float = Field(..., description="Tọa độ x kết thúc")
    y1: float = Field(..., description="Tọa độ y kết thúc")

class Clause(BaseModel):
    id: str
    clause_number: str = Field(..., description="Ví dụ: Điều 3, Khoản 3.1")
    title: str = Field(..., description="Tên điều khoản")
    content: str = Field(..., description="Nội dung chi tiết của điều khoản")
    page_number: int = 1
    bounding_boxes: List[BoundingBox] = []

class RiskItem(BaseModel):
    id: str
    clause_id: str
    clause_number: str
    risk_level: RiskLevel
    risk_title: str
    risk_category: str # 'Phạt vi phạm', 'Bồi thường', 'Thanh toán', 'Chấm dứt HĐ', 'Bảo mật', 'Tranh chấp'
    description: str = Field(..., description="Phân tích chi tiết rủi ro và sự bất lợi")
    legal_basis: Optional[str] = Field(None, description="Căn cứ pháp luật Việt Nam viện dẫn (Ví dụ: Điều 301 Luật Thương mại 2005)")
    original_text: str
    suggested_text: str = Field(..., description="Đề xuất sửa đổi điều khoản (Redline revision)")
    rationale: str = Field(..., description="Lý do đề xuất sửa đổi")
    bounding_boxes: List[BoundingBox] = []

class GraphNode(BaseModel):
    id: str
    label: str
    type: str # 'Contract', 'Clause', 'Law', 'Risk', 'Party'
    properties: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str # 'HAS_CLAUSE', 'VIOLATES_LAW', 'REFERENCES', 'PENALTY_FOR'
    properties: Dict[str, Any] = {}

class KnowledgeGraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ContractAnalysisReport(BaseModel):
    contract_id: str
    contract_title: str
    contract_type: str # 'Hợp đồng Mua bán', 'NDA', 'Hợp đồng Dịch vụ', 'Hợp đồng Thuê'
    overall_score: int = Field(..., ge=0, le=100, description="Điểm an toàn hợp đồng (0 = Nguy hiểm, 100 = Rất an toàn)")
    summary: str
    total_clauses: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    clauses: List[Clause]
    risks: List[RiskItem]
    graph_data: Optional[KnowledgeGraphData] = None

class ContractSummaryItem(BaseModel):
    id: str
    title: str
    contract_type: str
    page_count: int
    created_at: str
    score: int
    status: str # 'ready', 'analyzing', 'error'
