'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, BookOpen, Plus, Upload, Search, Trash2, Edit3, ShieldAlert,
  FileText, CheckCircle2, AlertTriangle, RefreshCw, Layers, Database,
  Sparkles, Globe, DownloadCloud, Check, Zap, ArrowRight, ExternalLink
} from 'lucide-react';
import { 
  LegalRuleItem, LegalRuleCreate, LegalRuleUpdate, 
  LegalLibraryStats, StatuteUploadResponse, NationalStatuteItem 
} from '@/types/contract';
import { 
  fetchLaws, fetchLawStats, createLaw, 
  updateLaw, deleteLaw, uploadStatuteDocument,
  fetchNationalCatalog, autoIngestStatute
} from '@/lib/api';

interface LegalLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Tất cả',
  'Lao động',
  'Thương mại',
  'Dân sự',
  'Đất đai & BĐS',
  'Sở hữu trí tuệ',
  'Công nghệ & Dữ liệu'
];

export function LegalLibraryModal({ isOpen, onClose }: LegalLibraryModalProps) {
  // Tabs: 'RULES' | 'AUTO_INGEST'
  const [activeTab, setActiveTab] = useState<'RULES' | 'AUTO_INGEST'>('RULES');

  const [rules, setRules] = useState<LegalRuleItem[]>([]);
  const [stats, setStats] = useState<LegalLibraryStats | null>(null);
  const [nationalCatalog, setNationalCatalog] = useState<NationalStatuteItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoSearchQuery, setAutoSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAutoIngesting, setIsAutoIngesting] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sub-modal states
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<LegalRuleItem | null>(null);

  // Form states for Add/Edit
  const [formCode, setFormCode] = useState('');
  const [formLaw, setFormLaw] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formRule, setFormRule] = useState('');
  const [formCategory, setFormCategory] = useState('Lao động');
  const [formKeywords, setFormKeywords] = useState('');
  const [formRiskLevel, setFormRiskLevel] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [formSource, setFormSource] = useState('');

  // Form states for Statute Ingestion
  const [statuteFile, setStatuteFile] = useState<File | null>(null);
  const [statuteTitle, setStatuteTitle] = useState('');
  const [statuteCategory, setStatuteCategory] = useState('Đất đai & BĐS');
  const [isUploadingStatute, setIsUploadingStatute] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, selectedCategory]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [lawsData, statsData, catalogData] = await Promise.all([
        fetchLaws(selectedCategory, searchQuery),
        fetchLawStats(),
        fetchNationalCatalog()
      ]);
      setRules(lawsData);
      setStats(statsData);
      setNationalCatalog(catalogData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await fetchLaws(selectedCategory, searchQuery);
      setRules(data);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-Ingest Handler
  const handleTriggerAutoIngest = async (statuteId?: string, query?: string) => {
    const key = statuteId || query || 'SEARCH';
    setIsAutoIngesting(key);
    try {
      const res = await autoIngestStatute({
        statute_id: statuteId,
        search_query: query
      });
      showMessage('success', res.message);
      await loadData();
      if (query) setAutoSearchQuery('');
    } catch (err: any) {
      showMessage('error', err.message || 'Lỗi khi tự động nạp văn bản');
    } finally {
      setIsAutoIngesting(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingRule(null);
    setFormCode(`RULE_${Date.now().toString().slice(-6)}`);
    setFormLaw('');
    setFormTopic('');
    setFormRule('');
    setFormCategory('Lao động');
    setFormKeywords('');
    setFormRiskLevel('HIGH');
    setFormSource('Quy chuẩn pháp lý Việt Nam');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (rule: LegalRuleItem) => {
    setEditingRule(rule);
    setFormCode(rule.code);
    setFormLaw(rule.law);
    setFormTopic(rule.topic);
    setFormRule(rule.rule);
    setFormCategory(rule.category);
    setFormKeywords(rule.keywords.join(', '));
    setFormRiskLevel(rule.risk_level);
    setFormSource(rule.statute_source || '');
    setIsAddOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formLaw || !formTopic || !formRule) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    const kwList = formKeywords.split(',').map(k => k.trim()).filter(Boolean);

    try {
      if (editingRule) {
        await updateLaw(editingRule.code, {
          law: formLaw,
          topic: formTopic,
          rule: formRule,
          category: formCategory,
          keywords: kwList,
          risk_level: formRiskLevel
        });
        showMessage('success', `Đã cập nhật thành công điều luật '${editingRule.code}'`);
      } else {
        await createLaw({
          code: formCode,
          law: formLaw,
          topic: formTopic,
          rule: formRule,
          category: formCategory,
          keywords: kwList,
          risk_level: formRiskLevel,
          statute_source: formSource
        });
        showMessage('success', `Đã thêm mới điều luật '${formCode}' vào thư viện`);
      }
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      showMessage('error', err.message || 'Lỗi lưu điều luật');
    }
  };

  const handleDelete = async (code: string, lawName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa điều luật '${lawName}' (${code}) khỏi thư viện không?`)) {
      return;
    }
    try {
      const ok = await deleteLaw(code);
      if (ok) {
        showMessage('success', `Đã xóa điều luật '${code}' khỏi kho dữ liệu.`);
        loadData();
      }
    } catch (err) {
      showMessage('error', 'Không thể xóa điều luật.');
    }
  };

  const handleUploadStatute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statuteFile || !statuteTitle) {
      alert('Vui lòng chọn tệp văn bản và nhập tiêu đề văn bản luật!');
      return;
    }

    setIsUploadingStatute(true);
    try {
      const res = await uploadStatuteDocument(statuteFile, statuteTitle, statuteCategory);
      showMessage('success', res.message);
      setIsUploadOpen(false);
      setStatuteFile(null);
      setStatuteTitle('');
      loadData();
    } catch (err: any) {
      showMessage('error', err.message || 'Lỗi khi tải văn bản');
    } finally {
      setIsUploadingStatute(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#0c121e] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-950/60 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-[#0c121e]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Quản Trị Thư Viện Điều Luật & Nạp Tự Động
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                  RAG Rule Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cơ sở tri thức điều luật động kết hợp tự động tìm kiếm & thu thập văn bản quy phạm pháp luật quốc gia
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toast Message */}
        {actionMessage && (
          <div className={`px-6 py-2.5 flex items-center gap-2 text-sm font-medium border-b ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50' 
              : 'bg-rose-950/80 text-rose-300 border-rose-800/50'
          }`}>
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {actionMessage.text}
          </div>
        )}

        {/* Tab Navigation Switcher */}
        <div className="flex items-center px-6 pt-3 bg-slate-950/40 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('RULES')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'RULES'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Điều Luật Đang Hoạt Động
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {stats?.total_rules ?? rules.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('AUTO_INGEST')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'AUTO_INGEST'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            Tự Động Tìm Kiếm & Nạp Luật (Auto-Ingest)
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/40">
              Mới
            </span>
          </button>
        </div>

        {/* KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 bg-slate-900/50 border-b border-slate-800/80">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Tổng điều luật</div>
              <div className="text-lg font-bold text-white">{stats?.total_rules ?? rules.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Lĩnh vực pháp lý</div>
              <div className="text-lg font-bold text-teal-300">{stats?.total_categories ?? 6}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Kho luật quốc gia</div>
              <div className="text-lg font-bold text-amber-300">{nationalCatalog.length} văn bản</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Tri thức RAG</div>
              <div className="text-[11px] font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sẵn sàng soi chiếu
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: ACTIVE RULES */}
        {activeTab === 'RULES' && (
          <>
            {/* Controls: Search, Tabs, Action Buttons */}
            <div className="p-6 pb-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Search Input */}
                <form onSubmit={handleSearch} className="relative flex-1 min-w-[260px] max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã, tên luật, chủ đề, hoặc từ khóa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </form>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Điều Luật
                  </button>

                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all hover:border-cyan-400 hover:scale-[1.02]"
                  >
                    <Upload className="w-4 h-4" />
                    Tải File Luật (PDF/DOCX)
                  </button>

                  <button
                    onClick={loadData}
                    title="Làm mới dữ liệu"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/60">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content: Legal Rules Table / Cards */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
              {isLoading ? (
                <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                  <span>Đang tải danh mục quy phạm pháp luật...</span>
                </div>
              ) : rules.length === 0 ? (
                <div className="py-16 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">Không tìm thấy điều luật phù hợp</p>
                  <p className="text-xs text-slate-500 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang tab Tự Động Nạp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {rules.map((rule) => (
                    <div 
                      key={rule.code}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
                              {rule.code}
                            </span>
                            <h4 className="text-sm font-bold text-white tracking-tight">
                              {rule.law}
                            </h4>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {rule.category}
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                              rule.risk_level === 'CRITICAL' 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                                : rule.risk_level === 'HIGH'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}>
                              {rule.risk_level === 'CRITICAL' ? 'NGHIÊM TRỌNG' : rule.risk_level === 'HIGH' ? 'RỦI RO CAO' : 'TRUNG BÌNH'}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-cyan-200 mb-1">
                            Chủ đề: {rule.topic}
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                            {rule.rule}
                          </p>

                          {/* Keywords & Statute Source */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="text-slate-500 font-medium">Từ khóa nhận diện:</span>
                            {rule.keywords.map((kw, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                                {kw}
                              </span>
                            ))}
                            {rule.statute_source && (
                              <span className="ml-auto text-slate-500 italic">
                                Nguồn: {rule.statute_source}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(rule)}
                            title="Chỉnh sửa điều luật"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.code, rule.law)}
                            title="Xóa điều luật"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: AUTO-INGEST ENGINE */}
        {activeTab === 'AUTO_INGEST' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Smart Search Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/40 border border-cyan-500/40 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Tìm Kiếm & Thu Thập Văn Bản Quy Phạm Tự Động (AI Auto-Fetch)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Nhập tên luật, số hiệu nghị định hoặc án lệ. Hệ thống sẽ tự động tìm kiếm, kéo toàn văn, bóc tách các Điều/Khoản và nạp vào thư viện tri thức chỉ với 1 click.
              </p>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (autoSearchQuery.trim()) {
                    handleTriggerAutoIngest(undefined, autoSearchQuery.trim());
                  }
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="VD: Luật Giao dịch điện tử 2023, Nghị định 12/2022, Luật Đất đai 2024..."
                    value={autoSearchQuery}
                    onChange={(e) => setAutoSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAutoIngesting === 'SEARCH' || !autoSearchQuery.trim()}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/40 disabled:opacity-50 transition-all"
                >
                  {isAutoIngesting === 'SEARCH' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Đang tìm & nạp...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Tìm & Nạp Tự Động
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* National Statutes Catalog Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Kho Văn Bản Pháp Luật Quốc Gia Sẵn Sàng Nạp (National Legal Hub)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {nationalCatalog.length} Đạo luật & Nghị định trọng điểm
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nationalCatalog.map((statute) => (
                  <div
                    key={statute.id}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {statute.official_number}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Hiệu lực: {statute.effective_date}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                            {statute.title}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {statute.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {statute.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {statute.articles_count} điều khoản quy chuẩn
                      </span>

                      {statute.is_ingested ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          Đã nạp vào kho
                        </div>
                      ) : (
                        <button
                          onClick={() => handleTriggerAutoIngest(statute.id)}
                          disabled={isAutoIngesting === statute.id}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                        >
                          {isAutoIngesting === statute.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Đang bóc tách & nạp...
                            </>
                          ) : (
                            <>
                              <DownloadCloud className="w-3.5 h-3.5" />
                              Nạp Tự Động (1-Click)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-MODAL: Add / Edit Legal Rule */}
        {isAddOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-[#0e1626] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-cyan-400" />
                  {editingRule ? 'Chỉnh Sửa Điều Luật' : 'Thêm Điều Luật Mới Vào Thư Viện'}
                </h3>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRule} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Mã Định Danh (Code)*</label>
                    <input
                      type="text"
                      disabled={!!editingRule}
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 outline-none font-mono"
                      placeholder="VD: BLLD2019_D17_1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Lĩnh Vực Pháp Lý*</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 outline-none"
                    >
                      {CATEGORIES.filter(c => c !== 'Tất cả').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-slate-400 mb-1 font-medium">Tên Điều Luật & Văn Bản Ban Hành*</label>
                    <input
                      type="text"
                      value={formLaw}
                      onChange={(e) => setFormLaw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 outline-none"
                      placeholder="VD: Điều 45, Luật Đất đai 2024"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Mức Độ Rủi Ro*</label>
                    <select
                      value={formRiskLevel}
                      onChange={(e: any) => setFormRiskLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 outline-none"
                    >
                      <option value="CRITICAL">Nghiêm Trọng (Critical)</option>
                      <option value="HIGH">Rủi Ro Cao (High)</option>
                      <option value="MEDIUM">Trung Bình (Medium)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Chủ Đề Rủi Ro / Tiêu Đề Vi Phạm*</label>
                  <input
                    type="text"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 outline-none"
                    placeholder="VD: Cấm chuyển nhượng đất đai khi chưa có Giấy chứng nhận (Sổ đỏ)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Nội Dung Quy Chuẩn Pháp Lý / Điều Cấm*</label>
                  <textarea
                    rows={3}
                    value={formRule}
                    onChange={(e) => setFormRule(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 outline-none resize-none leading-relaxed"
                    placeholder="Nhập nội dung quy phạm điều cấm hoặc nguyên tắc bắt buộc phải tuân thủ..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Từ Khóa Nhận Diện Ngữ Nghĩa (Cách nhau bằng dấu phẩy)*</label>
                  <input
                    type="text"
                    value={formKeywords}
                    onChange={(e) => setFormKeywords(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 outline-none"
                    placeholder="VD: chưa có sổ đỏ, đang tranh chấp đất, giấy tờ tay"
                    required
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Khuyến nghị dùng cụm từ 2 từ trở lên để hệ thống nhận diện chính xác ngữ cảnh rủi ro.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Nguồn Văn Bản Luật / Căn Cứ Ban Hành</label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 outline-none"
                    placeholder="VD: Luật Đất đai số 31/2024/QH15"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-900/40"
                  >
                    {editingRule ? 'Lưu Cập Nhật' : 'Lưu Vào Thư Viện'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUB-MODAL: Ingest Statute Document (PDF/DOCX/TXT) */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-[#0e1626] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan-400" />
                  Nạp Toàn Văn Văn Bản Pháp Quy (Statute Ingestion)
                </h3>
                <button 
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadStatute} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Tên Văn Bản Luật (Ví dụ: Luật Đất đai 2024)*</label>
                  <input
                    type="text"
                    value={statuteTitle}
                    onChange={(e) => setStatuteTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 outline-none"
                    placeholder="VD: Luật Kinh doanh Bất động sản 2023"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Lĩnh Vực Phân Loại*</label>
                  <select
                    value={statuteCategory}
                    onChange={(e) => setStatuteCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    {CATEGORIES.filter(c => c !== 'Tất cả').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Chọn Tệp Văn Bản (PDF / DOCX / TXT)*</label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center cursor-pointer bg-slate-950/40 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => setStatuteFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="statute-file-input"
                    />
                    <label htmlFor="statute-file-input" className="cursor-pointer block">
                      <FileText className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
                      {statuteFile ? (
                        <p className="font-semibold text-cyan-300">{statuteFile.name} ({(statuteFile.size / 1024).toFixed(1)} KB)</p>
                      ) : (
                        <>
                          <p className="font-medium text-slate-300">Kéo thả tệp hoặc nhấp để chọn</p>
                          <p className="text-[11px] text-slate-500 mt-1">Hỗ trợ PDF văn bản, Microsoft Word (.docx), hoặc Text (.txt)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200/90 leading-relaxed">
                  💡 <strong>Cơ chế tự động bóc tách:</strong> Bộ máy NLP sẽ tự động quét định dạng <code>Điều [Số]...</code> trong toàn văn bản, trích xuất tiêu đề, nội dung quy phạm và từ khóa để tự động nạp thành các điều luật vào Thư viện.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingStatute}
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-cyan-900/40 disabled:opacity-50"
                  >
                    {isUploadingStatute ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Đang bóc tách & nạp tri thức...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Bóc Tách & Nạp Tri Thức
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default LegalLibraryModal;
