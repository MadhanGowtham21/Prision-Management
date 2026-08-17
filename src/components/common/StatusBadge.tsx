import React from 'react';
import { PrisonerCategory, PrisonerStatus, CellStatus, CellSecurityLevel, VisitorStatus, CaseStatus, ReleaseStatus } from '../../types';

interface StatusBadgeProps {
  type: 'category' | 'prisonerStatus' | 'cellStatus' | 'security' | 'visitorStatus' | 'caseStatus' | 'releaseStatus';
  value: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, className = '' }) => {
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (type === 'category') {
    switch (value as PrisonerCategory) {
      case 'High Security':
        badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
        break;
      case 'Convicted':
        badgeStyles = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case 'Under Trial':
        badgeStyles = 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case 'Remand':
        badgeStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      case 'General':
      default:
        badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
    }
  } else if (type === 'prisonerStatus') {
    switch (value as PrisonerStatus) {
      case 'Active':
        badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-300';
        break;
      case 'Released':
        badgeStyles = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'Transferred':
        badgeStyles = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
    }
  } else if (type === 'cellStatus') {
    switch (value as CellStatus) {
      case 'Available':
        badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'Occupied':
        badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Maintenance':
        badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
    }
  } else if (type === 'security') {
    switch (value as CellSecurityLevel) {
      case 'Maximum':
        badgeStyles = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
        break;
      case 'High':
        badgeStyles = 'bg-orange-50 text-orange-700 border-orange-200';
        break;
      case 'Medium':
        badgeStyles = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'Low':
        badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  } else if (type === 'visitorStatus') {
    switch (value as VisitorStatus) {
      case 'Pending':
        badgeStyles = 'bg-amber-50 text-amber-700 border-amber-300';
        break;
      case 'Approved':
        badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-300';
        break;
      case 'Rejected':
        badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'Completed':
        badgeStyles = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'Cancelled':
        badgeStyles = 'bg-slate-100 text-slate-600 border-slate-200';
        break;
    }
  } else if (type === 'caseStatus') {
    switch (value as CaseStatus) {
      case 'Active':
        badgeStyles = 'bg-sky-50 text-sky-700 border-sky-300';
        break;
      case 'Pending':
        badgeStyles = 'bg-amber-50 text-amber-700 border-amber-300';
        break;
      case 'Closed':
        badgeStyles = 'bg-slate-100 text-slate-700 border-slate-300';
        break;
    }
  } else if (type === 'releaseStatus') {
    switch (value as ReleaseStatus) {
      case 'Upcoming':
        badgeStyles = 'bg-amber-100 text-amber-900 border-amber-300 font-medium animate-pulse';
        break;
      case 'Released':
        badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${badgeStyles} ${className}`}
    >
      {value}
    </span>
  );
};
