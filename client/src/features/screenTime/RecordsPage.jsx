import React, { useState, useEffect, useCallback } from 'react';
import screenTimeApi from '../../services/screenTimeApi.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { AddEditRecordModal } from './AddEditRecordModal.jsx';
import { CsvImportModal } from './CsvImportModal.jsx';
import {
  formatMinutesToHours,
  formatDate,
  formatTime24to12,
  getCategoryBadgeClass,
} from '../../utils/formatters.js';
import {
  Plus,
  Upload,
  Download,
  Filter,
  Trash2,
  Edit2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchRecords = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const res = await screenTimeApi.getAll({
          page,
          limit: pagination.limit,
          category: categoryFilter || undefined,
          source: sourceFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        setRecords(res.data || []);
        if (res.meta) {
          setPagination(res.meta);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load screen-time records');
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit, categoryFilter, sourceFilter, startDate, endDate]
  );

  useEffect(() => {
    fetchRecords(1);
  }, [categoryFilter, sourceFilter, startDate, endDate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await screenTimeApi.delete(id);
      fetchRecords(pagination.page);
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const handleExport = () => {
    screenTimeApi.exportCSV();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Screen Time Records
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, filter, edit, or batch import and export your usage history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="secondary"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            Import CSV
          </Button>

          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>

          <Button
            onClick={() => {
              setEditingRecord(null);
              setIsAddModalOpen(true);
            }}
            variant="primary"
            size="sm"
            className="w-full sm:w-auto font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Log Entry
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              <option value="Productivity">Productivity</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Social">Social</option>
              <option value="Communication">Communication</option>
              <option value="Gaming">Gaming</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Source
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Sources</option>
              <option value="manual">Manual Entry</option>
              <option value="CSV">CSV Import</option>
              <option value="demo">Demo Data</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </Card>

      {/* Records Table */}
      {isLoading ? (
        <Spinner size="lg" className="py-20" />
      ) : records.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No Screen-Time Records Found"
          description="You haven't logged any records matching the selected filters. Import a CSV or log an entry to get started."
          actionLabel="Log First Entry"
          onAction={() => {
            setEditingRecord(null);
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Application</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">Time Window</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      {r.applicationName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                          r.category
                        )}`}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {formatDate(r.date)}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      {formatMinutesToHours(r.durationMinutes)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {r.startTime ? (
                        <span>
                          {formatTime24to12(r.startTime)}{' '}
                          {r.endTime ? `– ${formatTime24to12(r.endTime)}` : ''}
                        </span>
                      ) : (
                        <span className="italic text-slate-500">Daily aggregate</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          r.source === 'demo'
                            ? 'amber'
                            : r.source === 'CSV'
                            ? 'blue'
                            : 'slate'
                        }
                        size="sm"
                      >
                        {r.source}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingRecord(r);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {records.length} of {pagination.total} records (Page {pagination.page} of{' '}
              {pagination.totalPages || 1})
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchRecords(pagination.page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchRecords(pagination.page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEditRecordModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        onSaved={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
          fetchRecords(1);
        }}
        record={editingRecord}
      />

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          fetchRecords(1);
        }}
      />
    </div>
  );
}

export default RecordsPage;
