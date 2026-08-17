import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  X,
  Printer,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { usePrisonData } from '../context/PrisonDataContext';
import { useAuth } from '../context/AuthContext';
import { ReleaseRecord, ReleaseType, ReleaseStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const Releases: React.FC = () => {
  const { canManageReleases, currentUser } = useAuth();
  const { releases, prisoners, addRelease, processRelease, updateRelease, generateNextReleaseId } =
    usePrisonData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [processingReleaseId, setProcessingReleaseId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<ReleaseRecord, 'id'>>({
    prisonerId: prisoners[0]?.id || 'PRN-2026-0001',
    prisonerName: prisoners[0]?.fullName || '',
    expectedReleaseDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    releaseType: 'Sentence Completed',
    status: 'Upcoming',
    authorizedOfficer: currentUser?.name || 'Superintendent Rajesh Sharma',
    notes: 'Standard sentence discharge on good conduct.',
  });

  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');

  // 30-day upcoming calculation
  const isWithin30Days = (dateStr: string) => {
    if (!dateStr) return false;
    const target = new Date(dateStr).getTime();
    const today = new Date('2026-08-16').getTime();
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  const filteredReleases = useMemo(() => {
    return (releases || []).filter((r) => {
      if (!r) return false;
      const matchesSearch =
        (r.prisonerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.prisonerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.releaseType || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [releases, searchTerm, filterStatus]);

  const handleOpenAdd = () => {
    const activeInmate = prisoners.find((p) => p.status === 'Active') || prisoners[0];
    setFormData({
      prisonerId: activeInmate?.id || '',
      prisonerName: activeInmate?.fullName || '',
      expectedReleaseDate: activeInmate?.releaseDate || new Date().toISOString().split('T')[0],
      releaseType: 'Sentence Completed',
      status: 'Upcoming',
      authorizedOfficer: currentUser?.name || 'Superintendent Rajesh Sharma',
      notes: 'All prison formalities and discharge clearance verified.',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expectedReleaseDate) {
      setFormError('Expected release date is required.');
      return;
    }

    const p = prisoners.find((item) => item.id === formData.prisonerId);
    const res = addRelease({
      ...formData,
      prisonerName: p?.fullName || formData.prisonerName,
    });

    if (res.success) {
      setFeedback('Release record scheduled successfully.');
      setIsAddModalOpen(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const handleConfirmProcessRelease = () => {
    if (processingReleaseId) {
      const res = processRelease(processingReleaseId);
      if (res.success) {
        setFeedback(res.message);
        setProcessingReleaseId(null);
        setTimeout(() => setFeedback(''), 4000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <CalendarCheck className="w-6 h-6 text-rose-600" />
            <span>Inmate Release Management & Discharge</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 7 & 18: Sentence completion dates, court bail clearances, discharge authorization & automatic cell vacation.
          </p>
        </div>

        {canManageReleases && (
          <button
            id="btn-schedule-release"
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Inmate Release</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{feedback}</span>
        </div>
      )}

      {/* 30-Day Alert Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <div className="font-bold text-sm">30-Day Upcoming Release Watchlist Active</div>
          <p className="mt-0.5 leading-relaxed">
            The system automatically calculates upcoming releases. When a release is authorized, the inmate status switches to <strong>Released</strong> and the occupied cell capacity is automatically freed.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Release ID, Inmate Name, Type..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'Upcoming', 'Released'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Records' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Release Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Release ID</th>
                <th className="py-3.5 px-4">Inmate Details</th>
                <th className="py-3.5 px-4">Release Category</th>
                <th className="py-3.5 px-4">Expected Date</th>
                <th className="py-3.5 px-4">Actual Discharge</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Authorized Officer</th>
                <th className="py-3.5 px-4 text-right">Discharge Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredReleases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No release records found.
                  </td>
                </tr>
              ) : (
                filteredReleases.map((release) => {
                  const upcoming30 = release.status === 'Upcoming' && isWithin30Days(release.expectedReleaseDate);

                  return (
                    <tr key={release.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {release.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{release.prisonerName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{release.prisonerId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{release.releaseType}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {release.expectedReleaseDate}
                          </span>
                          {upcoming30 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                              &lt; 30 Days
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {release.actualReleaseDate || 'Pending'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge type="releaseStatus" value={release.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {release.authorizedOfficer}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {release.status === 'Upcoming' && canManageReleases ? (
                          <button
                            id={`btn-process-release-${release.id}`}
                            onClick={() => setProcessingReleaseId(release.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Authorize Release</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-slate-400 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Discharged</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Release Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarCheck className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold">Schedule Inmate Release Record</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Inmate *</label>
                <select
                  value={formData.prisonerId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const p = prisoners.find((item) => item.id === pid);
                    setFormData({
                      ...formData,
                      prisonerId: pid,
                      prisonerName: p ? p.fullName : '',
                      expectedReleaseDate: p?.releaseDate || formData.expectedReleaseDate,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  {prisoners
                    .filter((p) => p.status === 'Active')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.id} • {p.block} - {p.cellNumber})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expected Release Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expectedReleaseDate}
                    onChange={(e) => setFormData({ ...formData, expectedReleaseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Release Type</label>
                  <select
                    value={formData.releaseType}
                    onChange={(e) => setFormData({ ...formData, releaseType: e.target.value as ReleaseType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Sentence Completed">Sentence Completed</option>
                    <option value="Court Order">Court Order / Bail</option>
                    <option value="Transfer">Inter-Prison Transfer</option>
                    <option value="Bail / Remand End">Bail / Remand End</option>
                    <option value="Other">Other Executive Order</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Authorizing Officer
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorizedOfficer}
                  onChange={(e) => setFormData({ ...formData, authorizedOfficer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discharge Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Court order reference, family intimation, medical clear..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs"
                >
                  Schedule Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Process Release Dialog */}
      <ConfirmModal
        isOpen={!!processingReleaseId}
        title="Confirm Formal Inmate Discharge?"
        message="This action will mark the prisoner's custody status as 'Released', record the actual discharge date, and automatically decrement cell occupancy so the bed becomes available for new admissions."
        confirmLabel="Authorize Discharge & De-allocate Cell"
        variant="primary"
        onConfirm={handleConfirmProcessRelease}
        onCancel={() => setProcessingReleaseId(null)}
      />
    </div>
  );
};
