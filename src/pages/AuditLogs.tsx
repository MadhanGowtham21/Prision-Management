import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Shield,
  Clock,
  User,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { usePrisonData } from '../context/PrisonDataContext';
import { useAuth } from '../context/AuthContext';
import { AuditAction, AuditModule } from '../types';

export const AuditLogs: React.FC = () => {
  const { currentUser } = useAuth();
  const { auditLogs, clearAuditLogs } = usePrisonData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState<string>('ALL');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return (auditLogs || []).filter((log) => {
      const matchesSearch =
        (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.userId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.recordId ? log.recordId.toLowerCase().includes(searchTerm.toLowerCase()) : false);

      const matchesModule = filterModule === 'ALL' || log.module === filterModule;
      const matchesAction = filterAction === 'ALL' || log.action === filterAction;

      return matchesSearch && matchesModule && matchesAction;
    });
  }, [auditLogs, searchTerm, filterModule, filterAction]);

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UPDATE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ALLOCATE':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'RELEASE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'STATUS_CHANGE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOGIN':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <History className="w-6 h-6 text-slate-700" />
            <span>Institutional Security Audit Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 23: Complete immutable audit trail of user actions, inmate admissions, cell allocations, and releases.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={clearAuditLogs}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History Logs</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search User, Record ID, Activity..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Module Filter */}
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Modules</option>
            <option value="Prisoners">Prisoners</option>
            <option value="Cells">Cells</option>
            <option value="Visitors">Visitors</option>
            <option value="Cases">Cases</option>
            <option value="Releases">Releases</option>
            <option value="Auth">Auth / Login</option>
            <option value="System">System</option>
          </select>

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="ALLOCATE">ALLOCATE</option>
            <option value="RELEASE">RELEASE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="LOGIN">LOGIN</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Target ID</th>
                <th className="py-3.5 px-4">Activity Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="capitalize text-[11px] font-bold text-slate-600">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700">
                      {log.module}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-700">
                      {log.recordId || '—'}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
