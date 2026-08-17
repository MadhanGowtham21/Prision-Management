import React from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { usePrisonData } from '../context/PrisonDataContext';

export const Notifications: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = usePrisonData();

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'danger':
        return 'bg-rose-50 border-rose-200 text-rose-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Bell className="w-6 h-6 text-amber-500" />
            <span>Alerts & System Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 21: Real-time custodial alerts, release warnings, capacity flags, and security advisories.
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {(notifications || []).length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No system notifications currently on record.
          </div>
        ) : (
          (notifications || []).map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                notif.read
                  ? 'bg-white border-slate-200 opacity-70'
                  : `shadow-xs ${getBadgeStyle(notif.type)}`
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white/80 rounded-xl shadow-2xs shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-slate-900">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{notif.timestamp}</span>
                  </div>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationAsRead(notif.id);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
