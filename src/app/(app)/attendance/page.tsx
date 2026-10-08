"use client";

import { useMemo, useState } from "react";
import { LogIn, LogOut, Plus, Download, Lock, Unlock, Trash2, Pencil, CalendarDays, Cpu } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, StatCard, Badge, RequestStatusBadge, Tabs } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DataTable, type Column } from "@/components/ui/data-table";
import { cn, formatDate, monthName, todayISO, num, download, toCSV } from "@/lib/utils";
import type { AttendanceRecord, Shift } from "@/lib/types";

const STATUS_TONE: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  LATE: "bg-amber-100 text-amber-700",
  ABSENT: "bg-red-100 text-red-700",
  LEAVE: "bg-violet-100 text-violet-700",
  MOVEMENT: "bg-sky-100 text-sky-700",
  OFFDAY: "bg-ink-100 text-ink-500",
  HOLIDAY: "bg-blue-100 text-blue-700",
  HALF_DAY: "bg-orange-100 text-orange-700",
};
const ALL_STATUSES = Object.keys(STATUS_TONE);
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function currentChip(rec?: AttendanceRecord): { label: string; tone: string } {
  if (!rec || !rec.inTime) {
    if (rec?.status === "LEAVE") return { label: "On leave", tone: STATUS_TONE.LEAVE };
    if (rec?.status === "ABSENT") return { label: "Absent", tone: STATUS_TONE.ABSENT };
    if (rec?.status === "HOLIDAY") return { label: "Holiday", tone: STATUS_TONE.HOLIDAY };
    if (rec?.status === "OFFDAY") return { label: "Off day", tone: STATUS_TONE.OFFDAY };
    return { label: "Not punched", tone: "bg-ink-100 text-ink-500" };
  }
  const modeLabel = rec.mode === "REMOTE" ? "Remote" : rec.mode === "FIELD" ? "Field" : "In office";
  return { label: rec.outTime ? `${modeLabel} · out` : modeLabel, tone: rec.outTime ? "bg-ink-100 text-ink-600" : "bg-emerald-100 text-emerald-700" };
}

const isTeamRole = (r: string) => ["DEPT_HEAD", "HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(r);
const isSetupRole = (r: string) => ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(r);

export default function AttendancePage() {
  const me = useCurrentUser();
  const [tab, setTab] = useState("MY");
  if (!me) return null;

  const tabs = [
    { id: "MY", label: "My Attendance" },
    ...(isTeamRole(me.role) ? [{ id: "TEAM", label: "Team" }, { id: "REGISTER", label: "Register" }] : []),
    ...(isSetupRole(me.role) ? [{ id: "SETUP", label: "Setup" }] : []),
  ];

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Clock in/out, timesheet, team presence, register and shift setup." />
      <div className="mb-4"><Tabs tabs={tabs} active={tab} onChange={setTab} /></div>
      {tab === "MY" ? <MyAttendance /> : null}
      {tab === "TEAM" ? <TeamTab /> : null}
      {tab === "REGISTER" ? <RegisterTab /> : null}
      {tab === "SETUP" ? <SetupTab /> : null}
    </div>
  );
}

/* ============================ My Attendance ============================ */

function MyAttendance() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const attendance = useStore((s) => s.attendance);
  const shifts = useStore((s) => s.shifts);
  const holidays = useStore((s) => s.holidays);
  const regularizations = useStore((s) => s.regularizations);
  const overtimeRequests = useStore((s) => s.overtimeRequests);
  const attendanceLocks = useStore((s) => s.attendanceLocks);
  const clockPunch = useStore((s) => s.clockPunch);
  const requestReg = useStore((s) => s.requestRegularization);
  const requestOvertime = useStore((s) => s.requestOvertime);
  const { push } = useToast();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [mode, setMode] = useState<"OFFICE" | "REMOTE" | "FIELD">("OFFICE");
  const [regOpen, setRegOpen] = useState(false);
  const [otOpen, setOtOpen] = useState(false);
  const [reg, setReg] = useState({ date: todayISO(), reason: "" });
  const [ot, setOt] = useState({ date: todayISO(), hours: "", reason: "" });

  if (!me) return null;
  const mkey = `2026-${String(month).padStart(2, "0")}`;
  const monthRecords = attendance.filter((a) => a.userId === me.id && a.date.startsWith(mkey)).sort((a, b) => a.date.localeCompare(b.date));
  const today = attendance.find((a) => a.userId === me.id && a.date === todayISO());
  const shift = shifts.find((s) => s.id === today?.shiftId) ?? shifts[0];
  const myRegs = regularizations.filter((r) => r.userId === me.id);
  const myOt = overtimeRequests.filter((o) => o.userId === me.id);
  const monthOtHours = myOt.filter((o) => o.status === "APPROVED" && o.date.startsWith(mkey)).reduce((s, o) => s + o.hours, 0);
  const locked = attendanceLocks.includes(mkey);

  const c = (st: string) => monthRecords.filter((a) => a.status === st).length;
  const halfDays = c("HALF_DAY");
  const monthHolidays = holidays.filter((h) => h.date.startsWith(mkey));

  const timesheet: Column<AttendanceRecord>[] = [
    { key: "date", header: "Date", render: (a) => <span className="num">{formatDate(a.date)}</span> },
    { key: "inTime", header: "In", render: (a) => <span className="num">{a.inTime ?? "—"}{a.lateMinutes ? <span className="ml-1 text-[10px] text-amber-600">+{a.lateMinutes}m</span> : null}</span> },
    { key: "outTime", header: "Out", render: (a) => <span className="num">{a.outTime ?? "—"}</span> },
    { key: "workedHours", header: "Worked", align: "right", render: (a) => <span className="num">{a.workedHours != null ? `${num(a.workedHours, 1)}h` : "—"}</span> },
    { key: "status", header: "Status", render: (a) => <span className={cn("chip", STATUS_TONE[a.status])}>{a.status.replace("_", " ")}</span> },
    { key: "remark", header: "Remark", render: (a) => <span className="text-xs text-ink-500">{a.remark ?? "—"}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-pad">
          <p className="text-xs uppercase tracking-wide text-ink-500">Today · {formatDate(todayISO())}</p>
          <p className="mt-1 text-sm font-semibold text-ink-900">
            {shift ? `${shift.name} Shift · ${shift.start}–${shift.end} · grace ${shift.graceMin}m` : "General Shift"}
          </p>
          <p className="mt-1 text-sm text-ink-600">
            {today?.inTime ? `Checked in ${today.inTime}${today.lateMinutes ? ` (Late by ${today.lateMinutes}m)` : ""}` : "Not checked in"}
            {today?.outTime ? ` · out ${today.outTime}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select className="max-w-[130px]" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} aria-label="Punch mode">
              <option value="OFFICE">Office</option>
              <option value="REMOTE">Remote</option>
              <option value="FIELD">Field</option>
            </Select>
            <button className="btn-primary btn-sm" onClick={() => { clockPunch(me.id, "IN", mode); push("success", `Clocked in (${mode.toLowerCase()}).`); }}><LogIn className="h-3.5 w-3.5" /> Clock In</button>
            <button className="btn-secondary btn-sm" onClick={() => { clockPunch(me.id, "OUT", mode); push("success", `Clocked out (${mode.toLowerCase()}).`); }}><LogOut className="h-3.5 w-3.5" /> Clock Out</button>
          </div>
        </Card>
        <StatCard label="Present" value={c("PRESENT")} tone="green" />
        <StatCard label="Late" value={c("LATE")} tone="amber" />
        <StatCard label="Absent" value={c("ABSENT")} tone="red" />
      </div>

      <Card className="card-pad">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Attendance summary · {monthName(month)} 2026</p>
          {[
            ["Present", c("PRESENT")], ["Late", c("LATE")], ["Absent", c("ABSENT")], ["Leave", c("LEAVE")],
            ["Half-day", halfDays], ["Movement", c("MOVEMENT")], ["Overtime", `${num(monthOtHours, 0)}h`],
          ].map(([label, val]) => (
            <span key={String(label)} className="text-sm text-ink-600">{label}: <span className="num font-semibold text-ink-900">{val}</span></span>
          ))}
          <span className="ml-auto flex gap-2">
            <button className="btn-secondary btn-sm" onClick={() => setRegOpen(true)}><Plus className="h-3.5 w-3.5" /> Regularization</button>
            <button className="btn-secondary btn-sm" onClick={() => setOtOpen(true)}><Plus className="h-3.5 w-3.5" /> Request Overtime</button>
          </span>
        </div>
      </Card>

      <Card>
        <CardHeader title="Attendance calendar" subtitle={`${monthName(month)} 2026`}
          action={<Select className="max-w-[150px]" value={month} onChange={(e) => setMonth(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m)}</option>)}</Select>} />
        <div className="grid grid-cols-2 gap-2 p-5 sm:grid-cols-4 lg:grid-cols-7">
          {monthRecords.map((a) => (
            <div key={a.id} className={cn("rounded-lg border border-ink-100 p-3", STATUS_TONE[a.status])}>
              <p className="text-xs font-semibold">{new Date(a.date).getDate()} · {DOW[new Date(a.date).getDay()]}</p>
              <p className="mt-1 text-[11px] font-medium">{a.status.replace("_", " ")}</p>
              {a.inTime ? <p className="num text-[10px] opacity-70">{a.inTime}–{a.outTime ?? "…"}</p> : null}
            </div>
          ))}
          {!monthRecords.length ? <p className="col-span-full text-center text-sm text-ink-500">No attendance records for this month.</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 px-5 py-3 text-[11px]">
          <span className="text-ink-400">Legend:</span>
          {ALL_STATUSES.map((s) => <span key={s} className={cn("chip", STATUS_TONE[s])}>{s.replace("_", " ")}</span>)}
        </div>
      </Card>

      <Card>
        <CardHeader title="Monthly timesheet" subtitle={`${monthRecords.length} day(s) · ${monthHolidays.length} holiday(s)`} />
        <DataTable columns={timesheet} rows={monthRecords} emptyTitle="No timesheet entries for this month" />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="My regularization requests" subtitle={`${myRegs.length} request(s)`} />
          <div className="divide-y divide-ink-100">
            {myRegs.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div><p className="text-sm text-ink-800">{formatDate(r.date)}</p><p className="text-xs text-ink-500">{r.reason}</p></div>
                <RequestStatusBadge status={r.status} />
              </div>
            ))}
            {!myRegs.length ? <p className="px-5 py-4 text-sm text-ink-500">No regularization requests.</p> : null}
          </div>
        </Card>
        <Card>
          <CardHeader title="My overtime requests" subtitle={`${myOt.length} request(s)`} />
          <div className="divide-y divide-ink-100">
            {myOt.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div><p className="text-sm text-ink-800">{formatDate(o.date)} · <span className="num">{o.hours}h</span></p><p className="text-xs text-ink-500">{o.reason}</p></div>
                <RequestStatusBadge status={o.status} />
              </div>
            ))}
            {!myOt.length ? <p className="px-5 py-4 text-sm text-ink-500">No overtime requests.</p> : null}
          </div>
        </Card>
      </div>

      <Modal open={regOpen} onClose={() => setRegOpen(false)} title="Request attendance regularization"
        footer={<><button className="btn-secondary" onClick={() => setRegOpen(false)}>Cancel</button><button className="btn-primary" disabled={!reg.reason.trim()} onClick={() => { requestReg({ userId: me.id, date: reg.date, reason: reg.reason, approverId: me.managerId }); push("success", "Regularization request submitted."); setRegOpen(false); setReg({ date: todayISO(), reason: "" }); }}>Submit</button></>}>
        <Field label="Date" required><TextInput type="date" value={reg.date} onChange={(e) => setReg({ ...reg, date: e.target.value })} /></Field>
        <Field label="Reason" required><TextArea rows={3} value={reg.reason} onChange={(e) => setReg({ ...reg, reason: e.target.value })} placeholder="e.g. Forgot to punch out — was on client visit." /></Field>
      </Modal>

      <Modal open={otOpen} onClose={() => setOtOpen(false)} title="Request overtime"
        footer={<><button className="btn-secondary" onClick={() => setOtOpen(false)}>Cancel</button><button className="btn-primary" disabled={!ot.hours || !ot.reason.trim()} onClick={() => { requestOvertime({ userId: me.id, date: ot.date, hours: Number(ot.hours) || 0, reason: ot.reason, approverId: me.managerId }); push("success", "Overtime request submitted."); setOtOpen(false); setOt({ date: todayISO(), hours: "", reason: "" }); }}>Submit</button></>}>
        <Field label="Date" required><TextInput type="date" value={ot.date} onChange={(e) => setOt({ ...ot, date: e.target.value })} /></Field>
        <Field label="Hours" required><TextInput type="number" value={ot.hours} onChange={(e) => setOt({ ...ot, hours: e.target.value })} placeholder="e.g. 2" /></Field>
        <Field label="Reason" required><TextArea rows={3} value={ot.reason} onChange={(e) => setOt({ ...ot, reason: e.target.value })} placeholder="e.g. Month-end reconciliation." /></Field>
      </Modal>

      {locked ? <p className="text-xs text-ink-400">Note: {monthName(month)} 2026 is a closed period (register locked).</p> : null}
      <p className="text-xs text-ink-300">Employee: {nameOf(users, me.id)}</p>
    </div>
  );
}

/* ============================ Team ============================ */

function TeamTab() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const attendance = useStore((s) => s.attendance);
  const regularizations = useStore((s) => s.regularizations);
  const overtimeRequests = useStore((s) => s.overtimeRequests);
  const decideReg = useStore((s) => s.decideRegularization);
  const decideOvertime = useStore((s) => s.decideOvertime);
  const { push } = useToast();

  if (!me) return null;
  const deptUsers = users.filter((u) => u.departmentId === me.departmentId && u.role !== "SUPER_ADMIN");
  const deptIds = new Set(deptUsers.map((u) => u.id));
  const today = todayISO();
  const todayRecs = new Map(attendance.filter((a) => a.date === today && deptIds.has(a.userId)).map((a) => [a.userId, a]));

  const exceptions = deptUsers.flatMap((u) => {
    const r = todayRecs.get(u.id);
    if (!r) return [{ u, type: "Missed punch", detail: "No punch today" }];
    if (r.status === "LATE") return [{ u, type: "Late", detail: `Late by ${r.lateMinutes ?? 0}m · in ${r.inTime}` }];
    if (r.status === "ABSENT") return [{ u, type: "Absent", detail: "Marked absent" }];
    if (r.inTime && !r.outTime) return [{ u, type: "Missed punch", detail: `In ${r.inTime}, no out-punch` }];
    return [];
  });

  const pendingRegs = regularizations.filter((r) => deptIds.has(r.userId) && r.status === "PENDING");
  const pendingOt = overtimeRequests.filter((o) => deptIds.has(o.userId) && o.status === "PENDING");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Who's in now" subtitle={`${deptUsers.length} in your department · ${formatDate(today)}`} />
        <div className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {deptUsers.map((u) => {
            const chip = currentChip(todayRecs.get(u.id));
            return (
              <div key={u.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">{u.fullName}</p>
                  <p className="truncate text-xs text-ink-500">{u.designation}</p>
                </div>
                <span className={cn("chip shrink-0", chip.tone)}>{chip.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Today's exceptions" subtitle={`${exceptions.length} to review`} />
        <div className="divide-y divide-ink-100">
          {exceptions.map(({ u, type, detail }) => (
            <div key={u.id + type} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <div><p className="text-sm text-ink-800">{u.fullName}</p><p className="text-xs text-ink-500">{detail}</p></div>
              <Badge tone={type === "Absent" ? "red" : type === "Late" ? "amber" : "neutral"}>{type}</Badge>
            </div>
          ))}
          {!exceptions.length ? <p className="px-5 py-4 text-sm text-ink-500">No exceptions today — the team is in order.</p> : null}
        </div>
      </Card>

      <Card>
        <CardHeader title="Pending regularization approvals" subtitle={`${pendingRegs.length} awaiting your decision`} />
        <ul className="divide-y divide-ink-100">
          {pendingRegs.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div><p className="text-sm text-ink-800">{nameOf(users, r.userId)} — {formatDate(r.date)}</p><p className="text-xs text-ink-500">{r.reason}</p></div>
              <div className="flex gap-2">
                <button className="btn-primary btn-sm" onClick={() => { decideReg(r.id, "APPROVED", "Approved"); push("success", "Regularization approved."); }}>Approve</button>
                <button className="btn-secondary btn-sm" onClick={() => { decideReg(r.id, "REJECTED", "Rejected"); push("success", "Regularization rejected."); }}>Reject</button>
              </div>
            </li>
          ))}
          {!pendingRegs.length ? <li className="px-5 py-4 text-sm text-ink-500">No pending regularizations.</li> : null}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Pending overtime approvals" subtitle={`${pendingOt.length} awaiting your decision`} />
        <ul className="divide-y divide-ink-100">
          {pendingOt.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div><p className="text-sm text-ink-800">{nameOf(users, o.userId)} — {formatDate(o.date)} · <span className="num">{o.hours}h</span></p><p className="text-xs text-ink-500">{o.reason}</p></div>
              <div className="flex gap-2">
                <button className="btn-primary btn-sm" onClick={() => { decideOvertime(o.id, "APPROVED", "Approved"); push("success", "Overtime approved."); }}>Approve</button>
                <button className="btn-secondary btn-sm" onClick={() => { decideOvertime(o.id, "REJECTED", "Rejected"); push("success", "Overtime rejected."); }}>Reject</button>
              </div>
            </li>
          ))}
          {!pendingOt.length ? <li className="px-5 py-4 text-sm text-ink-500">No pending overtime requests.</li> : null}
        </ul>
      </Card>
    </div>
  );
}

/* ============================ Register ============================ */

function RegisterTab() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const departments = useStore((s) => s.departments);
  const attendance = useStore((s) => s.attendance);
  const attendanceLocks = useStore((s) => s.attendanceLocks);
  const toggleLock = useStore((s) => s.toggleAttendanceLock);
  const { push } = useToast();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [dept, setDept] = useState("ALL");
  const [emp, setEmp] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  if (!me) return null;
  const isDeptHead = me.role === "DEPT_HEAD";
  const mkey = `2026-${String(month).padStart(2, "0")}`;
  const deptUsers = users.filter((u) => u.role !== "SUPER_ADMIN" && (isDeptHead ? u.departmentId === me.departmentId : dept === "ALL" || u.departmentId === dept));
  const deptIds = new Set(deptUsers.map((u) => u.id));

  const rows = useMemo(() => attendance
    .filter((a) => a.date.startsWith(mkey) && deptIds.has(a.userId) && (status === "ALL" || a.status === status) && (emp === "ALL" || a.userId === emp))
    .sort((a, b) => a.date.localeCompare(b.date) || a.userId.localeCompare(b.userId)),
    [attendance, mkey, status, emp, deptIds]);

  const locked = attendanceLocks.includes(mkey);

  const columns: Column<AttendanceRecord>[] = [
    { key: "userId", header: "Employee", render: (a) => <span className="font-medium text-ink-800">{nameOf(users, a.userId)}</span>, value: (a) => nameOf(users, a.userId) },
    { key: "date", header: "Date", render: (a) => <span className="num">{formatDate(a.date)}</span> },
    { key: "inTime", header: "In", render: (a) => <span className="num">{a.inTime ?? "—"}</span> },
    { key: "outTime", header: "Out", render: (a) => <span className="num">{a.outTime ?? "—"}</span> },
    { key: "workedHours", header: "Worked", align: "right", render: (a) => <span className="num">{a.workedHours != null ? `${num(a.workedHours, 1)}h` : "—"}</span> },
    { key: "status", header: "Status", render: (a) => <span className={cn("chip", STATUS_TONE[a.status])}>{a.status.replace("_", " ")}</span> },
  ];

  function exportCsv() {
    download(`attendance-register-${mkey}.csv`, toCSV(rows.map((a) => ({
      Employee: nameOf(users, a.userId), Date: a.date, In: a.inTime ?? "", Out: a.outTime ?? "",
      Worked: a.workedHours ?? "", Status: a.status, Remark: a.remark ?? "",
    }))), "text/csv");
    push("success", `Exported ${rows.length} register rows.`);
  }

  return (
    <div className="space-y-4">
      <Card className="card-pad">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40"><label className="label">Department</label><Select value={dept} disabled={isDeptHead} onChange={(e) => { setDept(e.target.value); setEmp("ALL"); }}><option value="ALL">All</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>
          <div className="w-48"><label className="label">Employee</label><Select value={emp} onChange={(e) => setEmp(e.target.value)}><option value="ALL">All</option>{deptUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}</Select></div>
          <div className="w-36"><label className="label">Month</label><Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m)}</option>)}</Select></div>
          <div className="w-36"><label className="label">Status</label><Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="ALL">All</option>{ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</Select></div>
          <div className="ml-auto flex items-center gap-2">
            {locked ? <Badge tone="red"><Lock className="mr-1 h-3 w-3" /> Closed</Badge> : <Badge tone="green">Open</Badge>}
            <button className={locked ? "btn-secondary" : "btn-primary"} onClick={() => { toggleLock(mkey); push("success", locked ? `${monthName(month)} reopened.` : `${monthName(month)} closed.`); }}>
              {locked ? <><Unlock className="h-4 w-4" /> Reopen period</> : <><Lock className="h-4 w-4" /> Close period</>}
            </button>
            <button className="btn-secondary" onClick={exportCsv} disabled={!rows.length}><Download className="h-4 w-4" /> Export CSV</button>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader title={`Register · ${monthName(month)} 2026`} subtitle={`${rows.length} row(s) · ${locked ? "period closed" : "period open"}`} />
        <DataTable columns={columns} rows={rows} searchKeys={["userId"]} searchPlaceholder="Search employee…" emptyTitle="No attendance rows for these filters" />
      </Card>
    </div>
  );
}

/* ============================ Setup ============================ */

function SetupTab() {
  const shifts = useStore((s) => s.shifts);
  const holidays = useStore((s) => s.holidays);
  const createShift = useStore((s) => s.createShift);
  const updateShift = useStore((s) => s.updateShift);
  const deleteShift = useStore((s) => s.deleteShift);
  const addHoliday = useStore((s) => s.addHoliday);
  const removeHoliday = useStore((s) => s.removeHoliday);
  const { push } = useToast();

  const blankShift = { name: "", start: "09:00", end: "18:00", graceMin: 15, halfDayAfterMin: 240, weekOffDays: [5] as number[] };
  const [shiftOpen, setShiftOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sh, setSh] = useState<Shift | typeof blankShift>(blankShift);
  const [holOpen, setHolOpen] = useState(false);
  const [hol, setHol] = useState({ date: "2026-10-25", name: "" });

  function openNew() { setEditId(null); setSh(blankShift); setShiftOpen(true); }
  function openEdit(s: Shift) { setEditId(s.id); setSh(s); setShiftOpen(true); }
  function saveShift() {
    const payload = { name: sh.name, start: sh.start, end: sh.end, graceMin: Number(sh.graceMin), halfDayAfterMin: Number(sh.halfDayAfterMin), weekOffDays: sh.weekOffDays };
    if (editId) { updateShift(editId, payload); push("success", "Shift updated."); }
    else { createShift(payload); push("success", "Shift added."); }
    setShiftOpen(false);
  }
  const toggleDow = (d: number) => setSh((s) => ({ ...s, weekOffDays: s.weekOffDays.includes(d) ? s.weekOffDays.filter((x) => x !== d) : [...s.weekOffDays, d].sort() }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Shift management" subtitle={`${shifts.length} shift(s)`} action={<button className="btn-primary btn-sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Add Shift</button>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-ink-50/60"><tr><th className="th">Shift</th><th className="th">Start</th><th className="th">End</th><th className="th text-right">Grace</th><th className="th text-right">Half-day after</th><th className="th">Week-offs</th><th className="th text-right">Actions</th></tr></thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id} className="border-b border-ink-50 last:border-0">
                  <td className="td font-medium text-ink-800">{s.name}</td>
                  <td className="td num">{s.start}</td>
                  <td className="td num">{s.end}</td>
                  <td className="td num text-right">{s.graceMin}m</td>
                  <td className="td num text-right">{s.halfDayAfterMin}m</td>
                  <td className="td text-xs text-ink-500">{s.weekOffDays.map((d) => DOW[d]).join(", ") || "—"}</td>
                  <td className="td">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Edit" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></button>
                      <button className="rounded p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600" title="Delete" onClick={() => { deleteShift(s.id); push("success", "Shift deleted."); }}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!shifts.length ? <tr><td colSpan={7} className="td text-center text-ink-500">No shifts configured.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Holiday calendar" subtitle={`${holidays.length} holiday(s) in 2026`} action={<button className="btn-primary btn-sm" onClick={() => setHolOpen(true)}><Plus className="h-3.5 w-3.5" /> Add Holiday</button>} />
        <div className="divide-y divide-ink-100">
          {holidays.map((h) => (
            <div key={h.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-ink-400" /><span className="num text-sm text-ink-700">{formatDate(h.date)}</span><span className="text-sm font-medium text-ink-800">{h.name}</span></div>
              <button className="rounded p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600" title="Remove" onClick={() => { removeHoliday(h.id); push("success", "Holiday removed."); }}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {!holidays.length ? <p className="px-5 py-4 text-sm text-ink-500">No holidays added.</p> : null}
        </div>
      </Card>

      <Card className="card-pad">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Cpu className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-semibold text-ink-800">Biometric device AC-1</p>
            <p className="text-xs text-ink-500">Status: <span className="text-emerald-600">Online</span> · Last sync 2 min ago · 38 enrolled</p>
          </div>
        </div>
      </Card>

      <Modal open={shiftOpen} onClose={() => setShiftOpen(false)} title={editId ? "Edit shift" : "Add shift"}
        footer={<><button className="btn-secondary" onClick={() => setShiftOpen(false)}>Cancel</button><button className="btn-primary" disabled={!sh.name} onClick={saveShift}>{editId ? "Save" : "Add"}</button></>}>
        <Field label="Shift name" required><TextInput value={sh.name} onChange={(e) => setSh({ ...sh, name: e.target.value })} placeholder="e.g. General" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start" required><TextInput type="time" value={sh.start} onChange={(e) => setSh({ ...sh, start: e.target.value })} /></Field>
          <Field label="End" required><TextInput type="time" value={sh.end} onChange={(e) => setSh({ ...sh, end: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Grace (minutes)"><TextInput type="number" value={sh.graceMin} onChange={(e) => setSh({ ...sh, graceMin: Number(e.target.value) })} /></Field>
          <Field label="Half-day after (minutes)"><TextInput type="number" value={sh.halfDayAfterMin} onChange={(e) => setSh({ ...sh, halfDayAfterMin: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Week-off days">
          <div className="flex flex-wrap gap-2">
            {DOW.map((d, i) => (
              <label key={d} className={cn("cursor-pointer rounded-lg border px-3 py-1.5 text-sm", sh.weekOffDays.includes(i) ? "border-brand-300 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600")}>
                <input type="checkbox" className="hidden" checked={sh.weekOffDays.includes(i)} onChange={() => toggleDow(i)} />{d}
              </label>
            ))}
          </div>
        </Field>
      </Modal>

      <Modal open={holOpen} onClose={() => setHolOpen(false)} title="Add holiday"
        footer={<><button className="btn-secondary" onClick={() => setHolOpen(false)}>Cancel</button><button className="btn-primary" disabled={!hol.name || !hol.date} onClick={() => { addHoliday(hol); push("success", "Holiday added."); setHolOpen(false); setHol({ date: "2026-10-25", name: "" }); }}>Add</button></>}>
        <Field label="Date" required><TextInput type="date" value={hol.date} onChange={(e) => setHol({ ...hol, date: e.target.value })} /></Field>
        <Field label="Name" required><TextInput value={hol.name} onChange={(e) => setHol({ ...hol, name: e.target.value })} placeholder="e.g. Victory Day" /></Field>
      </Modal>
    </div>
  );
}
