'use client';

import React from 'react';
import {
  ShieldAlert, Network, Upload, FileText, ChevronDown,
  Sparkles, Search, CheckCircle2, AlertTriangle, AlertOctagon,
  FileCheck, GitCompare, FileSignature, Gavel, FolderArchive, BookOpen
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
  onOpenLegalLibrary: () => void;
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
  onOpenLegalLibrary,
  onExportReport,
  onExportDocx,
}) => {
  const getScoreVisual = (sc: number) => {
    let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    let label = 'An Toàn';
    let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;

    if (sc < 40) {
      colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse';
      label = 'Vi Phạm Luật';
      icon = <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;
    } else if (sc < 70) {
      colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      label = 'Nhiều Rủi Ro';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    }

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${colorClass} transition-all`}>
        {icon}
        <div className="flex items-baseline gap-0.5">
          <span className="font-mono text-xs font-bold">{sc}</span>
          <span className="text-[10px] text-slate-400">/100</span>
        </div>
        <span className="text-[10px] font-bold pl-1.5 border-l border-white/10 hidden sm:inline tracking-wide uppercase">
          {label}
        </span>
      </div>
    );
  };

  return (
    <header className="h-14 glass-panel border-b border-slate-800/80 px-4 sm:px-5 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Contract Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-[1px] shadow-sm">
            <div className="w-full h-full rounded-[7px] bg-[#0c1222] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm tracking-tight">
                LegalAI
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono font-bold uppercase">
                Pro
              </span>
            </div>
          </div>
        </div>

        {/* Contract Switcher Dropdown */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1 transition-all">
          <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            value={selectedContractId}
            onChange={(e) => onSelectContract(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-medium outline-none cursor-pointer truncate max-w-[240px]"
          >
            {sampleContracts.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                {c.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-1 w-56 xl:w-64 focus-within:w-80 focus-within:border-cyan-500/60 transition-all">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Tìm rủi ro: giữ bằng, phạt 8%..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
        />
      </div>

      {/* Actions & Tools Segmented Clusters */}
      <div className="flex items-center gap-2">
        {getScoreVisual(score)}

        {/* Cluster 1: Negotiation & Audit Tools */}
        <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={onOpenDiff}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-medium transition-colors"
            title="So sánh 2 bản hợp đồng (Version Diff & ΔScore)"
          >
            <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Diff</span>
          </button>

          <button
            onClick={onOpenAnnex}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-800 text-slate-300 hover:text-emerald-300 text-xs font-medium transition-colors"
            title="Tự động tạo Phụ Lục Sửa Đổi (.docx) chuẩn Điều 403 BLDS 2015"
          >
            <FileSignature className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Phụ Lục</span>
          </button>

          <button
            onClick={onOpenLitigation}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-800 text-slate-300 hover:text-purple-300 text-xs font-medium transition-colors"
            title="Dự báo rủi ro tranh chấp & Án lệ TANDTC"
          >
            <Gavel className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Án Lệ</span>
          </button>
        </div>

        {/* Cluster 2: Repository & Knowledge */}
        <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={onOpenArchive}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-medium transition-colors"
            title="Mở Tủ Hồ Sơ Hợp Đồng & Quản Lý Kho Tài Liệu"
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Hồ Sơ</span>
          </button>

          <button
            onClick={onOpenLegalLibrary}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-medium transition-colors"
            title="Thư Viện Điều Luật & Tự Động Nạp Tri Thức (Auto-Ingest)"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Thư Viện</span>
          </button>

          <button
            onClick={onOpenGraph}
            className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-300 text-xs font-medium transition-colors"
            title="Bản đồ mạng lưới tri thức pháp lý (Knowledge Graph)"
          >
            <Network className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>

        {/* Cluster 3: File Operations & Export */}
        <button
          onClick={onExportDocx}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-blue-300 text-xs font-semibold transition-all"
          title="Tải về file Word (.docx) chứa gạch đỏ xóa bỏ và chữ xanh sửa đổi Track Changes"
        >
          <FileCheck className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden xl:inline">Xuất Word</span>
        </button>

        {/* Primary CTA: Upload */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm hover:shadow-blue-500/20 transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tải HĐ Mới</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
