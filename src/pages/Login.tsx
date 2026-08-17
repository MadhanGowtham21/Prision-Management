import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, CheckCircle, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login, switchUser } = useAuth();
  const [email, setEmail] = useState('admin@prison.gov');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
      setLoading(false);
    }, 400);
  };

  const handleQuickLogin = (role: UserRole, roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Prison@2026');
    setErrorMessage('');
    switchUser(role);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white shadow-xl ring-4 ring-blue-500/20">
            <Shield className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-white tracking-tight">
          PRISON MANAGEMENT SYSTEM
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Department of Correctional Services • Polytech CSE Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/80">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="name@prison.gov"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Security Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-400">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded-sm bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Remember credentials</span>
              </label>
              <span className="text-blue-400 text-xs cursor-pointer hover:underline">
                Security Policy
              </span>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5">
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Quick Demo Role Picker for Examiner / Viva Demonstration */}
          <div className="mt-6 pt-6 border-t border-slate-700/60">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Viva Demo Accounts
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin@prison.gov')}
                className="p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-700 hover:border-blue-500/50 rounded-xl text-center transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-blue-400">Admin</div>
                <div className="text-[10px] text-slate-400">Superintendent</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('officer', 'officer@prison.gov')}
                className="p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-700 hover:border-blue-500/50 rounded-xl text-center transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-blue-400">Officer</div>
                <div className="text-[10px] text-slate-400">Inspector</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('medical', 'medical@prison.gov')}
                className="p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-700 hover:border-blue-500/50 rounded-xl text-center transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-blue-400">Medical</div>
                <div className="text-[10px] text-slate-400">Health Officer</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Academic Compliance Badge */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Simulated RBAC Authentication • Academic Demonstration</span>
          </p>
        </div>
      </div>
    </div>
  );
};
