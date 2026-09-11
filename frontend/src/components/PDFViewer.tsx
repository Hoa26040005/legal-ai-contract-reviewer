'use client';

import React, { useState } from 'react';
import { Clause, RiskItem, RiskLevel } from '../types/contract';
import { ZoomIn, ZoomOut, FileText, Bookmark, Eye } from 'lucide-react';

interface PDFViewerProps {
  clauses: Clause[];
  risks: RiskItem[];
  selectedClauseId: string | null;
  onSelectClause: (id: string) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  clauses,
  risks,
  selectedClauseId,
  onSelectClause,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [activePage, setActivePage] = useState<number>(1);

  // Group clauses by page
  const maxPage = Math.max(...clauses.map((c) => c.page_number), 1);
  const pages = Array.from({ length: maxPage }, (_, i) => i + 1);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'border-rose-500 bg-rose-500/25 hover:bg-rose-500/35 text-rose-300';
      case 'HIGH':
        return 'border-amber-500 bg-amber-500/25 hover:bg-amber-500/35 text-amber-300';
      case 'MEDIUM':
        return 'border-yellow-500 bg-yellow-500/25 hover:bg-yellow-500/35 text-yellow-300';
      case 'LOW':
        return 'border-blue-500 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300';
      default:
        return 'border-slate-500 bg-slate-500/10 text-slate-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-legal-950 border-r border-legal-800 overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-12 bg-legal-900/90 border-b border-legal-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200">Văn Bản Hợp Đồng (PDF Preview)</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-legal-800 text-slate-400">
            Trang {activePage} / {maxPage}
          </span>
        </div>

        {/* Zoom & Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((prev) => Math.max(70, prev - 10))}
            className="p-1.5 rounded hover:bg-legal-800 text-slate-400 hover:text-white transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300 min-w-[40px] text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((prev) => Math.min(150, prev + 10))}
            className="p-1.5 rounded hover:bg-legal-800 text-slate-400 hover:text-white transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document View Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-6 custom-scrollbar">
        {pages.map((pageNum) => {
          const pageClauses = clauses.filter((c) => c.page_number === pageNum);

          return (
            <div
              key={pageNum}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-2xl bg-white text-slate-900 rounded-lg shadow-2xl p-10 relative transition-transform duration-150 min-h-[840px] flex flex-col justify-between border border-slate-200"
              onMouseEnter={() => setActivePage(pageNum)}
            >
              {/* Document Header */}
              <div>
                <div className="text-center mb-6 pb-4 border-b border-slate-200">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </p>
                  <p className="text-[9px] font-semibold text-slate-600 underline decoration-slate-400 mb-4">
                    Độc lập - Tự do - Hạnh phúc
                  </p>
                  <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
                    VĂN BẢN THỎA THUẬN HỢP ĐỒNG
                  </h3>
                </div>

                {/* Clauses on this page */}
                <div className="space-y-5">
                  {pageClauses.map((clause) => {
                    const clauseRisk = risks.find((r) => r.clause_id === clause.id);
                    const isSelected = selectedClauseId === clause.id;

                    return (
                      <div
                        key={clause.id}
                        id={`pdf-clause-${clause.id}`}
                        onClick={() => onSelectClause(clause.id)}
                        className={`group relative p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          clauseRisk
                            ? getRiskColor(clauseRisk.risk_level)
                            : 'border-transparent hover:border-slate-300 bg-slate-50/50'
                        } ${isSelected ? 'ring-4 ring-blue-500/40 shadow-lg scale-[1.01]' : ''}`}
                      >
                        {/* Risk Badge overlay */}
                        {clauseRisk && (
                          <div className="absolute -top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md bg-legal-950 text-white border border-slate-700">
                            <span className={`w-2 h-2 rounded-full ${
                              clauseRisk.risk_level === 'CRITICAL' ? 'bg-rose-500 animate-ping' :
                              clauseRisk.risk_level === 'HIGH' ? 'bg-amber-500' :
                              clauseRisk.risk_level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                            <span>{clauseRisk.risk_category}</span>
                          </div>
                        )}

                        <div className="font-bold text-xs text-slate-900 mb-1.5 flex items-center justify-between">
                          <span>{clause.clause_number}: {clause.title}</span>
                          <span className="text-[10px] text-slate-500 group-hover:text-blue-600 transition-colors flex items-center gap-1 font-normal">
                            <Eye className="w-3 h-3" /> Chi tiết
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-700 text-justify">
                          {clause.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Page Footer */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Rà soát bởi LegalAI Graph-RAG System</span>
                <span>Trang {pageNum} / {maxPage}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
