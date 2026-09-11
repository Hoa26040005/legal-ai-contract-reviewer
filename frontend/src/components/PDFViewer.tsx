'use client';

import React, { useState } from 'react';
import { Clause, RiskItem, RiskLevel } from '../types/contract';
import {
  ZoomIn, ZoomOut, FileText, Bookmark, Eye, Moon, Sun,
  Maximize2, Sparkles, Check, ChevronDown
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

  const maxPage = Math.max(...clauses.map((c) => c.page_number), 1);
  const pages = Array.from({ length: maxPage }, (_, i) => i + 1);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return paperTheme === 'paper'
          ? 'border-rose-500/80 bg-rose-500/15 hover:bg-rose-500/25 ring-1 ring-rose-500/40'
          : 'border-rose-500 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500/50';
      case 'HIGH':
        return paperTheme === 'paper'
          ? 'border-amber-500/80 bg-amber-500/15 hover:bg-amber-500/25 ring-1 ring-amber-500/40'
          : 'border-amber-500 bg-amber-950/40 text-amber-200 ring-1 ring-amber-500/50';
      case 'MEDIUM':
        return paperTheme === 'paper'
          ? 'border-yellow-500/80 bg-yellow-500/15 hover:bg-yellow-500/25 ring-1 ring-yellow-500/40'
          : 'border-yellow-500 bg-yellow-950/40 text-yellow-200 ring-1 ring-yellow-500/50';
      case 'LOW':
        return paperTheme === 'paper'
          ? 'border-blue-500/80 bg-blue-500/10 hover:bg-blue-500/20 ring-1 ring-blue-500/30'
          : 'border-blue-500 bg-blue-950/40 text-blue-200 ring-1 ring-blue-500/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070b14] border-r border-white/[0.08] overflow-hidden">
      {/* Precision PDF Toolbar */}
      <div className="h-12 bg-slate-950/80 border-b border-white/[0.07] px-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">Trình Xem Văn Bản Gốc (PDF / Smart OCR)</span>
          </div>
          <div className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.06] text-[11px] font-mono text-slate-300">
            Trang {activePage} / {maxPage}
          </div>
        </div>

        {/* Controls: Zoom, Theme Switcher */}
        <div className="flex items-center gap-2">
          {/* Paper Theme Toggle */}
          <button
            onClick={() => setPaperTheme((prev) => (prev === 'paper' ? 'dark' : 'paper'))}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-slate-300 transition-all"
            title="Đổi màu nền hiển thị văn bản"
          >
            {paperTheme === 'paper' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] hidden sm:inline">Chế độ Tối</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] hidden sm:inline">Trang Giấy Sáng</span>
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
          <span className="text-xs font-mono text-slate-300 min-w-[38px] text-center font-semibold">
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
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-8 custom-scrollbar bg-gradient-to-b from-[#070b14] to-[#04060b]">
        {pages.map((pageNum) => {
          const pageClauses = clauses.filter((c) => c.page_number === pageNum);

          return (
            <div
              key={pageNum}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className={`w-full max-w-2xl rounded-xl shadow-2xl p-10 relative transition-all duration-150 min-h-[860px] flex flex-col justify-between border ${
                paperTheme === 'paper'
                  ? 'bg-[#fdfdfd] text-slate-900 border-slate-300 shadow-slate-950/80'
                  : 'bg-slate-900/90 text-slate-100 border-white/10 shadow-black/90'
              }`}
              onMouseEnter={() => setActivePage(pageNum)}
            >
              {/* Official Document Header */}
              <div>
                <div className={`text-center mb-8 pb-5 border-b ${paperTheme === 'paper' ? 'border-slate-200' : 'border-white/10'}`}>
                  <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${paperTheme === 'paper' ? 'text-slate-600' : 'text-slate-400'}`}>
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </p>
                  <p className={`text-[9px] font-semibold underline decoration-slate-400 mb-5 ${paperTheme === 'paper' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Độc lập - Tự do - Hạnh phúc
                  </p>
                  <h2 className={`text-sm font-extrabold uppercase tracking-tight ${paperTheme === 'paper' ? 'text-slate-900' : 'text-white'}`}>
                    VĂN BẢN THỎA THUẬN HỢP ĐỒNG PHÁP LÝ
                  </h2>
                </div>

                {/* Page Clauses */}
                <div className="space-y-4">
                  {pageClauses.map((clause) => {
                    const clauseRisk = risks.find((r) => r.clause_id === clause.id);
                    const isSelected = selectedClauseId === clause.id;
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
                        className={`group relative p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          clauseRisk
                            ? getRiskColor(clauseRisk.risk_level)
                            : paperTheme === 'paper'
                            ? 'border-transparent hover:border-slate-300 bg-slate-50/60'
                            : 'border-transparent hover:border-white/20 bg-white/[0.02]'
                        } ${
                          isSelected
                            ? 'ring-4 ring-cyan-500/50 shadow-xl scale-[1.015] z-10'
                            : ''
                        } ${isMatchedSearch ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        {/* Risk Indicator Floating Pill */}
                        {clauseRisk && (
                          <div className="absolute -top-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg bg-slate-950 text-white border border-white/20">
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
                            <span className="tracking-wide">{clauseRisk.risk_category}</span>
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
                            paperTheme === 'paper' ? 'text-slate-700' : 'text-slate-300'
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
                  paperTheme === 'paper' ? 'border-slate-200 text-slate-400' : 'border-white/10 text-slate-500'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-500" /> Hệ Thống AI Rà Soát Pháp Lý (Vietnamese Legal Standard)
                </span>
                <span className="font-mono font-semibold">Trang {pageNum} / {maxPage}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
