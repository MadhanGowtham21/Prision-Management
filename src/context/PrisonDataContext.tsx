import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Prisoner,
  Cell,
  Visitor,
  CaseRecord,
  ReleaseRecord,
  AuditLog,
  NotificationItem,
  DashboardStats,
  PrisonerCategory,
  VisitorStatus,
} from '../types';
import { StorageService } from '../services/storageService';
import { useAuth } from './AuthContext';

interface AllocationRecommendation {
  cell: Cell;
  score: number;
  reasons: string[];
  isRecommended: boolean;
}

interface PrisonDataContextType {
  prisoners: Prisoner[];
  cells: Cell[];
  visitors: Visitor[];
  cases: CaseRecord[];
  releases: ReleaseRecord[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  stats: DashboardStats;

  // Prisoner Actions
  addPrisoner: (data: Omit<Prisoner, 'id'>) => { success: boolean; id: string; message: string };
  updatePrisoner: (id: string, data: Partial<Prisoner>) => { success: boolean; message: string };
  deletePrisoner: (id: string) => { success: boolean; message: string };
  getPrisonerById: (id: string) => Prisoner | undefined;

  // Cell Actions
  addCell: (data: Omit<Cell, 'id'>) => { success: boolean; id: string; message: string };
  updateCell: (id: string, data: Partial<Cell>) => { success: boolean; message: string };
  toggleCellMaintenance: (id: string) => void;
  recalculateCellOccupancies: () => void;
  recommendCellsForPrisoner: (category: PrisonerCategory, gender?: string) => AllocationRecommendation[];

  // Visitor Actions
  addVisitor: (data: Omit<Visitor, 'id'>) => { success: boolean; id: string; message: string };
  updateVisitorStatus: (id: string, status: VisitorStatus, note?: string) => { success: boolean; message: string };
  deleteVisitor: (id: string) => { success: boolean; message: string };

  // Case Actions
  addCase: (data: Omit<CaseRecord, 'id'>) => { success: boolean; id: string; message: string };
  updateCase: (id: string, data: Partial<CaseRecord>) => { success: boolean; message: string };
  deleteCase: (id: string) => { success: boolean; message: string };

  // Release Actions
  addRelease: (data: Omit<ReleaseRecord, 'id'>) => { success: boolean; id: string; message: string };
  processRelease: (id: string, actualDate?: string) => { success: boolean; message: string };
  updateRelease: (id: string, data: Partial<ReleaseRecord>) => { success: boolean; message: string };

  // System & Logs
  markNotificationRead: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  markAllNotificationsAsRead: () => void;
  resetToSampleData: () => void;
  resetToSeedData: () => void;
  clearAuditLogs: () => void;
  generateNextPrisonerId: () => string;
  generateNextVisitorId: () => string;
  generateNextCaseId: () => string;
  generateNextReleaseId: () => string;
}

const PrisonDataContext = createContext<PrisonDataContextType | undefined>(undefined);

export const PrisonDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [prisoners, setPrisoners] = useState<Prisoner[]>(() => StorageService.getPrisoners());
  const [cells, setCells] = useState<Cell[]>(() => StorageService.getCells());
  const [visitors, setVisitors] = useState<Visitor[]>(() => StorageService.getVisitors());
  const [cases, setCases] = useState<CaseRecord[]>(() => StorageService.getCases());
  const [releases, setReleases] = useState<ReleaseRecord[]>(() => StorageService.getReleases());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());

  // Save to localStorage on state changes
  useEffect(() => {
    StorageService.setPrisoners(prisoners);
  }, [prisoners]);

  useEffect(() => {
    StorageService.setCells(cells);
  }, [cells]);

  useEffect(() => {
    StorageService.setVisitors(visitors);
  }, [visitors]);

  useEffect(() => {
    StorageService.setCases(cases);
  }, [cases]);

  useEffect(() => {
    StorageService.setReleases(releases);
  }, [releases]);

  useEffect(() => {
    StorageService.setAuditLogs(auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    StorageService.setNotifications(notifications);
  }, [notifications]);

  // Helper to log audit actions
  const logAudit = (action: string, module: AuditLog['module'], recordId: string, details?: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      userId: currentUser?.id || 'SYSTEM',
      userName: currentUser?.name || 'System Administrator',
      role: currentUser?.role || 'admin',
      action,
      module,
      recordId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper to push notifications
  const pushNotification = (title: string, message: string, type: NotificationItem['type'] = 'info', linkModule?: string) => {
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now().toString().slice(-5)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      read: false,
      linkModule,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Sync cell occupancies based on active prisoners in each cell
  const syncCellOccupancy = (currentPrisoners: Prisoner[], currentCells: Cell[]): Cell[] => {
    const countMap: Record<string, number> = {};
    (currentPrisoners || []).forEach((p) => {
      if (p && p.status === 'Active' && p.cellNumber) {
        countMap[p.cellNumber] = (countMap[p.cellNumber] || 0) + 1;
      }
    });

    return (currentCells || []).map((c) => {
      const activeCount = countMap[c.cellNumber] || 0;
      let status = c.status;
      if (status !== 'Maintenance') {
        status = activeCount >= c.capacity ? 'Occupied' : 'Available';
      }
      return {
        ...c,
        currentOccupancy: activeCount,
        status,
      };
    });
  };

  const recalculateCellOccupancies = () => {
    setCells((prev) => syncCellOccupancy(prisoners || [], prev || []));
  };

  // Auto-ID Generators
  const generateNextPrisonerId = () => {
    const existingNums = (prisoners || [])
      .map((p) => {
        const parts = (p?.id || '').split('-');
        return parts.length === 3 ? parseInt(parts[2], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = existingNums.length ? Math.max(...existingNums) : 0;
    const next = max + 1;
    return `PRN-2026-${next.toString().padStart(4, '0')}`;
  };

  const generateNextVisitorId = () => {
    const existingNums = (visitors || [])
      .map((v) => {
        const parts = (v?.id || '').split('-');
        return parts.length === 3 ? parseInt(parts[2], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = existingNums.length ? Math.max(...existingNums) : 0;
    const next = max + 1;
    return `VIS-2026-${next.toString().padStart(3, '0')}`;
  };

  const generateNextCaseId = () => {
    const existingNums = (cases || [])
      .map((c) => {
        const parts = (c?.id || '').split('-');
        return parts.length === 3 ? parseInt(parts[2], 10) : 100;
      })
      .filter((n) => !isNaN(n));
    const max = existingNums.length ? Math.max(...existingNums) : 100;
    const next = max + 1;
    return `CAS-2026-${next}`;
  };

  const generateNextReleaseId = () => {
    const existingNums = (releases || [])
      .map((r) => {
        const parts = (r?.id || '').split('-');
        return parts.length === 3 ? parseInt(parts[2], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = existingNums.length ? Math.max(...existingNums) : 0;
    const next = max + 1;
    return `REL-2026-${next.toString().padStart(3, '0')}`;
  };

  // Rule-based Cell Allocation Engine
  const recommendCellsForPrisoner = (category: PrisonerCategory): AllocationRecommendation[] => {
    return (cells || [])
      .filter((c) => c && c.status !== 'Maintenance' && c.currentOccupancy < c.capacity)
      .map((cell) => {
        const reasons: string[] = [];
        let score = 0;

        if (category === 'High Security') {
          if (cell.block === 'Block B') {
            score += 50;
            reasons.push('High security block match');
          }
          if (cell.securityLevel === 'High' || cell.securityLevel === 'Maximum') {
            score += 40;
            reasons.push(`Appropriate security tier (${cell.securityLevel})`);
          } else {
            score -= 30;
            reasons.push('Warning: Insufficient security rating for High Security inmate');
          }
        } else if (category === 'Under Trial' || category === 'Remand') {
          if (cell.block === 'Block C') {
            score += 50;
            reasons.push('Designated Under-Trial & Remand Block');
          }
          if (cell.securityLevel === 'Medium' || cell.securityLevel === 'Low') {
            score += 30;
            reasons.push('Standard remand supervision level');
          }
        } else {
          // General / Convicted
          if (cell.block === 'Block A') {
            score += 45;
            reasons.push('General custody block match');
          } else if (cell.block === 'Block B' && category === 'Convicted') {
            score += 35;
            reasons.push('Suitable convicted wing');
          }
        }

        // Vacancy availability bonus
        const availableSlots = cell.capacity - cell.currentOccupancy;
        score += availableSlots * 5;
        reasons.push(`${availableSlots} of ${cell.capacity} bed(s) vacant`);

        return {
          cell,
          score,
          reasons,
          isRecommended: score >= 40,
        };
      })
      .sort((a, b) => b.score - a.score);
  };

  // CRUD Prisoners
  const addPrisoner = (data: Omit<Prisoner, 'id'>) => {
    const newId = generateNextPrisonerId();
    const newPrisoner: Prisoner = {
      ...data,
      id: newId,
    };

    const updatedPrisoners = [newPrisoner, ...prisoners];
    setPrisoners(updatedPrisoners);

    // Sync cells
    const updatedCells = syncCellOccupancy(updatedPrisoners, cells);
    setCells(updatedCells);

    logAudit(`Added new prisoner record ${newId} (${data.fullName})`, 'Prisoners', newId, `Assigned to ${data.block} - ${data.cellNumber}`);
    pushNotification('New Inmate Registered', `Prisoner ${data.fullName} registered under ID ${newId}.`, 'success', 'prisoners');

    // If release date is specified, automatically check for upcoming release
    if (data.releaseDate) {
      const releaseDateObj = new Date(data.releaseDate);
      const today = new Date('2026-08-16'); // Academic timeline
      const diffTime = releaseDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 30) {
        pushNotification('Upcoming Release Alert', `Inmate ${data.fullName} is due for release in ${diffDays} days (${data.releaseDate}).`, 'warning', 'releases');
      }
    }

    return { success: true, id: newId, message: `Prisoner ${data.fullName} registered successfully.` };
  };

  const updatePrisoner = (id: string, data: Partial<Prisoner>) => {
    const existing = prisoners.find((p) => p.id === id);
    if (!existing) return { success: false, message: 'Prisoner not found.' };

    const updatedPrisoners = prisoners.map((p) => (p.id === id ? { ...p, ...data } : p));
    setPrisoners(updatedPrisoners);

    const updatedCells = syncCellOccupancy(updatedPrisoners, cells);
    setCells(updatedCells);

    logAudit(`Updated prisoner profile ${id} (${existing.fullName})`, 'Prisoners', id, `Updated fields: ${Object.keys(data).join(', ')}`);
    return { success: true, message: 'Prisoner record updated successfully.' };
  };

  const deletePrisoner = (id: string) => {
    const existing = prisoners.find((p) => p.id === id);
    if (!existing) return { success: false, message: 'Prisoner not found.' };

    const updatedPrisoners = prisoners.filter((p) => p.id !== id);
    setPrisoners(updatedPrisoners);

    const updatedCells = syncCellOccupancy(updatedPrisoners, cells);
    setCells(updatedCells);

    logAudit(`Deleted prisoner record ${id} (${existing.fullName})`, 'Prisoners', id);
    return { success: true, message: `Prisoner record ${id} removed.` };
  };

  const getPrisonerById = (id: string) => prisoners.find((p) => p.id === id);

  // CRUD Cells
  const addCell = (data: Omit<Cell, 'id'>) => {
    const newId = `CELL-${data.cellNumber}`;
    if (cells.some((c) => c.cellNumber === data.cellNumber)) {
      return { success: false, id: '', message: `Cell number ${data.cellNumber} already exists.` };
    }

    const newCell: Cell = {
      ...data,
      id: newId,
      currentOccupancy: 0,
      status: 'Available',
    };

    setCells((prev) => [...prev, newCell]);
    logAudit(`Created cell ${data.cellNumber} in ${data.block}`, 'Cells', newId);
    return { success: true, id: newId, message: `Cell ${data.cellNumber} added successfully.` };
  };

  const updateCell = (id: string, data: Partial<Cell>) => {
    setCells((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    logAudit(`Updated cell configuration for ${id}`, 'Cells', id);
    return { success: true, message: 'Cell updated successfully.' };
  };

  const toggleCellMaintenance = (id: string) => {
    setCells((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === 'Maintenance' ? (c.currentOccupancy >= c.capacity ? 'Occupied' : 'Available') : 'Maintenance';
          logAudit(`Toggled maintenance status for cell ${c.cellNumber} to ${newStatus}`, 'Cells', id);
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  // CRUD Visitors
  const addVisitor = (data: Omit<Visitor, 'id'>) => {
    const newId = generateNextVisitorId();
    const newVisitor: Visitor = {
      ...data,
      id: newId,
    };

    setVisitors((prev) => [newVisitor, ...prev]);
    logAudit(`Registered visitor pass application ${newId} (${data.visitorName})`, 'Visitors', newId, `Visiting inmate ${data.prisonerName}`);
    pushNotification('Visitor Request Submitted', `${data.visitorName} requested to visit ${data.prisonerName} on ${data.visitDate}.`, 'info', 'visitors');
    return { success: true, id: newId, message: 'Visitor application submitted for review.' };
  };

  const updateVisitorStatus = (id: string, status: VisitorStatus, note?: string) => {
    setVisitors((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          logAudit(
            `Changed visitor ${v.id} status to ${status}`,
            'Visitors',
            id,
            `Inmate: ${v.prisonerName}, Officer: ${currentUser?.name || 'Administrator'}`
          );
          return {
            ...v,
            status,
            reviewedBy: currentUser?.name || v.reviewedBy,
            notes: note || v.notes,
          };
        }
        return v;
      })
    );
    return { success: true, message: `Visitor request marked as ${status}.` };
  };

  const deleteVisitor = (id: string) => {
    setVisitors((prev) => prev.filter((v) => v.id !== id));
    logAudit(`Deleted visitor log ${id}`, 'Visitors', id);
    return { success: true, message: 'Visitor record deleted.' };
  };

  // CRUD Cases
  const addCase = (data: Omit<CaseRecord, 'id'>) => {
    const newId = generateNextCaseId();
    const newCase: CaseRecord = {
      ...data,
      id: newId,
    };
    setCases((prev) => [newCase, ...prev]);
    logAudit(`Linked legal case ${newId} (${data.caseNumber}) to prisoner ${data.prisonerId}`, 'Cases', newId);
    return { success: true, id: newId, message: 'Case record added successfully.' };
  };

  const updateCase = (id: string, data: Partial<CaseRecord>) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    logAudit(`Updated case record ${id}`, 'Cases', id);
    return { success: true, message: 'Case record updated.' };
  };

  const deleteCase = (id: string) => {
    setCases((prev) => prev.filter((c) => c.id !== id));
    logAudit(`Deleted case record ${id}`, 'Cases', id);
    return { success: true, message: 'Case record removed.' };
  };

  // Releases
  const addRelease = (data: Omit<ReleaseRecord, 'id'>) => {
    const newId = generateNextReleaseId();
    const newRelease: ReleaseRecord = {
      ...data,
      id: newId,
    };
    setReleases((prev) => [newRelease, ...prev]);
    logAudit(`Scheduled release ${newId} for prisoner ${data.prisonerId}`, 'Releases', newId);
    return { success: true, id: newId, message: 'Release record scheduled successfully.' };
  };

  const processRelease = (id: string, actualDate?: string) => {
    const release = releases.find((r) => r.id === id);
    if (!release) return { success: false, message: 'Release record not found.' };

    const todayDateStr = actualDate || new Date().toISOString().split('T')[0];

    // 1. Update release record
    const updatedReleases = releases.map((r) =>
      r.id === id ? { ...r, status: 'Released' as const, actualReleaseDate: todayDateStr, cellDeallocated: true } : r
    );
    setReleases(updatedReleases);

    // 2. Update prisoner status to Released
    const updatedPrisoners = prisoners.map((p) => (p.id === release.prisonerId ? { ...p, status: 'Released' as const } : p));
    setPrisoners(updatedPrisoners);

    // 3. Automatically sync cell occupancy
    const updatedCells = syncCellOccupancy(updatedPrisoners, cells);
    setCells(updatedCells);

    logAudit(
      `Processed release for prisoner ${release.prisonerId} (${release.prisonerName})`,
      'Releases',
      id,
      `Cell vacated. Prisoner status updated to Released.`
    );
    pushNotification(
      'Prisoner Released',
      `Prisoner ${release.prisonerName} (${release.prisonerId}) has been successfully released and cell occupancy decremented.`,
      'success',
      'releases'
    );

    return { success: true, message: `Prisoner ${release.prisonerName} released and cell deallocated.` };
  };

  const updateRelease = (id: string, data: Partial<ReleaseRecord>) => {
    setReleases((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    logAudit(`Updated release record ${id}`, 'Releases', id);
    return { success: true, message: 'Release record updated.' };
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    StorageService.setAuditLogs([]);
  };

  // Reset sample data
  const resetToSampleData = () => {
    StorageService.resetAllToSeed();
    setPrisoners(StorageService.getPrisoners());
    setCells(StorageService.getCells());
    setVisitors(StorageService.getVisitors());
    setCases(StorageService.getCases());
    setReleases(StorageService.getReleases());
    setAuditLogs(StorageService.getAuditLogs());
    setNotifications(StorageService.getNotifications());
    logAudit('System reset to initial Polytechnic demonstration dataset', 'System', 'SYSTEM-RESET');
  };

  // Dashboard Aggregated Stats
  const stats: DashboardStats = useMemo(() => {
    const prisonerList = prisoners || [];
    const cellList = cells || [];
    const visitorList = visitors || [];
    const releaseList = releases || [];

    const totalPrisoners = prisonerList.length;
    const activePrisoners = prisonerList.filter((p) => p && p.status === 'Active').length;
    const releasedPrisoners = prisonerList.filter((p) => p && p.status === 'Released').length;

    const totalCells = cellList.length;
    const occupiedCells = cellList.filter((c) => c && c.status === 'Occupied').length;
    const availableCells = cellList.filter((c) => c && c.status === 'Available').length;
    const maintenanceCells = cellList.filter((c) => c && c.status === 'Maintenance').length;

    const pendingVisitors = visitorList.filter((v) => v && v.status === 'Pending').length;

    // Upcoming releases: calculated within 30 days from Aug 16, 2026 or release records with status Upcoming
    const upcomingReleases = releaseList.filter((r) => r && r.status === 'Upcoming').length;
    const highSecurityCount = prisonerList.filter((p) => p && p.status === 'Active' && p.category === 'High Security').length;

    return {
      totalPrisoners,
      activePrisoners,
      releasedPrisoners,
      totalCells,
      occupiedCells,
      availableCells,
      maintenanceCells,
      pendingVisitors,
      upcomingReleases,
      highSecurityCount,
    };
  }, [prisoners, cells, visitors, releases]);

  const value: PrisonDataContextType = {
    prisoners,
    cells,
    visitors,
    cases,
    releases,
    auditLogs,
    notifications,
    stats,
    addPrisoner,
    updatePrisoner,
    deletePrisoner,
    getPrisonerById,
    addCell,
    updateCell,
    toggleCellMaintenance,
    recalculateCellOccupancies,
    recommendCellsForPrisoner,
    addVisitor,
    updateVisitorStatus,
    deleteVisitor,
    addCase,
    updateCase,
    deleteCase,
    addRelease,
    processRelease,
    updateRelease,
    markNotificationRead,
    markNotificationAsRead: markNotificationRead,
    markAllNotificationsRead,
    markAllNotificationsAsRead: markAllNotificationsRead,
    resetToSampleData,
    resetToSeedData: resetToSampleData,
    clearAuditLogs,
    generateNextPrisonerId,
    generateNextVisitorId,
    generateNextCaseId,
    generateNextReleaseId,
  };

  return <PrisonDataContext.Provider value={value}>{children}</PrisonDataContext.Provider>;
};

export const usePrisonData = () => {
  const context = useContext(PrisonDataContext);
  if (!context) {
    throw new Error('usePrisonData must be used within a PrisonDataProvider');
  }
  return context;
};
