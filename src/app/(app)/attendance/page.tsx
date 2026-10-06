"use client";

import { useMemo, useState } from "react";
import { LogIn, LogOut, Plus } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, StatCard, Badge, RequestStatusBadge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate, monthName, todayISO } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-amber-100 text-amber-700",
  LEAVE: "bg-violet-100 text-violet-700",
  MOVEMENT: "bg-sky-100 text-sky-700",
  OFFDAY: "bg-ink-100 text-ink-500",
  HOLIDAY: "bg-blue-100 text-blue-700",
};

export default function AttendancePage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const attendance = useStore((s) => s.attendance);
  const regularizations = useStore((s) => s.regularizations);
  const clockPunch = useStore((s) => s.clockPunch);
  const requestReg = useStore((s) => s.requestRegularization);
  const decideReg = useStore((s) => s.decideRegularization);
  const { push } = useToast();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [regOpen, setRegOpen] = useState(false);
  const [reg, setReg] = useState({ date: todayISO(), reason: "" });

  if (!me) return null;
  const isHead = me.role === "DEPT_HEAD" || me.role === "SUPER_ADMIN";

  const myAtt = useMemo(() => attendance.filter((a) => a.userId === me.id && a.date.startsWith(`2026-${String(month).padStart(2, "0")}`)).sort((a, b) => a.date.localeCompare(b.date)), [attendance, me, month]);
  const today = attendance.find((a) => a.userId === me.id && a.date === todayISO());
  const myRegs = regularizations.filter((r) => r.userId === me.id);
  const deptUserIds = new Set(users.filter((u) => u.departmentId === me.departmentId).map((u) => u.id));
  const pendingRegs = regularizations.filter((r) => deptUserIds.has(r.userId) && r.status === "PENDING");

  const present = myAtt.filter((a) => a.status === "PRESENT").length;
  const absent = myAtt.filter((a) => a.status === "ABSENT").length;
  const late = myAtt.filter((a) => a.status === "LATE").length;
  const leave = myAtt.filter((a) => a.status === "LEAVE").length;

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Clock in/out, view your calendar and request regularization."
        action={<button className="btn-secondary" onClick={() => setRegOpen(true)}><Plus className="h-4 w-4" /> Regularization</button>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-pad">
          <p className="text-xs uppercase tracking-wide text-ink-500">Today</p>
          <p className="mt-1 text-lg font-bold text-ink-900">{today?.inTime ? `Checked in ${today.inTime}` : "Not checked in"}</p>
          <div className="mt-3 flex gap-2">
            <button className="btn-primary btn-sm" onClick={() => { clockPunch(me.id, "IN"); push("success", "Clocked in."); }}><LogIn className="h-3.5 w-3.5" /> Clock In</button>
            <button className="btn-secondary btn-sm" onClick={() => { clockPunch(me.id, "OUT"); push("success", "Clocked out."); }}><LogOut className="h-3.5 w-3.5" /> Clock Out</button>
          </div>
        </Card>
        <StatCard label="Present" value={present} tone="green" />
        <StatCard label="Absent" value={absent} tone="red" />
        <StatCard label="Late / Leave" value={`${late} / ${leave}`} tone="amber" />
      </div>

      <Card>
        <CardHeader title="Attendance calendar" subtitle={`${monthName(month)} 2026`}
          action={<select className="input max-w-[150px]" value={month} onChange={(e) => setMonth(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m)}</option>)}</select>} />
        <div className="grid grid-cols-2 gap-2 p-5 sm:grid-cols-4 lg:grid-cols-7">
          {myAtt.map((a) => (
            <div key={a.id} className={cn("rounded-lg border border-ink-100 p-3", STATUS_TONE[a.status])}>
              <p className="text-xs font-semibold">{new Date(a.date).getDate()}</p>
              <p className="mt-1 text-[11px] font-medium">{a.status}</p>
              {a.inTime ? <p className="num text-[10px] opacity-70">{a.inTime}–{a.outTime ?? "…"}</p> : null}
            </div>
          ))}
          {!myAtt.length ? <p className="col-span-full text-center text-sm text-ink-500">No attendance records for this month.</p> : null}
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Regularization requests" subtitle={`${myRegs.length} request(s)`} />
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

      {isHead && pendingRegs.length ? (
        <Card className="mt-4">
          <CardHeader title="Department regularization approvals" subtitle={`${pendingRegs.length} pending`} />
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
          </ul>
        </Card>
      ) : null}

      <Modal open={regOpen} onClose={() => setRegOpen(false)} title="Request attendance regularization" footer={<><button className="btn-secondary" onClick={() => setRegOpen(false)}>Cancel</button><button className="btn-primary" disabled={!reg.reason.trim()} onClick={() => { requestReg({ userId: me.id, date: reg.date, reason: reg.reason, approverId: me.managerId }); push("success", "Regularization request submitted."); setRegOpen(false); }}>Submit</button></>}>
        <Field label="Date" required><TextInput type="date" value={reg.date} onChange={(e) => setReg({ ...reg, date: e.target.value })} /></Field>
        <Field label="Reason" required><TextArea rows={3} value={reg.reason} onChange={(e) => setReg({ ...reg, reason: e.target.value })} placeholder="e.g. Forgot to punch out — was on client visit." /></Field>
      </Modal>
    </div>
  );
}
