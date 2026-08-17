import { Prisoner, Cell, Visitor, CaseRecord, ReleaseRecord, User, AuditLog, NotificationItem } from '../types';
import {
  initialUsers,
  initialPrisoners,
  initialCells,
  initialVisitors,
  initialCases,
  initialReleases,
  initialAuditLogs,
  initialNotifications,
} from '../data/seedData';

const KEYS = {
  USERS: 'pms_users_v1',
  PRISONERS: 'pms_prisoners_v1',
  CELLS: 'pms_cells_v1',
  VISITORS: 'pms_visitors_v1',
  CASES: 'pms_cases_v1',
  RELEASES: 'pms_releases_v1',
  AUDIT_LOGS: 'pms_audit_logs_v1',
  NOTIFICATIONS: 'pms_notifications_v1',
  CURRENT_USER: 'pms_current_user_v1',
};

function getItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') return defaultVal;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return defaultVal;
    if (Array.isArray(defaultVal) && !Array.isArray(parsed)) return defaultVal;
    return parsed;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const StorageService = {
  getUsers: (): User[] => getItem<User[]>(KEYS.USERS, initialUsers),
  setUsers: (data: User[]) => setItem(KEYS.USERS, data),

  getPrisoners: (): Prisoner[] => getItem<Prisoner[]>(KEYS.PRISONERS, initialPrisoners),
  setPrisoners: (data: Prisoner[]) => setItem(KEYS.PRISONERS, data),

  getCells: (): Cell[] => getItem<Cell[]>(KEYS.CELLS, initialCells),
  setCells: (data: Cell[]) => setItem(KEYS.CELLS, data),

  getVisitors: (): Visitor[] => getItem<Visitor[]>(KEYS.VISITORS, initialVisitors),
  setVisitors: (data: Visitor[]) => setItem(KEYS.VISITORS, data),

  getCases: (): CaseRecord[] => getItem<CaseRecord[]>(KEYS.CASES, initialCases),
  setCases: (data: CaseRecord[]) => setItem(KEYS.CASES, data),

  getReleases: (): ReleaseRecord[] => getItem<ReleaseRecord[]>(KEYS.RELEASES, initialReleases),
  setReleases: (data: ReleaseRecord[]) => setItem(KEYS.RELEASES, data),

  getAuditLogs: (): AuditLog[] => getItem<AuditLog[]>(KEYS.AUDIT_LOGS, initialAuditLogs),
  setAuditLogs: (data: AuditLog[]) => setItem(KEYS.AUDIT_LOGS, data),

  getNotifications: (): NotificationItem[] => getItem<NotificationItem[]>(KEYS.NOTIFICATIONS, initialNotifications),
  setNotifications: (data: NotificationItem[]) => setItem(KEYS.NOTIFICATIONS, data),

  getCurrentUser: (): User | null => getItem<User | null>(KEYS.CURRENT_USER, initialUsers[0]),
  setCurrentUser: (user: User | null) => setItem(KEYS.CURRENT_USER, user),

  resetAllToSeed: () => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
    localStorage.setItem(KEYS.PRISONERS, JSON.stringify(initialPrisoners));
    localStorage.setItem(KEYS.CELLS, JSON.stringify(initialCells));
    localStorage.setItem(KEYS.VISITORS, JSON.stringify(initialVisitors));
    localStorage.setItem(KEYS.CASES, JSON.stringify(initialCases));
    localStorage.setItem(KEYS.RELEASES, JSON.stringify(initialReleases));
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(initialUsers[0]));
  },
};
