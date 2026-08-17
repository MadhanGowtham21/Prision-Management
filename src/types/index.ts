export type UserRole = 'admin' | 'officer' | 'medical';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeNumber: string;
  department: string;
}

export type PrisonerCategory = 'General' | 'High Security' | 'Under Trial' | 'Convicted' | 'Remand';
export type PrisonerStatus = 'Active' | 'Released' | 'Transferred';

export interface Prisoner {
  id: string; // Auto-generated e.g. PRN-2026-0001
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  address: string;
  phone: string;
  emergencyContact: string;
  admissionDate: string;
  category: PrisonerCategory;
  caseId?: string;
  sentenceDuration: string; // e.g. "3 Years"
  releaseDate: string; // YYYY-MM-DD
  block: string; // e.g. "Block A"
  cellNumber: string; // e.g. "A101"
  status: PrisonerStatus;
  photoUrl?: string;
  medicalNotes?: string;
  bloodGroup?: string;
}

export type CellSecurityLevel = 'Low' | 'Medium' | 'High' | 'Maximum';
export type CellStatus = 'Available' | 'Occupied' | 'Maintenance';

export interface Cell {
  id: string; // e.g. CELL-A101
  block: 'Block A' | 'Block B' | 'Block C';
  cellNumber: string; // e.g. "A101"
  capacity: number;
  currentOccupancy: number;
  securityLevel: CellSecurityLevel;
  status: CellStatus;
  floor: number;
  notes?: string;
}

export type VisitorStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled';

export interface Visitor {
  id: string; // e.g. VIS-2026-001
  visitorName: string;
  phone: string;
  relationship: string;
  idProofType: 'Aadhaar Card' | 'Passport' | 'Voter ID' | 'Driving License' | 'National ID';
  idProofNumber: string;
  prisonerId: string;
  prisonerName: string;
  requestedDate: string;
  visitDate: string;
  timeSlot?: string;
  status: VisitorStatus;
  notes?: string;
  reviewedBy?: string;
}

export type CaseStatus = 'Pending' | 'Active' | 'Closed';

export interface CaseRecord {
  id: string; // e.g. CAS-2026-101
  prisonerId: string;
  prisonerName: string;
  caseNumber: string;
  courtName: string;
  offence: string;
  caseStatus: CaseStatus;
  sentenceDuration: string;
  judgmentDate: string;
  judgeName?: string;
  notes?: string;
}

export type ReleaseType = 'Sentence Completed' | 'Court Order' | 'Transfer' | 'Bail / Remand End' | 'Other';
export type ReleaseStatus = 'Upcoming' | 'Released';

export interface ReleaseRecord {
  id: string; // e.g. REL-2026-001
  prisonerId: string;
  prisonerName: string;
  expectedReleaseDate: string;
  actualReleaseDate?: string;
  releaseType: ReleaseType;
  status: ReleaseStatus;
  authorizedOfficer: string;
  notes?: string;
  cellDeallocated?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
  linkModule?: string;
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'ALLOCATE' | 'RELEASE' | 'STATUS_CHANGE' | 'LOGIN' | 'LOGOUT' | string;
export type AuditModule = 'Prisoners' | 'Cells' | 'Visitors' | 'Cases' | 'Releases' | 'Auth' | 'System';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: AuditAction;
  module: AuditModule;
  recordId?: string;
  timestamp: string;
  details?: string;
}

export interface DashboardStats {
  totalPrisoners: number;
  activePrisoners: number;
  releasedPrisoners: number;
  totalCells: number;
  occupiedCells: number;
  availableCells: number;
  maintenanceCells: number;
  pendingVisitors: number;
  upcomingReleases: number;
  highSecurityCount: number;
}
