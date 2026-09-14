'use client';

import React, { useState, useEffect } from 'react';
import {
  X, GitCompare, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck,
  Upload, FileText, Sparkles, Filter, ChevronRight, Scale, Check,
  AlertOctagon, RefreshCw
} from 'lucide-react';
import { ContractComparisonReport, ClauseDiffItem, DiffStatus } from '../types/contract';
import { fetchSampleComparison, compareTwoContracts } from '../lib/api';

interface VersionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionDiffModal: React.FC<VersionDiffModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sample' | 'upload'>('sample');
  const [comparison, setComparison] = useState<ContractComparisonReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<DiffStatus | 'ALL'>('ALL');

  // Upload states
  const [fileV1, setFileV1] = useState<File | null>(null);
  const [fileV2, setFileV2] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !comparison) {
      loadSample();
    }
  }, [isOpen]);

  const loadSample = async () => {
    setLoading(true);
    try {
      const data = await fetchSampleComparison();
      setComparison(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomCompare = async () => {
    if (!fileV1 || !fileV2) {
      setUploadError('Vui lòng chọn cả 2 tệp hợp đồng (Bản V1 và Bản V2) để bắt đầu so sánh.');
      return;
    }
    setUploadError(null);
    setLoading(true);
    try {
      const result = await compareTwoContracts(fileV1, fileV2);
      setComparison(result);
      setActiveTab('sample'); // Show results in standard viewer
    } catch (err: any) {
      setUploadError(err.message || 'Có lỗi xảy ra trong quá trình đối chiếu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredItems = comparison?.diff_items.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  }) || [];

  const getStatusBadge = (status: DiffStatus) => {
    switch (status) {
      case 'MODIFIED':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> ĐÃ SỬA ĐỔI
          </span>
        );
      case 'ADDED':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Check className="w-3 h-3" /> THÊM MỚI
          </span>
        );
      case 'REMOVED':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <X className="w-3 h-3" /> ĐÃ BÃI BỎ
          </span>
        );
      case 'UNCHANGED':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            GIỮ NGUYÊN
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* 1. Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30">
              <GitCompare className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  So Sánh Phiên Bản Hợp Đồng (Side-by-Side Diff)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
                  Negotiation Delta AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Đối chiếu trực quan song song giữa 2 bản hợp đồng, đo lường điểm an toàn pháp lý & rủi ro đã hóa giải
              </p>
            </div>
          </div>

          {/* Mode Tabs & Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 bg-slate-900 border border-white/10 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('sample')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'sample'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bản Mẫu Đàm Phán
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tải 2 Bản Tự So Sánh
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Upload Custom Files Tab */}
        {activeTab === 'upload' ? (
          <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
            <div className="text-center mb-8">
              <h3 className="text-lg font-bold text-white mb-2">Tải Lên 2 Bản Hợp Đồng Cần Đối Chiếu</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hệ thống sẽ bóc tách điều khoản tương ứng, tính toán độ chênh lệch điểm rủi ro và xác định các điều khoản vi phạm đã được khắc phục.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
              {/* File 1: V1 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-dashed border-rose-500/30 hover:border-rose-500/60 transition-all flex flex-col items-center justify-center text-center">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/30 mb-3">
                  Bản V1 (Gốc / Trước Đàm Phán)
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  id="file-v1-input"
                  className="hidden"
                  onChange={(e) => setFileV1(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="file-v1-input"
                  className="cursor-pointer flex flex-col items-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6 text-rose-400" />
                  </div>
                  <span className="text-xs font-bold text-white mb-1">
                    {fileV1 ? fileV1.name : 'Chọn file V1 (.pdf, .docx)'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {fileV1 ? `${(fileV1.size / 1024).toFixed(1)} KB` : 'Nhấp để chọn tệp'}
                  </span>
                </label>
              </div>

              {/* File 2: V2 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-dashed border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col items-center justify-center text-center">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 mb-3">
                  Bản V2 (Mới / Sau Đàm Phán)
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  id="file-v2-input"
                  className="hidden"
                  onChange={(e) => setFileV2(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="file-v2-input"
                  className="cursor-pointer flex flex-col items-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-white mb-1">
                    {fileV2 ? fileV2.name : 'Chọn file V2 (.pdf, .docx)'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {fileV2 ? `${(fileV2.size / 1024).toFixed(1)} KB` : 'Nhấp để chọn tệp'}
                  </span>
                </label>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <button
              onClick={handleCustomCompare}
              disabled={loading || !fileV1 || !fileV2}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang bóc tách & đối chiếu điều khoản...</span>
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4" />
                  <span>Bắt Đầu Đối Chiếu Song Song</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* 3. Side-by-Side Dual-Pane Results View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Score Comparison Metrics Card */}
            {comparison && (
              <div className="px-6 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
                {/* Score Delta Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-white/10">
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Bản V1</span>
                      <span className="text-sm font-extrabold text-rose-400 font-mono">{comparison.score_v1}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Bản V2</span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">{comparison.score_v2}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-extrabold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>+{comparison.score_delta} Điểm An Toàn</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-sans text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Hóa giải {comparison.resolved_risks_count} rủi ro pháp lý</span>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/10 text-[11px] font-semibold">
                  <span className="text-slate-400 px-2 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Lọc:
                  </span>
                  {(['ALL', 'MODIFIED', 'ADDED', 'REMOVED', 'UNCHANGED'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        statusFilter === filter
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {filter === 'ALL' ? 'Tất Cả' : filter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Executive Negotiation Summary Banner */}
            {comparison?.summary && (
              <div className="px-6 py-2 bg-blue-950/30 border-b border-blue-500/20 text-xs text-blue-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-cyan-300">Đánh giá kết quả đàm phán:</span>
                <span className="truncate">{comparison.summary}</span>
              </div>
            )}

            {/* Side-by-Side Dual-Pane Column Headers */}
            <div className="grid grid-cols-2 bg-slate-900/90 border-b border-white/10 text-xs font-bold text-slate-300">
              <div className="p-3 px-6 border-r border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>BẢN V1: {comparison?.title_v1 || 'Bản Gốc / Dự Thảo'}</span>
                </div>
                <span className="text-[10px] text-rose-400 font-mono font-normal">Nhiều rủi ro / Điểm: {comparison?.score_v1}</span>
              </div>
              <div className="p-3 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>BẢN V2: {comparison?.title_v2 || 'Bản Sau Đàm Phán'}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-normal">Đã hóa giải rủi ro / Điểm: {comparison?.score_v2}</span>
              </div>
            </div>

            {/* Dual Scrollable Clause Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/[0.06] p-4 space-y-4">
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-slate-900/40 border border-white/[0.06] hover:border-white/15 transition-all overflow-hidden"
                >
                  {/* Clause Header Bar */}
                  <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {item.clause_number}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {item.title}
                      </span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Dual Pane Content Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
                    {/* Left: V1 */}
                    <div className="p-4 bg-rose-950/[0.08]">
                      <div className="text-[10px] uppercase font-mono font-bold text-rose-400/70 mb-1.5 flex items-center gap-1">
                        <span>Bản V1 (Cũ)</span>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                        {item.text_v1 ? (
                          <div className={item.status === 'MODIFIED' ? 'text-rose-200/90' : ''}>
                            {item.text_v1}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            (Điều khoản này chưa có trong Bản V1)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: V2 */}
                    <div className="p-4 bg-emerald-950/[0.08]">
                      <div className="text-[10px] uppercase font-mono font-bold text-emerald-400/70 mb-1.5 flex items-center gap-1">
                        <span>Bản V2 (Đã Đàm Phán)</span>
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                        {item.text_v2 ? (
                          <div className={item.status === 'MODIFIED' ? 'text-emerald-200/95 font-medium' : ''}>
                            {item.text_v2}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            (Điều khoản này đã bị loại bỏ khỏi hợp đồng)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resolved Risk & Legal Impact Callout */}
                  {(item.resolved_risk || item.legal_impact) && (
                    <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-cyan-950/20 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      {item.resolved_risk && (
                        <div className="flex items-center gap-1.5 text-emerald-300">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span><strong className="font-bold">Đã loại trừ:</strong> {item.resolved_risk}</span>
                        </div>
                      )}
                      {item.legal_impact && (
                        <div className="flex items-center gap-1.5 text-cyan-300/90 font-mono text-[11px]">
                          <Scale className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{item.legal_impact}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Không có điều khoản nào phù hợp với bộ lọc "{statusFilter}".
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
