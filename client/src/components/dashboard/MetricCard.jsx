import React from 'react';
import { Card } from '../ui/Card.jsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function MetricCard({
  title,
  value,
  subvalue,
  trend, // { type: 'increase' | 'decrease' | 'neutral', label: string }
  icon: Icon,
  badgeText,
  badgeVariant = 'emerald',
  color = 'emerald',
}) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <Card glow className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {value}
          </div>
          {subvalue && <p className="text-xs text-slate-400 mt-1">{subvalue}</p>}
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-110 ${
              colorMap[color] || colorMap.emerald
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs">
          {trend.type === 'increase' ? (
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
          ) : trend.type === 'decrease' ? (
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span
            className={
              trend.type === 'increase'
                ? 'text-rose-400 font-medium'
                : trend.type === 'decrease'
                ? 'text-emerald-400 font-medium'
                : 'text-slate-400'
            }
          >
            {trend.label}
          </span>
        </div>
      )}
    </Card>
  );
}

export default MetricCard;
