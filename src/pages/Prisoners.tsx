import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Printer,
  Shield,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { usePrisonData } from '../context/PrisonDataContext';
import { useAuth } from '../context/AuthContext';
import { Prisoner, PrisonerCategory, PrisonerStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const Prisoners: React.FC = () => {
  const { currentUser, canManagePrisoners } = useAuth();
  const {
    prisoners,
    cells,
    addPrisoner,
    updatePrisoner,
    deletePrisoner,
    generateNextPrisonerId,
    recommendCellsForPrisoner,
  } = usePrisonData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBlock, setFilterBlock] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'releaseDate'>('id');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingPrisoner, setViewingPrisoner] = useState<Prisoner | null>(null);
  const [editingPrisoner, setEditingPrisoner] = useState<Prisoner | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const initialForm: Omit<Prisoner, 'id'> = {
    fullName: '',
    age: 28,
    gender: 'Male',
    dob: '1998-05-15',
    address: '',
    phone: '',
    emergencyContact: '',
    admissionDate: new Date().toISOString().split('T')[0],
    category: 'General',
    sentenceDuration: '2 Years',
    releaseDate: '2028-08-16',
    block: 'Block A',
    cellNumber: 'A101',
    status: 'Active',
    bloodGroup: 'O+',
    medicalNotes: '',
  };

  const [formData, setFormData] = useState<Omit<Prisoner, 'id'>>(initialForm);
  const [formError, setFormError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Filtered & Sorted Prisoners List
  const filteredPrisoners = useMemo(() => {
    return (prisoners || [])
      .filter((p) => {
        if (!p) return false;
        const matchesSearch =
          (p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.cellNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.emergencyContact || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.phone || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;
        const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
        const matchesBlock = filterBlock === 'ALL' || p.block === filterBlock;

        return matchesSearch && matchesCategory && matchesStatus && matchesBlock;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return (a.fullName || '').localeCompare(b.fullName || '');
        if (sortBy === 'releaseDate') return (a.releaseDate || '').localeCompare(b.releaseDate || '');
        return (a.id || '').localeCompare(b.id || '');
      });
  }, [prisoners, searchTerm, filterCategory, filterStatus, filterBlock, sortBy]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextId = generateNextPrisonerId();
    // Default smart cell
    const recommendations = recommendCellsForPrisoner('General');
    const defaultCell = recommendations[0]?.cell;

    setFormData({
      ...initialForm,
      block: (defaultCell?.block as any) || 'Block A',
      cellNumber: defaultCell?.cellNumber || 'A101',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (prisoner: Prisoner) => {
    setEditingPrisoner(prisoner);
    setFormData({
      fullName: prisoner.fullName,
      age: prisoner.age,
      gender: prisoner.gender,
      dob: prisoner.dob,
      address: prisoner.address,
      phone: prisoner.phone,
      emergencyContact: prisoner.emergencyContact,
      admissionDate: prisoner.admissionDate,
      category: prisoner.category,
      caseId: prisoner.caseId,
      sentenceDuration: prisoner.sentenceDuration,
      releaseDate: prisoner.releaseDate,
      block: prisoner.block,
      cellNumber: prisoner.cellNumber,
      status: prisoner.status,
      bloodGroup: prisoner.bloodGroup || 'O+',
      medicalNotes: prisoner.medicalNotes || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Form Submission
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setFormError('Inmate full name is required.');
      return;
    }
    if (formData.age < 18) {
      setFormError('Inmate must be at least 18 years of age (Adult correctional facility).');
      return;
    }

    const res = addPrisoner(formData);
    if (res.success) {
      setFeedbackMsg(`Prisoner ${formData.fullName} added successfully with ID ${res.id}`);
      setIsAddModalOpen(false);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrisoner) return;
    if (!formData.fullName.trim()) {
      setFormError('Inmate full name is required.');
      return;
    }

    const res = updatePrisoner(editingPrisoner.id, formData);
    if (res.success) {
      setFeedbackMsg(`Prisoner ${editingPrisoner.id} updated successfully.`);
      setIsEditModalOpen(false);
      setEditingPrisoner(null);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deletePrisoner(deletingId);
      setDeletingId(null);
      setFeedbackMsg(`Prisoner record deleted.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  // Recommendations for current form category
  const cellRecommendations = useMemo(() => {
    return recommendCellsForPrisoner(formData.category);
  }, [formData.category, cells]);

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Prisoner Management Roster</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 3: Inmate admission, demographic records, legal category classification, cell assignment & custody tracking.
          </p>
        </div>

        {canManagePrisoners && (
          <button
            id="btn-add-prisoner"
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Prisoner</span>
          </button>
        )}
      </div>

      {/* Success Notification Banner */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{feedbackMsg}</span>
        </div>
      )}

      {/* Filters, Search & Sorting Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID (e.g. PRN-2026-0001), Name, Cell..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Category */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="General">General</option>
              <option value="High Security">High Security</option>
              <option value="Under Trial">Under Trial</option>
              <option value="Convicted">Convicted</option>
              <option value="Remand">Remand</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Custody</option>
              <option value="Released">Released</option>
              <option value="Transferred">Transferred</option>
            </select>
          </div>

          {/* Filter Block */}
          <div>
            <select
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Blocks</option>
              <option value="Block A">Block A (General)</option>
              <option value="Block B">Block B (High Sec)</option>
              <option value="Block C">Block C (Remand)</option>
            </select>
          </div>
        </div>

        {/* Status Count Badges & Active Count */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Showing <strong>{filteredPrisoners.length}</strong> of {prisoners.length} prisoners</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400">Sort by:</span>
            <button
              onClick={() => setSortBy('id')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                sortBy === 'id' ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-100 text-slate-600'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                sortBy === 'name' ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('releaseDate')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                sortBy === 'releaseDate' ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Release Date
            </button>
          </div>
        </div>
      </div>

      {/* Main Prisoner Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Prisoner ID</th>
                <th className="py-3.5 px-4">Inmate Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Block & Cell</th>
                <th className="py-3.5 px-4">Custody Status</th>
                <th className="py-3.5 px-4">Admission Date</th>
                <th className="py-3.5 px-4">Expected Release</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPrisoners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No prisoner records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPrisoners.map((prisoner) => (
                  <tr key={prisoner.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {prisoner.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{prisoner.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {prisoner.age} yrs • {prisoner.gender} • Blood: {prisoner.bloodGroup || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="category" value={prisoner.category} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{prisoner.block}</span>
                      <span className="text-slate-500 ml-1">({prisoner.cellNumber})</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="prisonerStatus" value={prisoner.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {prisoner.admissionDate}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                      {prisoner.releaseDate || 'Undetermined'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* View Button */}
                        <button
                          onClick={() => setViewingPrisoner(prisoner)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Prisoner Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        {canManagePrisoners && (
                          <button
                            onClick={() => handleOpenEditModal(prisoner)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Inmate Information"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button (Admin Only) */}
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => setDeletingId(prisoner.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Prisoner Record"
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

      {/* Add / Register Inmate Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold">Inmate Admission Registration</h3>
                  <p className="text-[11px] text-slate-400">
                    Auto-generated ID: <strong>{generateNextPrisonerId()}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar Sharma"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Age & Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 18 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth & Blood Group */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prisoner Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value as PrisonerCategory;
                      const recs = recommendCellsForPrisoner(newCat);
                      const bestCell = recs[0]?.cell;
                      setFormData({
                        ...formData,
                        category: newCat,
                        block: (bestCell?.block as any) || formData.block,
                        cellNumber: bestCell?.cellNumber || formData.cellNumber,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                  >
                    <option value="General">General</option>
                    <option value="High Security">High Security</option>
                    <option value="Under Trial">Under Trial</option>
                    <option value="Convicted">Convicted</option>
                    <option value="Remand">Remand</option>
                  </select>
                </div>

                {/* Sentence Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sentence Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sentenceDuration}
                    onChange={(e) => setFormData({ ...formData, sentenceDuration: e.target.value })}
                    placeholder="e.g. 3 Years, Under Trial"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Admission Date & Expected Release Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admission Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expected Release Date
                  </label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Rule-Based Cell Allocation Selector */}
                <div className="sm:col-span-2 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-blue-900">
                      Rule-Based Cell Allocation Engine
                    </label>
                    <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                      Suggested for {formData.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Block</label>
                      <select
                        value={formData.block}
                        onChange={(e) => {
                          const blk = e.target.value;
                          const firstCellInBlk = cells.find((c) => c.block === blk && c.status !== 'Maintenance');
                          setFormData({
                            ...formData,
                            block: blk,
                            cellNumber: firstCellInBlk ? firstCellInBlk.cellNumber : formData.cellNumber,
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs"
                      >
                        <option value="Block A">Block A (General Custody)</option>
                        <option value="Block B">Block B (High Security)</option>
                        <option value="Block C">Block C (Remand & Trial)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Available Cell Number
                      </label>
                      <select
                        value={formData.cellNumber}
                        onChange={(e) => setFormData({ ...formData, cellNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-mono"
                      >
                        {cells
                          .filter((c) => c.block === formData.block && c.status !== 'Maintenance')
                          .map((c) => (
                            <option key={c.id} value={c.cellNumber}>
                              Cell {c.cellNumber} ({c.currentOccupancy}/{c.capacity} occupied • Sec: {c.securityLevel})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {cellRecommendations.length > 0 && (
                    <div className="mt-2 text-[11px] text-blue-800 flex items-center space-x-1">
                      <span>Top recommended cell:</span>
                      <strong className="font-mono">{cellRecommendations[0].cell.cellNumber}</strong>
                      <span>({cellRecommendations[0].reasons.join(', ')})</span>
                    </div>
                  )}
                </div>

                {/* Contact and Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Permanent Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 12 Fort Road, Jaipur, Rajasthan"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98112 34567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emergency Contact (Relative)
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="e.g. Sunita Gupta (Wife): +91 98112 34568"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Medical Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medical & Health Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    placeholder="Allergies, chronic conditions, daily medications..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
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
                  Register Inmate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inmate Modal */}
      {isEditModalOpen && editingPrisoner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">Edit Inmate Record</h3>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {editingPrisoner.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custody Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PrisonerStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Released">Released</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as PrisonerCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="General">General</option>
                    <option value="High Security">High Security</option>
                    <option value="Under Trial">Under Trial</option>
                    <option value="Convicted">Convicted</option>
                    <option value="Remand">Remand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Block</label>
                  <select
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cell Number</label>
                  <select
                    value={formData.cellNumber}
                    onChange={(e) => setFormData({ ...formData, cellNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  >
                    {cells
                      .filter((c) => c.block === formData.block)
                      .map((c) => (
                        <option key={c.id} value={c.cellNumber}>
                          Cell {c.cellNumber}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Release Date</label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sentence Duration</label>
                  <input
                    type="text"
                    value={formData.sentenceDuration}
                    onChange={(e) => setFormData({ ...formData, sentenceDuration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medical Notes</label>
                  <textarea
                    rows={2}
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Prisoner Profile Modal & Printable Badge */}
      {viewingPrisoner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold">Official Inmate Custody Dossier</h3>
              </div>
              <button
                onClick={() => setViewingPrisoner(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Top Profile Card */}
              <div className="flex items-start space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-20 h-24 bg-slate-200 rounded-xl border border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                  <Users className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Mugshot</span>
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                      {viewingPrisoner.id}
                    </span>
                    <StatusBadge type="prisonerStatus" value={viewingPrisoner.status} />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{viewingPrisoner.fullName}</h2>
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <StatusBadge type="category" value={viewingPrisoner.category} />
                    <span>• {viewingPrisoner.age} yrs • {viewingPrisoner.gender}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Blood Group: <strong>{viewingPrisoner.bloodGroup || 'O+'}</strong></p>
                </div>
              </div>

              {/* Custody Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Cell</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {viewingPrisoner.block} — {viewingPrisoner.cellNumber}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Date</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {viewingPrisoner.admissionDate}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Sentence Term</span>
                  <span className="font-semibold text-slate-900">{viewingPrisoner.sentenceDuration}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected Release</span>
                  <span className="font-mono font-bold text-blue-700">
                    {viewingPrisoner.releaseDate || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="text-xs space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Permanent Address</span>
                  <p className="text-slate-800">{viewingPrisoner.address || 'Address on record with registrar.'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency Contact</span>
                  <p className="text-slate-800">{viewingPrisoner.emergencyContact || 'No emergency contact specified.'}</p>
                </div>
              </div>

              {/* Medical Wellness Notes */}
              <div className="text-xs p-3.5 bg-amber-50/50 rounded-xl border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
                  Health & Medical Notes
                </span>
                <p className="text-slate-700">{viewingPrisoner.medicalNotes || 'No acute medical conditions reported.'}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Inmate Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPrisoner(null)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Prisoner Record?"
        message="Are you sure you want to delete this prisoner record from the database? This action will update cell occupancy."
        confirmLabel="Delete Prisoner"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
