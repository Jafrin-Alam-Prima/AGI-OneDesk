import type { AppState, Kpi, Role, User } from "./types";

export function deptName(s: Pick<AppState, "departments">, id?: string): string {
  return s.departments.find((d) => d.id === id)?.name ?? "—";
}
export function buName(s: Pick<AppState, "businessUnits">, id?: string): string {
  return s.businessUnits.find((b) => b.id === id)?.name ?? "—";
}
export function nameOf(users: User[], id?: string): string {
  return users.find((u) => u.id === id)?.fullName ?? "—";
}
export function userOf(users: User[], id?: string): User | undefined {
  return users.find((u) => u.id === id);
}
export function userByEmail(users: User[], email: string): User | undefined {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
}

export function usersInDept(users: User[], deptId: string): User[] {
  return users.filter((u) => u.departmentId === deptId);
}

export function deptHeads(users: User[], deptId: string): User[] {
  return users.filter((u) => u.departmentId === deptId && u.role === "DEPT_HEAD");
}

/** KPIs visible to a given user, per BRD §6.2. */
export function kpisVisibleTo(s: AppState, user: User | null): Kpi[] {
  if (!user) return [];
  const live = s.kpis.filter((k) => !k.deleted);
  if (user.role === "SUPER_ADMIN") return live;
  if (["HR_ADMIN", "FINANCE_ADMIN", "AUDIT_ADMIN", "SYS_ADMIN"].includes(user.role)) return live;
  if (user.role === "DEPT_HEAD") {
    const deptUserIds = new Set(s.users.filter((u) => u.departmentId === user.departmentId).map((u) => u.id));
    return live.filter((k) => k.ownerId === user.id || deptUserIds.has(k.ownerId));
  }
  return live.filter((k) => k.ownerId === user.id);
}

/** KPIs awaiting this user's decision. */
export function pendingFor(s: AppState, user: User | null): Kpi[] {
  if (!user) return [];
  const awaiting = s.kpis.filter((k) => !k.deleted && k.status === "SUBMITTED");
  if (user.role === "SUPER_ADMIN") return awaiting;
  if (user.role === "HR_ADMIN") return awaiting.filter((k) => k.stage === "HR");
  if (user.role === "FINANCE_ADMIN") return awaiting.filter((k) => k.stage === "FINANCE");
  if (user.role === "AUDIT_ADMIN") return awaiting.filter((k) => k.stage === "AUDIT");
  if (user.role === "DEPT_HEAD") {
    const deptUserIds = new Set(s.users.filter((u) => u.departmentId === user.departmentId).map((u) => u.id));
    return awaiting.filter((k) => deptUserIds.has(k.ownerId) && k.stage === "DEPT");
  }
  return [];
}

export function canDecideKpi(s: AppState, user: User | null, kpi: Kpi): boolean {
  if (!user) return false;
  if (kpi.ownerId === user.id) return false; // no self-approval (BR-10)
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "DEPT_HEAD") {
    const owner = s.users.find((u) => u.id === kpi.ownerId);
    return kpi.stage === "DEPT" && owner?.departmentId === user.departmentId;
  }
  if (user.role === "HR_ADMIN") return kpi.stage === "HR";
  if (user.role === "FINANCE_ADMIN") return kpi.stage === "FINANCE";
  if (user.role === "AUDIT_ADMIN") return kpi.stage === "AUDIT";
  return false;
}

export function isManagerOf(s: AppState, user: User | null, target: User): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "DEPT_HEAD") return target.departmentId === user.departmentId;
  return false;
}

export const ROLE_SCOPE: Record<Role, string> = {
  EMPLOYEE: "Own KPIs",
  DEPT_HEAD: "Own department",
  HR_ADMIN: "All departments — HR stage",
  FINANCE_ADMIN: "All departments — Finance stage",
  AUDIT_ADMIN: "All departments — Audit stage",
  SYS_ADMIN: "Administration",
  SUPER_ADMIN: "All departments",
};
