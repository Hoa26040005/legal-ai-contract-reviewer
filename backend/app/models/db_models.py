import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class ContractModel(Base):
    __tablename__ = "contracts"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    contract_type = Column(String(100), nullable=False)
    overall_score = Column(Integer, default=100)
    summary = Column(Text, default="")
    total_clauses = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    graph_data_json = Column(Text, default="{}")
    raw_filename = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    clauses = relationship("ClauseModel", back_populates="contract", cascade="all, delete-orphan")
    risks = relationship("RiskModel", back_populates="contract", cascade="all, delete-orphan")

class ClauseModel(Base):
    __tablename__ = "clauses"

    id = Column(String(64), primary_key=True, index=True)
    contract_id = Column(String(64), ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, index=True)
    clause_number = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)
    bounding_boxes_json = Column(Text, default="[]")

    contract = relationship("ContractModel", back_populates="clauses")

class RiskModel(Base):
    __tablename__ = "risks"

    id = Column(String(128), primary_key=True, index=True)
    contract_id = Column(String(64), ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, index=True)
    clause_id = Column(String(64), nullable=False, index=True)
    clause_number = Column(String(50), nullable=False)
    risk_level = Column(String(20), nullable=False, index=True)
    risk_title = Column(String(255), nullable=False)
    risk_category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    legal_basis = Column(String(255), default="")
    original_text = Column(Text, default="")
    suggested_text = Column(Text, default="")
    rationale = Column(Text, default="")
    bounding_boxes_json = Column(Text, default="[]")

    contract = relationship("ContractModel", back_populates="risks")

Index("idx_contract_created_score", ContractModel.created_at.desc(), ContractModel.overall_score)
Index("idx_risk_level_category", RiskModel.risk_level, RiskModel.risk_category)
