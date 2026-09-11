'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RiskSummaryCards } from '../components/RiskSummaryCards';
import { PDFViewer } from '../components/PDFViewer';
import { RiskPanel } from '../components/RiskPanel';
import { KnowledgeGraphModal } from '../components/KnowledgeGraphModal';
import { UploadModal } from '../components/UploadModal';
import { fetchSampleContracts, fetchContractReport } from '../lib/api';
import { ContractAnalysisReport, ContractSummaryItem, RiskLevel } from '../types/contract';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [samples, setSamples] = useState<ContractSummaryItem[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>('sample_it_service');
  const [report, setReport] = useState<ContractAnalysisReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Interactivity states
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);

  // Modals
  const [isGraphOpen, setIsGraphOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

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

  if (loading && !report) {
    return (
      <div className="min-h-screen bg-legal-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
        <p className="text-sm font-semibold">Đang nạp dữ liệu rà soát hợp đồng AI...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-legal-950 flex flex-col items-center justify-center text-slate-400">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
        <p className="text-sm font-semibold">Không thể tải báo cáo hợp đồng. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-legal-950 overflow-hidden select-none">
      {/* 1. Global Navigation Header */}
      <Header
        currentTitle={report.contract_title}
        score={report.overall_score}
        sampleContracts={samples}
        selectedContractId={selectedContractId}
        onSelectContract={handleSelectContract}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenGraph={() => setIsGraphOpen(true)}
      />

      {/* 2. Executive Summary Callout */}
      <div className="px-6 py-2.5 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-legal-950 border-b border-legal-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
            Tóm Tắt AI
          </span>
          <p className="text-xs text-slate-300 truncate font-medium">
            {report.summary}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 shrink-0 ml-4 font-mono">
          <span>Loại: {report.contract_type}</span>
          <span>•</span>
          <span>Tổng {report.total_clauses} Điều khoản</span>
        </div>
      </div>

      {/* 3. Risk Filter Summary Cards Bar */}
      <RiskSummaryCards
        totalClauses={report.total_clauses}
        criticalCount={report.critical_count}
        highCount={report.high_count}
        mediumCount={report.medium_count}
        lowCount={report.low_count}
        selectedFilter={selectedRiskFilter}
        onSelectFilter={setSelectedRiskFilter}
      />

      {/* 4. Main Split Screen Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: PDF Document Viewer with risk bounding box overlays */}
        <PDFViewer
          clauses={report.clauses}
          risks={report.risks}
          selectedClauseId={selectedClauseId}
          onSelectClause={handleSelectClause}
        />

        {/* Right Side: Risk Assessment Panel & Redline Recommendations */}
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
    </main>
  );
}
