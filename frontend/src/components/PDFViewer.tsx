'use client';

import React, { useState } from 'react';
import { Clause, RiskItem, RiskLevel } from '../types/contract';
import {
  ZoomIn, ZoomOut, FileText, Moon, Sun,
  Crosshair, Sparkles, Eye, ScanLine, RotateCcw
} from 'lucide-react';

interface PDFViewerProps {
  clauses: Clause[];
  risks: RiskItem[];
  selectedClauseId: string | null;
  searchQuery: string;
  onSelectClause: (id: string) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  clauses,
  risks,
  selectedClauseId,
  searchQuery,
  onSelectClause,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [activePage, setActivePage] = useState<number>(1);
  const [paperTheme, setPaperTheme] = useState<'paper' | 'dark'>('paper');
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [showAstCoords, setShowAstCoords] = useState<boolean>(false);

  const maxPage = Math.max(...clauses.map((c) => c.page_number), 1);
  const pages = Array.from({ length: maxPage }, (_, i) => i + 1);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return paperTheme === 'paper'
          ? 'border-rose-500/80 bg-rose-500/[0.08] hover:bg-rose-500/[0.14] ring-1 ring-rose-500/35 text-slate-900 shadow-sm'
          : 'border-rose-500/80 bg-rose-950/35 hover:bg-rose-950/50 text-rose-100 ring-1 ring-rose-500/45';
      case 'HIGH':
        return paperTheme === 'paper'
          ? 'border-amber-500/80 bg-amber-500/[0.08] hover:bg-amber-500/[0.14] ring-1 ring-amber-500/35 text-slate-900 shadow-sm'
          : 'border-amber-500/80 bg-amber-950/35 hover:bg-amber-950/50 text-amber-100 ring-1 ring-amber-500/45';
      case 'MEDIUM':
        return paperTheme === 'paper'
          ? 'border-yellow-500/80 bg-yellow-500/[0.08] hover:bg-yellow-500/[0.14] ring-1 ring-yellow-500/35 text-slate-900 shadow-sm'
          : 'border-yellow-500/80 bg-yellow-950/35 hover:bg-yellow-950/50 text-yellow-100 ring-1 ring-yellow-500/40';
      case 'LOW':
        return paperTheme === 'paper'
          ? 'border-emerald-500/80 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.14] ring-1 ring-emerald-500/30 text-slate-900 shadow-sm'
          : 'border-emerald-500/80 bg-emerald-950/35 hover:bg-emerald-950/50 text-emerald-100 ring-1 ring-emerald-500/30';
    }
  };

  const getPipColor = (level?: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500';
      case 'HIGH':
        return 'bg-amber-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#04070e] border-r border-white/[0.075] overflow-hidden relative">
      {/* Top Clause Minimap & Document Bar */}
      <div className="h-11 bg-[#060a15] border-b border-white/[0.075] px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            <FileText strokeWidth={1.75} className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-bold text-slate-200 tracking-tight hidden sm:inline">
            Văn Bản Hợp Đồng (AST Indexed)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-cyan-300 font-bold tabular-nums">
            Trang {activePage}/{maxPage}
          </span>
        </div>

        {/* Interactive Clause Quick-Jump Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1">
          {clauses.map((cl) => {
            const r = risks.find((item) => item.clause_id === cl.id);
            const isSelected = selectedClauseId === cl.id;
            return (
              <button
                key={cl.id}
                onClick={() => onSelectClause(cl.id)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all active:scale-[0.97] ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-white shadow-sm'
                    : 'bg-white/[0.025] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.15]'
                }`}
                title={`${cl.clause_number}: ${cl.title}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${getPipColor(r?.risk_level)}`} />
                <span>{cl.clause_number}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Document View Canvas with Architectural Grid */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 pb-24 flex flex-col items-center gap-8 custom-scrollbar bg-architectural-grid">
        {pages.map((pageNum) => {
          const pageClauses = clauses.filter((c) => c.page_number === pageNum);

          return (
            <div
              key={pageNum}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className={`w-full max-w-2xl rounded-2xl p-8 sm:p-11 relative transition-all duration-300 min-h-[880px] flex flex-col justify-between border overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.75)] ${
                paperTheme === 'paper'
                  ? 'bg-[#fcfcfd] text-slate-900 border-slate-200/90'
                  : 'bg-[#090e1c] text-slate-100 border-white/[0.09]'
              }`}
              onMouseEnter={() => setActivePage(pageNum)}
            >
              {/* Official Stamp Watermark (Mộc Đỏ Pháp Lý) */}
              <div className="legal-seal top-10 right-10">
                <div className="text-[9px] font-bold tracking-tighter">BẢO MẬT & ĐỐI CHIẾU</div>
                <div className="text-[12px] font-black border-y border-red-600/60 py-0.5 my-0.5 tracking-wider">
                  AI AUDITED
                </div>
                <div className="text-[8px] font-semibold">LEGAL STANDARD</div>
              </div>

              {/* Official Document Header */}
              <div>
                <div className={`text-center mb-8 pb-5 border-b ${paperTheme === 'paper' ? 'border-slate-200' : 'border-white/10'}`}>
                  <p className={`text-[10px] uppercase font-extrabold tracking-widest mb-1 ${paperTheme === 'paper' ? 'text-slate-600' : 'text-slate-400'}`}>
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </p>
                  <p className={`text-[9px] font-semibold underline decoration-slate-400 mb-5 ${paperTheme === 'paper' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Độc lập - Tự do - Hạnh phúc
                  </p>
                  <h2 className={`text-sm font-black uppercase tracking-tight ${paperTheme === 'paper' ? 'text-slate-900' : 'text-white'}`}>
                    VĂN BẢN THỎA THUẬN HỢP ĐỒNG PHÁP LÝ
                  </h2>
                </div>

                {/* Page Clauses */}
                <div className="space-y-4">
                  {pageClauses.map((clause) => {
                    const clauseRisk = risks.find((r) => r.clause_id === clause.id);
                    const isSelected = selectedClauseId === clause.id;
                    const isDimmed = focusMode && selectedClauseId && !isSelected;
                    const isMatchedSearch =
                      searchQuery &&
                      (clause.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        clause.clause_number.toLowerCase().includes(searchQuery.toLowerCase()));
                    const bbox = clause.bounding_boxes?.[0];

                    return (
                      <div
                        key={clause.id}
                        id={`pdf-clause-${clause.id}`}
                        onClick={() => onSelectClause(clause.id)}
                        className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isDimmed ? 'opacity-25 blur-[0.5px]' : 'opacity-100'
                        } ${
                          clauseRisk
                            ? getRiskColor(clauseRisk.risk_level)
                            : paperTheme === 'paper'
                            ? 'border-slate-200/70 hover:border-slate-300 bg-slate-50/80 text-slate-800'
                            : 'border-white/[0.04] hover:border-white/20 bg-white/[0.02] text-slate-200'
                        } ${
                          isSelected
                            ? 'ring-2 ring-cyan-500 shadow-xl scale-[1.01] z-10'
                            : ''
                        } ${isMatchedSearch ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        {/* Risk Indicator Floating Pill */}
                        {clauseRisk && (
                          <div className="absolute -top-2.5 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md bg-[#060a15] text-white border border-white/20">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                clauseRisk.risk_level === 'CRITICAL'
                                  ? 'bg-rose-500 animate-pulse'
                                  : clauseRisk.risk_level === 'HIGH'
                                  ? 'bg-amber-500'
                                  : clauseRisk.risk_level === 'MEDIUM'
                                  ? 'bg-yellow-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            <span className="tracking-wide uppercase font-mono">
                              {clauseRisk.risk_level} • {clauseRisk.risk_category}
                            </span>
                          </div>
                        )}

                        <div className="font-bold text-xs mb-1.5 flex items-center justify-between gap-2">
                          <span className={paperTheme === 'paper' ? 'text-slate-900' : 'text-white'}>
                            {clause.clause_number}: {clause.title}
                          </span>
                          <div className="flex items-center gap-2">
                            {showAstCoords && bbox && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 tabular-nums">
                                BBox [{bbox.x0},{bbox.y0} → {bbox.x1},{bbox.y1}]
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 group-hover:text-cyan-500 transition-colors flex items-center gap-1 font-normal font-mono">
                              <Eye strokeWidth={1.75} className="w-3 h-3" /> Soi điều khoản
                            </span>
                          </div>
                        </div>

                        <p
                          className={`text-xs leading-relaxed text-justify ${
                            paperTheme === 'paper' ? 'text-slate-700 font-serif' : 'text-slate-300 font-sans'
                          }`}
                        >
                          {clause.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Document Page Footer */}
              <div
                className={`pt-5 mt-6 border-t flex items-center justify-between text-[10px] tabular-nums ${
                  paperTheme === 'paper' ? 'border-slate-200 text-slate-500' : 'border-white/10 text-slate-500'
                }`}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles strokeWidth={1.75} className="w-3.5 h-3.5 text-cyan-500" /> Đối chiếu tự động theo Quy chuẩn Pháp luật Việt Nam
                </span>
                <span className="font-mono font-bold">Trang {pageNum} / {maxPage}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Glass Island Dock (Bottom Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 floating-dock rounded-full px-3 py-1.5 flex items-center gap-2 select-none tabular-nums">
        {/* Focus Mode Toggle */}
        <button
          onClick={() => setFocusMode((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
            focusMode
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
          }`}
          title="Chế độ tiêu điểm: Làm mờ các điều khoản khác để tập trung"
        >
          <Crosshair strokeWidth={1.75} className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline">Tiêu Điểm</span>
        </button>

        {/* AST Bounding Box Overlay Toggle */}
        <button
          onClick={() => setShowAstCoords((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 active:scale-[0.97] ${
            showAstCoords
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
          }`}
          title="Hiển thị tọa độ AST Bounding Box của từng điều khoản"
        >
          <ScanLine strokeWidth={1.75} className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] hidden md:inline">AST BBox</span>
        </button>

        {/* Paper / Dark Theme Toggle */}
        <button
          onClick={() => setPaperTheme((prev) => (prev === 'paper' ? 'dark' : 'paper'))}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all duration-200 active:scale-[0.97]"
          title="Chuyển đổi nền Giấy trắng / Chế độ tối"
        >
          {paperTheme === 'paper' ? (
            <>
              <Moon strokeWidth={1.75} className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] hidden sm:inline">Nền Tối</span>
            </>
          ) : (
            <>
              <Sun strokeWidth={1.75} className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] hidden sm:inline">Giấy Trắng</span>
            </>
          )}
        </button>

        <div className="h-4 w-[1px] bg-white/[0.12]" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((prev) => Math.max(75, prev - 10))}
            aria-label="Thu nhỏ"
            className="p-1 rounded-full hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut strokeWidth={1.75} className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="text-[11px] font-mono text-slate-200 min-w-[42px] text-center font-bold hover:text-cyan-400 transition-colors"
            title="Đặt lại 100%"
          >
            {zoom}%
          </button>
          <button
            onClick={() => setZoom((prev) => Math.min(135, prev + 10))}
            aria-label="Phóng to"
            className="p-1 rounded-full hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
            title="Phóng to"
          >
            <ZoomIn strokeWidth={1.75} className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
