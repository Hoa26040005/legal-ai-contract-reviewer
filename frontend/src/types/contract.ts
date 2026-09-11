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
