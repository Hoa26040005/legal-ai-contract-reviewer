'use client';

import React, { useState } from 'react';
import {
  X, Network, FileText, AlertTriangle, Scale,
  Layers, Terminal, Sparkles, Filter, Database
} from 'lucide-react';
import { KnowledgeGraphData, GraphNode } from '../types/contract';

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
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  if (!isOpen || !graphData) return null;

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-200">
      <div className="bg-[#090e1c] border border-white/10 w-full max-w-6xl h-[88vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-md">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Neo4j Graph-RAG Knowledge Explorer
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  CYPHER ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mạng lưới liên kết đa tầng: Hợp Đồng ➔ Điều Khoản ➔ Rủi Ro ➔ Căn Cứ Pháp Luật Việt Nam
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#060913] relative">
          {/* Main Visualizer Area */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
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
                <span>Cypher Query Inspector</span>
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
                      MATCH (c:Contract)-[:HAS_CLAUSE]-&gt;(cl:Clause)-[:EXHIBITS_RISK]-&gt;(r:Risk)-[:VIOLATES_LAW]-&gt;(l:Law) RETURN *
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
      </div>
    </div>
  );
};
