'use client';

import React from 'react';
import {
  ShieldCheck, AlertOctagon, AlertTriangle, Info, Layers,
  Activity, Sparkles, Network, Cpu, ArrowUpRight
} from 'lucide-react';
import { RiskLevel } from '../types/contract';

interface RiskSummaryCardsProps {
  score: number;
  summary?: string;
  contractType?: string;
  totalClauses: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  selectedFilter: RiskLevel | 'ALL';
  onSelectFilter: (level: RiskLevel | 'ALL') => void;
  onOpenGraph?: () => void;
  onOpenArchitecture?: () => void;
}

export const RiskSummaryCards: React.FC<RiskSummaryCardsProps> = ({
  score,
  summary,
  contractType = 'Hợp đồng thương mại',
  totalClauses,
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
  selectedFilter,
  onSelectFilter,
  onOpenGraph,
  onOpenArchitecture,
}) => {
  const totalRisks = criticalCount + highCount + mediumCount + lowCount || 1;
  const criticalPercent = Math.round((criticalCount / totalRisks) * 100);
  const highPercent = Math.round((highCount / totalRisks) * 100);
  const mediumPercent = Math.round((mediumCount / totalRisks) * 100);
  const lowPercent = Math.max(0, 100 - criticalPercent - highPercent - mediumPercent);

  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let gaugeColor = '#10b981';
  let verdictText = 'AN TOÀN PHÁP LÝ';
  let verdictClass = 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';

  if (score < 40) {
    gaugeColor = '#f43f5e';
    verdictText = 'VI PHẠM ĐIỀU CẤM';
    verdictClass = 'text-rose-300 bg-rose-500/15 border-rose-500/35';
  } else if (score < 70) {
    gaugeColor = '#f59e0b';
    verdictText = 'CẦN ĐÀM PHÁN LẠI';
    verdictClass = 'text-amber-300 bg-amber-500/10 border-amber-500/30';
  }

  const cards = [
    {
      id: 'ALL' as const,
      label: 'Tổng Điều Khoản',
      count: totalClauses,
      subtext: 'Đã bóc tách AST',
      icon: <Layers strokeWidth={1.75} className="w-3.5 h-3.5 text-cyan-400" />,
      activeOuter: 'border-cyan-500/50 bg-cyan-500/10 glow-cyan',
      activeInner: 'bg-[#091526] text-white',
      badgeColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25',
    },
    {
      id: 'CRITICAL' as const,
      label: 'Vi Phạm Điều Cấm',
      count: criticalCount,
      subtext: 'Vô hiệu tuyệt đối',
      icon: <AlertOctagon strokeWidth={1.75} className="w-3.5 h-3.5 text-rose-400" />,
      activeOuter: 'border-rose-500/55 bg-rose-500/15 glow-rose',
      activeInner: 'bg-[#1c0913] text-rose-100',
      badgeColor: 'text-rose-300 bg-rose-500/10 border-rose-500/25',
    },
    {
      id: 'HIGH' as const,
      label: 'Bất Lợi Lớn / Bẫy',
      count: highCount,
      subtext: 'Vượt trần luật',
      icon: <AlertTriangle strokeWidth={1.75} className="w-3.5 h-3.5 text-amber-400" />,
      activeOuter: 'border-amber-500/55 bg-amber-500/15 glow-amber',
      activeInner: 'bg-[#1b1207] text-amber-100',
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
    },
    {
      id: 'MEDIUM' as const,
      label: 'Mơ Hồ / Cần Sửa',
      count: mediumCount,
      subtext: 'Thiếu định lượng',
      icon: <Info strokeWidth={1.75} className="w-3.5 h-3.5 text-yellow-400" />,
      activeOuter: 'border-yellow-500/50 bg-yellow-500/15',
      activeInner: 'bg-[#191607] text-yellow-100',
      badgeColor: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/25',
    },
    {
      id: 'LOW' as const,
      label: 'Tuân Thủ / Chuẩn',
      count: lowCount,
      subtext: 'Đúng luật định',
      icon: <ShieldCheck strokeWidth={1.75} className="w-3.5 h-3.5 text-emerald-400" />,
      activeOuter: 'border-emerald-500/55 bg-emerald-500/15 glow-emerald',
      activeInner: 'bg-[#071914] text-emerald-100',
      badgeColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
    },
  ];

  return (
    <section
      aria-label="Tổng quan chỉ số an toàn pháp lý"
      className="bg-[#050811] border-b border-white/[0.075] px-4 sm:px-6 py-2.5 select-none tabular-nums"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch">
        {/* Zone 1: Machined Double-Bezel Radial Health Gauge (col-span-3) */}
        <div className="xl:col-span-3 double-bezel">
          <div className="double-bezel-inner h-full px-3.5 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.07)"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    stroke={gaugeColor}
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-sm font-black text-white leading-none">
                    {score}
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono mt-0.5">/100</span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border w-fit font-mono tracking-wider truncate ${verdictClass}`}>
                  {verdictText}
                </span>
                <span className="text-xs font-bold text-white truncate mt-0.5">
                  {contractType}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalClauses} Điều khoản AST • {criticalCount + highCount} Trọng điểm
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone 2: Interactive 5-Tier Risk Matrix Cards (col-span-6) */}
        <div className="xl:col-span-6 flex flex-col justify-between gap-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {cards.map((card) => {
              const isSelected = selectedFilter === card.id;

              return (
                <button
                  key={card.id}
                  onClick={() => onSelectFilter(card.id)}
                  className={`group text-left p-[2px] rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
                    isSelected
                      ? card.activeOuter
                      : 'border-white/[0.065] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]'
                  }`}
                >
                  <div
                    className={`px-2.5 py-2 rounded-[14px] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
                      isSelected ? card.activeInner : 'bg-[#080d19] group-hover:bg-[#0b1222]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-semibold text-slate-300 group-hover:text-white transition-colors truncate">
                        {card.label}
                      </span>
                      <div className={`p-1 rounded-md border shrink-0 ${card.badgeColor}`}>
                        {card.icon}
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-base font-black font-mono tracking-tight text-white">
                        {card.count}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono truncate">
                        {card.subtext}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Risk Spectrum Distribution Ribbon */}
          <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-xl bg-[#080d19] border border-white/[0.06]">
            <Activity strokeWidth={1.75} className="w-3 h-3 text-cyan-400 shrink-0" />
            <div className="flex-1 h-1.5 rounded-full bg-[#04070e] overflow-hidden flex relative">
              <div
                style={{ width: `${criticalPercent}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`Vi phạm điều cấm: ${criticalCount} (${criticalPercent}%)`}
              />
              <div
                style={{ width: `${highPercent}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`Bất lợi lớn: ${highCount} (${highPercent}%)`}
              />
              <div
                style={{ width: `${mediumPercent}%` }}
                className="bg-yellow-500 h-full transition-all duration-500"
                title={`Mơ hồ: ${mediumCount} (${mediumPercent}%)`}
              />
              <div
                style={{ width: `${lowPercent}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`An toàn: ${lowCount} (${lowPercent}%)`}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-400 shrink-0 hidden sm:inline">
              {criticalPercent}% Cấm • {highPercent}% Cao • {lowPercent}% Chuẩn
            </span>
          </div>
        </div>

        {/* Zone 3: AI Executive Callout & Quick Architecture/Graph Links (col-span-3) */}
        <div className="xl:col-span-3 double-bezel">
          <div className="double-bezel-inner h-full px-3.5 py-2.5 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-mono">
                <Sparkles strokeWidth={1.75} className="w-2.5 h-2.5 text-cyan-400" /> Kết Luận AI
              </span>
              <div className="flex items-center gap-1.5">
                {onOpenGraph && (
                  <button
                    onClick={onOpenGraph}
                    className="text-[9px] font-mono text-cyan-300 hover:text-white px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-cyan-500/20 border border-white/[0.08] flex items-center gap-0.5 transition-colors"
                    title="Mở Đồ thị Tri thức Neo4j"
                  >
                    <Network strokeWidth={1.75} className="w-2.5 h-2.5" />
                    <span>Neo4j</span>
                  </button>
                )}
                {onOpenArchitecture && (
                  <button
                    onClick={onOpenArchitecture}
                    className="text-[9px] font-mono text-emerald-300 hover:text-white px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 flex items-center gap-0.5 transition-colors"
                    title="Mở Hồ Sơ Kiến Trúc & Engineering Spec"
                  >
                    <Cpu strokeWidth={1.75} className="w-2.5 h-2.5" />
                    <span>Spec</span>
                    <ArrowUpRight strokeWidth={1.75} className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-sans">
              {summary || 'Hệ thống đã rà soát toàn bộ điều khoản và đối chiếu với 28 quy chuẩn pháp luật Việt Nam.'}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[9px] text-slate-400 font-mono">
              <span>Khung đối chiếu:</span>
              <span className="text-cyan-300 font-semibold truncate">
                BLLĐ 2019 • LTM 2005 • BLDS 2015
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskSummaryCards;
