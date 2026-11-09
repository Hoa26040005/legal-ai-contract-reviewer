'use client';

import React, { useState } from 'react';
import { RiskItem, RiskLevel } from '../types/contract';
import {
  AlertOctagon, AlertTriangle, ShieldCheck,
  Scale, Check, Copy, Sparkles, Send,
  FileDiff, ShieldAlert, Bot, Lightbulb, CheckCheck
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

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI Pháp lý chuyên sâu về Luật Việt Nam (Bộ luật Lao động 2019, Luật Thương mại 2005, Bộ luật Dân sự 2015, Luật SHTT 2022 & Nghị định 13/2023/NĐ-CP). Hãy chọn câu hỏi mẫu bên dưới hoặc nhập điều khoản cần tư vấn đàm phán.',
      time: 'Sẵn sàng',
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

  const handleAcceptAll = () => {
    if (acceptedRedlines.size === risks.length) {
      setAcceptedRedlines(new Set());
    } else {
      setAcceptedRedlines(new Set(risks.map((r) => r.id)));
    }
  };

  const handleSendMessage = (customPrompt?: string) => {
    const question = customPrompt || inputQuestion;
    if (!question.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: question, time: 'Vừa xong' },
    ]);
    if (!customPrompt) setInputQuestion('');

    setTimeout(() => {
      const lower = question.toLowerCase();
      let answer = 'Căn cứ theo quy định của pháp luật Việt Nam, điều khoản này cần được đàm phán điều chỉnh để bảo vệ quyền lợi hợp pháp của bạn và tránh rủi ro tranh chấp khi ra Tòa án hoặc Trọng tài.';

      if (lower.includes('giữ bằng') || lower.includes('bằng gốc') || lower.includes('văn bằng')) {
        answer = 'CĂN CỨ ĐIỀU 17.1 BỘ LUẬT LAO ĐỘNG 2019: Người sử dụng lao động tuyệt đối KHÔNG ĐƯỢC giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ của người lao động. Hành vi này sẽ bị Thanh tra Lao động xử phạt vi phạm hành chính từ 20.000.000 đến 25.000.000 đồng theo Nghị định 12/2022/NĐ-CP và buộc phải trả lại bằng gốc ngay lập tức.';
      } else if (lower.includes('phạt') && (lower.includes('15%') || lower.includes('8%') || lower.includes('thương mại'))) {
        answer = 'CĂN CỨ ĐIỀU 301 LUẬT THƯƠNG MẠI 2005: Mức phạt đối với vi phạm nghĩa vụ hợp đồng thương mại tối đa chỉ là 8% giá trị phần nghĩa vụ bị vi phạm. Việc thỏa thuận phạt 15% hay 20% tổng giá trị hợp đồng là vô hiệu đối với phần vượt quá 8% (Án lệ số 25/2018/AL). Chiến lược đàm phán: Đề xuất dẫn chiếu trực tiếp Điều 301 LTM để đối tác hạ mức phạt xuống 8%.';
      } else if (lower.includes('thử việc') || lower.includes('4 tháng') || lower.includes('60 ngày')) {
        answer = 'CĂN CỨ ĐIỀU 25 BỘ LUẬT LAO ĐỘNG 2019: Đối với công việc có trình độ từ cao đẳng, đại học trở lên (như kỹ sư phần mềm, chuyên viên), thời gian thử việc TỐI ĐA CHỈ 60 NGÀY. Quy định thử việc 4 tháng (120 ngày) là trái luật. Hết 60 ngày, công ty bắt buộc phải ký HĐLĐ chính thức hoặc thông báo kết quả.';
      } else if (lower.includes('bhxh') || lower.includes('tiền mặt') || lower.includes('bảo hiểm')) {
        answer = 'CĂN CỨ ĐIỀU 168 BLLĐ 2019 & LUẬT BHXH: Tham gia BHXH, BHYT, BHTN là NGHĨA VỤ BẮT BUỘC theo luật công, không phụ thuộc vào ý chí thỏa thuận của các bên. Thỏa thuận "trả thêm tiền mặt để tự đóng" hoàn toàn vô hiệu. Nếu xảy ra tranh chấp, cơ quan BHXH sẽ truy thu toàn bộ số tiền trốn đóng kèm tiền lãi phạt chậm nộp.';
      } else if (lower.includes('trần bồi thường') || lower.includes('liability cap') || lower.includes('gián tiếp')) {
        answer = 'CĂN CỨ ĐIỀU 360 BLDS 2015 & ĐIỀU 302 LTM 2005: Bên có nghĩa vụ chỉ phải bồi thường thiệt hại thực tế, trực tiếp. Chiến lược đàm phán: Luôn yêu cầu bổ sung điều khoản Trần trách nhiệm (Liability Cap), ví dụ: "Tổng trách nhiệm bồi thường không vượt quá 100% tổng giá trị hợp đồng đã thực tế thanh toán và loại trừ mọi thiệt hại gián tiếp, mất cơ hội kinh doanh".';
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: answer, time: 'Vừa xong' },
      ]);
    }, 380);
  };

  const getBadgeStyle = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/35 glow-rose';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/35 glow-amber';
      case 'MEDIUM':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      case 'LOW':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <aside
      aria-label="Bảng phân tích rủi ro pháp lý và AI Copilot"
      className="w-full lg:w-[480px] xl:w-[540px] flex flex-col h-full bg-[#050811] border-l border-white/[0.075] overflow-hidden tabular-nums"
    >
      {/* Top Tab Navigation with Double-Bezel Segmented Control */}
      <div className="h-11 bg-[#060a15] border-b border-white/[0.075] px-4 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1 bg-[#090e1d] p-1 rounded-xl border border-white/[0.07]">
          <button
            onClick={() => setActiveTab('risks')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'risks'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert strokeWidth={1.75} className="w-3.5 h-3.5" />
            <span>Phân Tích ({filteredRisks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('redline')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'redline'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileDiff strokeWidth={1.75} className="w-3.5 h-3.5" />
            <span>Redline Diff</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'copilot'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot strokeWidth={1.75} className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>
        </div>

        {/* Accept All Redlines Pill */}
        <button
          onClick={handleAcceptAll}
          className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-[0.97] ${
            acceptedRedlines.size === risks.length && risks.length > 0
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-white/[0.03] text-cyan-300 border-white/[0.08] hover:border-cyan-500/40'
          }`}
          title="Duyệt áp dụng toàn bộ đề xuất sửa đổi Redline"
        >
          <CheckCheck strokeWidth={1.75} className="w-3 h-3" />
          <span>{acceptedRedlines.size}/{risks.length} Duyệt</span>
        </button>
      </div>

      {/* Tab 1: Detailed Risk Assessment */}
      {activeTab === 'risks' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
          {filteredRisks.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <ShieldCheck strokeWidth={1.5} className="w-12 h-12 text-emerald-400/50 mb-3" />
              <p className="text-sm font-bold text-slate-200">Không có rủi ro nào ở bộ lọc này</p>
              <p className="text-xs text-slate-500 mt-1">Các điều khoản đều đảm bảo tính tuân thủ pháp luật</p>
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
                  className={`double-bezel cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500/75 shadow-[0_0_24px_rgba(6,182,212,0.22)] scale-[1.005]'
                      : ''
                  }`}
                >
                  <div className={`double-bezel-inner p-4 ${isSelected ? 'bg-[#091326]' : 'bg-[#080d19]'}`}>
                    {/* Card Header: Clause & Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/25 font-mono">
                        {risk.clause_number}
                      </span>
                      <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getBadgeStyle(risk.risk_level)}`}>
                        {risk.risk_level === 'CRITICAL' ? (
                          <AlertOctagon strokeWidth={1.75} className="w-3 h-3" />
                        ) : (
                          <AlertTriangle strokeWidth={1.75} className="w-3 h-3" />
                        )}
                        <span className="tracking-wide uppercase font-mono">
                          {risk.risk_level} • {risk.risk_category}
                        </span>
                      </div>
                    </div>

                    {/* Risk Title */}
                    <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">
                      {risk.risk_title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {risk.description}
                    </p>

                    {/* Legal Basis Callout */}
                    {risk.legal_basis && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-950/25 border border-cyan-500/25 text-cyan-100 text-xs mb-2.5 shadow-inner">
                        <Scale strokeWidth={1.75} className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block text-[9px] uppercase tracking-widest text-cyan-400 font-mono">
                            Căn Cứ Pháp Luật Việt Nam:
                          </span>
                          <span className="font-semibold">{risk.legal_basis}</span>
                        </div>
                      </div>
                    )}

                    {/* Negotiation Strategy Tip */}
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-amber-100/90 text-[11px] mb-3">
                      <Lightbulb strokeWidth={1.75} className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300">Chiến lược đàm phán: </span>
                        <span>{risk.rationale}</span>
                      </div>
                    </div>

                    {/* Redline Proposal */}
                    <div className="mt-3 pt-3 border-t border-white/[0.075]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                          <Sparkles strokeWidth={1.75} className="w-3 h-3" /> Đề Xuất Sửa Đổi (Redline)
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(risk.id, risk.suggested_text);
                          }}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] transition-colors"
                          title="Sao chép nội dung sửa đổi"
                        >
                          {copiedId === risk.id ? (
                            <>
                              <Check strokeWidth={1.75} className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Đã sao chép</span>
                            </>
                          ) : (
                            <>
                              <Copy strokeWidth={1.75} className="w-3 h-3" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-[#050811] border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed font-sans shadow-inner">
                        {risk.suggested_text}
                      </div>

                      {/* Bottom Action with Button-in-Button Architecture */}
                      <div className="flex items-center justify-end mt-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAccept(risk.id);
                          }}
                          className={`group flex items-center gap-2 pl-2 pr-3 py-1 rounded-full text-xs font-bold transition-all duration-200 active:scale-[0.97] ${
                            isAccepted
                              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                              : 'bg-white/[0.04] text-slate-200 hover:bg-emerald-500/15 hover:text-emerald-300 border border-white/[0.09] hover:border-emerald-500/40'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              isAccepted ? 'bg-slate-950/15 text-slate-950' : 'bg-emerald-500/15 text-emerald-400'
                            }`}
                          >
                            <Check strokeWidth={2} className="w-3 h-3" />
                          </span>
                          <span>{isAccepted ? 'Đã Duyệt Redline' : 'Áp Dụng Redline'}</span>
                        </button>
                      </div>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
          <div className="p-3 rounded-xl bg-cyan-500/[0.08] border border-cyan-500/25 text-xs text-cyan-100 flex items-center gap-2.5">
            <FileDiff strokeWidth={1.75} className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Chế độ So Sánh Redline</strong>: Đối chiếu trực tiếp văn bản gốc vi phạm và điều khoản AI đã chuẩn hóa theo luật định.
            </span>
          </div>

          {risks.map((risk) => (
            <div key={risk.id} className="double-bezel">
              <div className="double-bezel-inner p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">
                    {risk.clause_number}: {risk.risk_title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-cyan-300 font-mono font-bold shrink-0">
                    {risk.risk_category}
                  </span>
                </div>

                {/* Before */}
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 block mb-1 font-mono">
                    [-] Văn Bản Gốc (Bất Lợi / Vi Phạm Luật):
                  </span>
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/25 text-xs text-rose-200 line-through decoration-rose-500/70 leading-relaxed font-sans">
                    {risk.original_text}
                  </div>
                </div>

                {/* After */}
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1 font-mono">
                    [+] Đề Xuất Sửa Đổi Hợp Pháp (Redline):
                  </span>
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/25 text-xs text-emerald-200 leading-relaxed font-sans">
                    {risk.suggested_text}
                  </div>
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
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-slate-950 font-medium rounded-br-none shadow-md'
                      : 'bg-[#090e1d] text-slate-200 rounded-bl-none border border-white/[0.08] shadow-lg'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 bg-[#060a15] border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-cyan-500/15 hover:text-cyan-300 border border-white/[0.07] text-[10px] text-slate-300 transition-all active:scale-[0.97]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-white/[0.075] bg-[#060a15] flex items-center gap-2">
            <input
              type="text"
              aria-label="Nhập câu hỏi tư vấn pháp lý"
              placeholder="Hỏi về mức phạt 8%, BHXH, giữ bằng gốc..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-[#090e1d] border border-white/[0.08] rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/60 transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              aria-label="Gửi câu hỏi"
              className="p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md active:scale-[0.97]"
            >
              <Send strokeWidth={1.75} className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default RiskPanel;
