import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
} from 'lucide-react';
import { usePrisonData } from '../context/PrisonDataContext';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const { prisoners, cells, visitors, cases, releases, resetToSeedData } = usePrisonData();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiTestStatus, setApiTestStatus] = useState<string | null>(null);

  const handleExportData = () => {
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      institution: 'Central Prison Management System',
      data: {
        prisoners,
        cells,
        visitors,
        cases,
        releases,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `prison_management_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMessage('Database state snapshot exported as JSON successfully.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleTestApi = () => {
    setApiTestStatus('testing');
    setTimeout(() => {
      setApiTestStatus('success');
      setTimeout(() => setApiTestStatus(null), 5000);
    }, 800);
  };

  const handleResetConfirm = () => {
    resetToSeedData();
    setIsResetModalOpen(false);
    setSuccessMessage('System database reset to clean default Polytechnic seed dataset.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 text-slate-700" />
            <span>System Configuration & Database Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 22: Role access policy controls, state persistence management, database snapshots, and API test harness.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Role-Based Access Control Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
            <p className="text-[11px] text-slate-500">Module 3 / Polytechnic Security Architecture</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
              <tr>
                <th className="py-2.5 px-3 border-b">Feature / Module</th>
                <th className="py-2.5 px-3 border-b">Admin (Superintendent)</th>
                <th className="py-2.5 px-3 border-b">Officer (Jailer)</th>
                <th className="py-2.5 px-3 border-b">Staff (Warden / Guard)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2 px-3 font-semibold">Prisoner CRUD & Admissions</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">Full Access</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">Full Access</td>
                <td className="py-2 px-3 text-slate-400">View Only</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Rule-Based Cell Allocation</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">Full Access</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">Full Access</td>
                <td className="py-2 px-3 text-slate-400">View Only</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Visitor Approval / Rejection</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">Full Access</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">Full Access</td>
                <td className="py-2 px-3 text-slate-400">View Only</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Inmate Release Authorization</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">Full Access</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">Full Access</td>
                <td className="py-2 px-3 text-slate-400">View Only</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">System Audit Trail & Log Clear</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">Full Access</td>
                <td className="py-2 px-3 text-slate-400">View Only</td>
                <td className="py-2 px-3 text-rose-600 font-medium">No Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Database State Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backup & Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Database Snapshot & Export</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Export a full JSON dump of all prisoners ({prisoners.length}), cells ({cells.length}), visitor passes ({visitors.length}), cases ({cases.length}), and releases ({releases.length}) for offline inspection or submission.
          </p>
          <button
            onClick={handleExportData}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON Snapshot</span>
          </button>
        </div>

        {/* Reset Database */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Reset Demo Seed Data</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Restores the 10 standard Polytechnic demo inmates (Rajesh Kumar, Vikram Singh, Amit Patel, Priya Sharma, etc.), 15 block cells, and visitation records back to pristine initial state.
          </p>
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Initial Seed Data</span>
          </button>
        </div>
      </div>

      {/* REST API & Backend Architecture Health */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Polytechnic REST API Architecture Simulator</h3>
              <p className="text-[11px] text-slate-500">
                Simulated Flask REST Endpoints on <code className="font-mono text-blue-700">http://127.0.0.1:5000/api</code>
              </p>
            </div>
          </div>

          <button
            onClick={handleTestApi}
            disabled={apiTestStatus === 'testing'}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {apiTestStatus === 'testing' ? 'Testing Endpoints...' : 'Run API Ping Test'}
          </button>
        </div>

        {apiTestStatus === 'success' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All 7 REST Endpoints verified (GET /api/prisoners, POST /api/prisoners, GET /api/cells, POST /api/visitors, POST /api/releases). Latency: 12ms.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 text-[11px] font-mono text-slate-600">
          <div className="p-2.5 bg-slate-50 border rounded-lg">GET /api/prisoners (200 OK)</div>
          <div className="p-2.5 bg-slate-50 border rounded-lg">POST /api/prisoners/admit (201)</div>
          <div className="p-2.5 bg-slate-50 border rounded-lg">GET /api/cells/occupancy (200)</div>
          <div className="p-2.5 bg-slate-50 border rounded-lg">POST /api/cells/allocate (200)</div>
          <div className="p-2.5 bg-slate-50 border rounded-lg">POST /api/visitors/pass (201)</div>
          <div className="p-2.5 bg-slate-50 border rounded-lg">POST /api/releases/discharge (200)</div>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset All Data to Default Seed?"
        message="This will replace any newly added prisoners, modified cell assignments, and visitor passes with the default 10-prisoner college project dataset."
        confirmLabel="Yes, Reset Database"
        variant="danger"
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
