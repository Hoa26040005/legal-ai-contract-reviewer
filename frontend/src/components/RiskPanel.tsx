'use client';

import React, { useState } from 'react';
import { RiskItem, RiskLevel } from '../types/contract';
import {
  AlertOctagon, AlertTriangle, Info, ShieldCheck,
  Scale, Check, Copy, Sparkles, MessageSquare, Send,
  FileDiff, ShieldAlert, Bot, ArrowRight, Lightbulb
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
      text: 'Xin chào! Tôi là Trợ lý AI Pháp lý chuyên sâu về Luật Việt Nam (Lao động 2019, Thương mại 2005 & Dân sự 2015). Bạn có thể bấm chọn các gợi ý nhanh bên dưới hoặc nhập bất kỳ câu hỏi nào để tôi tư vấn phương án đàm phán.',
      time: 'Vừa xong',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');

  const quickPrompts = [
    'Giữ bằng đại học gốc có bị phạt không?',
    'Mức phạt vi phạm 15% có hợp pháp không?',
    'Thử việc 4 tháng có đúng luật không?',
    'Công ty không đóng BHXH mà trả tiền mặt được không?',
    'Cách đàm phán thêm điều khoản trần bồi thường (Liability Cap)?'
  ];

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

  const handleSendMessage = (customPrompt?: string) => {
    const question = customPrompt || inputQuestion;
    if (!question.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: question, time: 'Vừa xong' },
    ]);
    if (!customPrompt) setInputQuestion('');

    // Intelligent Vietnamese Legal Reasoning Response
    setTimeout(() => {
      const lower = question.toLowerCase();
      let answer = 'Căn cứ theo quy định của pháp luật Việt Nam, điều khoản này cần được đàm phán điều chỉnh để bảo vệ quyền lợi hợp pháp của bạn và tránh rủi ro tranh chấp khi ra Tòa án hoặc Trọng tài.';

      if (lower.includes('giữ bằng') || lower.includes('bằng gốc') || lower.includes('văn bằng')) {
        answer = 'CĂN CỨ ĐIỀU 17.1 BỘ LUẬT LAO ĐỘNG 2019: Người sử dụng lao động tuyệt đối KHÔNG ĐƯỢC giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ của người lao động. Hành vi này sẽ bị Thanh tra Lao động xử phạt vi phạm hành chính từ 20.000.000 đến 25.000.000 đồng theo Nghị định 12/2022/NĐ-CP và buộc phải trả lại bằng gốc ngay lập tức.';
      } else if (lower.includes('phạt') && (lower.includes('15%') || lower.includes('8%') || lower.includes('thương mại'))) {
        answer = 'CĂN CỨ ĐIỀU 301 LUẬT THƯƠNG MẠI 2005: Mức phạt đối với vi phạm nghĩa vụ hợp đồng thương mại tối đa chỉ là 8% giá trị phần nghĩa vụ bị vi phạm. Việc thỏa thuận phạt 15% hay 20% tổng giá trị hợp đồng là vô hiệu đối với phần vượt quá 8%. Chiến lược đàm phán: Đề xuất dẫn chiếu trực tiếp Điều 301 LTM để đối tác hạ mức phạt xuống 8%.';
      } else if (lower.includes('thử việc') || lower.includes('4 tháng') || lower.includes('60 ngày')) {
        answer = 'CĂN CỨ ĐIỀU 25 BỘ LUẬT LAO ĐỘNG 2019: Đối với công việc có trình độ từ cao đẳng, đại học trở lên (như kỹ sư phần mềm, chuyên viên), thời gian thử việc TỐI ĐA CHỈ 60 NGÀY. Quy định thử việc 4 tháng (120 ngày) là trái luật. Hết 60 ngày, công ty bắt buộc phải ký HĐLĐ chính thức hoặc thông báo chấm dứt.';
      } else if (lower.includes('bhxh') || lower.includes('tiền mặt') || lower.includes('bảo hiểm')) {
        answer = 'CĂN CỨ ĐIỀU 168 BLLD 2019 & LUẬT BHXH: Tham gia BHXH, BHYT, BHTN là NGHĨA VỤ BẮT BUỘC theo luật công, không phụ thuộc vào ý chí thỏa thuận của các bên. Thỏa thuận "trả thêm tiền mặt để tự đóng" hoàn toàn vô hiệu. Nếu xảy ra tranh chấp, cơ quan BHXH sẽ truy thu toàn bộ số tiền trốn đóng kèm tiền lãi phạt chậm nộp.';
      } else if (lower.includes('trần bồi thường') || lower.includes('liability cap') || lower.includes('gián tiếp')) {
        answer = 'CĂN CỨ ĐIỀU 360 BLDS 2015 & ĐIỀU 302 LTM 2005: Bên có nghĩa vụ chỉ phải bồi thường thiệt hại thực tế, trực tiếp. Chiến lược đàm phán: Luôn yêu cầu bổ sung điều khoản Trần trách nhiệm (Liability Cap), ví dụ: "Tổng trách nhiệm bồi thường không vượt quá 100% tổng giá trị hợp đồng đã thực tế thanh toán và loại trừ mọi thiệt hại gián tiếp, mất cơ hội kinh doanh".';
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: answer, time: 'Vừa xong' },
      ]);
    }, 500);
  };

  const getBadgeStyle = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40 glow-rose';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 glow-amber';
      case 'MEDIUM':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40';
      case 'LOW':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="w-full lg:w-[500px] xl:w-[560px] flex flex-col h-full bg-[#080d1a] border-l border-white/[0.08] overflow-hidden">
      {/* Tab Navigation */}
      <div className="h-12 bg-slate-950/90 border-b border-white/[0.07] px-4 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('risks')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'risks'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Phân Tích ({filteredRisks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('redline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'redline'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileDiff className="w-3.5 h-3.5" />
            <span>So Sánh Redline</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'copilot'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-300" />
            <span>AI Copilot Luật</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-cyan-400 font-semibold">
          {acceptedRedlines.size} đã áp dụng
        </span>
      </div>

      {/* Tab 1: Detailed Risk Assessment */}
      {activeTab === 'risks' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {filteredRisks.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <ShieldCheck className="w-12 h-12 text-emerald-400/50 mb-3" />
              <p className="text-sm font-bold text-slate-200">Không có rủi ro nào ở bộ lọc này</p>
              <p className="text-xs text-slate-500 mt-1">Các điều khoản đều đảm bảo tính an toàn pháp lý</p>
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
                      ? 'border-cyan-500 ring-2 ring-cyan-500/40 bg-slate-900/95 shadow-2xl scale-[1.01]'
                      : ''
                  }`}
                >
                  {/* Card Header: Clause & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20 font-mono">
                      {risk.clause_number}
                    </span>
                    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getBadgeStyle(risk.risk_level)}`}>
                      {risk.risk_level === 'CRITICAL' ? <AlertOctagon className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      <span className="tracking-wide uppercase">{risk.risk_level} • {risk.risk_category}</span>
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
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs mb-3">
                      <Scale className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold block text-[10px] uppercase tracking-wider text-indigo-300">
                          Căn Cứ Pháp Luật Việt Nam:
                        </span>
                        <span className="font-semibold">{risk.legal_basis}</span>
                      </div>
                    </div>
                  )}

                  {/* Negotiation Strategy Tip */}
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] mb-3">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">Chiến lược đàm phán: </span>
                      <span>{risk.rationale}</span>
                    </div>
                  </div>

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

                    <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-xs text-emerald-300 leading-relaxed font-sans">
                      {risk.suggested_text}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-end mt-3">
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
                        <span>{isAccepted ? 'Đã Áp Dụng' : 'Áp Dụng Redline Này'}</span>
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
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
            💡 <strong>Chế độ So Sánh Redline (Diff Viewer)</strong>: Giúp bạn gửi trực tiếp bảng so sánh cho đối tác hoặc nhà tuyển dụng để sửa đổi hợp đồng.
          </div>

          {risks.map((risk) => (
            <div key={risk.id} className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{risk.clause_number}: {risk.risk_title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono font-bold">
                  {risk.risk_category}
                </span>
              </div>

              {/* Before */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 block mb-1">
                  [Văn Bản Gốc - Bất Lợi / Vi Phạm]:
                </span>
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 line-through decoration-rose-500/70 leading-relaxed">
                  {risk.original_text}
                </div>
              </div>

              {/* After */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">
                  [Đề Xuất AI Sửa Đổi Hợp Pháp]:
                </span>
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
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
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'glass-card text-slate-200 rounded-bl-none border border-white/10 shadow-lg'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 bg-slate-950/70 border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/[0.08] text-[10px] text-slate-400 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat input */}
          <div className="p-3 border-t border-white/[0.08] bg-slate-950/90 flex items-center gap-2">
            <input
              type="text"
              placeholder="Hỏi về mức phạt, BHXH, giữ bằng gốc, thời hạn báo trước..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleSendMessage()}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
