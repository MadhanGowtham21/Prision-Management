import React, { useState, useMemo } from 'react';
import {
  UserCheck2,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
  FileBadge,
  Calendar,
  AlertCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import { usePrisonData } from '../context/PrisonDataContext';
import { useAuth } from '../context/AuthContext';
import { Visitor, VisitorStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const Visitors: React.FC = () => {
  const { currentUser, canManageVisitors } = useAuth();
  const {
    visitors,
    prisoners,
    addVisitor,
    updateVisitorStatus,
    deleteVisitor,
    generateNextVisitorId,
  } = usePrisonData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingVisitor, setViewingVisitor] = useState<Visitor | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Visitor, 'id'>>({
    visitorName: '',
    phone: '',
    relationship: 'Family Member',
    idProofType: 'Aadhaar Card',
    idProofNumber: '',
    prisonerId: prisoners[0]?.id || 'PRN-2026-0001',
    prisonerName: prisoners[0]?.fullName || '',
    requestedDate: new Date().toISOString().split('T')[0],
    visitDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: '10:00 AM - 11:00 AM',
    status: 'Pending',
    notes: '',
  });

  const [formError, setFormError] = useState('');

  const filteredVisitors = useMemo(() => {
    return (visitors || []).filter((v) => {
      if (!v) return false;
      const matchesSearch =
        (v.visitorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.prisonerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.prisonerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.idProofNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [visitors, searchTerm, filterStatus]);

  const handleOpenAdd = () => {
    const defaultPrisoner = prisoners.find((p) => p.status === 'Active') || prisoners[0];
    setFormData({
      visitorName: '',
      phone: '',
      relationship: 'Family Member',
      idProofType: 'Aadhaar Card',
      idProofNumber: '',
      prisonerId: defaultPrisoner?.id || '',
      prisonerName: defaultPrisoner?.fullName || '',
      requestedDate: new Date().toISOString().split('T')[0],
      visitDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      timeSlot: '10:00 AM - 11:00 AM',
      status: 'Pending',
      notes: '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visitorName.trim()) {
      setFormError('Visitor name is required.');
      return;
    }
    if (!formData.idProofNumber.trim()) {
      setFormError('Valid ID Proof Number is required for prison security clearance.');
      return;
    }

    const selectedPrisoner = prisoners.find((p) => p.id === formData.prisonerId);
    const res = addVisitor({
      ...formData,
      prisonerName: selectedPrisoner?.fullName || formData.prisonerName,
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
            <UserCheck2 className="w-6 h-6 text-sky-600" />
            <span>Visitor Management & Gate Pass Approval</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 5 & 16: Visitor authentication, ID verification, approval workflow, and visitation logs.
          </p>
        </div>

        {canManageVisitors && (
          <button
            id="btn-add-visitor"
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Book Visitor Pass</span>
          </button>
        )}
      </div>

      {/* Stats row for visitors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Visits</span>
          <p className="text-xl font-bold text-slate-900">{visitors.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending Review</span>
          <p className="text-xl font-bold text-amber-900">
            {visitors.filter((v) => v.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Approved</span>
          <p className="text-xl font-bold text-emerald-900">
            {visitors.filter((v) => v.status === 'Approved').length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Completed</span>
          <p className="text-xl font-bold text-blue-900">
            {visitors.filter((v) => v.status === 'Completed').length}
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
            placeholder="Search visitor, inmate name, ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['ALL', 'Pending', 'Approved', 'Completed', 'Rejected'].map((status) => (
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

      {/* Visitors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Pass ID</th>
                <th className="py-3.5 px-4">Visitor Details</th>
                <th className="py-3.5 px-4">Inmate Visiting</th>
                <th className="py-3.5 px-4">ID Proof</th>
                <th className="py-3.5 px-4">Scheduled Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Pass Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No visitor records found.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {visitor.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{visitor.visitorName}</div>
                      <div className="text-[11px] text-slate-500">
                        {visitor.relationship} • {visitor.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{visitor.prisonerName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{visitor.prisonerId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{visitor.idProofType}</span>
                      <div className="text-[10px] font-mono text-slate-400">{visitor.idProofNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 font-medium">{visitor.visitDate}</div>
                      <div className="text-[10px] text-slate-500">{visitor.timeSlot || 'General Slot'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="visitorStatus" value={visitor.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* If Pending, Show Approve/Reject Buttons for Officer */}
                        {visitor.status === 'Pending' && canManageVisitors && (
                          <>
                            <button
                              onClick={() => updateVisitorStatus(visitor.id, 'Approved')}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Approve Visitor Pass"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateVisitorStatus(visitor.id, 'Rejected', 'Security clearance declined')}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                              title="Reject Visitor Request"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* If Approved, can mark completed */}
                        {visitor.status === 'Approved' && canManageVisitors && (
                          <button
                            onClick={() => updateVisitorStatus(visitor.id, 'Completed')}
                            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                            title="Mark Visit Concluded"
                          >
                            Mark Completed
                          </button>
                        )}

                        <button
                          onClick={() => setViewingVisitor(visitor)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => deleteVisitor(visitor.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                            title="Delete Pass"
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

      {/* Add Visitor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck2 className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold">Register Inmate Visitor Request</h3>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Visitor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.visitorName}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                  placeholder="e.g. Sunita Gupta"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98112 34567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Wife / Husband">Wife / Husband</option>
                    <option value="Father / Mother">Father / Mother</option>
                    <option value="Brother / Sister">Brother / Sister</option>
                    <option value="Son / Daughter">Son / Daughter</option>
                    <option value="Legal Counsel">Legal Counsel (Lawyer)</option>
                    <option value="Friend / Acquaintance">Friend / Acquaintance</option>
                  </select>
                </div>
              </div>

              {/* ID Proof */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Govt ID Type *</label>
                  <select
                    value={formData.idProofType}
                    onChange={(e) => setFormData({ ...formData, idProofType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                    <option value="National ID">Bar Council / National ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ID Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.idProofNumber}
                    onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
                    placeholder="XXXX-XXXX-1234"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Select Prisoner */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inmate Being Visited *
                </label>
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
                  {prisoners
                    .filter((p) => p.status === 'Active')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.id} • {p.block} - {p.cellNumber})
                      </option>
                    ))}
                </select>
              </div>

              {/* Dates and Time Slots */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Visit Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="09:30 AM - 10:30 AM">09:30 AM - 10:30 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="03:30 PM - 04:30 PM">03:30 PM - 04:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visit Purpose / Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Family welfare, legal consult, document signing..."
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
                  Submit Pass Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Details Modal */}
      {viewingVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Visitor Pass: {viewingVisitor.id}</h3>
              <button
                onClick={() => setViewingVisitor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Visitor Name:</span>
                <span className="font-bold text-slate-900">{viewingVisitor.visitorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Relationship:</span>
                <span className="font-medium text-slate-800">{viewingVisitor.relationship}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">ID Proof:</span>
                <span className="font-mono text-slate-800">{viewingVisitor.idProofType} ({viewingVisitor.idProofNumber})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Inmate:</span>
                <span className="font-bold text-slate-900">{viewingVisitor.prisonerName} ({viewingVisitor.prisonerId})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Visit Scheduled:</span>
                <span className="font-semibold text-blue-700">{viewingVisitor.visitDate} @ {viewingVisitor.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Status:</span>
                <StatusBadge type="visitorStatus" value={viewingVisitor.status} />
              </div>
              {viewingVisitor.reviewedBy && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Reviewed By:</span>
                  <span className="text-slate-700">{viewingVisitor.reviewedBy}</span>
                </div>
              )}
              {viewingVisitor.notes && (
                <div className="pt-2 text-slate-600 bg-slate-50 p-2.5 rounded-lg text-[11px]">
                  <strong>Notes:</strong> {viewingVisitor.notes}
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setViewingVisitor(null)}
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
