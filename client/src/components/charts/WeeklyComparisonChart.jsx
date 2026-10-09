import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatMinutesToHours } from '../../utils/formatters.js';

export function WeeklyComparisonChart({ currentWeekDaily = [], previousWeekDaily = [], height = 260 }) {
  // Normalize days into Mon-Sun or 7 comparable points
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const combinedData = daysOfWeek.map((dayName, idx) => {
    const cur = currentWeekDaily[idx] ? currentWeekDaily[idx].totalMinutes : 0;
    const prev = previousWeekDaily[idx] ? previousWeekDaily[idx].totalMinutes : 0;
    return {
      day: dayName,
      'Current Week': cur,
      'Previous Week': prev,
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-white">{label}</p>
          {payload.map((p) => (
            <p key={p.dataKey} style={{ color: p.color }}>
              {p.dataKey}: <span className="font-semibold">{formatMinutesToHours(p.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={combinedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${Math.round(val / 60)}h`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
          />
          <Bar dataKey="Current Week" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Previous Week" fill="#64748b" radius={[4, 4, 0, 0]} opacity={0.6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeeklyComparisonChart;
