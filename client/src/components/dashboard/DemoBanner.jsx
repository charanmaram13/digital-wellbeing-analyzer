import React from 'react';
import { Info, Upload, Plus } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function DemoBanner({ onOpenImport, onOpenAdd }) {
  return (
    <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shadow-lg shadow-emerald-950/10">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            Demo Mode Active
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
              Sample Data
            </span>
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            You are exploring 14 days of simulated screen-time records. Upload your own CSV file or log real entries to personalize your analysis.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        <Button onClick={onOpenImport} size="sm" variant="secondary" className="text-xs w-full sm:w-auto">
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          Import CSV
        </Button>
        <Button onClick={onOpenAdd} size="sm" variant="primary" className="text-xs w-full sm:w-auto">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Log Real Entry
        </Button>
      </div>
    </div>
  );
}

export default DemoBanner;
