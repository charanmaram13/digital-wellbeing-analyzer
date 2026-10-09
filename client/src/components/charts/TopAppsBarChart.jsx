import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { CATEGORY_COLORS, formatMinutesToHours } from '../../utils/formatters.js';

export function TopAppsBarChart({ data = [], height = 240 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        No application usage logged yet.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-white">{item.applicationName}</p>
          <p className="text-slate-400">Category: {item.category}</p>
          <p className="text-emerald-400">
            Time: <span className="font-bold">{formatMinutesToHours(item.totalMinutes)}</span> ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <XAxis
            type="number"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${Math.round(val / 60)}h`}
          />
          <YAxis
            type="category"
            dataKey="applicationName"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={85}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalMinutes" radius={[0, 6, 6, 0]}>
            {data.map((entry) => (
              <Cell
                key={`bar-${entry.applicationName}`}
                fill={CATEGORY_COLORS[entry.category] || '#10b981'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopAppsBarChart;
