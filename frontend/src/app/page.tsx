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
import { fetchSampleContracts, fetchContractReport, downloadContractDocx } from '../lib/api';
import { ContractAnalysisReport, ContractSummaryItem, RiskLevel } from '../types/contract';
import { Loader2, AlertCircle, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

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

    // Smooth scroll to risk card if exists
    const riskCardEl = document.getElementById(`risk-card-${clauseId}`);
    if (riskCardEl) {
      riskCardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Smooth scroll to PDF clause element
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

    // Add to samples dropdown list for easy switching
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

  // 5. Export Report
  const handleExportReport = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LegalAI_Report_${report.contract_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 6. Export Word Track Changes (.docx)
  const handleExportDocx = () => {
    if (!report) return;
    downloadContractDocx(report.contract_id, report.contract_title);
  };

  if (loading && !report) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center text-slate-300">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        </div>
        <p className="text-sm font-bold text-white">Đang tải và đồng bộ dữ liệu Graph-RAG...</p>
        <p className="text-xs text-slate-500 mt-1">Chuẩn hóa cấu trúc điều khoản & căn cứ luật Việt Nam</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center text-slate-400">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
        <p className="text-sm font-bold text-white">Không thể nạp báo cáo. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-[#060913] overflow-hidden select-none">
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
        onExportReport={handleExportReport}
        onExportDocx={handleExportDocx}
      />

      {/* 2. Executive Summary Callout Banner */}
      <div className="px-6 py-2.5 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-[#060913] border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Tóm Tắt AI
          </span>
          <p className="text-xs text-slate-200 truncate font-medium">
            {report.summary}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2.5 text-[11px] text-slate-400 shrink-0 ml-4 font-mono">
          <span className="text-indigo-300 font-semibold">{report.contract_type}</span>
          <span>•</span>
          <span>{report.total_clauses} Điều khoản</span>
        </div>
      </div>

      {/* 3. Risk Filter KPI Summary Bar */}
      <RiskSummaryCards
        totalClauses={report.total_clauses}
        criticalCount={report.critical_count}
        highCount={report.high_count}
        mediumCount={report.medium_count}
        lowCount={report.low_count}
        selectedFilter={selectedRiskFilter}
        onSelectFilter={setSelectedRiskFilter}
      />

      {/* 4. Split-Screen Precision Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left: Interactive PDF Document Viewer with risk bounding box highlights */}
        <PDFViewer
          clauses={report.clauses}
          risks={report.risks}
          selectedClauseId={selectedClauseId}
          searchQuery={searchQuery}
          onSelectClause={handleSelectClause}
        />

        {/* Right: Risk Assessment Panel with Tabs (Risks, Redline Diff, AI Copilot) */}
        <RiskPanel
          risks={report.risks}
          selectedRiskFilter={selectedRiskFilter}
          selectedClauseId={selectedClauseId}
          onSelectClause={handleSelectClause}
        />
      </div>

      {/* 5. Modals */}
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
    </main>
  );
}
