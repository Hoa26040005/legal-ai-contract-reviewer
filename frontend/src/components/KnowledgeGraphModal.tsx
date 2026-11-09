'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Network, FileText, AlertTriangle, Scale,
  Layers, Terminal, Sparkles, Filter, Play,
  Loader2, CheckCircle2, AlertOctagon, Code, Table, ArrowRight
} from 'lucide-react';
import { KnowledgeGraphData, GraphNode } from '../types/contract';
import { fetchCypherPresets, executeCypherQuery, CypherPreset } from '../lib/api';

interface KnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  graphData?: KnowledgeGraphData;
}

export const KnowledgeGraphModal: React.FC<KnowledgeGraphModalProps> = ({
  isOpen,
  onClose,
  graphData,
}) => {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'cypher'>('visualizer');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Cypher Multi-hop Graph-RAG states
  const [presets, setPresets] = useState<CypherPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cypher_precedent_25');
  const [cypherQuery, setCypherQuery] = useState<string>('');
  const [isRunningQuery, setIsRunningQuery] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCypherPresets().then((loaded) => {
        setPresets(loaded);
        if (loaded.length > 0) {
          const first = loaded[0];
          setSelectedPresetId(first.id);
          setCypherQuery(first.query);
          setIsRunningQuery(true);
          executeCypherQuery(first.query)
            .then((res) => setQueryResult(res))
            .catch((err) => console.error(err))
            .finally(() => setIsRunningQuery(false));
        }
      });
    }
  }, [isOpen]);

  if (!isOpen || !graphData) return null;

  const handleSelectPreset = (preset: CypherPreset) => {
    setSelectedPresetId(preset.id);
    setCypherQuery(preset.query);
    setIsRunningQuery(true);
    executeCypherQuery(preset.query)
      .then((res) => setQueryResult(res))
      .catch((err) => console.error(err))
      .finally(() => setIsRunningQuery(false));
  };

  const handleRunCypher = async () => {
    const q = cypherQuery.trim();
    if (!q) return;
    setIsRunningQuery(true);
    try {
      const res = await executeCypherQuery(q);
      setQueryResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningQuery(false);
    }
  };

  const filteredNodes = graphData.nodes.filter((n) => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  const getNodeBadgeClass = (type: string) => {
    switch (type) {
      case 'Contract':
        return 'bg-blue-600/30 border-blue-400 text-blue-300 shadow-blue-500/20';
      case 'Clause':
        return 'bg-slate-800/80 border-slate-600 text-slate-200';
      case 'Risk':
        return 'bg-rose-950/70 border-rose-500 text-rose-300 shadow-rose-500/30 glow-rose';
      case 'Law':
        return 'bg-indigo-950/70 border-indigo-400 text-indigo-300 shadow-indigo-500/20';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      <div className="bg-[#090e1c] border border-white/10 w-full max-w-6xl h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header with Segmented Tab Navigation */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-md">
              <Network className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Neo4j Graph-RAG Knowledge Explorer
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  BOLT DRIVER & CYPHER
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Đồ thị tri thức pháp lý: Contract ➔ Clause ➔ Risk ➔ Statute / Precedent
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
              <button
                onClick={() => setActiveTab('visualizer')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'visualizer'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sơ Đồ Đồ Thị</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('cypher');
                  if (!queryResult) handleRunCypher();
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'cypher'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-300" />
                <span>Truy Vấn Cypher Đa Bậc</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Tab 1 (Visualizer) */}
        {activeTab === 'visualizer' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#060913] relative">
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lọc Phân Loại Node:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {['ALL', 'Contract', 'Clause', 'Risk', 'Law'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                        filterType === t
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {t === 'ALL' ? 'Tất Cả' : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entity Nodes Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Column 1: Contract */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                    <FileText className="w-3.5 h-3.5" /> Hợp Đồng Gốc
                  </div>
                  {filteredNodes.filter((n) => n.type === 'Contract').map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${getNodeBadgeClass(node.type)} ${
                        selectedNode?.id === node.id ? 'ring-2 ring-white scale-105' : 'hover:scale-[1.02]'
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">{node.label}</div>
                      <span className="text-[10px] text-blue-200">Root Node</span>
                    </div>
                  ))}
                </div>

                {/* Column 2: Clauses */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Layers className="w-3.5 h-3.5" /> Điều Khoản ({filteredNodes.filter((n) => n.type === 'Clause').length})
                  </div>
                  {filteredNodes.filter((n) => n.type === 'Clause').map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${getNodeBadgeClass(node.type)} ${
                        selectedNode?.id === node.id ? 'ring-2 ring-cyan-400 scale-105' : 'hover:border-slate-400'
                      }`}
                    >
                      <div className="font-semibold text-xs truncate">{node.label}</div>
                    </div>
                  ))}
                </div>

                {/* Column 3: Risks */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" /> Rủi Ro Pháp Lý
                  </div>
                  {filteredNodes.filter((n) => n.type === 'Risk').map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${getNodeBadgeClass(node.type)} ${
                        selectedNode?.id === node.id ? 'ring-2 ring-rose-400 scale-105' : 'hover:border-rose-400'
                      }`}
                    >
                      <div className="font-bold text-xs">{node.label}</div>
                    </div>
                  ))}
                </div>

                {/* Column 4: Laws */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                    <Scale className="w-3.5 h-3.5" /> Căn Cứ Luật Định
                  </div>
                  {filteredNodes.filter((n) => n.type === 'Law').map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${getNodeBadgeClass(node.type)} ${
                        selectedNode?.id === node.id ? 'ring-2 ring-indigo-400 scale-105' : 'hover:border-indigo-400'
                      }`}
                    >
                      <div className="font-semibold text-xs leading-relaxed">{node.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Cypher Inspector */}
            <div className="w-full lg:w-88 border-t lg:border-t-0 lg:border-l border-white/[0.08] bg-slate-950/90 p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Cypher Pattern Inspector</span>
                </div>

                {selectedNode ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.08]">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Node Label</span>
                      <p className="text-sm font-extrabold text-white mt-0.5">{selectedNode.label}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.08]">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Entity Type</span>
                      <p className="text-xs font-mono text-cyan-400 mt-0.5">:{selectedNode.type}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.08]">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Cypher Pattern</span>
                      <p className="text-xs font-mono text-emerald-400 mt-1">
                        MATCH (c:Contract)-[:HAS_CLAUSE]-&gt;(cl:Clause)-[:DETECTED_RISK]-&gt;(r:Risk)-[:VIOLATES_LAW]-&gt;(l:Law) RETURN *
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-slate-500 text-xs">
                    Nhấp vào một Node bất kỳ trên đồ thị để kiểm tra các thuộc tính và truy vấn Cypher liên quan.
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 text-xs text-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-400 mb-1" />
                <strong>Graph-RAG Traversal</strong>: Truy xuất lai (Hybrid Vector + Graph) giúp bắt trọn các mối quan hệ ẩn giữa nhiều điều khoản tham chiếu chéo trong hợp đồng.
              </div>
            </div>
          </div>
        )}

        {/* Modal Body: Tab 2 (Multi-hop Cypher Query Console) */}
        {activeTab === 'cypher' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#060913] p-5 sm:p-6 space-y-5 custom-scrollbar overflow-y-auto">
            {/* 1. Curated Presets Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Mẫu Truy Vấn Cypher Đa Bậc Nạp Sẵn:
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                  {presets.length} Presets Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 ${
                      selectedPresetId === p.id
                        ? 'bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-1 line-clamp-1">{p.title}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{p.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Cypher Code Editor Area */}
            <div className="rounded-2xl border border-white/[0.1] bg-[#040711] overflow-hidden shadow-xl">
              <div className="px-4 py-2.5 bg-slate-950/80 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CYPHER QUERY EDITOR (Neo4j Bolt)</span>
                </div>

                <button
                  onClick={handleRunCypher}
                  disabled={isRunningQuery}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-cyan-600/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isRunningQuery ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang Thực Thi...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Chạy Truy Vấn (Run Cypher)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4">
                <textarea
                  value={cypherQuery}
                  onChange={(e) => setCypherQuery(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent font-mono text-xs text-cyan-300 leading-relaxed outline-none resize-none selection:bg-cyan-500/30"
                  placeholder="MATCH (c:Contract)-[:HAS_CLAUSE]->(cl:Clause)..."
                />
              </div>
            </div>

            {/* 3. Query Execution Results */}
            <div className="flex-1 rounded-2xl border border-white/[0.08] bg-[#070b18] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Kết Quả Đồ Thị Tri Thức</span>
                  {queryResult && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {queryResult.count || queryResult.data?.length || 0} Kết quả
                    </span>
                  )}
                </div>

                {queryResult && (
                  <span className="text-[10px] font-mono text-slate-400">
                    Engine: <strong className="text-cyan-400">{queryResult.engine}</strong>
                  </span>
                )}
              </div>

              {/* Data Table */}
              {queryResult?.data && queryResult.data.length > 0 ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-slate-400 font-mono text-[11px]">
                        <th className="py-2.5 px-3">Hợp Đồng</th>
                        <th className="py-2.5 px-3">Điều Khoản</th>
                        <th className="py-2.5 px-3">Hành Vi / Rủi Ro</th>
                        <th className="py-2.5 px-3">Mức Độ</th>
                        <th className="py-2.5 px-3">Cơ Sở Pháp Lý / Án Lệ</th>
                        <th className="py-2.5 px-3">Phương Án Sửa Đổi (Redline)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {queryResult.data.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3 font-semibold text-white">
                            {row.contract_title || row.contract || 'Hợp Đồng Đang Rà Soát'}
                          </td>
                          <td className="py-3 px-3 font-mono text-cyan-300 font-bold">
                            {row.clause || row.clause_number || `Điều ${idx + 1}`}
                          </td>
                          <td className="py-3 px-3 text-slate-200">
                            {row.violation || row.risk_title || row.critical_risk || row.issue || 'Vi phạm điều cấm'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              (row.risk_level || row.level) === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {row.risk_level || row.level || 'HIGH'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-indigo-300 font-medium">
                            {row.legal_source || row.legal_basis || row.basis || 'Luật Việt Nam & Án lệ TANDTC'}
                          </td>
                          <td className="py-3 px-3 text-emerald-300 text-[11px] leading-relaxed max-w-xs">
                            {row.suggested_redline || row.redline || row.suggestion || 'Đề xuất tuân thủ mức trần luật định.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Terminal className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">Bấm nút &quot;Chạy Truy Vấn (Run Cypher)&quot; để thực thi câu lệnh trên Đồ thị Tri thức Neo4j</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraphModal;
