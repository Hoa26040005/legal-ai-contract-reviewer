'use client';

import React, { useState } from 'react';
import { Clause, RiskItem, RiskLevel } from '../types/contract';
import {
  ZoomIn, ZoomOut, FileText, Bookmark, Eye, Moon, Sun,
  Maximize2, Sparkles, Check, ChevronDown, Crosshair
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

  const maxPage = Math.max(...clauses.map((c) => c.page_number), 1);
  const pages = Array.from({ length: maxPage }, (_, i) => i + 1);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return paperTheme === 'paper'
          ? 'border-rose-500/90 bg-rose-500/15 hover:bg-rose-500/25 ring-1 ring-rose-500/50 text-slate-900'
          : 'border-rose-500 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500/60';
      case 'HIGH':
        return paperTheme === 'paper'
          ? 'border-amber-500/90 bg-amber-500/15 hover:bg-amber-500/25 ring-1 ring-amber-500/50 text-slate-900'
          : 'border-amber-500 bg-amber-950/40 text-amber-200 ring-1 ring-amber-500/60';
      case 'MEDIUM':
        return paperTheme === 'paper'
          ? 'border-yellow-500/90 bg-yellow-500/15 hover:bg-yellow-500/25 ring-1 ring-yellow-500/50 text-slate-900'
          : 'border-yellow-500 bg-yellow-950/40 text-yellow-200 ring-1 ring-yellow-500/50';
      case 'LOW':
        return paperTheme === 'paper'
          ? 'border-blue-500/80 bg-blue-500/10 hover:bg-blue-500/20 ring-1 ring-blue-500/30 text-slate-900'
          : 'border-blue-500 bg-blue-950/40 text-blue-200 ring-1 ring-blue-500/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050811] border-r border-white/[0.08] overflow-hidden">
      {/* Precision PDF Toolbar */}
      <div className="h-12 bg-slate-950/90 border-b border-white/[0.07] px-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">Bản Trình Bày Văn Bản Gốc (PDF)</span>
          </div>
          <div className="px-2.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[11px] font-mono text-cyan-300 font-bold">
            Trang {activePage} / {maxPage}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Focus Mode Button */}
          <button
            onClick={() => setFocusMode((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
              focusMode
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 glow-cyan'
                : 'bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-white'
            }`}
            title="Chế độ tiêu điểm: Làm mờ các điều khoản khác để tập trung"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Tiêu Điểm</span>
          </button>

          {/* Paper Theme Toggle */}
          <button
            onClick={() => setPaperTheme((prev) => (prev === 'paper' ? 'dark' : 'paper'))}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-slate-300 transition-all"
            title="Đổi màu nền hiển thị văn bản"
          >
            {paperTheme === 'paper' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] hidden md:inline">Chế độ Tối</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] hidden md:inline">Giấy Trắng</span>
              </>
            )}
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoom((prev) => Math.max(70, prev - 10))}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-200 min-w-[38px] text-center font-bold">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom((prev) => Math.min(140, prev + 10))}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document View Canvas */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-8 custom-scrollbar bg-gradient-to-b from-[#050811] via-[#080d1a] to-[#04060d]">
        {pages.map((pageNum) => {
          const pageClauses = clauses.filter((c) => c.page_number === pageNum);

          return (
            <div
              key={pageNum}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className={`w-full max-w-2xl rounded-2xl shadow-2xl p-10 relative transition-all duration-150 min-h-[880px] flex flex-col justify-between border overflow-hidden ${
                paperTheme === 'paper'
                  ? 'bg-[#ffffff] text-slate-900 border-slate-300 shadow-slate-950/70'
                  : 'bg-slate-900/90 text-slate-100 border-white/10 shadow-black/90'
              }`}
              onMouseEnter={() => setActivePage(pageNum)}
            >
              {/* Authentic Legal Stamp Watermark (Mộc Đỏ Pháp Lý) */}
              <div className="legal-seal top-12 right-12">
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
                    const isMatchedSearch = searchQuery && (
                      clause.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      clause.clause_number.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    return (
                      <div
                        key={clause.id}
                        id={`pdf-clause-${clause.id}`}
                        onClick={() => onSelectClause(clause.id)}
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          isDimmed ? 'opacity-30 blur-[0.5px]' : 'opacity-100'
                        } ${
                          clauseRisk
                            ? getRiskColor(clauseRisk.risk_level)
                            : paperTheme === 'paper'
                            ? 'border-transparent hover:border-slate-300 bg-slate-50/70 text-slate-800'
                            : 'border-transparent hover:border-white/20 bg-white/[0.02] text-slate-200'
                        } ${
                          isSelected
                            ? 'ring-4 ring-cyan-500/60 shadow-2xl scale-[1.015] z-10'
                            : ''
                        } ${isMatchedSearch ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        {/* Risk Indicator Floating Pill */}
                        {clauseRisk && (
                          <div className="absolute -top-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg bg-slate-950 text-white border border-white/25">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                clauseRisk.risk_level === 'CRITICAL'
                                  ? 'bg-rose-500 animate-pulse'
                                  : clauseRisk.risk_level === 'HIGH'
                                  ? 'bg-amber-500'
                                  : clauseRisk.risk_level === 'MEDIUM'
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            <span className="tracking-wide uppercase font-mono">{clauseRisk.risk_category}</span>
                          </div>
                        )}

                        <div className="font-bold text-xs mb-1.5 flex items-center justify-between">
                          <span className={paperTheme === 'paper' ? 'text-slate-900' : 'text-white'}>
                            {clause.clause_number}: {clause.title}
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover:text-cyan-500 transition-colors flex items-center gap-1 font-normal">
                            <Eye className="w-3 h-3" /> Xem phân tích
                          </span>
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
                className={`pt-5 mt-6 border-t flex items-center justify-between text-[10px] ${
                  paperTheme === 'paper' ? 'border-slate-200 text-slate-500' : 'border-white/10 text-slate-500'
                }`}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> Đối chiếu theo Quy chuẩn Pháp luật Việt Nam
                </span>
                <span className="font-mono font-bold">Trang {pageNum} / {maxPage}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
