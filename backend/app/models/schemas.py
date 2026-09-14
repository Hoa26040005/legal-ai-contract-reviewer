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

class DiffStatus(str, Enum):
    MODIFIED = "MODIFIED"   # Điều khoản đã được sửa đổi
    ADDED = "ADDED"         # Điều khoản mới được bổ sung
    REMOVED = "REMOVED"     # Điều khoản đã bị hủy bỏ
    UNCHANGED = "UNCHANGED" # Giữ nguyên

class ClauseDiffItem(BaseModel):
    clause_number: str
    title: str
    status: DiffStatus
    text_v1: Optional[str] = None
    text_v2: Optional[str] = None
    resolved_risk: Optional[str] = None
    legal_impact: Optional[str] = None

class ContractComparisonReport(BaseModel):
    title_v1: str
    title_v2: str
    score_v1: int
    score_v2: int
    score_delta: int
    summary: str
    resolved_risks_count: int
    diff_items: List[ClauseDiffItem]

class PrecedentCase(BaseModel):
    case_code: str          # Ví dụ: "Án lệ số 09/2017/AL"
    case_title: str         # Tiêu đề án lệ
    court: str              # Hội đồng Thẩm phán TANDTC
    adopted_date: str       # Ngày thông qua
    summary_situation: str  # Khái quát tình huống án lệ
    ruling: str             # Giải pháp pháp lý / Phán quyết của Tòa án
    applicable_topic: str   # Lĩnh vực áp dụng (Lãi suất, Kỷ luật, Bồi thường...)

class ClauseLitigationRisk(BaseModel):
    clause_number: str
    clause_title: str
    loss_probability: int   # Tỷ lệ thua kiện / bị tuyên vô hiệu (0-100%)
    invalidation_risk: str  # "Toàn bộ" | "Một phần" | "Không"
    relevant_precedent: Optional[PrecedentCase] = None
    dispute_scenario: str   # Tình huống tranh chấp giả định nếu ra Tòa
    court_ruling_forecast: str # Dự báo phán quyết của Thẩm phán
    estimated_court_fee: str   # Ước tính án phí sơ thẩm (Nghị quyết 326/2016)
    recommendation: str     # Lời khuyên chiến lược tranh tụng

class LitigationPredictionReport(BaseModel):
    contract_id: str
    contract_title: str
    overall_litigation_risk: int # Điểm rủi ro tố tụng tổng thể (0 = Rất an toàn, 100 = Chắc chắn thua kiện)
    risk_assessment: str         # "CỰC KỲ NGUY HIỂM" | "RỦI RO CAO" | "TRUNG BÌNH" | "AN TOÀN"
    summary: str
    total_disputed_clauses: int
    high_risk_clauses_count: int
    estimated_total_loss: str
    clauses_risks: List[ClauseLitigationRisk]

class ArchiveContractItem(BaseModel):
    contract_id: str
    title: str
    contract_type: str
    category: str        # 'Lao động & Nhân sự' | 'Mua bán & Thương mại' | 'Dịch vụ CNTT' | 'Bảo mật NDA'
    overall_score: int
    status_label: str    # 'AN TOÀN' | 'ĐANG ĐÀM PHÁN' | 'CẦN SỬA ĐỔI'
    created_at: str
    page_count: int
    total_clauses: int
    critical_count: int
    file_size_kb: float
    original_filename: str
    has_docx: bool = True
    has_annex: bool = True



