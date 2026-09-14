'use client';

import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Info, Layers, ChevronRight, Activity } from 'lucide-react';
import { RiskLevel } from '../types/contract';

interface RiskSummaryCardsProps {
  totalClauses: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  selectedFilter: RiskLevel | 'ALL';
  onSelectFilter: (level: RiskLevel | 'ALL') => void;
}

export const RiskSummaryCards: React.FC<RiskSummaryCardsProps> = ({
  totalClauses,
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
  selectedFilter,
  onSelectFilter,
}) => {
  const totalRisks = criticalCount + highCount + mediumCount + lowCount || 1;
  const criticalPercent = (criticalCount / totalRisks) * 100;
  const highPercent = (highCount / totalRisks) * 100;
  const mediumPercent = (mediumCount / totalRisks) * 100;
  const lowPercent = (lowCount / totalRisks) * 100;

  const cards = [
    {
      id: 'ALL' as const,
      label: 'Tổng Điều Khoản',
      count: totalClauses,
      subtext: 'Đã hoàn tất rà soát',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      activeClass: 'bg-cyan-500/15 border-cyan-500/60 glow-cyan text-white',
      accentColor: 'bg-cyan-500',
    },
    {
      id: 'CRITICAL' as const,
      label: 'Vi Phạm Điều Cấm',
      count: criticalCount,
      subtext: 'Tuyên vô hiệu ngay',
      icon: <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />,
      activeClass: 'bg-rose-500/20 border-rose-500/70 glow-rose text-rose-200',
      accentColor: 'bg-rose-500',
    },
    {
      id: 'HIGH' as const,
      label: 'Bất Lợi Lớn / Bẫy',
      count: highCount,
      subtext: 'Bất cân xứng nghiêm trọng',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      activeClass: 'bg-amber-500/20 border-amber-500/70 glow-amber text-amber-200',
      accentColor: 'bg-amber-500',
    },
    {
      id: 'MEDIUM' as const,
      label: 'Mơ Hồ / Cần Sửa',
      count: mediumCount,
      subtext: 'Chưa đủ điều kiện luật',
      icon: <Info className="w-4 h-4 text-yellow-400" />,
      activeClass: 'bg-yellow-500/20 border-yellow-500/70 text-yellow-200',
      accentColor: 'bg-yellow-500',
    },
    {
      id: 'LOW' as const,
      label: 'Tuân Thủ / Ghi Chú',
      count: lowCount,
      subtext: 'Thông lệ an toàn',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      activeClass: 'bg-emerald-500/20 border-emerald-500/70 glow-emerald text-emerald-200',
      accentColor: 'bg-emerald-500',
    },
  ];

  return (
    <div className="bg-slate-950/70 border-b border-white/[0.06] p-4 flex flex-col gap-3">
      {/* 1. Risk Distribution Visual Spectrum Bar */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" /> Bản Đồ Phân Bổ Rủi Ro:
        </span>
        <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden flex border border-white/10">
          <div
            style={{ width: `${criticalPercent}%` }}
            className="bg-rose-500 h-full transition-all duration-300"
            title={`Nghiêm trọng: ${criticalCount}`}
          />
          <div
            style={{ width: `${highPercent}%` }}
            className="bg-amber-500 h-full transition-all duration-300"
            title={`Rủi ro cao: ${highCount}`}
          />
          <div
            style={{ width: `${mediumPercent}%` }}
            className="bg-yellow-500 h-full transition-all duration-300"
            title={`Trung bình: ${mediumCount}`}
          />
          <div
            style={{ width: `${lowPercent}%` }}
            className="bg-emerald-500 h-full transition-all duration-300"
            title={`Tuân thủ: ${lowCount}`}
          />
        </div>
      </div>

      {/* 2. Interactive Filter Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const isSelected = selectedFilter === card.id;

          return (
            <button
              key={card.id}
              onClick={() => onSelectFilter(card.id)}
              className={`group relative p-3.5 rounded-2xl border transition-all duration-200 text-left overflow-hidden ${
                isSelected
                  ? card.activeClass
                  : 'bg-slate-900/50 border-white/[0.06] hover:border-white/20 hover:bg-slate-900/90'
              }`}
            >
              {/* Top Accent Line */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] transition-all ${
                  isSelected ? card.accentColor : 'bg-transparent group-hover:bg-white/15'
                }`}
              />

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  {card.label}
                </span>
                <div className="p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  {card.icon}
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold tracking-tight font-mono text-white">
                    {card.count}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{card.subtext}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isSelected ? 'translate-x-0.5 text-white' : 'text-slate-600 group-hover:text-slate-400'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
