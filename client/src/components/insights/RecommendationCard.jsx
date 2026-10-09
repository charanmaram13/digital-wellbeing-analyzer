import React from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { CheckCircle2, Clock, XCircle, Sparkles } from 'lucide-react';

export function RecommendationCard({ recommendation, onUpdateStatus, onDelete }) {
  const { _id, title, description, triggeringPattern, type, status } = recommendation;

  const typeColorMap = {
    routine: 'emerald',
    boundary: 'violet',
    focus: 'amber',
    app_limit: 'rose',
    bedtime_habit: 'blue',
  };

  return (
    <Card className="flex flex-col justify-between border-slate-800 hover:border-slate-700 transition-all">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <Badge variant={typeColorMap[type] || 'emerald'} size="sm">
            {type?.replace('_', ' ').toUpperCase()}
          </Badge>
          <span className="text-[11px] text-slate-400 italic">Triggered by: {triggeringPattern}</span>
        </div>

        <div>
          <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            {title}
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 capitalize">Status: <strong className="text-slate-200">{status}</strong></span>

        <div className="flex items-center gap-1.5">
          {status !== 'completed' && (
            <button
              onClick={() => onUpdateStatus(_id, 'completed')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors"
              title="Mark as Done"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete
            </button>
          )}

          {status !== 'snoozed' && (
            <button
              onClick={() => onUpdateStatus(_id, 'snoozed')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
              title="Snooze for Later"
            >
              <Clock className="w-3.5 h-3.5" />
              Snooze
            </button>
          )}

          <button
            onClick={() => onDelete(_id)}
            className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Dismiss Recommendation"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

export default RecommendationCard;
