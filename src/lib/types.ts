// AGI OneDesk — domain types

export type Role =
  | "EMPLOYEE"
  | "DEPT_HEAD"
  | "HR_ADMIN"
  | "FINANCE_ADMIN"
  | "AUDIT_ADMIN"
  | "SYS_ADMIN"
  | "SUPER_ADMIN";

export type UserStatus = "ACTIVE" | "PENDING_SETUP" | "DEACTIVATED";

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  businessUnitId: string;
}

export interface Designation {
  id: string;
  name: string;
}

export interface Grade {
  id: string;
  name: string;
  min: number; // 0..1
  max: number; // 0..1
  label: string; // e.g. "A+"
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  employeeId: string;
  role: Role;
  designation: string;
  departmentId: string;
  businessUnitId: string;
  sectionId?: string;
  managerId?: string;
  corporatePhone?: string;
  personalEmail?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  joiningDate?: string;
  confirmationDate?: string;
  status: UserStatus;
  avatarColor?: string;
}

/* ---------------- KPI / Goals ---------------- */

export type KpiCategory = "PROJECT" | "PEOPLE_CULTURE";
export type KpiDirection = "HIGHER_BETTER" | "LOWER_BETTER";
export type KpiStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "RETURNED"
  | "APPROVED"
  | "ADJUSTED"
  | "REJECTED"
  | "COMPLETED";

export type KpiStage = "DEPT" | "HR" | "FINANCE" | "AUDIT";

export interface Objective {
  id: string;
  name: string;
  perspective: string; // BSC perspective
  businessUnitId?: string;
}

export interface Kra {
  id: string;
  objectiveId: string;
  name: string;
  description?: string;
}

export interface EvidenceFile {
  id: string;
  kpiId: string;
  name: string;
  size: number;
  type: string;
  sha256: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface KpiVersion {
  id: string;
  kpiId: string;
  versionNo: number;
  changedFields: string[];
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  reason?: string;
  changedBy: string;
  changedAt: string;
}

export interface ReviewDecision {
  id: string;
  kpiId: string;
  stage: KpiStage;
  decision: "APPROVE" | "ADJUST" | "RETURN" | "REJECT" | "COMPLETE";
  reason?: string;
  actorId: string;
  at: string;
}

export interface Kpi {
  id: string;
  code: string; // KPI-2026-0001
  ownerId: string;
  approverId: string;
  objectiveId?: string;
  kraId?: string;
  name: string;
  category: KpiCategory;
  perspective: string;
  uom: string; // BDT, %, count, days
  direction: KpiDirection;
  srf?: string;
  /* PeopleDesk parity fields */
  pmType?: "BSC" | "ESG" | "OKR";
  bscPerspective?: string;
  aggregationType?: string;
  kpiMeasurement?: string;
  kpiFormat?: string;
  targetFrequency?: string;
  frequencyValue?: number;
  evidenceLink?: string;
  dataSource?: string;
  kpiCharter?: string;
  kpiDriver?: string;
  showOnDashboard?: boolean;
  kpiType?: "VARIABLE" | "NON_VARIABLE";
  weight: number; // percent
  benchmark?: number;
  target: number;
  actual: number;
  remarks?: string;
  periodYear: number;
  periodMonth: number; // 1..12
  status: KpiStatus;
  stage: KpiStage;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  hrNote?: string;
  paymentAmount?: number;
  attendanceNote?: string;
  deleted?: boolean;
  deleteReason?: string;
}

/* ---------------- Performance / Variable income ---------------- */

export interface VariableIncomeRow {
  id: string;
  recordId: string;
  kra: string;
  actionPlan: string;
  weight: number; // 0..1
  target: number;
  achievement: number;
}

export interface VariableIncomeRecord {
  id: string;
  employeeId: string;
  periodYear: number;
  periodMonth: number;
  rows: VariableIncomeRow[];
  signatures: { lm: boolean; coo: boolean; hod: boolean; hodHr: boolean };
  createdAt: string;
  updatedAt: string;
}

/* ---------------- ESS: attendance / leave / movement ---------------- */

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // yyyy-mm-dd
  inTime?: string;
  outTime?: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "MOVEMENT" | "OFFDAY" | "HOLIDAY";
  shift?: string;
}

export interface RegularizationRequest {
  id: string;
  userId: string;
  date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approverId?: string;
  decisionNote?: string;
  createdAt: string;
}

export interface LeaveType {
  id: string;
  name: string;
  yearlyQuota: number;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  leaveTypeId: string;
  entitled: number;
  taken: number;
}

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";

export interface LeaveApplication {
  id: string;
  userId: string;
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  location?: string;
  status: RequestStatus;
  approverId?: string;
  decisionNote?: string;
  createdAt: string;
}

export interface MovementApplication {
  id: string;
  userId: string;
  date: string;
  location: string;
  purpose: string;
  status: RequestStatus;
  approverId?: string;
  decisionNote?: string;
  createdAt: string;
}

/* ---------------- Loans / Advance / Expense ---------------- */

export interface LoanRequest {
  id: string;
  userId: string;
  loanType: string;
  amount: number;
  installments: number;
  reason: string;
  status: RequestStatus;
  approverId?: string;
  decisionNote?: string;
  createdAt: string;
}

export interface IouRequest {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  adjustAgainst?: string;
  status: RequestStatus;
  approverId?: string;
  decisionNote?: string;
  createdAt: string;
}

export interface ExpenseClaim {
  id: string;
  userId: string;
  expenseType: string;
  amount: number;
  date: string;
  description: string;
  status: RequestStatus;
  approverId?: string;
  decisionNote?: string;
  createdAt: string;
}

/* ---------------- Requests / tickets / grievances ---------------- */

export interface ServiceRequest {
  id: string;
  userId: string;
  requestType: string;
  subject: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assigneeId?: string;
  createdAt: string;
  resolution?: string;
}

export interface Grievance {
  id: string;
  userId: string;
  category: string;
  description: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
  createdAt: string;
  resolution?: string;
}

/* ---------------- HR modules ---------------- */

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  publishedAt: string;
  authorId: string;
}

export interface PolicyDoc {
  id: string;
  title: string;
  category: "POLICY" | "PROCEDURE" | "SOP" | "PROCESS" | "FORM";
  body: string;
  version: string;
  publishedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  departmentId: string;
  stage: "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";
  skills: string;
  salaryExpectation: number;
  appliedAt: string;
}

export interface TrainingProgram {
  id: string;
  title: string;
  category: string;
  trainer: string;
  startDate: string;
  endDate: string;
  seats: number;
}

export interface TrainingEnrollment {
  id: string;
  programId: string;
  userId: string;
  status: "REQUESTED" | "ENROLLED" | "COMPLETED" | "REJECTED";
  attended: boolean;
  score?: number;
}

export interface SeparationRequest {
  id: string;
  userId: string;
  type: string;
  lastWorkingDate: string;
  reason: string;
  status: "PENDING" | "CLEARANCE" | "SETTLED" | "RELEASED" | "REJECTED";
  clearance: { department: string; cleared: boolean }[];
  settlementAmount?: number;
  createdAt: string;
}

export interface TransferRequest {
  id: string;
  userId: string;
  type: "TRANSFER" | "PROMOTION";
  fromDepartmentId: string;
  toDepartmentId: string;
  effectiveDate: string;
  newDesignation?: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
}

export interface RewardRecord {
  id: string;
  userId: string;
  type: "REWARD" | "PUNISHMENT";
  title: string;
  description: string;
  date: string;
  amount?: number;
  createdAt: string;
}

export interface ConfirmationRecord {
  id: string;
  userId: string;
  status: "ELIGIBLE" | "SUPERVISOR_REVIEW" | "HR_ACCEPTANCE" | "CONFIRMED";
  dueDate: string;
  notes?: string;
}

export interface AssetItem {
  id: string;
  name: string;
  category: string;
  code: string;
  status: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE";
  assignedTo?: string;
  assignedAt?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  project: string;
  assigneeId: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string;
  createdAt: string;
}

export interface HelpdeskTicket {
  id: string;
  userId: string;
  issueType: string;
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
}

export interface MealBooking {
  id: string;
  userId: string;
  date: string;
  meal: string;
  quantity: number;
  createdAt: string;
}

export interface RiskItem {
  id: string;
  title: string;
  category: string;
  likelihood: number; // 1..5
  impact: number; // 1..5
  owner: string;
  status: "OPEN" | "MITIGATED" | "CLOSED";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
  at: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  at: string;
}

export interface PipelineStep {
  order: number;
  role: Role;
  label: string;
}

export interface ApprovalPipeline {
  id: string;
  name: string;
  appliesTo: string;
  steps: PipelineStep[];
}

export interface ContactEntry {
  id: string;
  userId: string;
  phone: string;
  email: string;
}

export interface SetupToken {
  id: string;
  userId: string;
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

export interface PayslipRecord {
  id: string;
  userId: string;
  periodYear: number;
  periodMonth: number;
  basics: { label: string; amount: number }[];
  deductions: { label: string; amount: number }[];
  net: number;
}

export interface AppState {
  session: { userId: string | null };
  businessUnits: BusinessUnit[];
  departments: Department[];
  designations: Designation[];
  grades: Grade[];
  users: User[];
  objectives: Objective[];
  kras: Kra[];
  kpis: Kpi[];
  evidence: EvidenceFile[];
  kpiVersions: KpiVersion[];
  decisions: ReviewDecision[];
  variableIncome: VariableIncomeRecord[];
  attendance: AttendanceRecord[];
  regularizations: RegularizationRequest[];
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveApplications: LeaveApplication[];
  movementApplications: MovementApplication[];
  loans: LoanRequest[];
  ious: IouRequest[];
  expenses: ExpenseClaim[];
  serviceRequests: ServiceRequest[];
  grievances: Grievance[];
  announcements: Announcement[];
  policies: PolicyDoc[];
  candidates: Candidate[];
  training: TrainingProgram[];
  enrollments: TrainingEnrollment[];
  separations: SeparationRequest[];
  transfers: TransferRequest[];
  rewards: RewardRecord[];
  confirmations: ConfirmationRecord[];
  assets: AssetItem[];
  tasks: TaskItem[];
  tickets: HelpdeskTicket[];
  meals: MealBooking[];
  risks: RiskItem[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  pipelines: ApprovalPipeline[];
  payslips: PayslipRecord[];
  contacts: ContactEntry[];
  setupTokens: SetupToken[];
}
