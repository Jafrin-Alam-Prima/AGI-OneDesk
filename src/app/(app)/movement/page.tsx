"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Tabs, RequestStatusBadge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatDate, todayISO } from "@/lib/utils";
import type { MovementApplication } from "@/lib/types";

export default function MovementPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const apps = useStore((s) => s.movementApplications);
  const applyMovement = useStore((s) => s.applyMovement);
  const decideMovement = useStore((s) => s.decideMovement);
  const { push } = useToast();

  const [tab, setTab] = useState("MY");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: todayISO(), location: "", purpose: "" });

  if (!me) return null;
  const isHead = me.role === "DEPT_HEAD" || me.role === "SUPER_ADMIN";
  const deptUserIds = new Set(users.filter((u) => u.departmentId === me.departmentId).map((u) => u.id));
  const myApps = apps.filter((a) => a.userId === me.id);
  const teamApps = useMemo(() => apps.filter((a) => deptUserIds.has(a.userId)), [apps]);
  const pending = teamApps.filter((a) => a.status === "PENDING");

  const columns: Column<MovementApplication>[] = [
    ...(tab === "TEAM" ? [{ key: "userId", header: "Employee", render: (a: MovementApplication) => nameOf(users, a.userId) }] : []),
    { key: "date", header: "Date", render: (a) => formatDate(a.date) },
    { key: "location", header: "Location" },
    { key: "purpose", header: "Purpose", render: (a) => <span className="text-xs text-ink-500">{a.purpose}</span> },
    { key: "status", header: "Status", render: (a) => <RequestStatusBadge status={a.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Movement / Out-Door Duty" subtitle="Request official movement outside the office and track approvals." action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Apply Movement</button>} />

      {isHead ? <div className="mb-4"><Tabs tabs={[{ id: "MY", label: "My Movements", count: myApps.length }, { id: "TEAM", label: "Department", count: teamApps.length }]} active={tab} onChange={setTab} /></div> : null}

      <DataTable columns={columns} rows={tab === "TEAM" ? teamApps : myApps} searchKeys={["location", "purpose"]} searchPlaceholder="Search movements…" emptyTitle="No movement applications" />

      {tab === "TEAM" && pending.length ? (
        <Card className="mt-4">
          <CardHeader title="Pending department approvals" subtitle={`${pending.length} awaiting your decision`} />
          <ul className="divide-y divide-ink-100">
            {pending.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink-800">{nameOf(users, a.userId)} → {a.location}</p>
                  <p className="text-xs text-ink-500">{formatDate(a.date)} · {a.purpose}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary btn-sm" onClick={() => { decideMovement(a.id, "APPROVED", "Approved"); push("success", "Movement approved."); }}>Approve</button>
                  <button className="btn-secondary btn-sm" onClick={() => { decideMovement(a.id, "REJECTED", "Rejected"); push("success", "Movement rejected."); }}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title="Apply for movement" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!form.location || !form.purpose.trim()} onClick={() => { applyMovement({ userId: me.id, date: form.date, location: form.location, purpose: form.purpose, approverId: me.managerId }); push("success", "Movement request submitted."); setOpen(false); }}>Submit</button></>}>
        <Field label="Date" required><TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="Location" required><TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Dhaka Regional Office" /></Field>
        <Field label="Purpose" required><TextArea rows={3} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
