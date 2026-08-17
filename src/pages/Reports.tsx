import React, { useState } from 'react';
import {
  BarChart3,
  Printer,
  FileText,
  Users,
  Grid,
  CalendarCheck,
  UserCheck2,
  Download,
  Building,
  Shield,
} from 'lucide-react';
import { usePrisonData } from '../context/PrisonDataContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const Reports: React.FC = () => {
  const { prisoners = [], cells = [], visitors = [], releases = [], stats = { totalPrisoners: 0, activePrisoners: 0, releasedPrisoners: 0, totalCells: 0, occupiedCells: 0, availableCells: 0, maintenanceCells: 0, pendingVisitors: 0, upcomingReleases: 0, highSecurityCount: 0 } } = usePrisonData();
  const [selectedReport, setSelectedReport] = useState<string>('all-active');

  const safePrisoners = prisoners || [];
  const safeCells = cells || [];
  const safeVisitors = visitors || [];
  const safeReleases = releases || [];

  const activePrisoners = safePrisoners.filter((p) => p && p.status === 'Active');
  const releasedPrisoners = safePrisoners.filter((p) => p && p.status === 'Released');
  const availableCells = safeCells.filter((c) => c && c.status === 'Available');
  const upcomingReleases = safeReleases.filter((r) => r && r.status === 'Upcoming');

  const reportTypes = [
    { id: 'all-active', label: '1. Active Inmates Roster', count: activePrisoners.length, icon: Users },
    { id: 'released', label: '2. Released Inmates Log', count: releasedPrisoners.length, icon: CalendarCheck },
    { id: 'cell-occupancy', label: '3. Cell Occupancy & Quota', count: `${stats.occupiedCells || 0}/${stats.totalCells || 0}`, icon: Grid },
    { id: 'available-cells', label: '4. Vacant Available Cells', count: availableCells.length, icon: Building },
    { id: 'visitor-stats', label: '5. Visitor Clearances', count: safeVisitors.length, icon: UserCheck2 },
    { id: 'upcoming-releases', label: '6. Upcoming 30-Day Releases', count: upcomingReleases.length, icon: CalendarCheck },
    { id: 'category-breakdown', label: '7. Inmates by Category', count: '5 Tiers', icon: Shield },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Custodial Reports & Administrative Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 19: Comprehensive institutional reports, occupancy audits, release projections, and printable summaries.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {reportTypes.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;

          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {rep.count}
                </span>
              </div>
              <span className="text-xs font-bold line-clamp-1">{rep.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Printable Report Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 print:border-none print:shadow-none">
        {/* Printable Official Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700">
              DEPARTMENT OF CORRECTIONAL SERVICES • CENTRAL PRISON
            </div>
            <h2 className="text-lg font-black text-slate-900">
              {reportTypes.find((r) => r.id === selectedReport)?.label || 'Custody Report'}
            </h2>
            <p className="text-xs text-slate-500">
              Official Institutional Record • Generated: {new Date().toISOString().replace('T', ' ').slice(0, 19)}
            </p>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-600">
            <div>Institutional Code: <strong>DEL-CP-01</strong></div>
            <div>Total Custody Count: <strong>{activePrisoners.length} active inmates</strong></div>
          </div>
        </div>

        {/* Dynamic Content based on selected report */}
        {selectedReport === 'all-active' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Prisoner ID</th>
                  <th className="py-2.5 px-3">Inmate Name</th>
                  <th className="py-2.5 px-3">Age/Gender</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Block & Cell</th>
                  <th className="py-2.5 px-3">Admission</th>
                  <th className="py-2.5 px-3">Release Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activePrisoners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold">{p.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.fullName}</td>
                    <td className="py-2.5 px-3">{p.age} yrs / {p.gender}</td>
                    <td className="py-2.5 px-3"><StatusBadge type="category" value={p.category} /></td>
                    <td className="py-2.5 px-3 font-medium">{p.block} — {p.cellNumber}</td>
                    <td className="py-2.5 px-3 font-mono">{p.admissionDate}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">{p.releaseDate || 'Undetermined'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'released' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Prisoner ID</th>
                  <th className="py-2.5 px-3">Inmate Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Vacated Cell</th>
                  <th className="py-2.5 px-3">Discharge Status</th>
                  <th className="py-2.5 px-3">Release Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {releasedPrisoners.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-mono font-bold">{p.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.fullName}</td>
                    <td className="py-2.5 px-3"><StatusBadge type="category" value={p.category} /></td>
                    <td className="py-2.5 px-3 font-mono">{p.block} ({p.cellNumber})</td>
                    <td className="py-2.5 px-3"><StatusBadge type="prisonerStatus" value={p.status} /></td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{p.releaseDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'cell-occupancy' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Cell ID</th>
                  <th className="py-2.5 px-3">Block</th>
                  <th className="py-2.5 px-3">Security Level</th>
                  <th className="py-2.5 px-3">Capacity</th>
                  <th className="py-2.5 px-3">Current Occupancy</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {cells.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-mono font-bold">{c.cellNumber}</td>
                    <td className="py-2.5 px-3 font-semibold">{c.block}</td>
                    <td className="py-2.5 px-3"><StatusBadge type="security" value={c.securityLevel} /></td>
                    <td className="py-2.5 px-3 font-mono">{c.capacity} Beds</td>
                    <td className="py-2.5 px-3 font-mono font-bold">{c.currentOccupancy} Inmates</td>
                    <td className="py-2.5 px-3"><StatusBadge type="cellStatus" value={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'available-cells' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Cell Number</th>
                  <th className="py-2.5 px-3">Block</th>
                  <th className="py-2.5 px-3">Security Tier</th>
                  <th className="py-2.5 px-3">Available Beds</th>
                  <th className="py-2.5 px-3">Location Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {availableCells.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.cellNumber}</td>
                    <td className="py-2.5 px-3">{c.block}</td>
                    <td className="py-2.5 px-3"><StatusBadge type="security" value={c.securityLevel} /></td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700 font-mono">
                      {c.capacity - c.currentOccupancy} of {c.capacity} Vacant
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{c.notes || 'Ready for allocation'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'visitor-stats' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Pass ID</th>
                  <th className="py-2.5 px-3">Visitor Name</th>
                  <th className="py-2.5 px-3">Inmate Visited</th>
                  <th className="py-2.5 px-3">ID Proof Type & No.</th>
                  <th className="py-2.5 px-3">Visit Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {visitors.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2.5 px-3 font-mono font-bold">{v.id}</td>
                    <td className="py-2.5 px-3 font-semibold">{v.visitorName} ({v.relationship})</td>
                    <td className="py-2.5 px-3">{v.prisonerName} ({v.prisonerId})</td>
                    <td className="py-2.5 px-3 font-mono">{v.idProofType}: {v.idProofNumber}</td>
                    <td className="py-2.5 px-3 font-mono">{v.visitDate}</td>
                    <td className="py-2.5 px-3"><StatusBadge type="visitorStatus" value={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'upcoming-releases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Release ID</th>
                  <th className="py-2.5 px-3">Inmate Name</th>
                  <th className="py-2.5 px-3">Expected Date</th>
                  <th className="py-2.5 px-3">Release Type</th>
                  <th className="py-2.5 px-3">Authorized Officer</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {upcomingReleases.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-3 font-mono font-bold">{r.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{r.prisonerName} ({r.prisonerId})</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{r.expectedReleaseDate}</td>
                    <td className="py-2.5 px-3">{r.releaseType}</td>
                    <td className="py-2.5 px-3">{r.authorizedOfficer}</td>
                    <td className="py-2.5 px-3"><StatusBadge type="releaseStatus" value={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'category-breakdown' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['High Security', 'Convicted', 'Under Trial', 'General', 'Remand'].map((cat) => {
              const catInmates = prisoners.filter((p) => p.status === 'Active' && p.category === cat);
              return (
                <div key={cat} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <StatusBadge type="category" value={cat} />
                    <span className="font-bold text-slate-900 text-sm">{catInmates.length} Inmates</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {catInmates.map((inmate) => (
                      <li key={inmate.id} className="flex justify-between font-mono">
                        <span>{inmate.fullName}</span>
                        <span className="text-slate-400">{inmate.block} - {inmate.cellNumber}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* Report Sign-off area */}
        <div className="pt-8 mt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p>System Generated Custodial Log</p>
            <p className="text-[10px]">Correctional Operations & Administration</p>
          </div>
          <div className="text-right">
            <div className="w-36 border-b border-slate-400 mb-1"></div>
            <p className="font-bold text-slate-800">Superintendent Authorization</p>
          </div>
        </div>
      </div>
    </div>
  );
};
