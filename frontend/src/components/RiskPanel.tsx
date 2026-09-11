'use client';

import React, { useState } from 'react';
import { RiskItem, RiskLevel } from '../types/contract';
import {
  AlertOctagon, AlertTriangle, Info, ShieldCheck,
  Scale, Check, Copy, Sparkles, MessageSquare, Send,
  FileDiff, ShieldAlert, Bot, ArrowRight
} from 'lucide-react';

interface RiskPanelProps {
  risks: RiskItem[];
  selectedRiskFilter: RiskLevel | 'ALL';
  selectedClauseId: string | null;
  onSelectClause: (clauseId: string) => void;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({
  risks,
  selectedRiskFilter,
  selectedClauseId,
  onSelectClause,
}) => {
  const [activeTab, setActiveTab] = useState<'risks' | 'redline' | 'copilot'>('risks');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [acceptedRedlines, setAcceptedRedlines] = useState<Set<string>>(new Set());

  // AI Copilot Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI Pháp lý. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về các điều khoản, rủi ro phạt vi phạm hoặc căn cứ pháp luật Việt Nam trong hợp đồng này.',
      time: 'Vừa xong',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');

  const filteredRisks = risks.filter((r) => {
    if (selectedRiskFilter === 'ALL') return true;
    return r.risk_level === selectedRiskFilter;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleAccept = (id: string) => {
    setAcceptedRedlines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSendMessage = () => {
    if (!inputQuestion.trim()) return;
    const userMsg = inputQuestion.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, time: 'Vừa xong' },
    ]);
    setInputQuestion('');

    // Generate intelligent AI legal answer
    setTimeout(() => {
      let answer = 'Theo quy định của pháp luật Việt Nam, điều khoản này cần được sửa đổi để đảm bảo tính công bằng và tránh nguy cơ bị Tòa án tuyên vô hiệu.';
      if (userMsg.toLowerCase().includes('phạt') || userMsg.toLowerCase().includes('8%')) {
        answer = 'Căn cứ theo Điều 301 Luật Thương mại 2005, mức phạt vi phạm tối đa là 8% giá trị phần nghĩa vụ bị vi phạm. Bất kỳ thỏa thuận nào vượt quá 8% sẽ không có giá trị thi hành đối với phần vượt mức.';
      } else if (userMsg.toLowerCase().includes('chấm dứt') || userMsg.toLowerCase().includes('đơn phương')) {
        answer = 'Theo Điều 428 Bộ luật Dân sự 2015, bên đơn phương chấm dứt hợp đồng phải thông báo ngay cho bên kia. Nên bổ sung thời hạn thông báo trước tối thiểu 30 ngày bằng văn bản.';
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: answer, time: 'Vừa xong' },
      ]);
    }, 600);
  };

  const getBadgeStyle = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40 glow-rose';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40';
      case 'LOW':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="w-full lg:w-[500px] xl:w-[560px] flex flex-col h-full bg-[#090e1c] border-l border-white/[0.08] overflow-hidden">
      {/* Tab Navigation */}
      <div className="h-12 bg-slate-950/90 border-b border-white/[0.07] px-4 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('risks')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'risks'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Rủi Ro ({filteredRisks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('redline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'redline'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileDiff className="w-3.5 h-3.5" />
            <span>Redline Diff</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'copilot'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Copilot</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {acceptedRedlines.size} đã áp dụng
        </span>
      </div>

      {/* Tab 1: Detailed Risk Assessment */}
      {activeTab === 'risks' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {filteredRisks.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <ShieldCheck className="w-12 h-12 text-emerald-400/40 mb-3" />
              <p className="text-sm font-semibold text-slate-300">Không có rủi ro nào ở bộ lọc này</p>
              <p className="text-xs text-slate-500 mt-1">Các điều khoản đều đảm bảo tính an toàn</p>
            </div>
          ) : (
            filteredRisks.map((risk) => {
              const isSelected = selectedClauseId === risk.clause_id;
              const isAccepted = acceptedRedlines.has(risk.id);

              return (
                <div
                  key={risk.id}
                  id={`risk-card-${risk.clause_id}`}
                  onClick={() => onSelectClause(risk.clause_id)}
                  className={`glass-card rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500 ring-2 ring-cyan-500/30 bg-slate-900/90 shadow-2xl'
                      : ''
                  }`}
                >
                  {/* Top Bar: Clause Number & Severity Pill */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20 font-mono">
                      {risk.clause_number}
                    </span>
                    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBadgeStyle(risk.risk_level)}`}>
                      {risk.risk_level === 'CRITICAL' ? <AlertOctagon className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{risk.risk_level} • {risk.risk_category}</span>
                    </div>
                  </div>

                  {/* Risk Title */}
                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                    {risk.risk_title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {risk.description}
                  </p>

                  {/* Legal Basis Callout */}
                  {risk.legal_basis && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs mb-3.5">
                      <Scale className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[10px] uppercase tracking-wider text-indigo-300">
                          Căn Cứ Pháp Luật Việt Nam:
                        </span>
                        <span className="font-medium">{risk.legal_basis}</span>
                      </div>
                    </div>
                  )}

                  {/* Redline Proposal */}
                  <div className="mt-3 pt-3 border-t border-white/[0.07]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Đề Xuất Sửa Đổi (Redline)
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(risk.id, risk.suggested_text);
                        }}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                        title="Sao chép nội dung sửa đổi"
                      >
                        {copiedId === risk.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs text-emerald-300 leading-relaxed font-sans">
                      {risk.suggested_text}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] text-slate-400 italic truncate max-w-[260px]">
                        Lý do: {risk.rationale}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAccept(risk.id);
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isAccepted
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                            : 'bg-white/[0.06] text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/10'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isAccepted ? 'Đã Áp Dụng' : 'Áp Dụng Redline'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Full Redline Diff Comparison */}
      {activeTab === 'redline' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
            💡 So sánh trực quan văn bản gốc và đề xuất sửa đổi của AI để đàm phán hợp đồng.
          </div>

          {risks.map((risk) => (
            <div key={risk.id} className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{risk.clause_number}: {risk.risk_title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {risk.risk_category}
                </span>
              </div>

              {/* Before */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                  [Gốc - Bất lợi / Rủi ro]:
                </span>
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 line-through decoration-rose-500/50 leading-relaxed">
                  {risk.original_text}
                </div>
              </div>

              {/* After */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  [Đề xuất AI Sửa Đổi]:
                </span>
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
                  {risk.suggested_text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Interactive Legal AI Copilot Chat */}
      {activeTab === 'copilot' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'glass-card text-slate-200 rounded-bl-none border border-white/10'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div className="p-3 border-t border-white/[0.08] bg-slate-950/90 flex items-center gap-2">
            <input
              type="text"
              placeholder="Đặt câu hỏi pháp lý về hợp đồng này..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
