"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useStore } from "@/lib/store";
import { deptName, nameOf } from "@/lib/selectors";
import { PageHeader, Tabs, Card, CardHeader } from "@/components/ui/primitives";
import { achievement, calculatedScore } from "@/lib/calc";
import { bdt, download, formatDate, monthName, num, toCSV } from "@/lib/utils";

export default function ReportsPage() {
  const users = useStore((s) => s.users);
  const departments = useStore((s) => s.departments);
  const kpis = useStore((s) => s.kpis);
  const attendance = useStore((s) => s.attendance);
  const leaves = useStore((s) => s.leaveApplications);
  const leaveTypes = useStore((s) => s.leaveTypes);
  const loans = useStore((s) => s.loans);
  const payslips = useStore((s) => s.payslips);
  const [tab, setTab] = useState("EMPLOYEE");

  const employeeRows = useMemo(() => users.map((u) => ({
    Employee: u.fullName, ID: u.employeeId, Designation: u.designation, Department: deptName({ departments }, u.departmentId), Status: u.status, Joined: formatDate(u.joiningDate),
  })), [users, departments]);

  const attendanceRows = useMemo(() => {
    const byUser: Record<string, { present: number; absent: number; late: number; leave: number }> = {};
    for (const a of attendance) {
      byUser[a.userId] = byUser[a.userId] || { present: 0, absent: 0, late: 0, leave: 0 };
      if (a.status === "PRESENT") byUser[a.userId].present++;
      else if (a.status === "ABSENT") byUser[a.userId].absent++;
      else if (a.status === "LATE") byUser[a.userId].late++;
      else if (a.status === "LEAVE") byUser[a.userId].leave++;
    }
    return Object.entries(byUser).map(([uid, c]) => ({ Employee: nameOf(users, uid), Department: deptName({ departments }, users.find((u) => u.id === uid)?.departmentId), Present: c.present, Absent: c.absent, Late: c.late, Leave: c.leave }));
  }, [attendance, users, departments]);

  const kpiRows = useMemo(() => kpis.filter((k) => !k.deleted).map((k) => ({
    Code: k.code, KPI: k.name, Owner: nameOf(users, k.ownerId), Department: deptName({ departments }, users.find((u) => u.id === k.ownerId)?.departmentId),
    Period: `${monthName(k.periodMonth)} ${k.periodYear}`, Weight: k.weight, Target: k.target, Actual: k.actual,
    Achievement: num(achievement(k.target, k.actual), 2), Score: num(calculatedScore(k.target, k.actual), 2), Status: k.status, Stage: k.stage,
  })), [kpis, users, departments]);

  const leaveRows = leaves.map((l) => ({ Employee: nameOf(users, l.userId), Type: leaveTypes.find((t) => t.id === l.leaveTypeId)?.name, From: formatDate(l.fromDate), To: formatDate(l.toDate), Days: l.days, Status: l.status }));
  const loanRows = loans.map((l) => ({ Employee: nameOf(users, l.userId), Type: l.loanType, Amount: l.amount, Instalments: l.installments, Status: l.status }));
  const payrollRows = payslips.slice(0, 40).map((p) => ({ Employee: nameOf(users, p.userId), Period: `${monthName(p.periodMonth)} ${p.periodYear}`, Gross: p.basics.reduce((s, b) => s + b.amount, 0), Net: p.net }));

  const REPORTS = [
    { id: "EMPLOYEE", label: "Employee Master", rows: employeeRows },
    { id: "ATTENDANCE", label: "Attendance", rows: attendanceRows },
    { id: "KPI", label: "KPI Performance", rows: kpiRows },
    { id: "LEAVE", label: "Leave", rows: leaveRows },
    { id: "LOAN", label: "Loan", rows: loanRows },
    { id: "PAYROLL", label: "Payroll", rows: payrollRows },
  ];
  const active = REPORTS.find((r) => r.id === tab) ?? REPORTS[0];
  const headers = active.rows.length ? Object.keys(active.rows[0]) : [];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Filterable, exportable reports across employees, attendance, performance, payroll and more."
        action={<button className="btn-secondary" onClick={() => download(`${active.label}.csv`, toCSV(active.rows as Record<string, unknown>[], headers))} disabled={!active.rows.length}><Download className="h-4 w-4" /> Export CSV</button>} />

      <div className="mb-4"><Tabs tabs={REPORTS.map((r) => ({ id: r.id, label: r.label, count: r.rows.length }))} active={tab} onChange={setTab} /></div>

      <Card>
        <CardHeader title={active.label} subtitle={`${active.rows.length} rows`} />
        <div className="max-h-[62vh] overflow-auto">
          <table className="w-full min-w-[720px]">
            <thead className="sticky top-0 bg-ink-50/95"><tr>{headers.map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {(active.rows as Record<string, unknown>[]).map((row, i) => (
                <tr key={i} className="border-b border-ink-50 last:border-0">
                  {headers.map((h) => {
                    const v = row[h];
                    const right = typeof v === "number";
                    return <td key={h} className={`td ${right ? "num text-right" : ""}`}>{typeof v === "number" && h.toLowerCase().includes("amount") ? bdt(v) : String(v ?? "—")}</td>;
                  })}
                </tr>
              ))}
              {!active.rows.length ? <tr><td colSpan={Math.max(1, headers.length)} className="td text-center text-ink-500">No data for this report.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
