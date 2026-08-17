import React, { useState, useMemo } from 'react';
import { FileCheck, Plus, Search, Scale, Calendar, Eye, Trash2, X, AlertCircle } from 'lucide-react';
import { usePrisonData } from '../context/PrisonDataContext';
import { useAuth } from '../context/AuthContext';
import { CaseRecord, CaseStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const Cases: React.FC = () => {
  const { canManageCases, currentUser } = useAuth();
  const { cases, prisoners, addCase, updateCase, deleteCase, generateNextCaseId } = usePrisonData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingCase, setViewingCase] = useState<CaseRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<CaseRecord, 'id'>>({
    prisonerId: prisoners[0]?.id || 'PRN-2026-0001',
    prisonerName: prisoners[0]?.fullName || '',
    caseNumber: '',
    courtName: '',
    offence: '',
    caseStatus: 'Active',
    sentenceDuration: '3 Years',
    judgmentDate: new Date().toISOString().split('T')[0],
    judgeName: '',
    notes: '',
  });

  const [formError, setFormError] = useState('');

  const filteredCases = useMemo(() => {
    return (cases || []).filter((c) => {
      if (!c) return false;
      const matchesSearch =
        (c.caseNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.prisonerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.prisonerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.courtName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.offence || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'ALL' || c.caseStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [cases, searchTerm, filterStatus]);

  const handleOpenAdd = () => {
    const defaultPrisoner = prisoners[0];
    setFormData({
      prisonerId: defaultPrisoner?.id || '',
      prisonerName: defaultPrisoner?.fullName || '',
      caseNumber: `CC-${Math.floor(1000 + Math.random() * 9000)}/2026`,
      courtName: 'Metropolitan Magistrate Court',
      offence: '',
      caseStatus: 'Active',
      sentenceDuration: '3 Years Rigorous Imprisonment',
      judgmentDate: new Date().toISOString().split('T')[0],
      judgeName: 'Hon. Magistrate',
      notes: '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseNumber.trim()) {
      setFormError('Case number is required.');
      return;
    }
    if (!formData.offence.trim()) {
      setFormError('Offence / legal charges description is required.');
      return;
    }

    const p = prisoners.find((item) => item.id === formData.prisonerId);
    const res = addCase({
      ...formData,
      prisonerName: p?.fullName || formData.prisonerName,
    });

    if (res.success) {
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Scale className="w-6 h-6 text-indigo-600" />
            <span>Prisoner Legal Cases & Trial Docket</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 6 & 17: Court warrants, criminal charges, trial statuses, and judicial judgments.
          </p>
        </div>

        {canManageCases && (
          <button
            id="btn-add-case"
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Legal Case</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Case Number, Offence, Inmate..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'Active', 'Pending', 'Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Case ID</th>
                <th className="py-3.5 px-4">Case / Court Number</th>
                <th className="py-3.5 px-4">Inmate Details</th>
                <th className="py-3.5 px-4">Offence Charges</th>
                <th className="py-3.5 px-4">Court Name</th>
                <th className="py-3.5 px-4">Sentence Term</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No legal case records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {caseItem.id}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                      {caseItem.caseNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{caseItem.prisonerName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{caseItem.prisonerId}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate" title={caseItem.offence}>
                      <span className="text-slate-800 font-medium">{caseItem.offence}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {caseItem.courtName}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {caseItem.sentenceDuration}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="caseStatus" value={caseItem.caseStatus} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setViewingCase(caseItem)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600"
                          title="View Case Docket"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => deleteCase(caseItem.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                            title="Delete Case Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Case Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold">Record Prisoner Legal Case</h3>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Inmate *</label>
                <select
                  value={formData.prisonerId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const p = prisoners.find((item) => item.id === pid);
                    setFormData({
                      ...formData,
                      prisonerId: pid,
                      prisonerName: p ? p.fullName : '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  {prisoners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Case Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    placeholder="e.g. SC-4012/2023"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Case Status</label>
                  <select
                    value={formData.caseStatus}
                    onChange={(e) => setFormData({ ...formData, caseStatus: e.target.value as CaseStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                  >
                    <option value="Active">Active Hearing</option>
                    <option value="Pending">Pending Verdict</option>
                    <option value="Closed">Closed / Convicted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Court Name *</label>
                <input
                  type="text"
                  required
                  value={formData.courtName}
                  onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                  placeholder="e.g. District & Sessions Court, Delhi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Offence / Charges *</label>
                <input
                  type="text"
                  required
                  value={formData.offence}
                  onChange={(e) => setFormData({ ...formData, offence: e.target.value })}
                  placeholder="e.g. Financial Fraud & Forgery (Sec 420/468)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sentence Term</label>
                  <input
                    type="text"
                    value={formData.sentenceDuration}
                    onChange={(e) => setFormData({ ...formData, sentenceDuration: e.target.value })}
                    placeholder="e.g. 5 Years"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judgment Date</label>
                  <input
                    type="date"
                    value={formData.judgmentDate}
                    onChange={(e) => setFormData({ ...formData, judgmentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judge / Bench Name</label>
                <input
                  type="text"
                  value={formData.judgeName}
                  onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })}
                  placeholder="e.g. Hon. Justice P. K. Saxena"
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
                  Save Case Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      {viewingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Court Docket: {viewingCase.caseNumber}</h3>
              <button
                onClick={() => setViewingCase(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Inmate Name:</span>
                <span className="font-bold text-slate-900">{viewingCase.prisonerName} ({viewingCase.prisonerId})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Court:</span>
                <span className="font-semibold text-slate-800">{viewingCase.courtName}</span>
              </div>
              <div className="py-1 border-b border-slate-50">
                <span className="text-slate-400 block mb-0.5">Offence Charges:</span>
                <span className="font-medium text-rose-800 bg-rose-50 px-2 py-1 rounded-md block">{viewingCase.offence}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Sentence Duration:</span>
                <span className="font-bold text-slate-900">{viewingCase.sentenceDuration}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Judgment Date:</span>
                <span className="font-mono text-slate-800">{viewingCase.judgmentDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Status:</span>
                <StatusBadge type="caseStatus" value={viewingCase.caseStatus} />
              </div>
              {viewingCase.judgeName && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Presiding Judge:</span>
                  <span className="text-slate-700">{viewingCase.judgeName}</span>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setViewingCase(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
