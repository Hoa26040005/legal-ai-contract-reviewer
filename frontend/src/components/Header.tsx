'use client';

import React from 'react';
import {
  ShieldAlert, Network, Upload, FileText, ChevronDown,
  Sparkles, Download, Search, CheckCircle2, AlertTriangle, AlertOctagon
} from 'lucide-react';
import { ContractSummaryItem } from '../types/contract';

interface HeaderProps {
  currentTitle: string;
  score: number;
  sampleContracts: ContractSummaryItem[];
  selectedContractId: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectContract: (id: string) => void;
  onOpenUpload: () => void;
  onOpenGraph: () => void;
  onExportReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTitle,
  score,
  sampleContracts,
  selectedContractId,
  searchQuery,
  onSearchChange,
  onSelectContract,
  onOpenUpload,
  onOpenGraph,
  onExportReport,
}) => {
  const getScoreVisual = (sc: number) => {
    let colorClass = 'text-emerald-400 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    let label = 'An Toàn';
    let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;

    if (sc < 50) {
      colorClass = 'text-rose-400 stroke-rose-500 bg-rose-500/10 border-rose-500/30 glow-rose';
      label = 'Rất Rủi Ro';
      icon = <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;
    } else if (sc < 80) {
      colorClass = 'text-amber-400 stroke-amber-500 bg-amber-500/10 border-amber-500/30';
      label = 'Cảnh Báo';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    }

    return (
      <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border ${colorClass} transition-all`}>
        {icon}
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-sm font-bold">{sc}</span>
          <span className="text-[10px] text-slate-400">/100</span>
        </div>
        <span className="text-[11px] font-semibold pl-1 border-l border-white/10 hidden sm:inline">
          {label}
        </span>
      </div>
    );
  };

  return (
    <header className="h-16 glass-panel border-b border-white/[0.08] px-5 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Contract Switcher */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-white/15 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 text-base tracking-tight">
                LegalAI
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold uppercase tracking-wider">
                Graph-RAG Pro
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Hệ Thống Rà Soát & Đối Chiếu Pháp Lý AI</p>
          </div>
        </div>

        {/* Contract Selector Pill */}
        <div className="hidden xl:flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-1.5 transition-all">
          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
          <select
            value={selectedContractId}
            onChange={(e) => onSelectContract(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-medium outline-none cursor-pointer truncate max-w-[280px]"
          >
            {sampleContracts.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                {c.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3.5 py-1.5 w-64 lg:w-80 focus-within:w-96 focus-within:border-cyan-500/50 focus-within:bg-white/[0.06] transition-all">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Tìm nhanh điều khoản, rủi ro, số điều..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full font-sans"
        />
      </div>

      {/* Actions & Score */}
      <div className="flex items-center gap-3">
        {getScoreVisual(score)}

        {/* Knowledge Graph Button */}
        <button
          onClick={onOpenGraph}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all hover:glow-purple"
        >
          <Network className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Knowledge Graph</span>
        </button>

        {/* Export Report Button */}
        <button
          onClick={onExportReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all"
          title="Xuất báo cáo PDF/JSON"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden lg:inline">Xuất Báo Cáo</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-xs transition duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-xl group-hover:scale-105 transition-transform"></div>
          <div className="relative px-3.5 py-1.5 bg-slate-950/90 rounded-[11px] flex items-center gap-1.5 text-white">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tải Hợp Đồng</span>
          </div>
        </button>
      </div>
    </header>
  );
};
