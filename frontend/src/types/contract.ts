export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface BoundingBox {
  page: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Clause {
  id: string;
  clause_number: string;
  title: string;
  content: string;
  page_number: number;
  bounding_boxes: BoundingBox[];
}

export interface RiskItem {
  id: string;
  clause_id: string;
  clause_number: string;
  risk_level: RiskLevel;
  risk_title: string;
  risk_category: string;
  description: string;
  legal_basis?: string;
  original_text: string;
  suggested_text: string;
  rationale: string;
  bounding_boxes: BoundingBox[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'Contract' | 'Clause' | 'Law' | 'Risk' | 'Party';
  properties?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  properties?: Record<string, any>;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ContractAnalysisReport {
  contract_id: string;
  contract_title: string;
  contract_type: string;
  overall_score: number;
  summary: string;
  total_clauses: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  clauses: Clause[];
  risks: RiskItem[];
  graph_data?: KnowledgeGraphData;
}

export interface ContractSummaryItem {
  id: string;
  title: string;
  contract_type: string;
  page_count: number;
  created_at: string;
  score: number;
  status: 'ready' | 'analyzing' | 'error';
}

export type DiffStatus = 'MODIFIED' | 'ADDED' | 'REMOVED' | 'UNCHANGED';

export interface ClauseDiffItem {
  clause_number: string;
  title: string;
  status: DiffStatus;
  text_v1?: string | null;
  text_v2?: string | null;
  resolved_risk?: string | null;
  legal_impact?: string | null;
}

export interface ContractComparisonReport {
  title_v1: string;
  title_v2: string;
  score_v1: number;
  score_v2: number;
  score_delta: number;
  summary: string;
  resolved_risks_count: number;
  diff_items: ClauseDiffItem[];
}

export interface PrecedentCase {
  case_code: string;
  case_title: string;
  court: string;
  adopted_date: string;
  summary_situation: string;
  ruling: string;
  applicable_topic: string;
}

export interface ClauseLitigationRisk {
  clause_number: string;
  clause_title: string;
  loss_probability: number;
  invalidation_risk: string;
  relevant_precedent?: PrecedentCase | null;
  dispute_scenario: string;
  court_ruling_forecast: string;
  estimated_court_fee: string;
  recommendation: string;
}

export interface LitigationPredictionReport {
  contract_id: string;
  contract_title: string;
  overall_litigation_risk: number;
  risk_assessment: string;
  summary: string;
  total_disputed_clauses: number;
  high_risk_clauses_count: number;
  estimated_total_loss: string;
  clauses_risks: ClauseLitigationRisk[];
}

export interface ArchiveContractItem {
  contract_id: string;
  title: string;
  contract_type: string;
  category: string;
  overall_score: number;
  status_label: 'AN TOÀN' | 'ĐANG ĐÀM PHÁN' | 'CẦN SỬA ĐỔI';
  created_at: string;
  page_count: number;
  total_clauses: number;
  critical_count: number;
  file_size_kb: number;
  original_filename: string;
  has_docx: boolean;
  has_annex: boolean;
}

export interface LegalRuleItem {
  code: string;
  law: string;
  topic: string;
  rule: string;
  category: string;
  keywords: string[];
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  statute_source?: string;
  created_at?: string;
}

export interface LegalRuleCreate {
  code: string;
  law: string;
  topic: string;
  rule: string;
  category: string;
  keywords: string[];
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  statute_source?: string;
}

export interface LegalRuleUpdate {
  law?: string;
  topic?: string;
  rule?: string;
  category?: string;
  keywords?: string[];
  risk_level?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface LegalLibraryStats {
  total_rules: number;
  total_categories: number;
  total_statutes: number;
  categories: { category: string; count: number }[];
  rag_active: boolean;
}

export interface StatuteUploadResponse {
  statute_title: string;
  filename: string;
  articles_extracted: number;
  category: string;
  message: string;
}

export interface NationalStatuteItem {
  id: string;
  title: string;
  official_number: string;
  effective_date: string;
  category: string;
  description: string;
  articles_count: number;
  is_ingested: boolean;
}

export interface AutoIngestRequest {
  statute_id?: string;
  search_query?: string;
  category?: string;
}

export interface AutoIngestResponse {
  statute_title: string;
  articles_ingested: number;
  category: string;
  message: string;
  ingested_codes: string[];
}
