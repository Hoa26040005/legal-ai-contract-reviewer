'use client';

import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Info, Layers, ChevronRight } from 'lucide-react';
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
  const cards = [
    {
      id: 'ALL' as const,
      label: 'Tổng Điều Khoản',
      count: totalClauses,
      subtext: 'Đã hoàn tất rà soát',
      icon: <Layers className="w-4 h-4 text-slate-400" />,
      activeClass: 'bg-blue-600/10 border-blue-500/50 glow-blue text-white',
      accentColor: 'bg-blue-500',
    },
    {
      id: 'CRITICAL' as const,
      label: 'Vi Phạm Pháp Luật',
      count: criticalCount,
      subtext: 'Rủi ro vô hiệu',
      icon: <AlertOctagon className="w-4 h-4 text-rose-400" />,
      activeClass: 'bg-rose-500/15 border-rose-500/60 glow-rose text-rose-200',
      accentColor: 'bg-rose-500',
      badge: 'Nghiêm trọng',
    },
    {
      id: 'HIGH' as const,
      label: 'Bất Lợi Nghiêm Trọng',
      count: highCount,
      subtext: 'Bất cân xứng lớn',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      activeClass: 'bg-amber-500/15 border-amber-500/60 text-amber-200',
      accentColor: 'bg-amber-500',
      badge: 'Rủi ro cao',
    },
    {
      id: 'MEDIUM' as const,
      label: 'Cần Làm Rõ',
      count: mediumCount,
      subtext: 'Mơ hồ câu chữ',
      icon: <Info className="w-4 h-4 text-yellow-400" />,
      activeClass: 'bg-yellow-500/15 border-yellow-500/60 text-yellow-200',
      accentColor: 'bg-yellow-500',
      badge: 'Trung bình',
    },
    {
      id: 'LOW' as const,
      label: 'Tuân Thủ / Ghi Chú',
      count: lowCount,
      subtext: 'Điều khoản thông lệ',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      activeClass: 'bg-emerald-500/15 border-emerald-500/60 glow-emerald text-emerald-200',
      accentColor: 'bg-emerald-500',
      badge: 'An toàn',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 bg-slate-950/60 border-b border-white/[0.06]">
      {cards.map((card) => {
        const isSelected = selectedFilter === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter(card.id)}
            className={`group relative p-3.5 rounded-2xl border transition-all duration-200 text-left overflow-hidden ${
              isSelected
                ? card.activeClass
                : 'bg-slate-900/40 border-white/[0.06] hover:border-white/15 hover:bg-slate-900/80'
            }`}
          >
            {/* Top Indicator bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-[2px] transition-all ${
                isSelected ? card.accentColor : 'bg-transparent group-hover:bg-white/10'
              }`}
            />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                {card.label}
              </span>
              <div className="p-1 rounded-lg bg-white/[0.04] border border-white/[0.05]">
                {card.icon}
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight font-mono text-white">
                  {card.count}
                </span>
                <span className="text-[10px] text-slate-400">{card.subtext}</span>
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
  );
};
