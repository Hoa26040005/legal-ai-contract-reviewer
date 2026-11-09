import json
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.db_models import ContractModel, ClauseModel, RiskModel
from app.models.schemas import (
    ContractAnalysisReport, Clause, RiskItem, RiskLevel,
    BoundingBox, KnowledgeGraphData, ContractSummaryItem
)

class ContractRepository:
    """
    Repository chuẩn ACID để thao tác với cơ sở dữ liệu bền vững (PostgreSQL / SQLite).
    """

    @staticmethod
    def save_report(db: Session, report: ContractAnalysisReport, raw_filename: str = "") -> ContractAnalysisReport:
        # Kiểm tra nếu hợp đồng đã tồn tại -> Xóa bản ghi cũ để cập nhật
        existing = db.query(ContractModel).filter(ContractModel.id == report.contract_id).first()
        if existing:
            db.delete(existing)
            db.flush()

        # 1. Tạo bản ghi Hợp đồng chính
        graph_json = report.graph_data.model_dump_json() if report.graph_data else "{}"
        contract_db = ContractModel(
            id=report.contract_id,
            title=report.contract_title,
            contract_type=report.contract_type,
            overall_score=report.overall_score,
            summary=report.summary,
            total_clauses=report.total_clauses,
            critical_count=report.critical_count,
            high_count=report.high_count,
            medium_count=report.medium_count,
            low_count=report.low_count,
            graph_data_json=graph_json,
            raw_filename=raw_filename
        )
        db.add(contract_db)
        db.flush()

        # 2. Lưu từng Điều khoản (Clauses)
        for clause in report.clauses:
            boxes_json = json.dumps([b.model_dump() for b in clause.bounding_boxes], ensure_ascii=False)
            clause_db = ClauseModel(
                id=clause.id,
                contract_id=report.contract_id,
                clause_number=clause.clause_number,
                title=clause.title,
                content=clause.content,
                page_number=clause.page_number,
                bounding_boxes_json=boxes_json
            )
            db.add(clause_db)

        # 3. Lưu từng Rủi ro (Risks)
        for risk in report.risks:
            risk_boxes_json = json.dumps([b.model_dump() for b in risk.bounding_boxes], ensure_ascii=False)
            risk_db = RiskModel(
                id=risk.id,
                contract_id=report.contract_id,
                clause_id=risk.clause_id,
                clause_number=risk.clause_number,
                risk_level=risk.risk_level.value if isinstance(risk.risk_level, RiskLevel) else str(risk.risk_level),
                risk_title=risk.risk_title,
                risk_category=risk.risk_category,
                description=risk.description,
                legal_basis=risk.legal_basis or "",
                original_text=risk.original_text,
                suggested_text=risk.suggested_text,
                rationale=risk.rationale,
                bounding_boxes_json=risk_boxes_json
            )
            db.add(risk_db)

        db.commit()
        db.refresh(contract_db)
        return report

    @staticmethod
    def get_report(db: Session, contract_id: str) -> Optional[ContractAnalysisReport]:
        contract_db = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
        if not contract_db:
            return None

        # Tải danh sách Điều khoản
        clauses_db = db.query(ClauseModel).filter(ClauseModel.contract_id == contract_id).order_by(ClauseModel.page_number, ClauseModel.clause_number).all()
        clauses = []
        for c in clauses_db:
            boxes_raw = json.loads(c.bounding_boxes_json) if c.bounding_boxes_json else []
            boxes = [BoundingBox(**b) for b in boxes_raw]
            clauses.append(Clause(
                id=c.id,
                clause_number=c.clause_number,
                title=c.title,
                content=c.content,
                page_number=c.page_number,
                bounding_boxes=boxes
            ))

        # Tải danh sách Rủi ro
        risks_db = db.query(RiskModel).filter(RiskModel.contract_id == contract_id).all()
        risks = []
        for r in risks_db:
            r_boxes_raw = json.loads(r.bounding_boxes_json) if r.bounding_boxes_json else []
            r_boxes = [BoundingBox(**b) for b in r_boxes_raw]
            risks.append(RiskItem(
                id=r.id,
                clause_id=r.clause_id,
                clause_number=r.clause_number,
                risk_level=RiskLevel(r.risk_level) if r.risk_level in RiskLevel.__members__ else RiskLevel.HIGH,
                risk_title=r.risk_title,
                risk_category=r.risk_category,
                description=r.description,
                legal_basis=r.legal_basis,
                original_text=r.original_text,
                suggested_text=r.suggested_text,
                rationale=r.rationale,
                bounding_boxes=r_boxes
            ))

        # Tải Graph data
        graph_data = None
        if contract_db.graph_data_json:
            try:
                g_dict = json.loads(contract_db.graph_data_json)
                if g_dict:
                    graph_data = KnowledgeGraphData(**g_dict)
            except Exception:
                pass

        return ContractAnalysisReport(
            contract_id=contract_db.id,
            contract_title=contract_db.title,
            contract_type=contract_db.contract_type,
            overall_score=contract_db.overall_score,
            summary=contract_db.summary,
            total_clauses=contract_db.total_clauses,
            critical_count=contract_db.critical_count,
            high_count=contract_db.high_count,
            medium_count=contract_db.medium_count,
            low_count=contract_db.low_count,
            clauses=clauses,
            risks=risks,
            graph_data=graph_data
        )

    @staticmethod
    def list_contracts(db: Session, limit: int = 50) -> List[ContractSummaryItem]:
        contracts_db = db.query(ContractModel).order_by(ContractModel.created_at.desc()).limit(limit).all()
        results = []
        for c in contracts_db:
            max_page = db.query(ClauseModel.page_number).filter(ClauseModel.contract_id == c.id).order_by(ClauseModel.page_number.desc()).first()
            page_count = max_page[0] if max_page else 1
            results.append(ContractSummaryItem(
                id=c.id,
                title=c.title,
                contract_type=c.contract_type,
                page_count=page_count,
                created_at=c.created_at.strftime("%Y-%m-%d"),
                score=c.overall_score,
                status="ready"
            ))
        return results

    @staticmethod
    def delete_contract(db: Session, contract_id: str) -> bool:
        item = db.query(ContractModel).filter(ContractModel.id == contract_id).first()
        if item:
            db.delete(item)
            db.commit()
            return True
        return False
