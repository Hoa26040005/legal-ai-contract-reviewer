'use client';

import React, { useState } from 'react';
import { RiskItem, RiskLevel } from '../types/contract';
import {
  AlertOctagon, AlertTriangle, Info, ShieldCheck,
  Scale, Check, Copy, Sparkles, ChevronRight, Filter
} from 'lucide-react';

interface RiskPanelProps {
  risks: RiskItem[];
  selectedRiskFilter: RiskLevel | 'ALL';
  selectedClauseId: string | null;
  onSelectClause: (clauseId: string) => void;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({
  risks,
  selectedRiskFilter,
  selectedClauseId,
  onSelectClause,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [acceptedRedlines, setAcceptedRedlines] = useState<Set<string>>(new Set());

  const filteredRisks = risks.filter((r) => {
    if (selectedRiskFilter === 'ALL') return true;
    return r.risk_level === selectedRiskFilter;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleAccept = (id: string) => {
    setAcceptedRedlines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getBadgeStyle = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  const getIcon = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'MEDIUM':
        return <Info className="w-4 h-4 text-yellow-400" />;
      case 'LOW':
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col h-full bg-legal-900 border-l border-legal-800 overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-legal-800 bg-legal-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">Chi Tiết Rà Soát & Đề Xuất Sửa Đổi</h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-legal-800 text-slate-300 font-mono">
          {filteredRisks.length} / {risks.length} mục
        </span>
      </div>

      {/* Risk Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {filteredRisks.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <ShieldCheck className="w-12 h-12 text-emerald-500/40 mb-3" />
            <p className="text-sm font-medium text-slate-300">Không có rủi ro nào ở phân mục này</p>
            <p className="text-xs text-slate-500 mt-1">Các điều khoản đã kiểm tra đều tuân thủ tốt</p>
          </div>
        ) : (
          filteredRisks.map((risk) => {
            const isSelected = selectedClauseId === risk.clause_id;
            const isAccepted = acceptedRedlines.has(risk.id);

            return (
              <div
                key={risk.id}
                id={`risk-card-${risk.id}`}
                onClick={() => onSelectClause(risk.clause_id)}
                className={`rounded-xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-legal-800/90 border-blue-500 ring-2 ring-blue-500/20 shadow-xl'
                    : 'bg-legal-950/60 border-legal-800 hover:border-legal-700 hover:bg-legal-900/80'
                }`}
              >
                {/* Card Top: Clause Number & Severity Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {risk.clause_number}
                  </span>
                  <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getBadgeStyle(risk.risk_level)}`}>
                    {getIcon(risk.risk_level)}
                    <span>{risk.risk_level} • {risk.risk_category}</span>
                  </div>
                </div>

                {/* Risk Title */}
                <h3 className="text-sm font-bold text-slate-100 mb-2 leading-snug">
                  {risk.risk_title}
                </h3>

                {/* Analysis Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {risk.description}
                </p>

                {/* Legal Citation Basis */}
                {risk.legal_basis && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs mb-3">
                    <Scale className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-[11px] uppercase tracking-wider text-indigo-200">
                        Căn Cứ Pháp Luật Việt Nam:
                      </span>
                      <span>{risk.legal_basis}</span>
                    </div>
                  </div>
                )}

                {/* Redline / Suggested Revision Section */}
                <div className="mt-3 pt-3 border-t border-legal-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Đề Xuất Sửa Đổi (Redline)
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(risk.id, risk.suggested_text);
                      }}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-legal-800 hover:bg-legal-700 transition-colors"
                      title="Sao chép điều khoản đề xuất"
                    >
                      {copiedId === risk.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-legal-950 border border-emerald-500/30 text-xs text-emerald-200 font-sans leading-relaxed">
                    {risk.suggested_text}
                  </div>

                  {/* Rationale & Accept Action */}
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[11px] text-slate-400 italic">
                      Mục đích: {risk.rationale}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAccept(risk.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                        isAccepted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-legal-800 text-slate-300 hover:bg-emerald-600/20 hover:text-emerald-400 border border-legal-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAccepted ? 'Đã Áp Dụng' : 'Áp Dụng Redline'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
