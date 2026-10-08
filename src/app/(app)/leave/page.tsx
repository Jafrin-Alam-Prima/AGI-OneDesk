"use client";

import { useMemo, useState } from "react";
import { Plus, CalendarPlus } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Tabs, RequestStatusBadge, StatCard } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DataTable, type Column } from "@/components/ui/data-table";
import { daysBetween, formatDate, todayISO } from "@/lib/utils";
import type { LeaveApplication } from "@/lib/types";

export default function LeavePage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const leaveTypes = useStore((s) => s.leaveTypes);
  const balances = useStore((s) => s.leaveBalances);
  const apps = useStore((s) => s.leaveApplications);
  const applyLeave = useStore((s) => s.applyLeave);
  const decideLeave = useStore((s) => s.decideLeave);
  const { push } = useToast();

  const [tab, setTab] = useState("MY");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: leaveTypes[0]?.id ?? "", fromDate: todayISO(), toDate: todayISO(), location: "", reason: "" });

  if (!me) return null;
  const isHead = me.role === "DEPT_HEAD" || me.role === "SUPER_ADMIN";
  const deptUserIds = new Set(users.filter((u) => u.departmentId === me.departmentId).map((u) => u.id));

  const myApps = apps.filter((a) => a.userId === me.id);
  const myBalances = balances.filter((b) => b.userId === me.id);
  const teamApps = useMemo(() => apps.filter((a) => deptUserIds.has(a.userId) && a.status === "PENDING"), [apps]);
  const decidableApps = useMemo(() => apps.filter((a) => deptUserIds.has(a.userId)), [apps]);

  const days = daysBetween(form.fromDate, form.toDate);
  const bal = myBalances.find((b) => b.leaveTypeId === form.leaveTypeId);

  function submit() {
    if (!form.reason.trim()) { push("error", "Please provide a reason."); return; }
    applyLeave({ userId: me!.id, leaveTypeId: form.leaveTypeId, fromDate: form.fromDate, toDate: form.toDate, days, reason: form.reason, location: form.location, approverId: me!.managerId });
    push("success", "Leave application submitted for approval.");
    setOpen(false);
  }

  const columns: Column<LeaveApplication>[] = [
    { key: "leaveTypeId", header: "Leave Type", render: (a) => leaveTypes.find((t) => t.id === a.leaveTypeId)?.name ?? "—" },
    ...(tab === "TEAM" ? [{ key: "userId", header: "Employee", render: (a: LeaveApplication) => nameOf(users, a.userId) }] : []),
    { key: "fromDate", header: "From", render: (a) => formatDate(a.fromDate) },
    { key: "toDate", header: "To", render: (a) => formatDate(a.toDate) },
    { key: "days", header: "Days", align: "right", render: (a) => <span className="num">{a.days}</span> },
    { key: "reason", header: "Reason", render: (a) => <span className="text-xs text-ink-500">{a.reason}</span> },
    { key: "status", header: "Status", render: (a) => <RequestStatusBadge status={a.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Leave" subtitle="Apply for leave, track balances and approvals." action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Apply Leave</button>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {myBalances.slice(0, 4).map((b) => {
          const lt = leaveTypes.find((t) => t.id === b.leaveTypeId);
          return <StatCard key={b.id} label={lt?.name ?? "Leave"} value={Math.max(0, b.entitled - b.taken)} hint={`of ${b.entitled} days · ${b.taken} taken`} />;
        })}
      </div>

      {isHead ? <div className="mb-4"><Tabs tabs={[{ id: "MY", label: "My Applications", count: myApps.length }, { id: "TEAM", label: "Department", count: decidableApps.length }]} active={tab} onChange={setTab} /></div> : null}

      <DataTable
        columns={columns}
        rows={tab === "TEAM" ? decidableApps : myApps}
        searchKeys={["reason"]}
        searchPlaceholder="Search leave requests…"
        emptyTitle="No leave applications"
        emptyMessage="Apply for leave to see it here."
        pageSize={8}
      />

      {tab === "TEAM" && teamApps.length ? (
        <Card className="mt-4">
          <CardHeader title="Pending department approvals" subtitle={`${teamApps.length} awaiting your decision`} />
          <ul className="divide-y divide-ink-100">
            {teamApps.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink-800">{nameOf(users, a.userId)} — {days} day(s)</p>
                  <p className="text-xs text-ink-500">{formatDate(a.fromDate)} → {formatDate(a.toDate)} · {a.reason}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary btn-sm" onClick={() => { decideLeave(a.id, "APPROVED", "Approved"); push("success", "Leave approved."); }}>Approve</button>
                  <button className="btn-secondary btn-sm" onClick={() => { decideLeave(a.id, "REJECTED", "Rejected by supervisor"); push("success", "Leave rejected."); }}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title="Apply for leave" subtitle={`${days} day(s) requested`}
        footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!form.leaveTypeId || !form.reason.trim()} onClick={submit}><CalendarPlus className="h-4 w-4" /> Apply</button></>}>
        <Field label="Leave Type" required>
          <Select value={form.leaveTypeId} onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}>
            {leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name} (balance {Math.max(0, (myBalances.find((b) => b.leaveTypeId === t.id)?.entitled ?? 0) - (myBalances.find((b) => b.leaveTypeId === t.id)?.taken ?? 0))})</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="From Date" required><TextInput type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} /></Field>
          <Field label="To Date" required><TextInput type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} /></Field>
        </div>
        {bal && days > Math.max(0, bal.entitled - bal.taken) ? <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">Requested {days} day(s) exceeds your available balance of {Math.max(0, bal.entitled - bal.taken)}.</p> : null}
        <Field label="Location"><TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Optional — where you will be during leave" /></Field>
        <Field label="Reason" required><TextArea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
