"use client";

import { useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { nameOf, deptName } from "@/lib/selectors";
import { PageHeader, Badge, RequestStatusBadge, Card, CardHeader } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

export default function TransfersPage() {
  const users = useStore((s) => s.users);
  const departments = useStore((s) => s.departments);
  const transfers = useStore((s) => s.transfers);
  const create = useStore((s) => s.createTransfer);
  const decide = useStore((s) => s.decideTransfer);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ userId: "", type: "PROMOTION" as "PROMOTION" | "TRANSFER", toDepartmentId: departments[0]?.id ?? "", effectiveDate: "2026-11-01", newDesignation: "", reason: "" });

  const pending = transfers.filter((t) => t.status === "PENDING");
  const employees = users.filter((u) => u.role === "EMPLOYEE" || u.role === "DEPT_HEAD");

  return (
    <div>
      <PageHeader title="Transfer & Promotion" subtitle="Initiate and approve employee transfers, promotions and increments."
        action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Request</button>} />

      {pending.length ? (
        <Card className="mb-4">
          <CardHeader title="Pending approvals" subtitle={`${pending.length} requests`} />
          <ul className="divide-y divide-ink-100">
            {pending.map((t) => {
              const u = users.find((x) => x.id === t.userId);
              return (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="brand">{t.type}</Badge>
                      <span className="text-sm font-medium text-ink-800">{u?.fullName}</span>
                      <span className="flex items-center gap-1 text-xs text-ink-500">
                        {deptName({ departments }, t.fromDepartmentId)} <ArrowRight className="h-3 w-3" /> {deptName({ departments }, t.toDepartmentId)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-500">{t.newDesignation ? `New designation: ${t.newDesignation} · ` : ""}{t.reason} · effective {formatDate(t.effectiveDate)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary btn-sm" onClick={() => { decide(t.id, "APPROVED", "Approved"); push("success", "Approved — employee record updated."); }}>Approve</button>
                    <button className="btn-secondary btn-sm" onClick={() => { decide(t.id, "REJECTED", "Rejected"); push("success", "Rejected."); }}>Reject</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="All requests" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-ink-50/60"><tr><th className="th">Employee</th><th className="th">Type</th><th className="th">From → To</th><th className="th">Effective</th><th className="th">Status</th></tr></thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id} className="border-b border-ink-50 last:border-0">
                  <td className="td">{nameOf(users, t.userId)}</td>
                  <td className="td"><Badge tone="neutral">{t.type}</Badge></td>
                  <td className="td text-sm text-ink-600">{deptName({ departments }, t.fromDepartmentId)} → {deptName({ departments }, t.toDepartmentId)}</td>
                  <td className="td text-sm">{formatDate(t.effectiveDate)}</td>
                  <td className="td"><RequestStatusBadge status={t.status} /></td>
                </tr>
              ))}
              {!transfers.length ? <tr><td colSpan={5} className="td text-center text-ink-500">No requests.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New transfer / promotion" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.userId || !f.reason.trim()} onClick={() => { const u = users.find((x) => x.id === f.userId); create({ userId: f.userId, type: f.type, fromDepartmentId: u?.departmentId ?? "", toDepartmentId: f.toDepartmentId, effectiveDate: f.effectiveDate, newDesignation: f.newDesignation, reason: f.reason }); push("success", "Request submitted."); setOpen(false); }}>Submit</button></>}>
        <Field label="Employee" required><Select value={f.userId} onChange={(e) => setF({ ...f, userId: e.target.value })}><option value="">Select employee…</option>{employees.map((u) => <option key={u.id} value={u.id}>{u.fullName} — {u.employeeId}</option>)}</Select></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type"><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as typeof f.type })}><option value="PROMOTION">Promotion</option><option value="TRANSFER">Transfer</option></Select></Field>
          <Field label="Effective Date"><TextInput type="date" value={f.effectiveDate} onChange={(e) => setF({ ...f, effectiveDate: e.target.value })} /></Field>
        </div>
        <Field label="To Department"><Select value={f.toDepartmentId} onChange={(e) => setF({ ...f, toDepartmentId: e.target.value })}>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field>
        <Field label="New Designation (for promotions)"><TextInput value={f.newDesignation} onChange={(e) => setF({ ...f, newDesignation: e.target.value })} /></Field>
        <Field label="Reason" required><TextArea rows={3} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
