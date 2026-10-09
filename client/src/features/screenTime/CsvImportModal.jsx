import React, { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import screenTimeApi from '../../services/screenTimeApi.js';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Copy } from 'lucide-react';

const SAMPLE_CSV = `applicationName,category,date,durationMinutes,startTime,endTime,sessionCount,deviceIdentifier
Visual Studio Code,Productivity,2026-10-09,120,09:30,11:30,1,MacBook Pro
YouTube,Entertainment,2026-10-09,75,23:15,00:30,1,MacBook Pro
Slack,Communication,2026-10-09,45,14:00,14:45,3,MacBook Pro
Spotify,Entertainment,2026-10-10,60,10:00,11:00,1,iPhone 15
Instagram,Social,2026-10-10,40,19:00,19:40,2,iPhone 15`;

export function CsvImportModal({ isOpen, onClose, onImportSuccess }) {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setErrorMessage('Please select a valid .csv file.');
      return;
    }

    setFileName(file.name);
    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target?.result || '');
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setCsvText(SAMPLE_CSV);
    setFileName('sample_screen_time.csv');
    setErrorMessage('');
    setResult(null);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screen_time_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      setErrorMessage('Please select a file or paste CSV content.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setResult(null);

    try {
      const data = await screenTimeApi.importCSV(csvText);
      setResult(data);
      if (onImportSuccess) {
        onImportSuccess(data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'CSV import failed. Please verify headers.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCsvText('');
    setFileName('');
    setResult(null);
    setErrorMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Import Screen Time CSV"
      description="Import logs with duplicate prevention and error validation."
      maxWidth="max-w-2xl"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
          {errorMessage}
        </div>
      )}

      {!result ? (
        <div className="space-y-4">
          {/* Dropzone */}
          <div className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-950/40 transition-colors">
            <UploadCloud className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">Choose a CSV file to upload</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Supported headers: applicationName, category, date, durationMinutes, startTime, endTime
            </p>

            <label className="inline-flex cursor-pointer">
              <span className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors">
                {fileName ? `File: ${fileName}` : 'Browse Computer'}
              </span>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-emerald-400 hover:underline font-medium flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                Load Sample Template Text
              </button>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-slate-400 hover:text-white flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              Download .CSV Template
            </button>
          </div>

          {/* Raw Text Preview */}
          {csvText && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                CSV Payload Preview ({csvText.split('\n').filter(Boolean).length} rows)
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={5}
                className="w-full font-mono text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <Button
              variant="ghost"
              onClick={() => {
                handleReset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              isLoading={isLoading}
              disabled={!csvText.trim()}
            >
              Run Import
            </Button>
          </div>
        </div>
      ) : (
        /* Results Report */
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xl font-extrabold text-emerald-400">{result.importedCount}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Records Imported</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-xl font-extrabold text-amber-400">{result.duplicateCount}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Duplicates Skipped</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-xl font-extrabold text-rose-400">{result.rejectedCount}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Rejected Rows</p>
            </div>
          </div>

          {result.rejectedRows && result.rejectedRows.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Validation Errors Detected:
              </h5>
              <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                {result.rejectedRows.map((rej, i) => (
                  <div key={i} className="py-1 border-b border-slate-900 last:border-0">
                    <span className="font-semibold text-rose-300">Row {rej.row}:</span>{' '}
                    {rej.errors.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <Button variant="secondary" onClick={handleReset}>
              Import Another File
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                handleReset();
                onClose();
              }}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default CsvImportModal;
