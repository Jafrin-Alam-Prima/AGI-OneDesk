import type { Kpi, Role } from "./types";

export interface NavItem {
  label: string;
  href?: string;
  icon?: string;
  roles?: Role[];
  children?: NavItem[];
  badgeKey?: "kpiPending" | "notifications";
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

const ALL: Role[] = ["EMPLOYEE", "DEPT_HEAD", "HR_ADMIN", "FINANCE_ADMIN", "AUDIT_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"];
const HEADS: Role[] = ["DEPT_HEAD", "HR_ADMIN", "FINANCE_ADMIN", "AUDIT_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"];
const STAGE: Role[] = ["HR_ADMIN", "FINANCE_ADMIN", "AUDIT_ADMIN", "SUPER_ADMIN"];
const ADMIN: Role[] = ["SYS_ADMIN", "SUPER_ADMIN"];
/** Roles allowed to define/edit the HR-controlled KPI fields (BSC, Objective, KPI, KPI Type, UOM, Direction, SRF, Weight). */
export const KPI_ADMIN_ROLES: Role[] = ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"];
export function canEditKpiDefinition(role?: Role): boolean {
  return !!role && KPI_ADMIN_ROLES.includes(role);
}

/** KPI fields owned by HR — an employee must never persist these. */
export const HR_KPI_FIELDS: (keyof Kpi)[] = [
  "name", "objectiveId", "kpiType", "uom", "direction", "srf", "weight", "bscPerspective", "perspective", "pmType",
];
/** KPI fields an employee owns (achievement entry). */
export const EMPLOYEE_KPI_FIELDS: (keyof Kpi)[] = [
  "benchmark", "target", "actual", "evidenceLink", "dataSource", "kpiCharter", "kpiDriver",
];

export const NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ALL },
    ],
  },
  {
    title: "Performance",
    items: [
      { label: "My KPI", href: "/my-kpi", icon: "Target", roles: ALL },
      { label: "KPI Requests", href: "/kpi-requests", icon: "ClipboardCheck", roles: HEADS, badgeKey: "kpiPending" },
      { label: "Performance Summary", href: "/performance", icon: "LineChart", roles: ALL },
      { label: "Leaderboard", href: "/leaderboard", icon: "Trophy", roles: HEADS },
    ],
  },
  {
    title: "My Workspace",
    items: [
      { label: "Attendance", href: "/attendance", icon: "CalendarCheck", roles: ALL },
      {
        label: "Leave & Movement", icon: "PlaneTakeoff", roles: ALL,
        children: [
          { label: "Leave", href: "/leave" },
          { label: "Movement", href: "/movement" },
        ],
      },
      { label: "Loans & Advance", href: "/loans", icon: "HandCoins", roles: ALL },
      { label: "Expense", href: "/expenses", icon: "Receipt", roles: ALL },
      { label: "Documents", href: "/documents", icon: "FolderOpen", roles: ALL },
      { label: "Payslip", href: "/payslips", icon: "Wallet", roles: ALL },
      { label: "Requests", href: "/requests", icon: "LifeBuoy", roles: ALL },
      { label: "Grievance", href: "/grievances", icon: "MessageSquareWarning", roles: ALL },
      { label: "Profile", href: "/profile", icon: "User", roles: ALL },
    ],
  },
  {
    title: "Approvals",
    items: [
      { label: "Approval Center", href: "/approvals", icon: "Inbox", roles: HEADS },
    ],
  },
  {
    title: "Human Resource",
    items: [
      { label: "Employees", href: "/employees", icon: "Users", roles: ADMIN },
      { label: "Recruitment", href: "/recruitment", icon: "UserPlus", roles: HEADS },
      { label: "Training", href: "/training", icon: "GraduationCap", roles: ALL },
      { label: "Confirmation", href: "/confirmation", icon: "BadgeCheck", roles: HEADS },
      { label: "Transfer & Promotion", href: "/transfers", icon: "ArrowLeftRight", roles: HEADS },
      { label: "Separation", href: "/separation", icon: "DoorOpen", roles: HEADS },
      { label: "Rewards & Discipline", href: "/rewards", icon: "Award", roles: HEADS },
    ],
  },
  {
    title: "Workplace",
    items: [
      { label: "Helpdesk", href: "/helpdesk", icon: "Headphones", roles: ALL },
      { label: "Tasks", href: "/tasks", icon: "ListChecks", roles: ALL },
      { label: "Assets", href: "/assets", icon: "Boxes", roles: HEADS },
      { label: "Cafeteria", href: "/cafeteria", icon: "UtensilsCrossed", roles: ALL },
      { label: "GRC", href: "/grc", icon: "ShieldCheck", roles: HEADS },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: "BarChart3", roles: HEADS },
      { label: "Announcements", href: "/announcements", icon: "Megaphone", roles: ALL },
      { label: "Policy & Documents", href: "/policies", icon: "BookText", roles: ALL },
      { label: "Contact Book", href: "/contact-book", icon: "Contact", roles: ALL },
      { label: "Templates", href: "/templates", icon: "FileText", roles: ALL },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Organisation", href: "/admin/organisation", icon: "Building2", roles: ADMIN },
      { label: "Employees & Roles", href: "/admin/employees", icon: "UserCog", roles: ADMIN },
      { label: "KPI Configuration", href: "/admin/kpi-config", icon: "SlidersHorizontal", roles: KPI_ADMIN_ROLES },
      { label: "Grade Bands", href: "/admin/grades", icon: "Layers", roles: ADMIN },
      { label: "Approval Pipelines", href: "/admin/pipelines", icon: "GitBranch", roles: ADMIN },
      { label: "Announcements", href: "/admin/announcements", icon: "Megaphone", roles: ADMIN },
      { label: "Documents", href: "/admin/documents", icon: "FileStack", roles: ADMIN },
      { label: "Audit Trail", href: "/admin/audit", icon: "ScrollText", roles: ADMIN },
      { label: "Version Control", href: "/admin/versions", icon: "History", roles: ADMIN },
    ],
  },
];

export function visibleNav(role?: Role): NavGroup[] {
  if (!role) return [];
  return NAV.map((g) => ({
    ...g,
    items: g.items
      .filter((it) => !it.roles || it.roles.includes(role))
      .map((it) => ({ ...it, children: it.children }))
      .filter(Boolean),
  })).filter((g) => g.items.length > 0);
}

export const ROLE_LABEL: Record<Role, string> = {
  EMPLOYEE: "Employee",
  DEPT_HEAD: "Department Head",
  HR_ADMIN: "HR Admin",
  FINANCE_ADMIN: "Finance Admin",
  AUDIT_ADMIN: "Audit Admin",
  SYS_ADMIN: "System Admin",
  SUPER_ADMIN: "Super Admin",
};

export const ROLE_HOME: Record<Role, string> = {
  EMPLOYEE: "/my-kpi",
  DEPT_HEAD: "/dashboard",
  HR_ADMIN: "/dashboard",
  FINANCE_ADMIN: "/dashboard",
  AUDIT_ADMIN: "/dashboard",
  SYS_ADMIN: "/dashboard",
  SUPER_ADMIN: "/dashboard",
};
