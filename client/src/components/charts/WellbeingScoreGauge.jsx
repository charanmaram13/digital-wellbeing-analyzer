import React from 'react';
import { Badge } from '../ui/Badge.jsx';
import { ShieldCheck, Moon, Zap, Target } from 'lucide-react';

export function WellbeingScoreGauge({ score = 100, classification = {}, breakdown = {} }) {
  // Score color gradient calculation
  const getScoreColor = (val) => {
    if (val >= 75) return '#10b981'; // emerald
    if (val >= 50) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  const scoreColor = getScoreColor(score);
  const strokeDashoffset = 283 - (283 * Math.min(100, Math.max(0, score))) / 100;

  const componentsList = [
    {
      key: 'goalAdherence',
      label: 'Goal Adherence',
      icon: Target,
      item: breakdown?.goalAdherence || { points: 35, max: 35 },
      color: 'bg-emerald-500',
    },
    {
      key: 'lateNight',
      label: 'Sleep Protection',
      icon: Moon,
      item: breakdown?.lateNight || { points: 25, max: 25 },
      color: 'bg-indigo-500',
    },
    {
      key: 'sessionHealth',
      label: 'Session Health',
      icon: ShieldCheck,
      item: breakdown?.sessionHealth || { points: 20, max: 20 },
      color: 'bg-cyan-500',
    },
    {
      key: 'focusConsistency',
      label: 'Focus Consistency',
      icon: Zap,
      item: breakdown?.focusConsistency || { points: 20, max: 20 },
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Radial Gauge */}
      <div className="flex flex-col items-center justify-center shrink-0">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="8"
            />
            {/* Value Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={scoreColor}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              / 100
            </span>
          </div>
        </div>

        {/* Classification Badge */}
        <div className="mt-3 text-center">
          <Badge
            variant={
              classification.status === 'Balanced'
                ? 'emerald'
                : classification.status === 'Needs Attention'
                ? 'amber'
                : 'rose'
            }
            size="md"
          >
            {classification.status || 'Balanced'}
          </Badge>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px] text-center">
            {classification.summary || 'Healthy and intentional device habits.'}
          </p>
        </div>
      </div>

      {/* Component Progress Bars */}
      <div className="flex-1 w-full space-y-3.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Score Contribution Breakdown
        </h4>
        {componentsList.map(({ key, label, icon: Icon, item, color }) => {
          const percent = item.max > 0 ? Math.round((item.points / item.max) * 100) : 0;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {label}
                </span>
                <span className="font-semibold text-white">
                  {item.points} <span className="text-slate-500 font-normal">/ {item.max} pts</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              {item.description && (
                <p className="text-[11px] text-slate-400">{item.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WellbeingScoreGauge;
