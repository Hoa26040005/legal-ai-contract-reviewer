'use client';

import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Info, Layers } from 'lucide-react';
import { RiskLevel } from '../types/contract';

interface RiskSummaryCardsProps {
  totalClauses: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  selectedFilter: RiskLevel | 'ALL';
  onSelectFilter: (level: RiskLevel | 'ALL') => void;
}

export const RiskSummaryCards: React.FC<RiskSummaryCardsProps> = ({
  totalClauses,
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
  selectedFilter,
  onSelectFilter,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 bg-legal-950/40 border-b border-legal-800">
      {/* All Clauses */}
      <button
        onClick={() => onSelectFilter('ALL')}
        className={`p-3 rounded-xl border text-left transition-all ${
          selectedFilter === 'ALL'
            ? 'bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-500/10'
            : 'bg-legal-900/60 border-legal-800 hover:border-legal-700'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400 font-medium">Tổng Điều Khoản</span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-white">{totalClauses}</div>
      </button>

      {/* Critical */}
      <button
        onClick={() => onSelectFilter('CRITICAL')}
        className={`p-3 rounded-xl border text-left transition-all ${
          selectedFilter === 'CRITICAL'
            ? 'bg-rose-500/20 border-rose-500 shadow-md shadow-rose-500/20'
            : 'bg-legal-900/60 border-legal-800 hover:border-rose-500/40'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-rose-400 font-semibold">Nghiêm Trọng</span>
          <AlertOctagon className="w-4 h-4 text-rose-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-rose-400">{criticalCount}</span>
          <span className="text-[10px] text-rose-300 font-medium">Vi phạm luật</span>
        </div>
      </button>

      {/* High */}
      <button
        onClick={() => onSelectFilter('HIGH')}
        className={`p-3 rounded-xl border text-left transition-all ${
          selectedFilter === 'HIGH'
            ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/20'
            : 'bg-legal-900/60 border-legal-800 hover:border-amber-500/40'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-amber-400 font-semibold">Rủi Ro Cao</span>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-amber-400">{highCount}</span>
          <span className="text-[10px] text-amber-300 font-medium">Bất cân xứng</span>
        </div>
      </button>

      {/* Medium */}
      <button
        onClick={() => onSelectFilter('MEDIUM')}
        className={`p-3 rounded-xl border text-left transition-all ${
          selectedFilter === 'MEDIUM'
            ? 'bg-yellow-500/20 border-yellow-500 shadow-md shadow-yellow-500/20'
            : 'bg-legal-900/60 border-legal-800 hover:border-yellow-500/40'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-yellow-400 font-semibold">Cần Làm Rõ</span>
          <Info className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-yellow-400">{mediumCount}</span>
          <span className="text-[10px] text-yellow-300 font-medium">Trung bình</span>
        </div>
      </button>

      {/* Low / Safe */}
      <button
        onClick={() => onSelectFilter('LOW')}
        className={`p-3 rounded-xl border text-left transition-all ${
          selectedFilter === 'LOW'
            ? 'bg-blue-500/20 border-blue-500 shadow-md shadow-blue-500/20'
            : 'bg-legal-900/60 border-legal-800 hover:border-blue-500/40'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-blue-400 font-semibold">An Toàn / Thấp</span>
          <ShieldCheck className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-blue-400">{lowCount}</span>
          <span className="text-[10px] text-blue-300 font-medium">Lưu ý nhỏ</span>
        </div>
      </button>
    </div>
  );
};
