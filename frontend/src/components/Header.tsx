'use client';

import React from 'react';
import { ShieldAlert, Network, Upload, FileText, ChevronDown, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { ContractSummaryItem } from '../types/contract';

interface HeaderProps {
  currentTitle: string;
  score: number;
  sampleContracts: ContractSummaryItem[];
  selectedContractId: string;
  onSelectContract: (id: string) => void;
  onOpenUpload: () => void;
  onOpenGraph: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTitle,
  score,
  sampleContracts,
  selectedContractId,
  onSelectContract,
  onOpenUpload,
  onOpenGraph,
}) => {
  const getScoreBadge = (sc: number) => {
    if (sc >= 80) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Điểm An Toàn: {sc}/100 (Tốt)</span>
        </div>
      );
    } else if (sc >= 50) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Điểm An Toàn: {sc}/100 (Cảnh báo)</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-pulse">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>Điểm An Toàn: {sc}/100 (Rất Rủi Ro)</span>
        </div>
      );
    }
  };

  return (
    <header className="h-16 bg-legal-900 border-b border-legal-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Title */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg tracking-tight">LegalAI</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">PRO</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Hệ thống Rà soát Hợp đồng & Graph-RAG</p>
          </div>
        </div>

        {/* Contract Selector */}
        <div className="hidden lg:flex items-center gap-2 bg-legal-950/70 border border-legal-800 rounded-lg px-3 py-1.5 max-w-md">
          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
          <select
            value={selectedContractId}
            onChange={(e) => onSelectContract(e.target.value)}
            className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer truncate max-w-[280px]"
          >
            {sampleContracts.map((c) => (
              <option key={c.id} value={c.id} className="bg-legal-900 text-slate-200">
                {c.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        </div>
      </div>

      {/* Safety Score & Action Buttons */}
      <div className="flex items-center gap-3">
        {getScoreBadge(score)}

        <button
          onClick={onOpenGraph}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium transition-all shadow-sm"
        >
          <Network className="w-4 h-4 text-indigo-400" />
          <span>Knowledge Graph</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Tải Hợp Đồng Mới</span>
        </button>
      </div>
    </header>
  );
};
