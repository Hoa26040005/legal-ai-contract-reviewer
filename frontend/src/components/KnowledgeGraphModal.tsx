'use client';

import React, { useState } from 'react';
import { X, Network, FileText, AlertTriangle, Scale, Shield, Layers } from 'lucide-react';
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

  if (!isOpen || !graphData) return null;

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'Contract':
        return 'bg-blue-600 border-blue-400 text-white shadow-blue-500/30';
      case 'Clause':
        return 'bg-slate-800 border-slate-600 text-slate-200 shadow-slate-900/40';
      case 'Risk':
        return 'bg-rose-900/80 border-rose-500 text-rose-200 shadow-rose-500/20';
      case 'Law':
        return 'bg-indigo-900/80 border-indigo-400 text-indigo-200 shadow-indigo-500/20';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'Contract':
        return <FileText className="w-4 h-4" />;
      case 'Clause':
        return <Layers className="w-4 h-4 text-blue-400" />;
      case 'Risk':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'Law':
        return <Scale className="w-4 h-4 text-indigo-400" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-legal-900 border border-legal-700 w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-legal-800 flex items-center justify-between bg-legal-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Graph-RAG Knowledge Graph Visualizer</h3>
              <p className="text-xs text-slate-400">
                Đồ thị tri thức liên kết: Hợp Đồng ➔ Điều Khoản ➔ Rủi Ro ➔ Căn Cứ Pháp Luật (Neo4j Schema)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-legal-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Graph Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-legal-950 relative">
          {/* Main Visualizer Canvas / Grid */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar relative">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-legal-900/80 border border-legal-800 text-xs">
              <span className="text-slate-400 font-semibold">Phân loại Node:</span>
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-3 h-3 rounded-full bg-blue-500" /> Hợp Đồng
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-slate-600" /> Điều Khoản
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-3 rounded-full bg-rose-500" /> Rủi Ro (Risk)
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-3 h-3 rounded-full bg-indigo-500" /> Căn Cứ Luật (Statute)
              </div>
            </div>

            {/* Nodes Layout by Category */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Column 1: Contract */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Hợp Đồng
                </h4>
                {graphData.nodes.filter((n) => n.type === 'Contract').map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-bold shadow-lg transition-all ${getNodeColor(node.type)} ${
                      selectedNode?.id === node.id ? 'ring-2 ring-white scale-105' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getNodeIcon(node.type)}
                      <span className="truncate">{node.label}</span>
                    </div>
                    <span className="text-[10px] text-blue-200 font-normal">Root Entity</span>
                  </button>
                ))}
              </div>

              {/* Column 2: Clauses */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Điều Khoản ({graphData.nodes.filter((n) => n.type === 'Clause').length})
                </h4>
                {graphData.nodes.filter((n) => n.type === 'Clause').map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium shadow-md transition-all ${getNodeColor(node.type)} ${
                      selectedNode?.id === node.id ? 'ring-2 ring-blue-400 scale-105' : 'hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getNodeIcon(node.type)}
                      <span className="truncate">{node.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Column 3: Risks */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Rủi Ro Phát Hiện
                </h4>
                {graphData.nodes.filter((n) => n.type === 'Risk').map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs font-semibold shadow-md transition-all ${getNodeColor(node.type)} ${
                      selectedNode?.id === node.id ? 'ring-2 ring-rose-400 scale-105' : 'hover:border-rose-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getNodeIcon(node.type)}
                      <span className="truncate">{node.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Column 4: Laws */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> Căn Cứ Luật
                </h4>
                {graphData.nodes.filter((n) => n.type === 'Law').map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium shadow-md transition-all ${getNodeColor(node.type)} ${
                      selectedNode?.id === node.id ? 'ring-2 ring-indigo-400 scale-105' : 'hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getNodeIcon(node.type)}
                      <span className="truncate">{node.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Node Inspector Side Details */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-legal-800 bg-legal-900 p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Node Properties (Cypher Explorer)
              </h4>
              {selectedNode ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-legal-950 border border-legal-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Entity Type</span>
                    <p className="text-sm font-bold text-white mt-0.5">{selectedNode.type}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-legal-950 border border-legal-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Label / Content</span>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">{selectedNode.label}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-legal-950 border border-legal-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Node ID</span>
                    <p className="text-xs font-mono text-indigo-400 mt-0.5">{selectedNode.id}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Nhấp vào một Node bất kỳ trên đồ thị để xem chi tiết thuộc tính quan hệ Cypher.
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300">
              💡 <strong>Neo4j Cypher Traversal</strong>: Hệ thống kết hợp đồ thị quan hệ để rà soát xung đột điều khoản và vi phạm luật định một cách chính xác.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
