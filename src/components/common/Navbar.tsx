import React, { useState } from 'react';
import {
  Shield,
  Bell,
  Search,
  RotateCcw,
  BookOpen,
  UserCheck,
  LogOut,
  ChevronDown,
  FileText,
  AlertCircle,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePrisonData } from '../../context/PrisonDataContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenDocs?: () => void;
  onSearchClick?: () => void;
  onNavigate?: (page: string) => void;
  onToggleSidebar?: () => void;
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDocs, onNavigate, onToggleSidebar }) => {
  const { currentUser, switchUser, logout } = useAuth();
  const { notifications = [], markNotificationRead, markAllNotificationsRead, resetToSampleData } = usePrisonData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const unreadCount = (notifications || []).filter((n) => n && !n.read).length;

  const handleRoleChange = (role: UserRole) => {
    switchUser(role);
    setShowRoleMenu(false);
  };

  const handleReset = () => {
    resetToSampleData();
    setShowResetConfirm(false);
  };

  const handleDocsClick = () => {
    if (onOpenDocs) {
      onOpenDocs();
    } else if (onNavigate) {
      onNavigate('academic');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-3">
            {onToggleSidebar && (
              <button
                id="btn-mobile-sidebar-toggle"
                onClick={onToggleSidebar}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                title="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base tracking-tight">PRISON MANAGEMENT SYSTEM</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Govt. Custody Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Prisoner • Cell • Visitor • Case & Release Records
              </p>
            </div>
          </div>

          {/* Right: Actions, Role switch, Quick Demo, Notifications & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Viva & Project Documentation Button */}
            <button
              id="btn-academic-guide"
              onClick={handleDocsClick}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              title="Polytechnic Project Architecture, Viva Q&A & Source Code"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">Viva & Documentation</span>
            </button>

            {/* Reset Sample Data Button */}
            <button
              id="btn-reset-demo"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Re-seed demo data for fresh demonstration"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline">Reset Demo</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                id="btn-role-switcher"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold capitalize">{currentUser?.role || 'Guest'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Active Role (Demo)
                  </div>
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      currentUser?.role === 'admin' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Administrator</div>
                      <div className="text-[10px] text-slate-400">Full System Access & Release Approval</div>
                    </div>
                    {currentUser?.role === 'admin' && <span className="text-blue-600 text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleChange('officer')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      currentUser?.role === 'officer' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Prison Officer</div>
                      <div className="text-[10px] text-slate-400">Inmates, Cells & Visitor Processing</div>
                    </div>
                    {currentUser?.role === 'officer' && <span className="text-blue-600 text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleChange('medical')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      currentUser?.role === 'medical' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Medical Officer</div>
                      <div className="text-[10px] text-slate-400">Health records & medical notes</div>
                    </div>
                    {currentUser?.role === 'medical' && <span className="text-blue-600 text-xs">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="System Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">Notifications</span>
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                        {unreadCount} new
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No active alerts.</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.linkModule) {
                              onNavigate(n.linkModule);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.read ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.timestamp.slice(11, 16)}</span>
                          </div>
                          <p className="text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        onNavigate('notifications');
                        setShowNotifications(false);
                      }}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              id="btn-logout"
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout Session"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center space-x-3 text-amber-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Reset Demo Database?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              This will restore all default Polytechnic sample data (10 prisoners, 15 cells, 8 visitors, 5 legal cases, 5 releases, and audit logs). Any newly added items will be reset.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Confirm & Re-seed Data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
