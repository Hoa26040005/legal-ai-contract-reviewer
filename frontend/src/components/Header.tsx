'use client';

import React, { useEffect, useRef } from 'react';
import {
  ShieldAlert, Network, Upload, FileText, ChevronDown,
  Search, CheckCircle2, AlertTriangle, AlertOctagon,
  FileCheck, GitCompare, FileSignature, Gavel, FolderArchive,
  BookOpen, Cpu, X
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
  onOpenArchitecture?: () => void;
  onExportReport: () => void;
  onExportDocx: () => void;
}

export const Header: React.FC<HeaderProps> = ({
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
  onOpenArchitecture,
  onExportDocx,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getScoreVisual = (sc: number) => {
    let colorClass = 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30 glow-emerald';
    let label = 'An Toàn';
    let pipColor = 'bg-emerald-400';
    let icon = <CheckCircle2 strokeWidth={1.75} className="w-3.5 h-3.5 text-emerald-400" />;

    if (sc < 40) {
      colorClass = 'text-rose-300 bg-rose-500/15 border-rose-500/40 glow-rose';
      label = 'Vi Phạm Cấm';
      pipColor = 'bg-rose-400';
      icon = <AlertOctagon strokeWidth={1.75} className="w-3.5 h-3.5 text-rose-400" />;
    } else if (sc < 70) {
      colorClass = 'text-amber-300 bg-amber-500/10 border-amber-500/30 glow-amber';
      label = 'Cần Đàm Phán';
      pipColor = 'bg-amber-400';
      icon = <AlertTriangle strokeWidth={1.75} className="w-3.5 h-3.5 text-amber-400" />;
    }

    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full border ${colorClass} tabular-nums transition-all duration-300`}
        title="Điểm an toàn pháp lý tổng thể của hợp đồng"
      >
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${pipColor} animate-pulse`} />
          {icon}
        </div>
        <div className="flex items-baseline gap-0.5 font-mono">
          <span className="text-xs font-extrabold">{sc}</span>
          <span className="text-[10px] text-slate-400 opacity-75">/100</span>
        </div>
        <span className="text-[9px] font-bold tracking-wider uppercase pl-1.5 border-l border-white/15 hidden 2xl:inline font-mono">
          {label}
        </span>
      </div>
    );
  };

  return (
    <header className="h-14 glass-panel border-b border-white/[0.075] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Brand Lockup & Machined Contract Switcher */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          onClick={onOpenArchitecture}
          className="flex items-center gap-2.5 group cursor-pointer"
          title="Xem Hồ Sơ Kiến Trúc Hệ Thống & Engineering Spec"
        >
          <div className="relative p-[2px] rounded-xl bg-white/[0.06] border border-white/[0.1] group-hover:border-cyan-500/50 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <div className="w-8 h-8 rounded-[9px] bg-[#060a15] flex items-center justify-center">
              <ShieldAlert strokeWidth={1.75} className="w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110 duration-200" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#04070e]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm tracking-tight">
                Legal<span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-mono font-bold tracking-wider uppercase">
                GRAPH-RAG v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block leading-none mt-0.5 font-mono">
              Vietnamese Contract Intelligence
            </p>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-white/[0.08] hidden xl:block" />

        {/* Contract Switcher with Double-Bezel Framing */}
        <div className="hidden xl:flex items-center p-[2px] rounded-xl bg-white/[0.025] border border-white/[0.07] hover:border-white/[0.15] transition-all">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-[9px] bg-[#080d19] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <FileText strokeWidth={1.75} className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              aria-label="Chọn hợp đồng mẫu hoặc hợp đồng đã tải lên"
              value={selectedContractId}
              onChange={(e) => onSelectContract(e.target.value)}
              className="bg-transparent text-xs text-slate-100 font-semibold outline-none cursor-pointer truncate max-w-[230px]"
            >
              {sampleContracts.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#080d19] text-slate-200 py-1">
                  {c.title} ({c.score}/100)
                </option>
              ))}
            </select>
            <ChevronDown strokeWidth={1.75} className="w-3 h-3 text-slate-500 shrink-0 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Center: Precision Search Bar with Keyboard Shortcut */}
      <div className="hidden lg:flex items-center gap-2 bg-[#070b16] border border-white/[0.08] rounded-xl px-3 py-1.5 w-52 xl:w-64 focus-within:w-72 focus-within:border-cyan-500/60 focus-within:shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300">
        <Search strokeWidth={1.75} className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          aria-label="Tìm điều khoản, mức phạt, rủi ro"
          placeholder="Tìm điều khoản, mức phạt..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none w-full"
        />
        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            aria-label="Xóa từ khóa tìm kiếm"
            className="text-slate-500 hover:text-slate-300"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <kbd className="hidden xl:inline text-[9px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.07]">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Right: Segmented Action Clusters & Button-in-Button CTAs */}
      <div className="flex items-center gap-2">
        {getScoreVisual(score)}

        {/* Recruiter / System Spec Pill */}
        {onOpenArchitecture && (
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all active:scale-[0.98]"
            title="Hồ Sơ Kiến Trúc Hệ Thống & Engineering Spec (Dành cho Nhà Tuyển Dụng)"
          >
            <Cpu strokeWidth={1.75} className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Kiến Trúc</span>
          </button>
        )}

        {/* Cluster 1: Negotiation & Litigation Suite */}
        <div className="flex items-center bg-[#070b16] border border-white/[0.075] rounded-xl p-0.5 shadow-inner">
          <button
            onClick={onOpenDiff}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-[0.98]"
            title="So sánh 2 bản hợp đồng (Side-by-Side Diff & ΔScore)"
          >
            <GitCompare strokeWidth={1.75} className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Diff</span>
          </button>

          <button
            onClick={onOpenAnnex}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-[0.98]"
            title="Tự động tạo Phụ Lục Sửa Đổi (.docx) chuẩn Điều 403 BLDS 2015"
          >
            <FileSignature strokeWidth={1.75} className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Phụ Lục</span>
          </button>

          <button
            onClick={onOpenLitigation}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-[0.98]"
            title="Dự báo rủi ro tranh chấp & Đối chiếu Án lệ TANDTC"
          >
            <Gavel strokeWidth={1.75} className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Án Lệ</span>
          </button>
        </div>

        {/* Cluster 2: Knowledge Graph & Repository */}
        <div className="flex items-center bg-[#070b16] border border-white/[0.075] rounded-xl p-0.5 shadow-inner">
          <button
            onClick={onOpenArchive}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-[0.98]"
            title="Mở Tủ Hồ Sơ Hợp Đồng & Quản Lý Kho Tài Liệu"
          >
            <FolderArchive strokeWidth={1.75} className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden xl:inline">Hồ Sơ</span>
          </button>

          <button
            onClick={onOpenLegalLibrary}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-[0.98]"
            title="Thư Viện Điều Luật & Tự Động Nạp Tri Thức (Auto-Ingest)"
          >
            <BookOpen strokeWidth={1.75} className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">Luật</span>
          </button>

          <button
            onClick={onOpenGraph}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-cyan-300 text-xs font-medium transition-all active:scale-[0.98]"
            title="Đồ thị tri thức pháp lý Neo4j (Knowledge Graph & Cypher)"
          >
            <Network strokeWidth={1.75} className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden 2xl:inline">Graph</span>
          </button>
        </div>

        {/* Button-in-Button Secondary CTA: Word Redline Export */}
        <button
          onClick={onExportDocx}
          className="group hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-cyan-500/40 text-slate-100 text-xs font-semibold transition-all duration-200 active:scale-[0.98]"
          title="Tải về file Word (.docx) chứa Track Changes Redline"
        >
          <span className="w-6 h-6 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
            <FileCheck strokeWidth={1.75} className="w-3 h-3" />
          </span>
          <span className="hidden xl:inline">Xuất Redline</span>
        </button>

        {/* Button-in-Button Primary CTA: Upload Contract */}
        <button
          onClick={onOpenUpload}
          className="group flex items-center gap-2 pl-2 pr-3.5 py-1 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200 active:scale-[0.98]"
        >
          <span className="w-6 h-6 rounded-full bg-slate-950/15 flex items-center justify-center text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-[1px] transition-transform">
            <Upload strokeWidth={2} className="w-3 h-3" />
          </span>
          <span className="hidden sm:inline">Tải Hợp Đồng</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
