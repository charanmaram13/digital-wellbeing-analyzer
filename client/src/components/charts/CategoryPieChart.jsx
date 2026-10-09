import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CATEGORY_COLORS, formatMinutesToHours } from '../../utils/formatters.js';

export function CategoryPieChart({ data = [], height = 240 }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        No category distribution available.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-white flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#94a3b8' }}
            />
            {item.category}
          </p>
          <p className="text-slate-300">
            Duration: <span className="font-semibold">{formatMinutesToHours(item.totalMinutes)}</span>
          </p>
          <p className="text-emerald-400 font-bold">{item.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <div style={{ width: '100%', maxWidth: '240px', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="totalMinutes"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.category}`}
                  fill={CATEGORY_COLORS[entry.category] || '#94a3b8'}
                  stroke="#0f172a"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full sm:w-auto">
        {data.slice(0, 6).map((entry) => (
          <div key={entry.category} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[entry.category] || '#94a3b8' }}
            />
            <span className="text-slate-300 truncate max-w-[90px]">{entry.category}</span>
            <span className="text-slate-400 font-semibold">{entry.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryPieChart;
