'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, FolderArchive, FileText, Search, Download, Trash2, ExternalLink,
  CheckCircle2, AlertTriangle, AlertOctagon, Folder, HardDrive, Filter,
  FileCheck, FileSignature, ShieldCheck, RefreshCw
} from 'lucide-react';
import { ArchiveContractItem } from '../types/contract';
import { fetchArchiveContracts, deleteArchiveContract, downloadContractDocx, downloadContractAnnex } from '../lib/api';

interface ContractArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContract: (contractId: string) => void;
}

export const ContractArchiveModal: React.FC<ContractArchiveModalProps> = ({
  isOpen,
  onClose,
  onSelectContract,
}) => {
  const [items, setItems] = useState<ArchiveContractItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  useEffect(() => {
    if (isOpen) {
      loadArchive();
    }
  }, [isOpen]);

  const loadArchive = async () => {
    setLoading(true);
    try {
      const data = await fetchArchiveContracts();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contractId: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa hồ sơ "${title}" khỏi Tủ Hồ Sơ không?`)) {
      await deleteArchiveContract(contractId);
      setItems(prev => prev.filter(i => i.contract_id !== contractId));
    }
  };

  const categories = ['Tất cả', 'Lao động & Nhân sự', 'Mua bán & Thương mại', 'Dịch vụ CNTT', 'Bảo mật NDA'];

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchCat = selectedCategory === 'Tất cả' || item.category === selectedCategory;
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contract_type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // Quick stats
  const totalKb = useMemo(() => items.reduce((sum, i) => sum + i.file_size_kb, 0), [items]);
  const safeCount = useMemo(() => items.filter(i => i.status_label === 'AN TOÀN').length, [items]);
  const riskCount = useMemo(() => items.filter(i => i.status_label !== 'AN TOÀN').length, [items]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-950/95 border border-amber-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* 1. Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-950/20 via-slate-950 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <FolderArchive className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Tủ Hồ Sơ Hợp Đồng & Quản Lý Kho Tài Liệu
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                  Central Document Repository
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lưu trữ tập trung file PDF/Ảnh gốc, bản Word Track Changes và Phụ lục sửa đổi bổ sung của toàn doanh nghiệp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Top Storage Metric Cards */}
        <div className="px-6 py-3.5 bg-slate-900/40 border-b border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
            <Folder className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Tổng Số Hồ Sơ</span>
              <span className="font-extrabold text-white font-mono">{items.length} Hợp đồng</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Hợp Đồng An Toàn</span>
              <span className="font-extrabold text-emerald-400 font-mono">{safeCount} Hồ sơ</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Cần Sửa Đổi / Đàm Phán</span>
              <span className="font-extrabold text-rose-400 font-mono">{riskCount} Hồ sơ</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
            <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Dung Lượng Đã Dùng</span>
              <span className="font-extrabold text-amber-300 font-mono">{(totalKb / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        </div>

        {/* 3. Main Workspace: Categories Sidebar + Files Table */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Category Sidebar */}
          <div className="w-full md:w-64 border-r border-white/10 p-4 bg-slate-900/30 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold px-2 block mb-2">
                Thư Mục Phòng Ban
              </span>
              {categories.map((cat) => {
                const count = cat === 'Tất cả'
                  ? items.length
                  : items.filter(i => i.category === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{cat}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-400 space-y-1 mt-4">
              <span className="font-bold text-slate-300 block">Lưu trữ tự động:</span>
              <p className="text-[10px] leading-relaxed">
                Mọi tệp hợp đồng tải lên hoặc biên soạn phụ lục sẽ được tự động đồng bộ vào Tủ Hồ Sơ.
              </p>
            </div>
          </div>

          {/* Right Document Bundle Table */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/60 p-5">
            {/* Search Header */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hợp đồng, loại hình hoặc tên tệp gốc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-amber-500/60 outline-none transition-all"
                />
              </div>
              <button
                onClick={loadArchive}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                title="Làm mới danh sách"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Document Cards List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredItems.map((item) => (
                <div
                  key={item.contract_id}
                  className="p-4 rounded-xl bg-slate-900/50 border border-white/10 hover:border-white/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-cyan-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xs font-bold text-white tracking-tight">
                          {item.title}
                        </h3>
                        {/* Status badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold ${
                            item.status_label === 'AN TOÀN'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : item.status_label === 'ĐANG ĐÀM PHÁN'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 glow-rose'
                          }`}
                        >
                          {item.status_label} ({item.overall_score}/100)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Tệp: <strong className="text-slate-300 font-mono">{item.original_filename}</strong></span>
                        <span>•</span>
                        <span>{item.file_size_kb} KB</span>
                        <span>•</span>
                        <span>{item.total_clauses} Điều khoản</span>
                        <span>•</span>
                        <span>Lưu lúc: {item.created_at}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    {/* Open in Workspace */}
                    <button
                      onClick={() => {
                        onSelectContract(item.contract_id);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 text-xs font-semibold transition-all hover:glow-cyan"
                      title="Mở hợp đồng trong bảng soi điều khoản"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Mở Soi HĐ</span>
                    </button>

                    {/* Download Word Track Changes */}
                    {item.has_docx && (
                      <button
                        onClick={() => downloadContractDocx(item.contract_id, item.title)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all shadow-sm"
                        title="Tải về file Word (.docx) chứa gạch đỏ xóa bỏ và chữ xanh sửa đổi"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Tải Word</span>
                      </button>
                    )}

                    {/* Download Annex */}
                    {item.has_annex && (
                      <button
                        onClick={() => downloadContractAnnex(item.contract_id, item.title)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-semibold transition-all hover:glow-green shadow-sm"
                        title="Tải về Phụ Lục Sửa Đổi Hợp Đồng (.docx)"
                      >
                        <FileSignature className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Phụ Lục</span>
                      </button>
                    )}

                    {/* Delete item */}
                    <button
                      onClick={() => handleDelete(item.contract_id, item.title)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all"
                      title="Xóa hồ sơ khỏi kho"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="py-16 text-center text-slate-500 text-xs">
                  <FolderArchive className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p>Không tìm thấy hồ sơ nào phù hợp với bộ lọc hiện tại.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
