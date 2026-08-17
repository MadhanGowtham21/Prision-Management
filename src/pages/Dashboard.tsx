import React from 'react';
import {
  Users,
  Grid,
  Lock,
  UserCheck2,
  CalendarCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  CheckCircle2,
  UserPlus,
  PlusCircle,
  AlertTriangle,
  Building,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell as RechartsCell,
  Legend,
} from 'recharts';
import { usePrisonData } from '../context/PrisonDataContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { prisoners = [], cells = [], visitors = [], releases = [], auditLogs = [], stats = { totalPrisoners: 0, activePrisoners: 0, releasedPrisoners: 0, totalCells: 0, occupiedCells: 0, availableCells: 0, maintenanceCells: 0, pendingVisitors: 0, upcomingReleases: 0, highSecurityCount: 0 } } = usePrisonData();

  const safePrisoners = prisoners || [];
  const safeReleases = releases || [];
  const safeAuditLogs = auditLogs || [];

  // Chart 1: Prisoners by Block
  const blockData = [
    {
      name: 'Block A (General)',
      inmates: safePrisoners.filter((p) => p && p.status === 'Active' && p.block === 'Block A').length,
    },
    {
      name: 'Block B (High Sec)',
      inmates: safePrisoners.filter((p) => p && p.status === 'Active' && p.block === 'Block B').length,
    },
    {
      name: 'Block C (Remand)',
      inmates: safePrisoners.filter((p) => p && p.status === 'Active' && p.block === 'Block C').length,
    },
  ];

  // Chart 2: Cell Occupancy Breakdown
  const cellOccupancyData = [
    { name: 'Occupied Cells', value: stats.occupiedCells || 0, color: '#f59e0b' },
    { name: 'Available Cells', value: stats.availableCells || 0, color: '#10b981' },
    { name: 'Under Maintenance', value: stats.maintenanceCells || 0, color: '#ef4444' },
  ];

  // Chart 3: Category Distribution
  const categoryData = [
    { name: 'Convicted', count: safePrisoners.filter((p) => p && p.status === 'Active' && p.category === 'Convicted').length },
    { name: 'High Security', count: safePrisoners.filter((p) => p && p.status === 'Active' && p.category === 'High Security').length },
    { name: 'Under Trial', count: safePrisoners.filter((p) => p && p.status === 'Active' && p.category === 'Under Trial').length },
    { name: 'General', count: safePrisoners.filter((p) => p && p.status === 'Active' && p.category === 'General').length },
    { name: 'Remand', count: safePrisoners.filter((p) => p && p.status === 'Active' && p.category === 'Remand').length },
  ];

  // Upcoming releases within 30 days
  const upcomingReleaseList = safeReleases.filter((r) => r && r.status === 'Upcoming').slice(0, 4);

  // Recent Inmates
  const recentPrisoners = [...safePrisoners].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
              {currentUser?.role === 'admin' ? 'Administrative Dashboard' : 'Custodial Operations Dashboard'}
            </span>
            <span className="text-xs text-slate-400">• System Date: Aug 16, 2026</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
            Central Prison Custody Terminal
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Logged in as <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.department}). Live monitoring of inmate custody, block allocations, visitor passes, and scheduled releases.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('prisoners')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Prisoner</span>
          </button>
          <button
            onClick={() => onNavigate('cells')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Grid className="w-4 h-4 text-blue-400" />
            <span>Cell Allocator</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          id="stat-total-prisoners"
          title="Total Inmates"
          value={stats.totalPrisoners}
          subtitle={`${stats.activePrisoners} active in custody`}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          badge={`${stats.releasedPrisoners} released`}
          onClick={() => onNavigate('prisoners')}
        />

        <StatCard
          id="stat-total-cells"
          title="Total Cells"
          value={stats.totalCells}
          subtitle="3 Security Blocks"
          icon={Building}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          onClick={() => onNavigate('cells')}
        />

        <StatCard
          id="stat-occupied-cells"
          title="Occupied Cells"
          value={stats.occupiedCells}
          subtitle={`${Math.round((stats.occupiedCells / (stats.totalCells || 1)) * 100)}% capacity filled`}
          icon={Lock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          badgeType="warning"
          badge="High Demand"
          onClick={() => onNavigate('cells')}
        />

        <StatCard
          id="stat-available-cells"
          title="Available Cells"
          value={stats.availableCells}
          subtitle={`${stats.maintenanceCells} under repair`}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          badgeType="success"
          badge="Vacant"
          onClick={() => onNavigate('cells')}
        />

        <StatCard
          id="stat-pending-visitors"
          title="Pending Visitors"
          value={stats.pendingVisitors}
          subtitle="Awaiting pass approval"
          icon={UserCheck2}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
          badgeType={stats.pendingVisitors > 0 ? 'warning' : 'neutral'}
          badge={stats.pendingVisitors > 0 ? 'Action Req' : 'Clear'}
          onClick={() => onNavigate('visitors')}
        />

        <StatCard
          id="stat-upcoming-releases"
          title="Upcoming Releases"
          value={stats.upcomingReleases}
          subtitle="Within 30-day window"
          icon={CalendarCheck}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          badgeType="danger"
          badge="30 Days"
          onClick={() => onNavigate('releases')}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Prisoners by Block */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Inmates by Block</h3>
              <p className="text-xs text-slate-500">Distribution across cell blocks</p>
            </div>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              Chart 1
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="inmates" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Inmate Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cell Occupancy Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cell Occupancy Status</h3>
              <p className="text-xs text-slate-500">Capacity & maintenance ratio</p>
            </div>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              Chart 2
            </span>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cellOccupancyData}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {cellOccupancyData.map((entry, index) => (
                    <RechartsCell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Category Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inmates by Category</h3>
              <p className="text-xs text-slate-500">Legal classification tags</p>
            </div>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              Chart 3
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={75} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} name="Inmates" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Inmates Overview & Upcoming Releases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Inmates Roster Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inmate Registry Summary</h3>
              <p className="text-xs text-slate-500">Recently admitted or active prisoners</p>
            </div>
            <button
              onClick={() => onNavigate('prisoners')}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Prisoner ID</th>
                  <th className="py-3 px-4">Inmate Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Release Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentPrisoners.map((prisoner) => (
                  <tr key={prisoner.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{prisoner.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{prisoner.fullName}</div>
                      <div className="text-[10px] text-slate-400">{prisoner.age} yrs • {prisoner.gender}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="category" value={prisoner.category} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{prisoner.block}</span>
                      <span className="text-slate-400 ml-1">({prisoner.cellNumber})</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="prisonerStatus" value={prisoner.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {prisoner.releaseDate || 'Undetermined'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Release Alerts & Recent Audit Trail */}
        <div className="space-y-6">
          {/* Upcoming Release Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <CalendarCheck className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Releases (30d)</h3>
              </div>
              <button
                onClick={() => onNavigate('releases')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingReleaseList.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No releases scheduled in 30 days.</p>
              ) : (
                upcomingReleaseList.map((rel) => (
                  <div
                    key={rel.id}
                    className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{rel.prisonerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        ID: {rel.prisonerId} • {rel.releaseType}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 font-mono">
                        {rel.expectedReleaseDate}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Audit Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Audit Activity</h3>
              </div>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => onNavigate('audit-logs')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Full Log
                </button>
              )}
            </div>

            <div className="space-y-3">
              {safeAuditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-blue-500 pl-3 py-0.5">
                  <p className="text-slate-800 font-medium leading-snug">{log.action}</p>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{log.userName}</span>
                    <span>•</span>
                    <span>{(log.timestamp || '').slice(11, 16)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
