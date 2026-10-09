import React, { useState, useEffect } from 'react';
import analyticsApi from '../../services/analyticsApi.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import {
  AlertTriangle,
  Moon,
  Clock,
  Layers,
  TrendingUp,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export function PatternsPage() {
  const [patterns, setPatterns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadPatterns() {
      setIsLoading(true);
      try {
        const data = await analyticsApi.getPatterns();
        setPatterns(data || []);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load usage patterns');
      } finally {
        setIsLoading(false);
      }
    }
    loadPatterns();
  }, []);

  const getPatternIcon = (type) => {
    switch (type) {
      case 'late_night_binge':
        return Moon;
      case 'goal_overrun':
        return Clock;
      case 'category_monopoly':
        return Layers;
      case 'baseline_surge':
        return TrendingUp;
      default:
        return AlertTriangle;
    }
  };

  if (isLoading) {
    return <Spinner size="lg" className="py-24" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          Usage Patterns & Behavioral Anomaly Alerts
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Algorithmic heuristics detecting excessive screen time, late-night binging, marathon sessions, and category imbalances.
        </p>
      </div>

      {patterns.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All Usage Patterns Within Healthy Bounds"
          description="No anomalies or risky behavioral patterns were detected across your recent screen time logs."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((p, idx) => {
            const Icon = getPatternIcon(p.type);
            return (
              <Card
                key={idx}
                className={`border transition-all ${
                  p.severity === 'high'
                    ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-900'
                    : 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        p.severity === 'high'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{p.title}</h3>
                      <span className="text-[11px] text-slate-400 capitalize">
                        Heuristic: {p.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <Badge variant={p.severity === 'high' ? 'rose' : 'amber'} size="sm">
                    {p.severity.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  {p.description}
                </p>

                {p.metrics && (
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    {Object.entries(p.metrics).map(([key, val]) => (
                      <span key={key}>
                        <strong className="text-slate-200 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}:
                        </strong>{' '}
                        {val}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Heuristics Reference */}
      <Card className="border-slate-800 text-xs text-slate-400 space-y-2">
        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          Heuristic Threshold Definitions
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-inside">
          <li><strong>Daily Goal Overrun:</strong> Triggers when total minutes exceed your configured daily limit.</li>
          <li><strong>Late-Night Binge:</strong> Triggers when &gt;45 min of screen time occurs past configured bedtime.</li>
          <li><strong>Extended Sessions:</strong> Triggers when individual unbroken sessions exceed 90 minutes.</li>
          <li><strong>Category Over-Concentration:</strong> Triggers when a single non-productivity category occupies &gt;50% of screen time.</li>
        </ul>
      </Card>
    </div>
  );
}

export default PatternsPage;
