import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  AlertTriangle,
  Sparkles,
  Timer,
  FileSpreadsheet,
  Settings,
  HeartHandshake,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/patterns', label: 'Usage Patterns', icon: AlertTriangle },
  { to: '/insights', label: 'AI Insights', icon: Sparkles, badge: 'AI' },
  { to: '/focus', label: 'Focus & Goals', icon: Timer },
  { to: '/records', label: 'Records & CSV', icon: FileSpreadsheet },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ className = '', onItemClick }) {
  return (
    <aside className={`w-64 flex flex-col justify-between py-6 px-4 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 ${className}`}>
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-slate-950 font-black">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              Wellbeing
            </h1>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest">
              Analyzer
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5 pt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Companion App Teaser */}
      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Companion Sync Ready
        </div>
        <p className="text-[11px] leading-relaxed">
          Ready for automatic Android & Desktop background sync via REST API.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
