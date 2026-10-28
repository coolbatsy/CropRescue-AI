import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'green' | 'amber' | 'blue';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'green',
}) => {
  const badgeClasses = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  }[badgeColor];

  // If value is numeric, smooth count up
  const isNumeric = typeof value === 'number';
  const animatedNumber = useCountUp(isNumeric ? value : 0, 800, isNumeric);

  const displayValue = isNumeric ? animatedNumber : value;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-sm transition-all relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#647067]">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-[#F7F9F4] group-hover:bg-[#166534]/10 text-[#166534] flex items-center justify-center transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-extrabold text-[#17251C] tracking-tight">
          {displayValue}
        </span>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-[#647067] mt-1.5 line-clamp-1">{subtitle}</p>
      )}
    </div>
  );
};
