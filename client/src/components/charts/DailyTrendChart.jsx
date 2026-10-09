import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { formatMinutesToHours, formatDate } from '../../utils/formatters.js';
import { Clock } from 'lucide-react';

export function DailyTrendChart({ data = [], goalMinutes = 360, height = 280 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
        <Clock className="w-8 h-8 text-slate-600 mb-1" />
        <p>No daily records logged for this period.</p>
        <span className="text-xs text-slate-600">Log entries or import a CSV to view trends</span>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: d.date,
    shortDate: d.date.slice(5),
    totalMinutes: d.totalMinutes,
    lateNightMinutes: d.lateNightMinutes || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-white">{formatDate(item.date)}</p>
          <p className="text-emerald-400">
            Total Usage: <span className="font-semibold">{formatMinutesToHours(item.totalMinutes)}</span>
          </p>
          {item.lateNightMinutes > 0 && (
            <p className="text-rose-400">
              Late Night: <span className="font-semibold">{formatMinutesToHours(item.lateNightMinutes)}</span>
            </p>
          )}
          <p className="text-slate-400">
            Daily Goal: <span>{formatMinutesToHours(goalMinutes)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="shortDate"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${Math.round(val / 60)}h`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={goalMinutes}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{
              value: `Goal (${Math.round(goalMinutes / 60)}h)`,
              fill: '#f59e0b',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
          <Area
            type="monotone"
            dataKey="totalMinutes"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#usageGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DailyTrendChart;
