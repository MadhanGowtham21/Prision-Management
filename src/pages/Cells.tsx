import React, { useState } from 'react';
import {
  Grid,
  Plus,
  Wrench,
  CheckCircle2,
  Lock,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  X,
  AlertTriangle,
} from 'lucide-react';
import { usePrisonData } from '../context/PrisonDataContext';
import { useAuth } from '../context/AuthContext';
import { Cell, CellSecurityLevel, PrisonerCategory } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const Cells: React.FC = () => {
  const { canManageCells } = useAuth();
  const { cells, prisoners, addCell, toggleCellMaintenance, recommendCellsForPrisoner } = usePrisonData();

  const [activeBlockTab, setActiveBlockTab] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allocationCategory, setAllocationCategory] = useState<PrisonerCategory>('High Security');
  const [showAllocationDrawer, setShowAllocationDrawer] = useState(false);

  // Add Cell Form
  const [newCell, setNewCell] = useState<Omit<Cell, 'id' | 'currentOccupancy' | 'status'>>({
    block: 'Block A',
    cellNumber: 'A301',
    capacity: 2,
    securityLevel: 'Medium',
    floor: 3,
    notes: '',
  });
  const [formError, setFormError] = useState('');

  const filteredCells = (cells || []).filter((c) => activeBlockTab === 'ALL' || c.block === activeBlockTab);

  const handleAddCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCell.cellNumber.trim()) {
      setFormError('Cell number is required.');
      return;
    }
    const res = addCell({
      ...newCell,
      currentOccupancy: 0,
      status: 'Available',
    });
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setIsAddModalOpen(false);
    setFormError('');
  };

  // Rule-based recommendations for chosen category
  const allocationRecommendations = recommendCellsForPrisoner(allocationCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Grid className="w-6 h-6 text-indigo-600" />
            <span>Cell & Block Facility Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 4 & 14: Security wings, capacity quotas, occupancy counters, and rule-based cell allocator.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-cell-allocator-tool"
            onClick={() => setShowAllocationDrawer(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Rule-Based Allocator</span>
          </button>

          {canManageCells && (
            <button
              id="btn-add-cell"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Cell</span>
            </button>
          )}
        </div>
      </div>

      {/* Block Summaries & Allocation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Block A */}
        <div
          onClick={() => setActiveBlockTab('Block A')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeBlockTab === 'Block A'
              ? 'bg-blue-50/50 border-blue-500 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Block A (General)</h3>
            </div>
            <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
              Low/Med Sec
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">General custody wards, standard inmates</p>
          <div className="mt-3 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Cells: {cells.filter((c) => c.block === 'Block A').length}</span>
            <span className="text-blue-600">
              Inmates: {prisoners.filter((p) => p.status === 'Active' && p.block === 'Block A').length}
            </span>
          </div>
        </div>

        {/* Block B */}
        <div
          onClick={() => setActiveBlockTab('Block B')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeBlockTab === 'Block B'
              ? 'bg-amber-50/50 border-amber-500 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Block B (High Security)</h3>
            </div>
            <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
              High/Max Sec
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Reinforced doors, isolation units, CCTV</p>
          <div className="mt-3 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Cells: {cells.filter((c) => c.block === 'Block B').length}</span>
            <span className="text-amber-600">
              Inmates: {prisoners.filter((p) => p.status === 'Active' && p.block === 'Block B').length}
            </span>
          </div>
        </div>

        {/* Block C */}
        <div
          onClick={() => setActiveBlockTab('Block C')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeBlockTab === 'Block C'
              ? 'bg-sky-50/50 border-sky-500 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Block C (Remand & Trial)</h3>
            </div>
            <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
              Medium Sec
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Under-trial dormitories & temporary remand</p>
          <div className="mt-3 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Cells: {cells.filter((c) => c.block === 'Block C').length}</span>
            <span className="text-sky-600">
              Inmates: {prisoners.filter((p) => p.status === 'Active' && p.block === 'Block C').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          {['ALL', 'Block A', 'Block B', 'Block C'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveBlockTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeBlockTab === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All Blocks' : tab}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500">
          Showing <strong>{filteredCells.length}</strong> cells
        </span>
      </div>

      {/* Cells Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCells.map((cell) => {
          const occupancyRatio = (cell.currentOccupancy / cell.capacity) * 100;
          const isFull = cell.currentOccupancy >= cell.capacity;
          const cellInmates = prisoners.filter(
            (p) => p.status === 'Active' && p.cellNumber === cell.cellNumber
          );

          return (
            <div
              key={cell.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:shadow-md ${
                cell.status === 'Maintenance'
                  ? 'border-rose-200 bg-rose-50/20'
                  : isFull
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {cell.block} • Floor {cell.floor}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 font-mono">
                      Cell {cell.cellNumber}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <StatusBadge type="cellStatus" value={cell.status} />
                    <StatusBadge type="security" value={cell.securityLevel} />
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Occupancy</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {cell.currentOccupancy} / {cell.capacity} Beds
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cell.status === 'Maintenance'
                          ? 'bg-rose-400'
                          : isFull
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(occupancyRatio, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Inmates currently assigned */}
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Current Inmates ({cellInmates.length})
                  </span>
                  {cellInmates.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No inmates in this cell.</span>
                  ) : (
                    <ul className="space-y-1 text-xs text-slate-700">
                      {cellInmates.map((inmate) => (
                        <li key={inmate.id} className="truncate flex items-center justify-between">
                          <span className="font-medium">{inmate.fullName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{inmate.id}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Card Footer: Toggle Maintenance */}
              {canManageCells && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleCellMaintenance(cell.id)}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      cell.status === 'Maintenance'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <Wrench className="w-3 h-3" />
                    <span>{cell.status === 'Maintenance' ? 'Restore Cell' : 'Maintenance'}</span>
                  </button>
                  <span className="text-[11px] text-slate-400">{cell.notes || 'Normal'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rule-Based Automatic Cell Allocation Drawer/Modal */}
      {showAllocationDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold">Rule-Based Automatic Cell Allocator</h3>
                  <p className="text-[11px] text-slate-300">Academic Decision Support Engine (Module 14)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllocationDrawer(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Prisoner Category to Evaluate
                </label>
                <select
                  value={allocationCategory}
                  onChange={(e) => setAllocationCategory(e.target.value as PrisonerCategory)}
                  className="w-full px-3 py-2 border border-indigo-200 bg-indigo-50/40 rounded-xl text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="High Security">High Security (Requires Block B, High/Max Sec)</option>
                  <option value="Convicted">Convicted (Suitable for Block A/B, Medium Sec)</option>
                  <option value="Under Trial">Under Trial (Designated Block C)</option>
                  <option value="Remand">Remand (Designated Block C Remand Dormitory)</option>
                  <option value="General">General (Block A standard custody)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Rule Logic Applied:</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  1. Check Category Security Tier • 2. Match Block Wing • 3. Exclude Maintenance cells • 4. Filter Available Capacity (Occupancy &lt; Capacity) • 5. Rank by vacancy score.
                </p>
              </div>

              {/* Recommended Cells List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">
                  Evaluated Cell Suitability ({allocationRecommendations.length} available)
                </h4>

                {allocationRecommendations.length === 0 ? (
                  <div className="p-4 text-center text-xs text-rose-600 bg-rose-50 rounded-xl">
                    No available vacant cells match this security tier.
                  </div>
                ) : (
                  allocationRecommendations.map(({ cell, score, reasons, isRecommended }) => (
                    <div
                      key={cell.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between text-xs ${
                        isRecommended
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-slate-50 border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            {cell.block} — Cell {cell.cellNumber}
                          </span>
                          <StatusBadge type="security" value={cell.securityLevel} />
                          {isRecommended && (
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Best Fit (Score: {score})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {reasons.join(' • ')}
                        </p>
                      </div>

                      <div className="text-right shrink-0 ml-3">
                        <span className="font-mono text-xs font-bold text-slate-700 block">
                          {cell.currentOccupancy} / {cell.capacity} occupied
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          {cell.capacity - cell.currentOccupancy} bed(s) open
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 text-right">
                <button
                  onClick={() => setShowAllocationDrawer(false)}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Cell Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Grid className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold">Add New Prison Cell</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCell} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Block *</label>
                <select
                  value={newCell.block}
                  onChange={(e) => setNewCell({ ...newCell, block: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="Block A">Block A (General Custody)</option>
                  <option value="Block B">Block B (High Security)</option>
                  <option value="Block C">Block C (Remand & Trial)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cell Number *</label>
                <input
                  type="text"
                  required
                  value={newCell.cellNumber}
                  onChange={(e) => setNewCell({ ...newCell, cellNumber: e.target.value })}
                  placeholder="e.g. A301"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                >
                </input>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Capacity (Beds) *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={newCell.capacity}
                    onChange={(e) => setNewCell({ ...newCell, capacity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Floor</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newCell.floor}
                    onChange={(e) => setNewCell({ ...newCell, floor: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Security Rating</label>
                <select
                  value={newCell.securityLevel}
                  onChange={(e) => setNewCell({ ...newCell, securityLevel: e.target.value as CellSecurityLevel })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="Low">Low Security</option>
                  <option value="Medium">Medium Security</option>
                  <option value="High">High Security</option>
                  <option value="Maximum">Maximum Isolation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Description</label>
                <input
                  type="text"
                  value={newCell.notes}
                  onChange={(e) => setNewCell({ ...newCell, notes: e.target.value })}
                  placeholder="e.g. CCTV equipped, renovated wing"
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
                  Create Cell
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
