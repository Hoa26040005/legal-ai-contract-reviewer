'use client';

import React from 'react';
import {
  ShieldAlert, Network, Upload, FileText, ChevronDown,
  Sparkles, Download, Search, CheckCircle2, AlertTriangle, AlertOctagon,
  FileCheck, GitCompare, FileSignature, Gavel, FolderArchive
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
  onOpenDiff: () => void;
  onOpenAnnex: () => void;
  onOpenLitigation: () => void;
  onOpenArchive: () => void;
  onExportReport: () => void;
  onExportDocx: () => void;
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
  onOpenDiff,
  onOpenAnnex,
  onOpenLitigation,
  onOpenArchive,
  onExportReport,
  onExportDocx,
}) => {
  const getScoreVisual = (sc: number) => {
    let colorClass = 'text-emerald-400 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    let label = 'An Toàn';
    let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;

    if (sc < 40) {
      colorClass = 'text-rose-400 stroke-rose-500 bg-rose-500/10 border-rose-500/30 glow-rose animate-pulse';
      label = 'Vi Phạm Luật';
      icon = <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;
    } else if (sc < 70) {
      colorClass = 'text-amber-400 stroke-amber-500 bg-amber-500/10 border-amber-500/30 glow-amber';
      label = 'Nhiều Rủi Ro';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    }

    return (
      <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border ${colorClass} transition-all`}>
        {icon}
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-sm font-extrabold">{sc}</span>
          <span className="text-[10px] text-slate-400">/100</span>
        </div>
        <span className="text-[11px] font-bold pl-1.5 border-l border-white/10 hidden sm:inline tracking-wide uppercase">
          {label}
        </span>
      </div>
    );
  };

  return (
    <header className="h-16 glass-panel border-b border-white/[0.08] px-5 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Switcher */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-indigo-600 to-rose-500 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-white/15 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 text-base tracking-tight">
                LegalAI
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-extrabold uppercase tracking-wider">
                Graph-RAG 2.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hệ thống Rà soát Hợp đồng & Tiền lệ Pháp lý</span>
            </div>
          </div>
        </div>

        {/* Contract Switcher */}
        <div className="hidden xl:flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-1.5 transition-all">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={selectedContractId}
            onChange={(e) => onSelectContract(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-semibold outline-none cursor-pointer truncate max-w-[280px]"
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
      <div className="hidden md:flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-1.5 w-60 lg:w-72 focus-within:w-88 focus-within:border-cyan-500/60 focus-within:bg-white/[0.07] transition-all">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Tìm: giữ bằng gốc, phạt 8%, thử việc..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full font-sans"
        />
        <kbd className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono">
          /
        </kbd>
      </div>

      {/* Actions & Score */}
      <div className="flex items-center gap-2.5">
        {getScoreVisual(score)}

        {/* Side-by-Side Version Diff Button */}
        <button
          onClick={onOpenDiff}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 text-xs font-semibold transition-all hover:glow-cyan shadow-sm"
          title="Đối chiếu 2 bản hợp đồng song song (Bản V1 vs Bản V2)"
        >
          <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">So Sánh Diff</span>
        </button>

        {/* Contract Amendment Annex Generator Button */}
        <button
          onClick={onOpenAnnex}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-semibold transition-all hover:glow-green shadow-sm"
          title="Tự động tạo Phụ Lục Sửa Đổi, Bổ Sung Hợp Đồng (.docx) chuẩn Điều 403 BLDS 2015"
        >
          <FileSignature className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Tạo Phụ Lục</span>
        </button>

        {/* Supreme Court Precedent & Litigation Loss Predictor Button */}
        <button
          onClick={onOpenLitigation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-300 text-xs font-semibold transition-all hover:glow-purple shadow-sm"
          title="Dự báo tỷ lệ thua kiện và đối chiếu Án lệ của Hội đồng Thẩm phán TANDTC"
        >
          <Gavel className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline">Dự Báo Án Lệ</span>
        </button>

        {/* Word Docx Track Changes Button */}
        <button
          onClick={onExportDocx}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all shadow-sm"
          title="Tải về file Word (.docx) chứa gạch đỏ xóa bỏ và chữ xanh sửa đổi Track Changes"
        >
          <FileCheck className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden lg:inline">Xuất Word (.docx)</span>
        </button>

        {/* Knowledge Graph Button */}
        <button
          onClick={onOpenGraph}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 text-indigo-300 text-xs font-semibold transition-all hover:glow-purple"
        >
          <Network className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Graph</span>
        </button>

        {/* Contract Archive / Document Repository Button */}
        <button
          onClick={onOpenArchive}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-semibold transition-all hover:glow-amber shadow-sm"
          title="Mở Tủ Hồ Sơ Hợp Đồng & Quản Lý Kho Tài Liệu"
        >
          <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Tủ Hồ Sơ</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-xs transition duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-xl group-hover:scale-105 transition-transform"></div>
          <div className="relative px-3.5 py-1.5 bg-slate-950/90 rounded-[11px] flex items-center gap-1.5 text-white">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tải Hợp Đồng</span>
          </div>
        </button>
      </div>
    </header>
  );
};
