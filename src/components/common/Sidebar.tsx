import React from 'react';
import {
  LayoutDashboard,
  Users,
  Grid,
  UserCheck2,
  FileCheck,
  CalendarCheck,
  BarChart3,
  Bell,
  History,
  Settings,
  BookOpen,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePrisonData } from '../../context/PrisonDataContext';

interface SidebarProps {
  currentPage?: string;
  activeTab?: string;
  onNavigate?: (page: string) => void;
  onSelectTab?: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  activeTab,
  onNavigate,
  onSelectTab,
  isOpen = false,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { notifications = [], stats } = usePrisonData();

  const activePageId = activeTab || currentPage || 'dashboard';
  const handleItemClick = (pageId: string) => {
    if (onSelectTab) onSelectTab(pageId);
    else if (onNavigate) onNavigate(pageId);
    if (onClose) onClose();
  };

  const safeStats = stats || {
    totalPrisoners: 0,
    activePrisoners: 0,
    releasedPrisoners: 0,
    totalCells: 0,
    occupiedCells: 0,
    availableCells: 0,
    maintenanceCells: 0,
    pendingVisitors: 0,
    upcomingReleases: 0,
    highSecurityCount: 0,
  };

  const unreadNotifs = (notifications || []).filter((n) => n && !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, roles: ['admin', 'officer', 'medical'] },
    { id: 'prisoners', label: 'Prisoners', icon: Users, badge: safeStats.activePrisoners ? `${safeStats.activePrisoners} active` : null, roles: ['admin', 'officer', 'medical'] },
    { id: 'cells', label: 'Cells & Blocks', icon: Grid, badge: `${safeStats.occupiedCells || 0}/${safeStats.totalCells || 0}`, roles: ['admin', 'officer'] },
    { id: 'visitors', label: 'Visitors', icon: UserCheck2, badge: safeStats.pendingVisitors > 0 ? `${safeStats.pendingVisitors} pending` : null, badgeColor: 'bg-amber-100 text-amber-800', roles: ['admin', 'officer'] },
    { id: 'cases', label: 'Legal Cases', icon: FileCheck, badge: null, roles: ['admin', 'officer'] },
    { id: 'releases', label: 'Releases', icon: CalendarCheck, badge: safeStats.upcomingReleases > 0 ? `${safeStats.upcomingReleases} due` : null, badgeColor: 'bg-rose-100 text-rose-800', roles: ['admin', 'officer'] },
    { id: 'reports', label: 'Reports & Stats', icon: BarChart3, badge: null, roles: ['admin', 'officer'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? `${unreadNotifs}` : null, badgeColor: 'bg-blue-600 text-white', roles: ['admin', 'officer', 'medical'] },
    { id: 'audit-logs', label: 'Audit Logs', icon: History, badge: null, roles: ['admin'] },
    { id: 'academic-guide', label: 'Viva & Project Guide', icon: BookOpen, badge: 'Academic', badgeColor: 'bg-indigo-100 text-indigo-800', roles: ['admin', 'officer', 'medical'] },
    { id: 'settings', label: 'Settings & Security', icon: Settings, badge: null, roles: ['admin', 'officer', 'medical'] },
  ];

  const currentRole = currentUser?.role || 'admin';
  const filteredNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  const sidebarContent = (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none h-full min-h-[calc(100vh-4rem)]">
      {/* Officer / User Profile Card */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
            {currentUser?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2) || 'AD'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-white truncate">{currentUser?.name}</h4>
            <p className="text-[11px] text-slate-400 truncate">{currentUser?.badgeNumber} • {currentUser?.role?.toUpperCase()}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Custodial Management
        </div>

        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activePageId === item.id ||
            (item.id === 'audit-logs' && activePageId === 'audit') ||
            (item.id === 'academic-guide' && activePageId === 'academic');

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    item.badgeColor || (isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Polytechnic Academic Notice Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 m-2 rounded-xl text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5 text-blue-400 font-semibold mb-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Polytechnic CSE Project</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-snug">
          Demonstration sandbox with simulated Firestore REST endpoints, rule-based cell allocator & full viva preparation.
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex flex-col shrink-0">{sidebarContent}</div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
