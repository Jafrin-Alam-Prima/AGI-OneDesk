import type {
  AppState, AttendanceRecord, AuditLog, BusinessUnit, Department, Grade, Kpi,
  KpiVersion, LeaveApplication, LeaveBalance, Notification, Objective, Kra,
  ReviewDecision, User, VariableIncomeRecord, PayslipRecord,
} from "./types";
import { colorFor } from "./utils";

const NOW = "2026-10-06T09:00:00.000Z";

/* ---------------- Business units ---------------- */
const buDefs: [string, string][] = [
  ["Anwar Cement Limited", "ACL"],
  ["Anwar Cement Sheet Limited", "ACSL"],
  ["Anwar Ispat Limited", "AIL"],
  ["Anwar Galvanizing Limited", "AGL"],
  ["A-One Polymer Limited", "AOPL"],
  ["Anwar Textile", "AT"],
  ["Anwar Landmark", "AL"],
  ["Anwar Jute Spinning Mills Limited", "AJSM"],
  ["Anwar Technologies", "ATECH"],
  ["Anwar Organic", "AO"],
];
export const businessUnits: BusinessUnit[] = buDefs.map(([name, code], i) => ({
  id: `bu${i + 1}`, name, code,
}));

/* ---------------- Departments ---------------- */
const deptDefs: [string, string, string][] = [
  ["Growth Analytics", "GA", "bu1"],
  ["Human Resources", "HR", "bu1"],
  ["Marketing", "MKT", "bu1"],
  ["Sales & Distribution", "SND", "bu1"],
  ["Finance & Accounts", "FIN", "bu1"],
  ["Supply Chain", "SCM", "bu1"],
  ["Operations", "OPS", "bu1"],
  ["Information Technology", "IT", "bu1"],
  ["Production", "PRD", "bu1"],
];
export const departments: Department[] = deptDefs.map(([name, code, bu], i) => ({
  id: `dept${i + 1}`, name, code, businessUnitId: bu,
}));

const designations = [
  "Intern", "Officer", "Senior Officer", "Executive", "Senior Executive",
  "Assistant Manager", "Manager", "Senior Manager", "Head of Department",
  "Chief Operating Officer",
].map((name, i) => ({ id: `desig${i + 1}`, name }));

/* ---------------- Grades (variable income bands) ----------------
   Bands chosen so the reference score 0.8894 maps to B+ (VK sample). */
export const grades: Grade[] = [
  { id: "g1", name: "A+", label: "Outstanding", min: 0.95, max: 1.0001 },
  { id: "g2", name: "A", label: "Excellent", min: 0.9, max: 0.9499 },
  { id: "g3", name: "B+", label: "Very Good", min: 0.85, max: 0.8999 },
  { id: "g4", name: "B", label: "Good", min: 0.8, max: 0.8499 },
  { id: "g5", name: "C+", label: "Satisfactory", min: 0.7, max: 0.7999 },
  { id: "g6", name: "C", label: "Needs Improvement", min: 0.6, max: 0.6999 },
  { id: "g7", name: "D", label: "Unsatisfactory", min: 0, max: 0.5999 },
];

/* ---------------- Users ---------------- */
type U = [string, string, string, User["role"], string, string, string];
const userDefs: U[] = [
  ["Sarwar Hossain", "superadmin@anwargroup.net", "AG-0001", "SUPER_ADMIN", "Chief Operating Officer", "dept1", "dept1"],
  ["Tanjila Hoque", "sysadmin@anwargroup.net", "AG-0002", "SYS_ADMIN", "Manager", "dept8", "dept8"],
  ["Shamima Nasrin", "hradmin@anwargroup.net", "AG-0004", "HR_ADMIN", "Manager", "dept2", "dept2"],
  ["Mahbub Alam", "financeadmin@anwargroup.net", "AG-0003", "FINANCE_ADMIN", "Senior Manager", "dept5", "dept5"],
  ["Kazi Ashraf", "auditadmin@anwargroup.net", "AG-0005", "AUDIT_ADMIN", "Senior Manager", "dept5", "dept5"],
  ["Nasrin Islam", "nasrin.islam@anwargroup.net", "AG-0101", "DEPT_HEAD", "Head of Department", "dept1", "dept1"],
  ["Kamal Hasan", "kamal.hasan@anwargroup.net", "AG-0102", "DEPT_HEAD", "Senior Manager", "dept1", "dept1"],
  ["Farhana Rahman", "farhana.rahman@anwargroup.net", "AG-0201", "DEPT_HEAD", "Head of Department", "dept2", "dept2"],
  ["Imran Chowdhury", "imran.chowdhury@anwargroup.net", "AG-0301", "DEPT_HEAD", "Head of Department", "dept3", "dept3"],
  ["Rezaul Karim", "rezaul.karim@anwargroup.net", "AG-0401", "DEPT_HEAD", "Head of Department", "dept5", "dept5"],
  ["Salma Begum", "salma.begum@anwargroup.net", "AG-0501", "DEPT_HEAD", "Head of Department", "dept4", "dept4"],
  ["Jafrin Alam Prima", "jafrin.alam@anwargroup.net", "AG-1042", "EMPLOYEE", "Sales Executive", "dept1", "dept1"],
  ["Sadia Noor", "sadia.noor@anwargroup.net", "AG-1057", "EMPLOYEE", "Assistant Manager", "dept1", "dept1"],
  ["Shuvo Rahman", "shuvo.rahman@anwargroup.net", "AG-1063", "EMPLOYEE", "Senior Executive", "dept1", "dept1"],
  ["Mahin Chowdhury", "mahin.chowdhury@anwargroup.net", "AG-1078", "EMPLOYEE", "Executive", "dept1", "dept1"],
  ["Anika Tabassum", "anika.tabassum@anwargroup.net", "AG-1081", "EMPLOYEE", "Senior Officer", "dept1", "dept1"],
  ["Fahim Shahriar", "fahim.shahriar@anwargroup.net", "AG-1084", "EMPLOYEE", "Officer", "dept1", "dept1"],
  ["Lamia Haque", "lamia.haque@anwargroup.net", "AG-1089", "EMPLOYEE", "Senior Executive", "dept1", "dept1"],
  ["Rakibul Islam", "rakibul.islam@anwargroup.net", "AG-1093", "EMPLOYEE", "Executive", "dept1", "dept1"],
  ["Tania Karim", "tania.karim@anwargroup.net", "AG-2011", "EMPLOYEE", "Senior Officer", "dept2", "dept2"],
  ["Nusrat Jahan", "nusrat.jahan@anwargroup.net", "AG-2019", "EMPLOYEE", "Officer", "dept2", "dept2"],
  ["Arif Hossain", "arif.hossain@anwargroup.net", "AG-2024", "EMPLOYEE", "Executive", "dept2", "dept2"],
  ["Mizanur Rahman", "mizanur.rahman@anwargroup.net", "AG-2036", "EMPLOYEE", "Assistant Manager", "dept2", "dept2"],
  ["Mehedi Hasan", "mehedi.hasan@anwargroup.net", "AG-3005", "EMPLOYEE", "Executive", "dept3", "dept3"],
  ["Sumaiya Akter", "sumaiya.akter@anwargroup.net", "AG-3012", "EMPLOYEE", "Senior Officer", "dept3", "dept3"],
  ["Tahmid Rahman", "tahmid.rahman@anwargroup.net", "AG-3018", "EMPLOYEE", "Officer", "dept3", "dept3"],
  ["Jannatul Ferdous", "jannatul.ferdous@anwargroup.net", "AG-4001", "EMPLOYEE", "Officer", "dept6", "dept6"],
  ["Tanvir Alam", "tanvir.alam@anwargroup.net", "AG-5003", "EMPLOYEE", "Executive", "dept5", "dept5"],
  ["Rasel Mia", "rasel.mia@anwargroup.net", "AG-2047", "EMPLOYEE", "Officer", "dept2", "dept2"],
  ["Farzana Yasmin", "farzana.yasmin@anwargroup.net", "AG-2042", "EMPLOYEE", "Senior Officer", "dept2", "dept2"],
  ["Ishrat Jahan", "ishtat.jahan@anwargroup.net", "AG-3023", "EMPLOYEE", "Senior Officer", "dept3", "dept3"],
  ["Nafis Iqbal", "nafis.iqbal@anwargroup.net", "AG-3029", "EMPLOYEE", "Executive", "dept3", "dept3"],
  ["Sharmin Sultana", "sharmin.sultana@anwargroup.net", "AG-3034", "EMPLOYEE", "Officer", "dept3", "dept3"],
  ["Ashraful Kabir", "ashraful.kabir@anwargroup.net", "AG-1115", "EMPLOYEE", "Assistant Manager", "dept1", "dept1"],
  ["Rumana Akter", "rumana.akter@anwargroup.net", "AG-1121", "EMPLOYEE", "Senior Executive", "dept4", "dept4"],
  ["Zubair Mahmud", "zubair.mahmud@anwargroup.net", "AG-1128", "EMPLOYEE", "Executive", "dept4", "dept4"],
  ["Nabila Sultana", "nabila.sultana@anwargroup.net", "AG-1107", "EMPLOYEE", "Officer", "dept4", "dept4"],
  ["Sabbir Hossain", "sabbir.hossain@anwargroup.net", "AG-1102", "EMPLOYEE", "Senior Executive", "dept4", "dept4"],
];

export const users: User[] = userDefs.map(([fullName, email, employeeId, role, designation, dept, _x], i) => ({
  id: `u${i + 1}`,
  fullName,
  email,
  employeeId,
  role,
  designation,
  departmentId: dept,
  businessUnitId: "bu1",
  managerId: undefined,
  corporatePhone: `+8801${(700000000 + i * 111111).toString().slice(0, 9)}`,
  personalEmail: email.replace("@anwargroup.net", "@gmail.com"),
  bloodGroup: ["A+", "B+", "O+", "AB+"][i % 4],
  maritalStatus: i % 3 === 0 ? "Married" : "Single",
  joiningDate: `20${16 + (i % 8)}-0${(i % 9) + 1}-1${i % 9}`,
  status: "ACTIVE",
  avatarColor: colorFor(email),
}));

// assign managers: dept heads manage their department employees
const deptHead: Record<string, string> = {
  dept1: "u6", dept2: "u8", dept3: "u9", dept4: "u11", dept5: "u10",
};
for (const u of users) {
  if (u.role === "EMPLOYEE" && deptHead[u.departmentId]) u.managerId = deptHead[u.departmentId];
}

/* ---------------- Objectives & KRAs ---------------- */
export const objectives: Objective[] = [
  { id: "obj1", name: "Financial Growth", perspective: "Financial" },
  { id: "obj2", name: "Customer Excellence", perspective: "Customer" },
  { id: "obj3", name: "Operational Excellence", perspective: "Internal Process" },
  { id: "obj4", name: "People & Culture", perspective: "Learning & Growth" },
  { id: "obj5", name: "Reduce external research/consulting cost by executing suitable research, analytics and intelligence work in-house.", perspective: "Financial" },
];

export const kras: Kra[] = [
  { id: "kra1", objectiveId: "obj1", name: "Sales Achievement" },
  { id: "kra2", objectiveId: "obj1", name: "Revenue & Profitability" },
  { id: "kra3", objectiveId: "obj2", name: "Customer Retention" },
  { id: "kra4", objectiveId: "obj2", name: "Market Expansion" },
  { id: "kra5", objectiveId: "obj3", name: "Process Efficiency" },
  { id: "kra6", objectiveId: "obj3", name: "Quality & Compliance" },
  { id: "kra7", objectiveId: "obj4", name: "Employee Engagement" },
  { id: "kra8", objectiveId: "obj4", name: "Capability Building" },
  { id: "kra9", objectiveId: "obj5", name: "In-House Cost Saving" },
];

/* ---------------- KPIs ---------------- */
let kcode = 0;
function mkKpi(p: Partial<Kpi> & { ownerId: string; approverId: string; name: string }): Kpi {
  kcode += 1;
  const target = p.target ?? 100;
  const actual = p.actual ?? 0;
  return {
    id: p.id ?? `kpi${kcode}`,
    code: `KPI-2026-${String(kcode).padStart(4, "0")}`,
    ownerId: p.ownerId,
    approverId: p.approverId,
    objectiveId: p.objectiveId ?? "obj1",
    kraId: p.kraId ?? "kra1",
    name: p.name,
    category: p.category ?? "PROJECT",
    perspective: p.perspective ?? "Financial",
    uom: p.uom ?? "BDT",
    direction: p.direction ?? "HIGHER_BETTER",
    srf: p.srf,
    pmType: p.pmType ?? "BSC",
    bscPerspective: p.bscPerspective ?? p.perspective ?? "Financial",
    evidenceLink: p.evidenceLink,
    dataSource: p.dataSource,
    kpiCharter: p.kpiCharter,
    kpiDriver: p.kpiDriver,
    showOnDashboard: p.showOnDashboard ?? true,
    kpiType: p.kpiType ?? "NON_VARIABLE",
    weight: p.weight ?? 20,
    benchmark: p.benchmark,
    target,
    actual,
    remarks: p.remarks ?? "",
    periodYear: p.periodYear ?? 2026,
    periodMonth: p.periodMonth ?? 10,
    status: p.status ?? "SUBMITTED",
    stage: p.stage ?? "DEPT",
    createdAt: p.createdAt ?? NOW,
    updatedAt: p.updatedAt ?? NOW,
    createdBy: p.ownerId,
    hrNote: p.hrNote,
    deleted: p.deleted,
    deleteReason: p.deleteReason,
  };
}

function salesKpis(owner: string, approver: string, month: number, base: number): Kpi[] {
  return [
    mkKpi({ ownerId: owner, approverId: approver, name: "Sales Target vs Achievement (AOPL)", kraId: "kra1", objectiveId: "obj1", perspective: "Financial", uom: "MT", weight: 40, target: base, actual: Math.round(base * 0.9), remarks: "Regional demand softened in the last week.", periodMonth: month, kpiType: "VARIABLE", srf: "Monthly" }),
    mkKpi({ ownerId: owner, approverId: approver, name: "New Dealer Acquisition", kraId: "kra4", objectiveId: "obj2", perspective: "Customer", uom: "Count", weight: 25, target: 12, actual: 13, remarks: "Added 1 dealer above plan in Rajshahi region.", periodMonth: month }),
    mkKpi({ ownerId: owner, approverId: approver, name: "Business Development Initiatives", kraId: "kra2", objectiveId: "obj1", perspective: "Financial", uom: "%", weight: 20, target: 100, actual: 88, remarks: "Forecasting and territory plans completed.", periodMonth: month }),
    mkKpi({ ownerId: owner, approverId: approver, name: "Collection Efficiency", kraId: "kra5", objectiveId: "obj3", perspective: "Internal Process", uom: "%", weight: 15, target: 95, actual: 97, remarks: "Improved due to follow-up cadence.", periodMonth: month }),
  ];
}

const kpis: Kpi[] = [
  // Reference employee Jafrin Alam Prima (u12): history across months
  ...salesKpis("u12", "u6", 8, 900).map((k, i) => i === 0 ? { ...k, status: "COMPLETED" as const } : { ...k, status: "APPROVED" as const }),
  ...salesKpis("u12", "u6", 9, 950).map((k, i) => i === 3 ? { ...k, status: "REJECTED" as const } : { ...k, status: "APPROVED" as const }),
  // October: mix of statuses
  ...salesKpis("u12", "u6", 10, 1000),
];
kpis[8].status = "DRAFT";
kpis[9].status = "RETURNED";
kpis[9].remarks = "Evidence unclear — please re-upload the dealer onboarding sheet.";
kpis[10].status = "SUBMITTED";
kpis[11].status = "APPROVED";

// Other department employees — some submitted (for queues/leaderboards)
const others: [string, string, string, number, number, number][] = [
  ["u13", "u6", "Sales Target vs Achievement", 40, 800, 760],
  ["u14", "u6", "Sales Target vs Achievement", 40, 800, 820],
  ["u15", "u6", "Sales Target vs Achievement", 40, 800, 690],
  ["u16", "u6", "New Dealer Acquisition", 30, 10, 11],
  ["u17", "u6", "Collection Efficiency", 30, 95, 92],
  ["u18", "u6", "Customer Satisfaction Score", 25, 90, 88],
  ["u20", "u8", "Talent Acquisition TAT", 35, 30, 26],
  ["u21", "u8", "Employee Engagement Score", 30, 85, 80],
  ["u22", "u8", "Training Completion", 35, 100, 94],
  ["u23", "u8", "Payroll Accuracy", 40, 100, 99],
  ["u24", "u9", "Campaign ROI", 35, 120, 130],
  ["u25", "u9", "Brand Reach", 30, 100, 105],
  ["u26", "u9", "Lead Conversion", 35, 25, 22],
  ["u27", "u10", "Procurement Cost Saving", 40, 100, 96],
  ["u28", "u10", "Vendor On-time Delivery", 30, 95, 97],
  ["u29", "u8", "Recruitment TAT", 40, 30, 33],
  ["u30", "u8", "HR Service SLA", 30, 95, 91],
  ["u31", "u9", "Digital Engagement", 50, 100, 112],
  ["u32", "u9", "Content Calendar Adherence", 50, 100, 85],
  ["u33", "u6", "Territory Coverage", 50, 100, 78],
  ["u34", "u11", "Order Fulfilment", 50, 100, 101],
  ["u35", "u11", "Dispatch Accuracy", 50, 100, 99],
  ["u36", "u11", "Dealer Satisfaction", 50, 100, 90],
  ["u37", "u11", "Route Efficiency", 50, 100, 88],
];
for (const [owner, approver, name, weight, target, actual] of others) {
  kpis.push(mkKpi({
    ownerId: owner, approverId: approver, name,
    weight, target, actual,
    status: ["SUBMITTED", "SUBMITTED", "APPROVED", "APPROVED", "ADJUSTED"][kpis.length % 5] as Kpi["status"],
    periodMonth: 10,
  }));
}

/* ---------------- HR-defined KPIs for the employee demo (assigned to reference employee Jafrin) ---------------- */
kpis.push(mkKpi({
  id: "kpi-housavings", ownerId: "u12", approverId: "u6",
  name: "BDT Lac In-House Cost Saving", objectiveId: "obj5", kraId: "kra9",
  perspective: "Financial", bscPerspective: "Financial",
  uom: "BDT Lac", direction: "HIGHER_BETTER", srf: "Monthly", weight: 10,
  kpiType: "VARIABLE", pmType: "BSC",
  benchmark: 12, target: 20, actual: 14,
  evidenceLink: "https://anwargroup.sharepoint.com/sites/kpi/inhouse-cost-saving-oct.xlsx",
  dataSource: "Finance ERP — Cost Centre report",
  kpiCharter: "Cost Optimisation", kpiDriver: "In-house capability",
  remarks: "Consulting spend brought in-house this month.",
  status: "APPROVED", periodMonth: 10, periodYear: 2026,
}));
kpis.push(mkKpi({
  id: "kpi-research", ownerId: "u12", approverId: "u6",
  name: "In-House Research Deliverables", objectiveId: "obj5", kraId: "kra9",
  perspective: "Financial", bscPerspective: "Financial",
  uom: "Count", direction: "HIGHER_BETTER", srf: "Monthly", weight: 5,
  kpiType: "NON_VARIABLE", pmType: "BSC",
  benchmark: 4, target: 6, actual: 5,
  dataSource: "Research team weekly tracker",
  kpiCharter: "Capability Building", kpiDriver: "Research throughput",
  status: "APPROVED", periodMonth: 10, periodYear: 2026,
}));

/* ---------------- Evidence / versions / decisions (reference KPIs) ---------------- */
import type { EvidenceFile } from "./types";
const evidence: EvidenceFile[] = [];
const kpiVersions: KpiVersion[] = [];
const decisions: ReviewDecision[] = [];

let evc = 0, vc = 0, dc = 0;
for (const k of kpis) {
  if (k.status === "DRAFT") continue;
  evc += 1;
  evidence.push({
    id: `ev${evc}`, kpiId: k.id, name: `${k.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-evidence.pdf`,
    size: 120000 + evc * 137, type: "application/pdf",
    sha256: "a3f5" + evc.toString(16).padStart(4, "0") + "9c2e7b1d4f60a8c3e5b9d2f7041a6c8e" + (evc * 7).toString(16).padStart(2, "0") + "be14d2f3a9c6",
    uploadedBy: k.ownerId, uploadedAt: k.createdAt,
  });
  vc += 1;
  kpiVersions.push({
    id: `ver${vc}`, kpiId: k.id, versionNo: 1,
    changedFields: ["status"], oldValues: { status: "DRAFT" }, newValues: { status: "SUBMITTED" },
    reason: "Submitted for review", changedBy: k.ownerId, changedAt: k.createdAt,
  });
  if (["APPROVED", "ADJUSTED", "COMPLETED", "REJECTED"].includes(k.status)) {
    dc += 1;
    decisions.push({
      id: `dec${dc}`, kpiId: k.id, stage: "DEPT",
      decision: k.status === "REJECTED" ? "REJECT" : k.status === "ADJUSTED" ? "ADJUST" : k.status === "COMPLETED" ? "COMPLETE" : "APPROVE",
      reason: k.status === "REJECTED" ? "Target not met and no mitigation plan attached." : undefined,
      actorId: k.approverId, at: k.updatedAt,
    });
    vc += 1;
    kpiVersions.push({
      id: `ver${vc}`, kpiId: k.id, versionNo: 2,
      changedFields: ["status"], oldValues: { status: "SUBMITTED" }, newValues: { status: k.status },
      reason: k.status === "REJECTED" ? "Rejected" : "Approved", changedBy: k.approverId, changedAt: k.updatedAt,
    });
  }
}
// one adjustment example
const adjTarget = kpis.find((k) => k.status === "ADJUSTED");
if (adjTarget) {
  vc += 1;
  kpiVersions.push({
    id: `ver${vc}`, kpiId: adjTarget.id, versionNo: 3,
    changedFields: ["weight", "score"], oldValues: { weight: adjTarget.weight, actual: adjTarget.actual },
    newValues: { weight: adjTarget.weight, actual: adjTarget.actual },
    reason: "Weight rebalanced to reflect role focus.", changedBy: adjTarget.approverId, changedAt: NOW,
  });
  dc += 1;
  decisions.push({ id: `dec${dc}`, kpiId: adjTarget.id, stage: "DEPT", decision: "ADJUST", reason: "Weight rebalanced to reflect role focus.", actorId: adjTarget.approverId, at: NOW });
}

/* ---------------- Variable income ---------------- */
const variableIncome: VariableIncomeRecord[] = [
  {
    id: "vi1", employeeId: "u12", periodYear: 2026, periodMonth: 8,
    rows: [
      { id: "vir1", recordId: "vi1", kra: "Financial Perspective (Sales Achievement AOPL)", actionPlan: "Sales Target vs Achievement (AOPL) - Lion", weight: 0.4, target: 49.16, achievement: 44.42 },
      { id: "vir2", recordId: "vi1", kra: "Business Development", actionPlan: "Forecasting, dealer & retail target setup, market development plan", weight: 0.6, target: 100, achievement: 88 },
    ],
    signatures: { lm: true, coo: false, hod: true, hodHr: false },
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "vi2", employeeId: "u13", periodYear: 2026, periodMonth: 8,
    rows: [
      { id: "vir3", recordId: "vi2", kra: "Financial Perspective", actionPlan: "Sales Target vs Achievement", weight: 0.5, target: 60, achievement: 58 },
      { id: "vir4", recordId: "vi2", kra: "Business Development", actionPlan: "Market expansion", weight: 0.5, target: 100, achievement: 100 },
    ],
    signatures: { lm: true, coo: false, hod: false, hodHr: false },
    createdAt: NOW, updatedAt: NOW,
  },
];

/* ---------------- Attendance & leave ---------------- */
const attendance: AttendanceRecord[] = [];
const shift = "General 09:00-18:00";
for (let day = 1; day <= 5; day++) {
  for (const u of users.filter((x) => x.role === "EMPLOYEE" || x.role === "DEPT_HEAD")) {
    const dow = new Date(2026, 9, day).getDay();
    if (dow === 5 || dow === 6) {
      attendance.push({ id: `att_${u.id}_${day}`, userId: u.id, date: `2026-10-${String(day).padStart(2, "0")}`, status: dow === 5 ? "OFFDAY" : "HOLIDAY", shift });
      continue;
    }
    const r = (u.id.length * day) % 10;
    const status: AttendanceRecord["status"] = r === 0 ? "ABSENT" : r === 1 ? "LATE" : r === 2 ? "LEAVE" : "PRESENT";
    attendance.push({
      id: `att_${u.id}_${day}`, userId: u.id, date: `2026-10-${String(day).padStart(2, "0")}`,
      inTime: status === "PRESENT" || status === "LATE" ? (status === "LATE" ? "09:41" : "08:57") : undefined,
      outTime: status === "PRESENT" || status === "LATE" ? "18:05" : undefined,
      status, shift,
    });
  }
}

const leaveTypes = [
  { id: "lt1", name: "Casual Leave", yearlyQuota: 10 },
  { id: "lt2", name: "Sick Leave", yearlyQuota: 14 },
  { id: "lt3", name: "Earned Leave", yearlyQuota: 18 },
  { id: "lt4", name: "Compensatory Leave", yearlyQuota: 5 },
  { id: "lt5", name: "Maternity Leave", yearlyQuota: 180 },
];

const leaveBalances: LeaveBalance[] = [];
for (const u of users) {
  for (const lt of leaveTypes) {
    leaveBalances.push({
      id: `lb_${u.id}_${lt.id}`, userId: u.id, leaveTypeId: lt.id,
      entitled: lt.yearlyQuota, taken: (u.id.length + lt.yearlyQuota) % 5,
    });
  }
}

let lac = 0;
const leaveApplications: LeaveApplication[] = [];
const moveApps: AppState["movementApplications"] = [];
for (const u of users.filter((x) => x.role === "EMPLOYEE").slice(0, 12)) {
  lac += 1;
  leaveApplications.push({
    id: `la${lac}`, userId: u.id, leaveTypeId: "lt1",
    fromDate: "2026-10-12", toDate: "2026-10-13", days: 2,
    reason: "Family commitment.", status: lac % 4 === 0 ? "PENDING" : "APPROVED",
    approverId: deptHead[u.departmentId], createdAt: NOW,
  });
  moveApps.push({
    id: `mv${lac}`, userId: u.id, date: "2026-10-08", location: "Dhaka Regional Office",
    purpose: "Dealer visit and market survey.", status: lac % 3 === 0 ? "PENDING" : "APPROVED",
    approverId: deptHead[u.departmentId], createdAt: NOW,
  });
}

const regularizations = [{
  id: "reg1", userId: "u12", date: "2026-10-04", reason: "Forgot to punch out — was on client visit.",
  status: "PENDING" as const, approverId: "u6", createdAt: NOW,
}];

/* ---------------- Loans / IOU / expenses ---------------- */
const loans = [
  { id: "ln1", userId: "u12", loanType: "Festival Loan", amount: 50000, installments: 10, reason: "Festival support.", status: "APPROVED" as const, approverId: "u6", createdAt: NOW },
  { id: "ln2", userId: "u14", loanType: "Salary Advance", amount: 20000, installments: 4, reason: "Emergency medical.", status: "PENDING" as const, approverId: "u6", createdAt: NOW },
];
const ious = [
  { id: "io1", userId: "u12", amount: 8000, purpose: "Client entertainment advance", status: "APPROVED" as const, approverId: "u6", createdAt: NOW },
  { id: "io2", userId: "u13", amount: 12000, purpose: "Travel advance", status: "PENDING" as const, approverId: "u6", createdAt: NOW },
];
const expenses = [
  { id: "ex1", userId: "u12", expenseType: "Travel", amount: 4500, date: "2026-10-03", description: "Taxi and hotel for dealer visit.", status: "APPROVED" as const, approverId: "u6", createdAt: NOW },
  { id: "ex2", userId: "u13", expenseType: "Mobile Bill", amount: 1200, date: "2026-10-02", description: "Monthly corporate mobile bill.", status: "PENDING" as const, approverId: "u6", createdAt: NOW },
  { id: "ex3", userId: "u14", expenseType: "Client Meal", amount: 3200, date: "2026-10-01", description: "Client dinner meeting.", status: "PENDING" as const, approverId: "u6", createdAt: NOW },
];

/* ---------------- Service / grievances ---------------- */
const serviceRequests = [
  { id: "sr1", userId: "u12", requestType: "Salary Certificate", subject: "Salary certificate for bank", description: "Need salary certificate for a home loan application.", priority: "MEDIUM" as const, status: "IN_PROGRESS" as const, assigneeId: "u3", createdAt: NOW },
  { id: "sr2", userId: "u20", requestType: "ID Card", subject: "Replacement ID card", description: "Lost my ID card; need a replacement.", priority: "LOW" as const, status: "OPEN" as const, createdAt: NOW },
];
const grievances = [
  { id: "gr1", userId: "u22", category: "Workplace", description: "Seating arrangement in the HR wing needs review.", status: "IN_REVIEW" as const, createdAt: NOW },
];

/* ---------------- Comms / docs ---------------- */
const announcements = [
  { id: "an1", title: "Variable Income KPI cycle for August is open", body: "All employees are requested to submit their monthly variable KPI scorecards by 28 October 2026.", audience: "All Employees", publishedAt: NOW, authorId: "u3" },
  { id: "an2", title: "Annual Performance Review 2026", body: "The annual performance review cycle will begin on 1 November 2026. Department Heads should prepare their teams.", audience: "All Employees", publishedAt: NOW, authorId: "u1" },
  { id: "an3", title: "Office closed on 20-21 October", body: "Anwar Group offices will remain closed for the announced holidays.", audience: "All Employees", publishedAt: NOW, authorId: "u3" },
];
const policies = [
  { id: "po1", title: "Leave Policy 2026", category: "POLICY" as const, body: "Casual, sick and earned leave entitlements and accrual rules.", version: "2.0", publishedAt: NOW },
  { id: "po2", title: "Variable Income KPI Guidelines", category: "PROCEDURE" as const, body: "How monthly variable KPI targets, weights and grades are set.", version: "1.3", publishedAt: NOW },
  { id: "po3", title: "Travel & Expense Reimbursement SOP", category: "SOP" as const, body: "Claim submission, approval and reimbursement timelines.", version: "1.1", publishedAt: NOW },
];

/* ---------------- Recruitment ---------------- */
const candidates = [
  { id: "cd1", name: "Asif Mahmud", position: "Sales Executive", departmentId: "dept1", stage: "INTERVIEW" as const, skills: "FMCG sales, negotiation", salaryExpectation: 45000, appliedAt: NOW },
  { id: "cd2", name: "Tanha Sultana", position: "Brand Executive", departmentId: "dept3", stage: "SCREENING" as const, skills: "Branding, social media", salaryExpectation: 40000, appliedAt: NOW },
  { id: "cd3", name: "Rehan Kabir", position: "HR Officer", departmentId: "dept2", stage: "OFFER" as const, skills: "Recruitment, onboarding", salaryExpectation: 38000, appliedAt: NOW },
  { id: "cd4", name: "Mitila Roy", position: "Data Analyst", departmentId: "dept1", stage: "APPLIED" as const, skills: "SQL, Power BI", salaryExpectation: 52000, appliedAt: NOW },
];

/* ---------------- Training ---------------- */
const training = [
  { id: "tr1", title: "Leadership Essentials", category: "Behavioural", trainer: "External — CCL", startDate: "2026-10-15", endDate: "2026-10-16", seats: 20 },
  { id: "tr2", title: "Advanced Excel for HR Analytics", category: "Technical", trainer: "Internal — IT", startDate: "2026-10-22", endDate: "2026-10-23", seats: 25 },
  { id: "tr3", title: "Sales Negotiation Skills", category: "Functional", trainer: "External — MDF", startDate: "2026-11-05", endDate: "2026-11-06", seats: 15 },
];
const enrollments = [
  { id: "en1", programId: "tr1", userId: "u12", status: "ENROLLED" as const, attended: false },
  { id: "en2", programId: "tr2", userId: "u20", status: "REQUESTED" as const, attended: false },
  { id: "en3", programId: "tr3", userId: "u13", status: "COMPLETED" as const, attended: true, score: 88 },
];

/* ---------------- Separation / transfer / rewards / confirmation ---------------- */
const separations = [
  {
    id: "sep1", userId: "u23", type: "Resignation", lastWorkingDate: "2026-11-30",
    reason: "Higher studies.", status: "CLEARANCE" as const,
    clearance: [
      { department: "IT", cleared: true }, { department: "Finance", cleared: false },
      { department: "Admin", cleared: false }, { department: "HR", cleared: false },
    ],
    settlementAmount: 185000, createdAt: NOW,
  },
];
const transfers = [
  { id: "tf1", userId: "u16", type: "PROMOTION" as const, fromDepartmentId: "dept1", toDepartmentId: "dept1", effectiveDate: "2026-11-01", newDesignation: "Senior Executive", reason: "Consistently high performance.", status: "PENDING" as const, createdAt: NOW },
  { id: "tf2", userId: "u24", type: "TRANSFER" as const, fromDepartmentId: "dept3", toDepartmentId: "dept4", effectiveDate: "2026-11-15", reason: "Business need in Sales.", status: "PENDING" as const, createdAt: NOW },
];
const rewards = [
  { id: "rw1", userId: "u13", type: "REWARD" as const, title: "Top Performer Q3", description: "Highest regional sales in Q3.", date: "2026-10-01", amount: 15000, createdAt: NOW },
  { id: "rw2", userId: "u29", type: "REWARD" as const, title: "Best Team Player", description: "Outstanding support to the HR team.", date: "2026-09-20", createdAt: NOW },
  { id: "rw3", userId: "u15", type: "PUNISHMENT" as const, title: "Late attendance warning", description: "Repeated late attendance in September.", date: "2026-09-30", createdAt: NOW },
];
const confirmations = [
  { id: "cf1", userId: "u31", status: "ELIGIBLE" as const, dueDate: "2026-10-30" },
  { id: "cf2", userId: "u32", status: "SUPERVISOR_REVIEW" as const, dueDate: "2026-10-25" },
  { id: "cf3", userId: "u33", status: "HR_ACCEPTANCE" as const, dueDate: "2026-10-20" },
];

/* ---------------- Assets / tasks / tickets / meals / risks ---------------- */
const assets = [
  { id: "as1", name: 'Dell Latitude 5440 Laptop', category: "Laptop", code: "AST-LAP-0012", status: "ASSIGNED" as const, assignedTo: "u12", assignedAt: NOW },
  { id: "as2", name: "Samsung 24\" Monitor", category: "Monitor", code: "AST-MON-0031", status: "ASSIGNED" as const, assignedTo: "u13", assignedAt: NOW },
  { id: "as3", name: "iPhone 14 (Corporate)", category: "Mobile", code: "AST-MOB-0007", status: "AVAILABLE" as const },
  { id: "as4", name: "Office Chair (Ergonomic)", category: "Furniture", code: "AST-FUR-0102", status: "MAINTENANCE" as const },
];
const tasks = [
  { id: "tk1", title: "Prepare Q4 sales forecast", project: "Growth Analytics", assigneeId: "u12", priority: "HIGH" as const, status: "IN_PROGRESS" as const, dueDate: "2026-10-15", createdAt: NOW },
  { id: "tk2", title: "Update dealer onboarding pack", project: "Growth Analytics", assigneeId: "u13", priority: "MEDIUM" as const, status: "TODO" as const, dueDate: "2026-10-18", createdAt: NOW },
  { id: "tk3", title: "Publish engagement survey results", project: "HR", assigneeId: "u20", priority: "MEDIUM" as const, status: "DONE" as const, dueDate: "2026-10-05", createdAt: NOW },
];
const tickets = [
  { id: "ht1", userId: "u12", issueType: "IT Support", subject: "Laptop running slow", description: "System is very slow since the last update.", status: "OPEN" as const, createdAt: NOW },
  { id: "ht2", userId: "u20", issueType: "Facilities", subject: "AC not working", description: "AC in the HR wing is not cooling.", status: "IN_PROGRESS" as const, createdAt: NOW },
];
const meals = [
  { id: "ml1", userId: "u12", date: "2026-10-06", meal: "Lunch", quantity: 1, createdAt: NOW },
];
const risks = [
  { id: "rk1", title: "Cement price volatility", category: "Market", likelihood: 4, impact: 4, owner: "Finance", status: "OPEN" as const, createdAt: NOW },
  { id: "rk2", title: "Key-man dependency in IT", category: "Operational", likelihood: 3, impact: 5, owner: "HR", status: "MITIGATED" as const, createdAt: NOW },
];

/* ---------------- Notifications / audit / payslips / contacts ---------------- */
const notifications: Notification[] = [
  { id: "nt1", userId: "u6", title: "4 KPI requests awaiting your review", body: "Employees in Growth Analytics have submitted KPIs.", link: "/kpi-requests", read: false, at: NOW },
  { id: "nt2", userId: "u12", title: "Your KPI was returned", body: "Business Development Initiatives was returned for correction.", link: "/my-kpi", read: false, at: NOW },
  { id: "nt3", userId: "u12", title: "KPI approved", body: "Collection Efficiency was approved.", link: "/my-kpi", read: true, at: NOW },
  { id: "nt4", userId: "u1", title: "Monthly cutoff approaching", body: "The variable income KPI cutoff is 28 October.", link: "/dashboard", read: false, at: NOW },
];

const auditLogs: AuditLog[] = [
  { id: "au1", actorId: "u12", action: "KPI_SUBMITTED", entity: "Kpi", entityId: "kpi11", detail: "Submitted Business Development Initiatives", at: NOW },
  { id: "au2", actorId: "u6", action: "KPI_APPROVED", entity: "Kpi", entityId: "kpi12", detail: "Approved Collection Efficiency", at: NOW },
  { id: "au3", actorId: "u1", action: "USER_CREATED", entity: "User", entityId: "u12", detail: "Onboarded Jafrin Alam Prima", at: NOW },
];

const payslips: PayslipRecord[] = [];
for (const m of [8, 9]) {
  for (const u of users.filter((x) => ["EMPLOYEE", "DEPT_HEAD"].includes(x.role)).slice(0, 20)) {
    const basic = 30000 + (u.id.length % 5) * 5000;
    const basics = [
      { label: "Basic", amount: basic },
      { label: "House Rent", amount: Math.round(basic * 0.5) },
      { label: "Conveyance", amount: Math.round(basic * 0.1) },
      { label: "Variable Income", amount: Math.round(basic * 0.15) },
    ];
    const deductions = [
      { label: "Provident Fund", amount: Math.round(basic * 0.1) },
      { label: "Income Tax", amount: Math.round(basic * 0.05) },
    ];
    const gross = basics.reduce((s, b) => s + b.amount, 0);
    const ded = deductions.reduce((s, b) => s + b.amount, 0);
    payslips.push({ id: `ps_${u.id}_${m}`, userId: u.id, periodYear: 2026, periodMonth: m, basics, deductions, net: gross - ded });
  }
}

const contacts = users.slice(0, 20).map((u, i) => ({
  id: `ct${i + 1}`, userId: u.id, phone: u.corporatePhone ?? "", email: u.email,
}));

const pipelines = [
  {
    id: "pl1", name: "KPI Approval Pipeline", appliesTo: "KPI",
    steps: [
      { order: 1, role: "DEPT_HEAD" as const, label: "Department Head Review" },
      { order: 2, role: "HR_ADMIN" as const, label: "HR Validation" },
      { order: 3, role: "FINANCE_ADMIN" as const, label: "Finance Approval" },
      { order: 4, role: "AUDIT_ADMIN" as const, label: "Audit Completion" },
    ],
  },
  {
    id: "pl2", name: "Leave Approval Pipeline", appliesTo: "Leave",
    steps: [{ order: 1, role: "DEPT_HEAD" as const, label: "Supervisor Approval" }],
  },
  {
    id: "pl3", name: "Loan Approval Pipeline", appliesTo: "Loan",
    steps: [
      { order: 1, role: "DEPT_HEAD" as const, label: "Supervisor Approval" },
      { order: 2, role: "FINANCE_ADMIN" as const, label: "Finance Approval" },
    ],
  },
];

export function createSeedState(): AppState {
  return {
    session: { userId: "u12" }, // default signed-in user: Jafrin Alam Prima (Employee)
    businessUnits,
    departments,
    designations,
    grades,
    users,
    objectives,
    kras,
    kpis,
    evidence,
    kpiVersions,
    decisions,
    variableIncome,
    attendance,
    regularizations,
    leaveTypes,
    leaveBalances,
    leaveApplications,
    movementApplications: moveApps,
    loans,
    ious,
    expenses,
    serviceRequests,
    grievances,
    announcements,
    policies,
    candidates,
    training,
    enrollments,
    separations,
    transfers,
    rewards,
    confirmations,
    assets,
    tasks,
    tickets,
    meals,
    risks,
    auditLogs,
    notifications,
    pipelines,
    payslips,
    contacts,
    setupTokens: [],
  };
}
