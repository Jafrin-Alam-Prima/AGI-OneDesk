"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createSeedState } from "./seed";
import type {
  AppState, Announcement, ApprovalPipeline, AssetItem, AuditLog, BusinessUnit,
  Candidate, ConfirmationRecord, Department, Designation, EvidenceFile, ExpenseClaim,
  Grievance, Grade, IouRequest, Kpi, Kra, KpiVersion, LeaveApplication, LoanRequest,
  MealBooking, MovementApplication, Notification, Objective, PolicyDoc, ReviewDecision,
  RewardRecord, RiskItem, SeparationRequest, ServiceRequest, TaskItem, TrainingEnrollment,
  TrainingProgram, TransferRequest, User, VariableIncomeRecord, PayslipRecord, HelpdeskTicket,
  SetupToken,
} from "./types";
import { achievement, calculatedScore } from "./calc";
import { uid } from "./utils";

const now = () => new Date().toISOString();

const DEPT_HEAD_MAP: Record<string, string> = {
  dept1: "u6", dept2: "u8", dept3: "u9", dept4: "u11", dept5: "u10",
};
function deptHeadMap(deptId: string): string | undefined {
  return DEPT_HEAD_MAP[deptId];
}

interface Actions {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;

  /* auth */
  login: (email: string, password: string) => User | null;
  logout: () => void;
  setSession: (userId: string) => void;
  register: (input: { fullName: string; email: string; employeeId: string; businessUnitId: string; departmentId: string }) => { ok: true; user: User; token: SetupToken } | { ok: false; error: string };
  setPassword: (token: string, password: string) => { ok: boolean; error?: string };
  issueSetupLink: (email: string) => SetupToken | null;

  /* kpi */
  createKpi: (input: Partial<Kpi> & { ownerId: string; name: string }) => Kpi;
  updateKpi: (id: string, patch: Partial<Kpi>, reason?: string) => void;
  deleteKpi: (id: string, reason: string) => void;
  submitKpi: (id: string) => void;
  resubmitKpi: (id: string, patch: Partial<Kpi>) => void;
  decideKpi: (id: string, decision: ReviewDecision["decision"], reason: string) => void;
  adjustKpi: (id: string, patch: Partial<Kpi>, reason: string) => void;
  addEvidence: (kpiId: string, file: Omit<EvidenceFile, "id" | "kpiId" | "uploadedAt">) => void;
  removeEvidence: (id: string) => void;

  /* variable income */
  saveVariableIncome: (rec: VariableIncomeRecord) => void;
  toggleViSignature: (id: string, key: keyof VariableIncomeRecord["signatures"]) => void;

  /* notifications */
  markNotification: (id: string, read: boolean) => void;
  markAllNotifications: () => void;

  /* ESS */
  applyLeave: (input: Omit<LeaveApplication, "id" | "status" | "createdAt">) => void;
  decideLeave: (id: string, status: "APPROVED" | "REJECTED", note: string) => void;
  applyMovement: (input: Omit<MovementApplication, "id" | "status" | "createdAt">) => void;
  decideMovement: (id: string, status: "APPROVED" | "REJECTED", note: string) => void;
  requestRegularization: (input: Omit<import("./types").RegularizationRequest, "id" | "status" | "createdAt">) => void;
  decideRegularization: (id: string, status: "APPROVED" | "REJECTED", note: string) => void;
  applyLoan: (input: Omit<LoanRequest, "id" | "status" | "createdAt">) => void;
  decideLoan: (id: string, status: "APPROVED" | "REJECTED", note: string) => void;
  applyIou: (input: Omit<IouRequest, "id" | "status" | "createdAt">) => void;
  decideIou: (id: string, status: "APPROVED" | "REJECTED", note: string) => void;
  claimExpense: (input: Omit<ExpenseClaim, "id" | "status" | "createdAt">) => void;
  decideExpense: (id: string, status: "APPROVED" | "REJECTED", note: string) => void;
  updateProfile: (userId: string, patch: Partial<User>) => void;
  clockPunch: (userId: string, kind: "IN" | "OUT") => void;

  /* requests */
  createServiceRequest: (input: Omit<ServiceRequest, "id" | "status" | "createdAt">) => void;
  updateServiceRequest: (id: string, patch: Partial<ServiceRequest>) => void;
  createGrievance: (input: Omit<Grievance, "id" | "status" | "createdAt">) => void;
  updateGrievance: (id: string, patch: Partial<Grievance>) => void;
  createTicket: (input: Omit<HelpdeskTicket, "id" | "status" | "createdAt">) => void;
  updateTicket: (id: string, patch: Partial<HelpdeskTicket>) => void;

  /* HR modules */
  createCandidate: (input: Omit<Candidate, "id" | "appliedAt">) => void;
  moveCandidate: (id: string, stage: Candidate["stage"]) => void;
  createTraining: (input: Omit<TrainingProgram, "id">) => void;
  enrollTraining: (programId: string, userId: string) => void;
  updateEnrollment: (id: string, patch: Partial<TrainingEnrollment>) => void;
  createSeparation: (input: Omit<SeparationRequest, "id" | "createdAt" | "status" | "clearance">) => void;
  advanceSeparation: (id: string, status: SeparationRequest["status"]) => void;
  toggleClearance: (id: string, department: string) => void;
  createTransfer: (input: Omit<TransferRequest, "id" | "status" | "createdAt">) => void;
  decideTransfer: (id: string, status: "APPROVED" | "REJECTED", note: string) => void;
  createReward: (input: Omit<RewardRecord, "id" | "createdAt">) => void;
  advanceConfirmation: (id: string, status: ConfirmationRecord["status"]) => void;
  createAsset: (input: Omit<AssetItem, "id">) => void;
  assignAsset: (id: string, userId: string) => void;
  returnAsset: (id: string) => void;
  createTask: (input: Omit<TaskItem, "id" | "createdAt">) => void;
  moveTask: (id: string, status: TaskItem["status"]) => void;
  createRisk: (input: Omit<RiskItem, "id" | "createdAt">) => void;
  bookMeal: (input: Omit<MealBooking, "id" | "createdAt">) => void;

  /* comms & admin */
  createAnnouncement: (input: Omit<Announcement, "id" | "publishedAt">) => void;
  createPolicy: (input: Omit<PolicyDoc, "id" | "publishedAt">) => void;
  createEmployee: (input: Omit<User, "id" | "avatarColor" | "status"> & { status?: User["status"] }) => User;
  updateEmployee: (id: string, patch: Partial<User>) => void;
  setEmployeeStatus: (id: string, status: User["status"]) => void;
  createDepartment: (input: Omit<Department, "id">) => void;
  createBusinessUnit: (input: Omit<BusinessUnit, "id">) => void;
  createDesignation: (input: Omit<Designation, "id">) => void;
  createObjective: (input: Omit<Objective, "id">) => void;
  createKra: (input: Omit<Kra, "id">) => void;
  upsertGrade: (grade: Grade) => void;
  deleteGrade: (id: string) => void;
  updatePipeline: (pipeline: ApprovalPipeline) => void;
  resetDemo: () => void;
  audit: (action: string, entity: string, entityId: string, detail: string) => void;
}

export type Store = AppState & Actions;

function pushAudit(state: AppState, actorId: string, action: string, entity: string, entityId: string, detail: string): AuditLog {
  return { id: uid("au"), actorId, action, entity, entityId, detail, at: now() };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createSeedState(),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      /* -------- auth -------- */
      login: (email, password) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
        if (!user) return null;
        // prototype password rule: any password of 4+ chars, or the documented demo passwords
        if (password.length < 4) return null;
        set((s) => ({ session: { userId: user.id }, auditLogs: [pushAudit(s, user.id, "LOGIN", "User", user.id, `Signed in as ${user.fullName}`), ...s.auditLogs] }));
        return user;
      },
      logout: () => set({ session: { userId: null } }),
      setSession: (userId) => set({ session: { userId } }),
      register: ({ fullName, email, employeeId, businessUnitId, departmentId }) => {
        const clean = email.trim().toLowerCase();
        if (!clean.endsWith("@anwargroup.net")) return { ok: false, error: "Only @anwargroup.net company emails are allowed." };
        const s = get();
        if (s.users.some((u) => u.email.toLowerCase() === clean)) return { ok: false, error: "An account already exists for this email." };
        if (s.users.some((u) => u.employeeId.toLowerCase() === employeeId.trim().toLowerCase())) return { ok: false, error: "This Employee ID is already registered." };
        const user: User = {
          id: uid("u"), fullName: fullName.trim(), email: clean, employeeId: employeeId.trim(),
          role: "EMPLOYEE", designation: "Officer", departmentId, businessUnitId,
          managerId: deptHeadMap(departmentId), status: "PENDING_SETUP",
        };
        const token: SetupToken = {
          id: uid("tok"), userId: user.id, email: clean, token: uid("setup").replace(/[^a-z0-9]/gi, ""),
          createdAt: now(), expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        };
        set((st) => ({ users: [...st.users, user], setupTokens: [token, ...st.setupTokens], auditLogs: [pushAudit(st, user.id, "ACCOUNT_REQUESTED", "User", user.id, `Sign-up ${clean}`), ...st.auditLogs] }));
        return { ok: true, user, token };
      },
      setPassword: (token, password) => {
        const s = get();
        const t = s.setupTokens.find((x) => x.token === token);
        if (!t) return { ok: false, error: "This setup link is invalid." };
        if (t.usedAt) return { ok: false, error: "This setup link has already been used." };
        if (new Date(t.expiresAt).getTime() < Date.now()) return { ok: false, error: "This setup link has expired. Request a new one." };
        set((st) => ({
          users: st.users.map((u) => (u.id === t.userId ? { ...u, status: "ACTIVE" } : u)),
          setupTokens: st.setupTokens.map((x) => (x.id === t.id ? { ...x, usedAt: now() } : x)),
          auditLogs: [pushAudit(st, t.userId, "PASSWORD_SET", "User", t.userId, "Password created"), ...st.auditLogs],
        }));
        return { ok: true };
      },
      issueSetupLink: (email) => {
        const s = get();
        const user = s.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) return null;
        const token: SetupToken = {
          id: uid("tok"), userId: user.id, email: user.email, token: uid("setup").replace(/[^a-z0-9]/gi, ""),
          createdAt: now(), expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        };
        set((st) => ({ setupTokens: [token, ...st.setupTokens], auditLogs: [pushAudit(st, user.id, "SETUP_LINK_ISSUED", "User", user.id, `Reset link for ${user.email}`), ...st.auditLogs] }));
        return token;
      },

      /* -------- KPI -------- */
      createKpi: (input) => {
        const s = get();
        const count = s.kpis.length + 1;
        const kpi: Kpi = {
          id: uid("kpi"),
          code: `KPI-${input.periodYear ?? 2026}-${String(count).padStart(4, "0")}`,
          ownerId: input.ownerId,
          approverId: input.approverId || "",
          objectiveId: input.objectiveId,
          kraId: input.kraId,
          name: input.name,
          category: input.category ?? "PROJECT",
          perspective: input.perspective ?? "Financial",
          uom: input.uom ?? "BDT",
          direction: input.direction ?? "HIGHER_BETTER",
          srf: input.srf,
          pmType: input.pmType,
          bscPerspective: input.bscPerspective,
          aggregationType: input.aggregationType,
          kpiMeasurement: input.kpiMeasurement,
          kpiFormat: input.kpiFormat,
          targetFrequency: input.targetFrequency,
          frequencyValue: input.frequencyValue,
          evidenceLink: input.evidenceLink,
          dataSource: input.dataSource,
          kpiCharter: input.kpiCharter,
          kpiDriver: input.kpiDriver,
          showOnDashboard: input.showOnDashboard,
          kpiType: input.kpiType,
          weight: input.weight ?? 0,
          benchmark: input.benchmark,
          target: input.target ?? 0,
          actual: input.actual ?? 0,
          remarks: input.remarks ?? "",
          periodYear: input.periodYear ?? 2026,
          periodMonth: input.periodMonth ?? new Date().getMonth() + 1,
          status: "DRAFT",
          stage: "DEPT",
          createdAt: now(),
          updatedAt: now(),
          createdBy: input.ownerId,
        };
        set((st) => ({
          kpis: [kpi, ...st.kpis],
          auditLogs: [pushAudit(st, kpi.ownerId, "KPI_CREATED", "Kpi", kpi.id, `Created ${kpi.name}`), ...st.auditLogs],
        }));
        return kpi;
      },
      updateKpi: (id, patch, reason) => {
        set((s) => {
          const kpi = s.kpis.find((k) => k.id === id);
          if (!kpi) return s;
          const oldValues: Record<string, unknown> = {};
          const newValues: Record<string, unknown> = {};
          const changed: string[] = [];
          (Object.keys(patch) as (keyof Kpi)[]).forEach((key) => {
            if (patch[key] !== undefined && patch[key] !== kpi[key]) {
              changed.push(String(key));
              oldValues[String(key)] = kpi[key];
              newValues[String(key)] = patch[key];
            }
          });
          if (!changed.length) return s;
          const version: KpiVersion = {
            id: uid("ver"), kpiId: id, versionNo: s.kpiVersions.filter((v) => v.kpiId === id).length + 1,
            changedFields: changed, oldValues, newValues, reason, changedBy: get().session.userId ?? kpi.ownerId, changedAt: now(),
          };
          return {
            kpis: s.kpis.map((k) => (k.id === id ? { ...k, ...patch, updatedAt: now() } : k)),
            kpiVersions: [...s.kpiVersions, version],
            auditLogs: [pushAudit(s, version.changedBy, "KPI_UPDATED", "Kpi", id, `Updated ${changed.join(", ")}`), ...s.auditLogs],
          };
        });
      },
      deleteKpi: (id, reason) =>
        set((s) => ({
          kpis: s.kpis.map((k) => (k.id === id ? { ...k, deleted: true, deleteReason: reason, updatedAt: now() } : k)),
          kpiVersions: [
            ...s.kpiVersions,
            { id: uid("ver"), kpiId: id, versionNo: s.kpiVersions.filter((v) => v.kpiId === id).length + 1, changedFields: ["deleted"], oldValues: { deleted: false }, newValues: { deleted: true }, reason, changedBy: s.session.userId ?? "", changedAt: now() },
          ],
          auditLogs: [pushAudit(s, s.session.userId ?? "", "KPI_DELETED", "Kpi", id, `Deleted: ${reason}`), ...s.auditLogs],
        })),
      submitKpi: (id) => {
        const s = get();
        const kpi = s.kpis.find((k) => k.id === id);
        if (!kpi) return;
        set((st) => ({
          kpis: st.kpis.map((k) => (k.id === id ? { ...k, status: "SUBMITTED", stage: "DEPT", updatedAt: now() } : k)),
          kpiVersions: [...st.kpiVersions, { id: uid("ver"), kpiId: id, versionNo: st.kpiVersions.filter((v) => v.kpiId === id).length + 1, changedFields: ["status"], oldValues: { status: kpi.status }, newValues: { status: "SUBMITTED" }, changedBy: kpi.ownerId, changedAt: now() }],
          notifications: [...st.notifications, { id: uid("nt"), userId: kpi.approverId, title: "New KPI request", body: `${kpi.name} submitted for review.`, link: "/kpi-requests", read: false, at: now() }],
          auditLogs: [pushAudit(st, kpi.ownerId, "KPI_SUBMITTED", "Kpi", id, `Submitted ${kpi.name}`), ...st.auditLogs],
        }));
      },
      resubmitKpi: (id, patch) => {
        const s = get();
        const kpi = s.kpis.find((k) => k.id === id);
        if (!kpi) return;
        set((st) => ({
          kpis: st.kpis.map((k) => (k.id === id ? { ...k, ...patch, status: "SUBMITTED", stage: "DEPT", updatedAt: now() } : k)),
          kpiVersions: [...st.kpiVersions, { id: uid("ver"), kpiId: id, versionNo: st.kpiVersions.filter((v) => v.kpiId === id).length + 1, changedFields: [...Object.keys(patch), "status"], oldValues: { status: kpi.status }, newValues: { ...patch, status: "SUBMITTED" }, reason: "Resubmitted after correction", changedBy: kpi.ownerId, changedAt: now() }],
          notifications: [...st.notifications, { id: uid("nt"), userId: kpi.approverId, title: "KPI resubmitted", body: `${kpi.name} was corrected and resubmitted.`, link: "/kpi-requests", read: false, at: now() }],
          auditLogs: [pushAudit(st, kpi.ownerId, "KPI_RESUBMITTED", "Kpi", id, `Resubmitted ${kpi.name}`), ...st.auditLogs],
        }));
      },
      decideKpi: (id, decision, reason) => {
        const s = get();
        const kpi = s.kpis.find((k) => k.id === id);
        if (!kpi) return;
        const actor = s.session.userId ?? kpi.approverId;
        const statusMap: Record<ReviewDecision["decision"], Kpi["status"]> = {
          APPROVE: "APPROVED", ADJUST: "ADJUSTED", RETURN: "RETURNED", REJECT: "REJECTED", COMPLETE: "COMPLETED",
        };
        const newStatus = statusMap[decision];
        let stage: Kpi["stage"] = kpi.stage;
        let advanced = false;
        if (decision === "APPROVE") {
          if (kpi.stage === "DEPT") { stage = "HR"; advanced = true; }
          else if (kpi.stage === "HR") { stage = "FINANCE"; advanced = true; }
          else if (kpi.stage === "FINANCE") { stage = "AUDIT"; advanced = true; }
        }
        const finalStatus: Kpi["status"] = decision === "APPROVE" && advanced ? "SUBMITTED" : newStatus;
        set((st) => ({
          kpis: st.kpis.map((k) => (k.id === id ? { ...k, status: finalStatus, stage, updatedAt: now() } : k)),
          decisions: [...st.decisions, { id: uid("dec"), kpiId: id, stage: kpi.stage, decision, reason, actorId: actor, at: now() }],
          kpiVersions: [...st.kpiVersions, { id: uid("ver"), kpiId: id, versionNo: st.kpiVersions.filter((v) => v.kpiId === id).length + 1, changedFields: ["status", "stage"], oldValues: { status: kpi.status, stage: kpi.stage }, newValues: { status: finalStatus, stage }, reason, changedBy: actor, changedAt: now() }],
          notifications: [...st.notifications, { id: uid("nt"), userId: kpi.ownerId, title: `KPI ${decision.toLowerCase()}d`, body: `${kpi.name}: ${reason || decision}`, link: "/my-kpi", read: false, at: now() }],
          auditLogs: [pushAudit(st, actor, `KPI_${decision}`, "Kpi", id, `${decision} ${kpi.name}${reason ? " — " + reason : ""}`), ...st.auditLogs],
        }));
      },
      adjustKpi: (id, patch, reason) => {
        const s = get();
        const kpi = s.kpis.find((k) => k.id === id);
        if (!kpi) return;
        const actor = s.session.userId ?? kpi.approverId;
        const combined = { ...kpi, ...patch };
        set((st) => ({
          kpis: st.kpis.map((k) => (k.id === id ? { ...k, ...patch, status: "ADJUSTED", updatedAt: now() } : k)),
          decisions: [...st.decisions, { id: uid("dec"), kpiId: id, stage: kpi.stage, decision: "ADJUST", reason, actorId: actor, at: now() }],
          kpiVersions: [...st.kpiVersions, { id: uid("ver"), kpiId: id, versionNo: st.kpiVersions.filter((v) => v.kpiId === id).length + 1, changedFields: [...Object.keys(patch), "status"], oldValues: { target: kpi.target, actual: kpi.actual, weight: kpi.weight }, newValues: { target: combined.target, actual: combined.actual, weight: combined.weight }, reason, changedBy: actor, changedAt: now() }],
          notifications: [...st.notifications, { id: uid("nt"), userId: kpi.ownerId, title: "KPI adjusted & approved", body: `${kpi.name}: ${reason}`, link: "/my-kpi", read: false, at: now() }],
          auditLogs: [pushAudit(st, actor, "KPI_ADJUST", "Kpi", id, `Adjusted ${kpi.name} — ${reason}`), ...st.auditLogs],
        }));
      },
      addEvidence: (kpiId, file) =>
        set((s) => ({
          evidence: [...s.evidence, { ...file, id: uid("ev"), kpiId, uploadedAt: now() }],
          auditLogs: [pushAudit(s, file.uploadedBy, "EVIDENCE_UPLOADED", "Kpi", kpiId, `Uploaded ${file.name}`), ...s.auditLogs],
        })),
      removeEvidence: (id) => set((s) => ({ evidence: s.evidence.filter((e) => e.id !== id) })),

      /* -------- variable income -------- */
      saveVariableIncome: (rec) =>
        set((s) => ({
          variableIncome: s.variableIncome.some((r) => r.id === rec.id)
            ? s.variableIncome.map((r) => (r.id === rec.id ? { ...rec, updatedAt: now() } : r))
            : [...s.variableIncome, { ...rec, createdAt: now(), updatedAt: now() }],
          auditLogs: [pushAudit(s, s.session.userId ?? "", "VI_SAVED", "VariableIncome", rec.id, "Saved variable income scorecard"), ...s.auditLogs],
        })),
      toggleViSignature: (id, key) =>
        set((s) => ({
          variableIncome: s.variableIncome.map((r) => (r.id === id ? { ...r, signatures: { ...r.signatures, [key]: !r.signatures[key] }, updatedAt: now() } : r)),
        })),

      /* -------- notifications -------- */
      markNotification: (id, read) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read } : n)) })),
      markAllNotifications: () => set((s) => ({ notifications: s.notifications.map((n) => (n.userId === s.session.userId ? { ...n, read: true } : n)) })),

      /* -------- ESS -------- */
      applyLeave: (input) =>
        set((s) => ({
          leaveApplications: [{ ...input, id: uid("la"), status: "PENDING", createdAt: now() }, ...s.leaveApplications],
          notifications: [...s.notifications, { id: uid("nt"), userId: input.approverId ?? "", title: "New leave application", body: `${input.days} day leave request awaiting approval.`, link: "/approvals", read: false, at: now() }],
          auditLogs: [pushAudit(s, input.userId, "LEAVE_APPLIED", "LeaveApplication", input.userId, `${input.days} days`), ...s.auditLogs],
        })),
      decideLeave: (id, status, note) =>
        set((s) => {
          const app = s.leaveApplications.find((l) => l.id === id);
          const balances = app && status === "APPROVED"
            ? s.leaveBalances.map((b) => (b.userId === app.userId && b.leaveTypeId === app.leaveTypeId ? { ...b, taken: b.taken + app.days } : b))
            : s.leaveBalances;
          return {
            leaveApplications: s.leaveApplications.map((l) => (l.id === id ? { ...l, status, decisionNote: note, approverId: s.session.userId ?? l.approverId } : l)),
            leaveBalances: balances,
            notifications: app ? [...s.notifications, { id: uid("nt"), userId: app.userId, title: `Leave ${status.toLowerCase()}`, body: note || status, link: "/leave", read: false, at: now() }] : s.notifications,
            auditLogs: [pushAudit(s, s.session.userId ?? "", `LEAVE_${status}`, "LeaveApplication", id, note), ...s.auditLogs],
          };
        }),
      applyMovement: (input) =>
        set((s) => ({
          movementApplications: [{ ...input, id: uid("mv"), status: "PENDING", createdAt: now() }, ...s.movementApplications],
          auditLogs: [pushAudit(s, input.userId, "MOVEMENT_APPLIED", "Movement", input.userId, input.purpose), ...s.auditLogs],
        })),
      decideMovement: (id, status, note) =>
        set((s) => ({
          movementApplications: s.movementApplications.map((m) => (m.id === id ? { ...m, status, decisionNote: note } : m)),
          auditLogs: [pushAudit(s, s.session.userId ?? "", `MOVEMENT_${status}`, "Movement", id, note), ...s.auditLogs],
        })),
      requestRegularization: (input) =>
        set((s) => ({ regularizations: [{ ...input, id: uid("reg"), status: "PENDING", createdAt: now() }, ...s.regularizations], auditLogs: [pushAudit(s, input.userId, "REGULARIZATION_REQUESTED", "Regularization", input.userId, input.reason), ...s.auditLogs] })),
      decideRegularization: (id, status, note) =>
        set((s) => ({
          regularizations: s.regularizations.map((r) => (r.id === id ? { ...r, status, decisionNote: note } : r)),
          auditLogs: [pushAudit(s, s.session.userId ?? "", `REGULARIZATION_${status}`, "Regularization", id, note), ...s.auditLogs],
        })),
      applyLoan: (input) =>
        set((s) => ({ loans: [{ ...input, id: uid("ln"), status: "PENDING", createdAt: now() }, ...s.loans], notifications: [...s.notifications, { id: uid("nt"), userId: input.approverId ?? "", title: "New loan request", body: `Loan request awaiting approval.`, link: "/approvals", read: false, at: now() }], auditLogs: [pushAudit(s, input.userId, "LOAN_APPLIED", "Loan", input.userId, input.reason), ...s.auditLogs] })),
      decideLoan: (id, status, note) =>
        set((s) => ({ loans: s.loans.map((l) => (l.id === id ? { ...l, status, decisionNote: note } : l)), auditLogs: [pushAudit(s, s.session.userId ?? "", `LOAN_${status}`, "Loan", id, note), ...s.auditLogs] })),
      applyIou: (input) =>
        set((s) => ({ ious: [{ ...input, id: uid("io"), status: "PENDING", createdAt: now() }, ...s.ious], auditLogs: [pushAudit(s, input.userId, "IOU_APPLIED", "Iou", input.userId, input.purpose), ...s.auditLogs] })),
      decideIou: (id, status, note) =>
        set((s) => ({ ious: s.ious.map((l) => (l.id === id ? { ...l, status, decisionNote: note } : l)), auditLogs: [pushAudit(s, s.session.userId ?? "", `IOU_${status}`, "Iou", id, note), ...s.auditLogs] })),
      claimExpense: (input) =>
        set((s) => ({ expenses: [{ ...input, id: uid("ex"), status: "PENDING", createdAt: now() }, ...s.expenses], notifications: [...s.notifications, { id: uid("nt"), userId: input.approverId ?? "", title: "New expense claim", body: `Expense claim awaiting approval.`, link: "/approvals", read: false, at: now() }], auditLogs: [pushAudit(s, input.userId, "EXPENSE_CLAIMED", "Expense", input.userId, input.description), ...s.auditLogs] })),
      decideExpense: (id, status, note) =>
        set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, status, decisionNote: note } : e)), auditLogs: [pushAudit(s, s.session.userId ?? "", `EXPENSE_${status}`, "Expense", id, note), ...s.auditLogs] })),
      updateProfile: (userId, patch) => set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)), auditLogs: [pushAudit(s, userId, "PROFILE_UPDATED", "User", userId, "Updated profile"), ...s.auditLogs] })),
      clockPunch: (userId, kind) => {
        const date = new Date().toISOString().slice(0, 10);
        const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        set((s) => {
          const existing = s.attendance.find((a) => a.userId === userId && a.date === date);
          if (existing) {
            return {
              attendance: s.attendance.map((a) => (a.id === existing.id ? { ...a, inTime: kind === "IN" ? time : a.inTime, outTime: kind === "OUT" ? time : a.outTime, status: "PRESENT" } : a)),
              auditLogs: [pushAudit(s, userId, kind === "IN" ? "CLOCK_IN" : "CLOCK_OUT", "Attendance", userId, `${kind} at ${time}`), ...s.auditLogs],
            };
          }
          return {
            attendance: [{ id: uid("att"), userId, date, inTime: kind === "IN" ? time : undefined, outTime: kind === "OUT" ? time : undefined, status: "PRESENT", shift: "General 09:00-18:00" }, ...s.attendance],
            auditLogs: [pushAudit(s, userId, kind === "IN" ? "CLOCK_IN" : "CLOCK_OUT", "Attendance", userId, `${kind} at ${time}`), ...s.auditLogs],
          };
        });
      },

      /* -------- requests -------- */
      createServiceRequest: (input) => set((s) => ({ serviceRequests: [{ ...input, id: uid("sr"), status: "OPEN", createdAt: now() }, ...s.serviceRequests], auditLogs: [pushAudit(s, input.userId, "SERVICE_REQUESTED", "ServiceRequest", input.userId, input.subject), ...s.auditLogs] })),
      updateServiceRequest: (id, patch) => set((s) => ({ serviceRequests: s.serviceRequests.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      createGrievance: (input) => set((s) => ({ grievances: [{ ...input, id: uid("gr"), status: "OPEN", createdAt: now() }, ...s.grievances], auditLogs: [pushAudit(s, input.userId, "GRIEVANCE_RAISED", "Grievance", input.userId, input.category), ...s.auditLogs] })),
      updateGrievance: (id, patch) => set((s) => ({ grievances: s.grievances.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      createTicket: (input) => set((s) => ({ tickets: [{ ...input, id: uid("ht"), status: "OPEN", createdAt: now() }, ...s.tickets], auditLogs: [pushAudit(s, input.userId, "TICKET_CREATED", "Ticket", input.userId, input.subject), ...s.auditLogs] })),
      updateTicket: (id, patch) => set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

      /* -------- HR modules -------- */
      createCandidate: (input) => set((s) => ({ candidates: [{ ...input, id: uid("cd"), appliedAt: now() }, ...s.candidates], auditLogs: [pushAudit(s, s.session.userId ?? "", "CANDIDATE_CREATED", "Candidate", input.name, input.position), ...s.auditLogs] })),
      moveCandidate: (id, stage) => set((s) => ({ candidates: s.candidates.map((c) => (c.id === id ? { ...c, stage } : c)) })),
      createTraining: (input) => set((s) => ({ training: [{ ...input, id: uid("tr") }, ...s.training] })),
      enrollTraining: (programId, userId) => set((s) => ({ enrollments: [{ id: uid("en"), programId, userId, status: "REQUESTED", attended: false }, ...s.enrollments] })),
      updateEnrollment: (id, patch) => set((s) => ({ enrollments: s.enrollments.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      createSeparation: (input) => set((s) => ({ separations: [{ ...input, id: uid("sep"), status: "PENDING", clearance: [{ department: "IT", cleared: false }, { department: "Finance", cleared: false }, { department: "Admin", cleared: false }, { department: "HR", cleared: false }], createdAt: now() }, ...s.separations], auditLogs: [pushAudit(s, input.userId, "SEPARATION_APPLIED", "Separation", input.userId, input.reason), ...s.auditLogs] })),
      advanceSeparation: (id, status) => set((s) => ({ separations: s.separations.map((x) => (x.id === id ? { ...x, status } : x)) })),
      toggleClearance: (id, department) => set((s) => ({ separations: s.separations.map((x) => (x.id === id ? { ...x, clearance: x.clearance.map((c) => (c.department === department ? { ...c, cleared: !c.cleared } : c)) } : x)) })),
      createTransfer: (input) => set((s) => ({ transfers: [{ ...input, id: uid("tf"), status: "PENDING", createdAt: now() }, ...s.transfers], auditLogs: [pushAudit(s, input.userId, "TRANSFER_CREATED", "Transfer", input.userId, input.type), ...s.auditLogs] })),
      decideTransfer: (id, status, note) => set((s) => {
        const t = s.transfers.find((x) => x.id === id);
        const users = t && status === "APPROVED"
          ? s.users.map((u) => (u.id === t.userId ? { ...u, departmentId: t.toDepartmentId, designation: t.newDesignation || u.designation } : u))
          : s.users;
        return { transfers: s.transfers.map((x) => (x.id === id ? { ...x, status, decisionNote: note } as TransferRequest & { decisionNote?: string } : x)), users, auditLogs: [pushAudit(s, s.session.userId ?? "", `TRANSFER_${status}`, "Transfer", id, note), ...s.auditLogs] };
      }),
      createReward: (input) => set((s) => ({ rewards: [{ ...input, id: uid("rw"), createdAt: now() }, ...s.rewards], auditLogs: [pushAudit(s, s.session.userId ?? "", "REWARD_RECORDED", "Reward", input.userId, input.title), ...s.auditLogs] })),
      advanceConfirmation: (id, status) => set((s) => ({ confirmations: s.confirmations.map((c) => (c.id === id ? { ...c, status } : c)) })),
      createAsset: (input) => set((s) => ({ assets: [{ ...input, id: uid("as") }, ...s.assets] })),
      assignAsset: (id, userId) => set((s) => ({ assets: s.assets.map((a) => (a.id === id ? { ...a, status: "ASSIGNED", assignedTo: userId, assignedAt: now() } : a)) })),
      returnAsset: (id) => set((s) => ({ assets: s.assets.map((a) => (a.id === id ? { ...a, status: "AVAILABLE", assignedTo: undefined, assignedAt: undefined } : a)) })),
      createTask: (input) => set((s) => ({ tasks: [{ ...input, id: uid("tk"), createdAt: now() }, ...s.tasks] })),
      moveTask: (id, status) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) })),
      createRisk: (input) => set((s) => ({ risks: [{ ...input, id: uid("rk"), createdAt: now() }, ...s.risks] })),
      bookMeal: (input) => set((s) => ({ meals: [{ ...input, id: uid("ml"), createdAt: now() }, ...s.meals] })),

      /* -------- comms & admin -------- */
      createAnnouncement: (input) => set((s) => ({ announcements: [{ ...input, id: uid("an"), publishedAt: now() }, ...s.announcements], auditLogs: [pushAudit(s, input.authorId, "ANNOUNCEMENT_CREATED", "Announcement", input.title, input.audience), ...s.auditLogs] })),
      createPolicy: (input) => set((s) => ({ policies: [{ ...input, id: uid("po"), publishedAt: now() }, ...s.policies], auditLogs: [pushAudit(s, s.session.userId ?? "", "DOCUMENT_CREATED", "Policy", input.title, input.category), ...s.auditLogs] })),
      createEmployee: (input) => {
        const user: User = { ...input, id: uid("u"), avatarColor: undefined, status: input.status ?? "ACTIVE" };
        set((s) => ({ users: [...s.users, user], auditLogs: [pushAudit(s, s.session.userId ?? "", "EMPLOYEE_CREATED", "User", user.id, `Added ${user.fullName}`), ...s.auditLogs] }));
        return user;
      },
      updateEmployee: (id, patch) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)), auditLogs: [pushAudit(s, s.session.userId ?? "", "EMPLOYEE_UPDATED", "User", id, "Updated employee"), ...s.auditLogs] })),
      setEmployeeStatus: (id, status) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status } : u)), auditLogs: [pushAudit(s, s.session.userId ?? "", "EMPLOYEE_STATUS", "User", id, status), ...s.auditLogs] })),
      createDepartment: (input) => set((s) => ({ departments: [...s.departments, { ...input, id: uid("dept") }] })),
      createBusinessUnit: (input) => set((s) => ({ businessUnits: [...s.businessUnits, { ...input, id: uid("bu") }] })),
      createDesignation: (input) => set((s) => ({ designations: [...s.designations, { ...input, id: uid("desig") }] })),
      createObjective: (input) => set((s) => ({ objectives: [...s.objectives, { ...input, id: uid("obj") }] })),
      createKra: (input) => set((s) => ({ kras: [...s.kras, { ...input, id: uid("kra") }] })),
      upsertGrade: (grade) => set((s) => ({ grades: s.grades.some((g) => g.id === grade.id) ? s.grades.map((g) => (g.id === grade.id ? grade : g)) : [...s.grades, grade] })),
      deleteGrade: (id) => set((s) => ({ grades: s.grades.filter((g) => g.id !== id) })),
      updatePipeline: (pipeline) => set((s) => ({ pipelines: s.pipelines.map((p) => (p.id === pipeline.id ? pipeline : p)) })),
      resetDemo: () => set({ ...createSeedState(), hydrated: true }),
      audit: (action, entity, entityId, detail) => set((s) => ({ auditLogs: [pushAudit(s, s.session.userId ?? "", action, entity, entityId, detail), ...s.auditLogs] })),
    }),
    {
      name: "agi-onedesk-v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const data: Record<string, unknown> = {};
        const src = state as unknown as Record<string, unknown>;
        for (const key of Object.keys(src)) {
          if (key === "hydrated" || key === "setHydrated" || typeof src[key] === "function") continue;
          data[key] = src[key];
        }
        return data as Partial<Store>;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

/* --------- selectors / helpers --------- */
export function useCurrentUser(): User | null {
  return useStore((s) => s.users.find((u) => u.id === s.session.userId) ?? null);
}

export function userName(users: User[], id?: string): string {
  return users.find((u) => u.id === id)?.fullName ?? "—";
}

export function achievementOf(kpi: Kpi): number {
  return achievement(kpi.target, kpi.actual);
}
export function scoreOf(kpi: Kpi): number {
  return calculatedScore(kpi.target, kpi.actual);
}
