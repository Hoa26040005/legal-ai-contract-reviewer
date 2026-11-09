'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RiskSummaryCards } from '../components/RiskSummaryCards';
import { PDFViewer } from '../components/PDFViewer';
import { RiskPanel } from '../components/RiskPanel';
import { KnowledgeGraphModal } from '../components/KnowledgeGraphModal';
import { UploadModal } from '../components/UploadModal';
import { VersionDiffModal } from '../components/VersionDiffModal';
import { ContractAnnexModal } from '../components/ContractAnnexModal';
import { LitigationPredictionModal } from '../components/LitigationPredictionModal';
import { ContractArchiveModal } from '../components/ContractArchiveModal';
import { LegalLibraryModal } from '../components/LegalLibraryModal';
import { SystemArchitectureModal } from '../components/SystemArchitectureModal';
import { fetchSampleContracts, fetchContractReport, downloadContractDocx } from '../lib/api';
import { ContractAnalysisReport, ContractSummaryItem, RiskLevel } from '../types/contract';
import { AlertCircle, Cpu, Network, Download, CheckCircle2, Terminal } from 'lucide-react';

export default function Home() {
  const [samples, setSamples] = useState<ContractSummaryItem[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>('sample_it_service');
  const [report, setReport] = useState<ContractAnalysisReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search & Interactivity states
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isGraphOpen, setIsGraphOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isDiffOpen, setIsDiffOpen] = useState<boolean>(false);
  const [isAnnexOpen, setIsAnnexOpen] = useState<boolean>(false);
  const [isLitigationOpen, setIsLitigationOpen] = useState<boolean>(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [isLegalLibraryOpen, setIsLegalLibraryOpen] = useState<boolean>(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);

  // 1. Initial Load: Fetch sample list and first contract
  useEffect(() => {
    async function init() {
      setLoading(true);
      const sampleList = await fetchSampleContracts();
      setSamples(sampleList);

      const initialId = sampleList[0]?.id || 'sample_it_service';
      setSelectedContractId(initialId);

      const initialReport = await fetchContractReport(initialId);
      setReport(initialReport);
      setLoading(false);
    }
    init();
  }, []);

  // Global Escape key handler to close any open modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsGraphOpen(false);
        setIsUploadOpen(false);
        setIsDiffOpen(false);
        setIsAnnexOpen(false);
        setIsLitigationOpen(false);
        setIsArchiveOpen(false);
        setIsLegalLibraryOpen(false);
        setIsArchitectureOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // 2. Switch Contract
  const handleSelectContract = async (contractId: string) => {
    setSelectedContractId(contractId);
    setLoading(true);
    setSelectedClauseId(null);
    setSelectedRiskFilter('ALL');

    const newReport = await fetchContractReport(contractId);
    setReport(newReport);
    setLoading(false);
  };

  // 3. Clause Click & Scroll Sync
  const handleSelectClause = (clauseId: string) => {
    setSelectedClauseId(clauseId);

    const riskCardEl = document.getElementById(`risk-card-${clauseId}`);
    if (riskCardEl) {
      riskCardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const pdfClauseEl = document.getElementById(`pdf-clause-${clauseId}`);
    if (pdfClauseEl) {
      pdfClauseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // 4. Handle new uploaded report
  const handleUploadSuccess = (newReport: ContractAnalysisReport) => {
    setReport(newReport);
    setSelectedContractId(newReport.contract_id);
    setSelectedClauseId(null);
    setSelectedRiskFilter('ALL');

    setSamples((prev) => [
      {
        id: newReport.contract_id,
        title: newReport.contract_title,
        contract_type: newReport.contract_type,
        page_count: Math.max(...newReport.clauses.map((c) => c.page_number), 1),
        created_at: new Date().toISOString().split('T')[0],
        score: newReport.overall_score,
        status: 'ready',
      },
      ...prev,
    ]);
  };

  // 5. Export Report JSON
  const handleExportReport = () => {
    if (!report) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `LegalAI_Report_${report.contract_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 6. Export Word Track Changes (.docx)
  const handleExportDocx = () => {
    if (!report) return;
    downloadContractDocx(report.contract_id, report.contract_title);
  };

  // Skeletal Layout Loader (Taste-Skill Section 4.5: Match final layout shape, no generic circular spinner)
  if (loading && !report) {
    return (
      <div
        className="min-h-[100dvh] bg-[#04070e] flex flex-col overflow-hidden select-none"
        aria-busy="true"
        aria-label="Đang nạp báo cáo thẩm định hợp đồng"
      >
        <div className="film-grain-overlay" aria-hidden="true" />
        {/* Skeleton Header */}
        <div className="h-14 border-b border-white/[0.075] px-6 flex items-center justify-between bg-[#050912]">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] animate-pulse" />
            <div className="w-48 h-5 rounded-lg bg-white/[0.05] animate-pulse" />
          </div>
          <div className="w-64 h-8 rounded-xl bg-white/[0.04] animate-pulse hidden md:block" />
          <div className="flex items-center gap-2">
            <div className="w-24 h-8 rounded-full bg-white/[0.05] animate-pulse" />
            <div className="w-32 h-8 rounded-full bg-cyan-500/20 animate-pulse" />
          </div>
        </div>

        {/* Skeleton Bento Bar */}
        <div className="px-6 py-3 border-b border-white/[0.075] grid grid-cols-1 xl:grid-cols-12 gap-3 bg-[#050811]">
          <div className="xl:col-span-3 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
          <div className="xl:col-span-6 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
          <div className="xl:col-span-3 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
        </div>

        {/* Skeleton Split-Screen Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 p-8 flex flex-col items-center justify-center bg-architectural-grid">
            <div className="w-full max-w-2xl h-[620px] rounded-2xl bg-white/[0.025] border border-white/[0.07] p-8 space-y-5">
              <div className="w-1/2 h-4 mx-auto rounded bg-white/[0.06] animate-pulse" />
              <div className="w-1/3 h-3 mx-auto rounded bg-white/[0.04] animate-pulse" />
              <div className="pt-6 space-y-4">
                <div className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
                <div className="h-28 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 animate-pulse" />
                <div className="h-24 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 animate-pulse" />
                <div className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[500px] border-l border-white/[0.075] p-4 space-y-4 bg-[#050811]">
            <div className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="h-44 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
            <div className="h-44 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[100dvh] bg-[#04070e] flex flex-col items-center justify-center text-slate-400 p-6">
        <div className="double-bezel max-w-md w-full">
          <div className="double-bezel-inner p-6 text-center space-y-3">
            <AlertCircle strokeWidth={1.75} className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-white">Không thể nạp báo cáo hợp đồng</p>
            <p className="text-xs text-slate-400">
              Vui lòng kiểm tra kết nối máy chủ hoặc tải lại trang để khởi tạo dữ liệu mẫu.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-full bg-cyan-500 text-slate-950 text-xs font-extrabold"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="h-[100dvh] flex flex-col bg-[#04070e] overflow-hidden select-none relative">
      {/* Fixed GPU-Safe Film Grain Texture Overlay */}
      <div className="film-grain-overlay" aria-hidden="true" />

      {/* 1. Global Navigation Header */}
      <Header
        currentTitle={report.contract_title}
        score={report.overall_score}
        sampleContracts={samples}
        selectedContractId={selectedContractId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectContract={handleSelectContract}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenGraph={() => setIsGraphOpen(true)}
        onOpenDiff={() => setIsDiffOpen(true)}
        onOpenAnnex={() => setIsAnnexOpen(true)}
        onOpenLitigation={() => setIsLitigationOpen(true)}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenLegalLibrary={() => setIsLegalLibraryOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onExportReport={handleExportReport}
        onExportDocx={handleExportDocx}
      />

      {/* 2. Executive Intelligence Bento Bar */}
      <RiskSummaryCards
        score={report.overall_score}
        summary={report.summary}
        contractType={report.contract_type}
        totalClauses={report.total_clauses}
        criticalCount={report.critical_count}
        highCount={report.high_count}
        mediumCount={report.medium_count}
        lowCount={report.low_count}
        selectedFilter={selectedRiskFilter}
        onSelectFilter={setSelectedRiskFilter}
        onOpenGraph={() => setIsGraphOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* 3. Split-Screen Precision Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <PDFViewer
          clauses={report.clauses}
          risks={report.risks}
          selectedClauseId={selectedClauseId}
          searchQuery={searchQuery}
          onSelectClause={handleSelectClause}
        />

        <RiskPanel
          risks={report.risks}
          selectedRiskFilter={selectedRiskFilter}
          selectedClauseId={selectedClauseId}
          onSelectClause={handleSelectClause}
        />
      </div>

      {/* 4. System Telemetry & Recruiter Quick-Access Footer Bar */}
      <footer className="h-7 bg-[#03060c] border-t border-white/[0.075] px-4 sm:px-6 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0 tabular-nums z-30">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ENGINE: HYBRID GRAPH-RAG v2.4
          </span>
          <span className="text-white/15">|</span>
          <span className="hidden sm:inline shrink-0">
            CORPUS: <strong className="text-slate-200">30+ Điều Luật &amp; 06 Án Lệ TANDTC</strong>
          </span>
          <span className="text-white/15 hidden md:inline">|</span>
          <span className="hidden md:flex items-center gap-1 text-cyan-300 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>QA &amp; SECURITY AUDIT: 10 MODULES • 37/37 PASSED</span>
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsArchitectureOpen(true)}
            className="flex items-center gap-1 text-cyan-300 hover:text-white transition-colors font-bold"
          >
            <Cpu className="w-3 h-3" />
            <span>Hồ Sơ Kiến Trúc (Recruiter Spec)</span>
          </button>
          <span className="text-white/15">|</span>
          <button
            onClick={() => setIsGraphOpen(true)}
            className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <Network className="w-3 h-3 text-cyan-400" />
            <span>Neo4j Cypher</span>
          </button>
          <span className="text-white/15 hidden sm:inline">|</span>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            title="Tải báo cáo dữ liệu thô định dạng JSON"
          >
            <Download className="w-3 h-3" />
            <span>Export JSON</span>
          </button>
        </div>
      </footer>

      {/* 5. Modals */}
      <SystemArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
        onOpenGraph={() => setIsGraphOpen(true)}
        onOpenDiff={() => setIsDiffOpen(true)}
        onOpenLitigation={() => setIsLitigationOpen(true)}
      />

      <KnowledgeGraphModal
        isOpen={isGraphOpen}
        onClose={() => setIsGraphOpen(false)}
        graphData={report.graph_data}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <VersionDiffModal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
      />

      <ContractAnnexModal
        isOpen={isAnnexOpen}
        onClose={() => setIsAnnexOpen(false)}
        report={report}
      />

      <LitigationPredictionModal
        isOpen={isLitigationOpen}
        onClose={() => setIsLitigationOpen(false)}
        report={report}
      />

      <ContractArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onSelectContract={handleSelectContract}
      />

      <LegalLibraryModal
        isOpen={isLegalLibraryOpen}
        onClose={() => setIsLegalLibraryOpen(false)}
      />
    </main>
  );
}
