"use client";

import { useState } from "react";
import { Plus, LifeBuoy } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Badge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DataTable, ActionMenu, type Column } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";
import type { ServiceRequest } from "@/lib/types";

const REQUEST_TYPES = ["Salary Certificate", "ID Card", "Bank Letter", "Address Change", "Experience Letter", "Other"];
const STATUS_TONE: Record<string, "amber" | "blue" | "green" | "neutral"> = { OPEN: "amber", IN_PROGRESS: "blue", RESOLVED: "green", CLOSED: "neutral" };

export default function RequestsPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const requests = useStore((s) => s.serviceRequests);
  const create = useStore((s) => s.createServiceRequest);
  const update = useStore((s) => s.updateServiceRequest);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ requestType: REQUEST_TYPES[0], subject: "", description: "", priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" });

  if (!me) return null;
  const isHR = ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(me.role);
  const rows = isHR ? requests : requests.filter((r) => r.userId === me.id);

  const cols: Column<ServiceRequest>[] = [
    { key: "requestType", header: "Type" },
    ...(isHR ? [{ key: "userId", header: "Employee", render: (r: ServiceRequest) => nameOf(users, r.userId) }] : []),
    { key: "subject", header: "Subject" },
    { key: "priority", header: "Priority", render: (r) => <Badge tone={r.priority === "HIGH" ? "red" : r.priority === "MEDIUM" ? "amber" : "neutral"}>{r.priority}</Badge> },
    { key: "createdAt", header: "Raised", render: (r) => formatDate(r.createdAt) },
    { key: "status", header: "Status", render: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status.replace("_", " ")}</Badge> },
    ...(isHR ? [{ key: "actions", header: "", align: "right" as const, render: (r: ServiceRequest) => (
      <ActionMenu items={[
        { label: "Mark In Progress", onClick: () => { update(r.id, { status: "IN_PROGRESS", assigneeId: me.id }); push("success", "Marked in progress."); } },
        { label: "Mark Resolved", onClick: () => { update(r.id, { status: "RESOLVED", resolution: "Resolved by HR." }); push("success", "Marked resolved."); } },
        { label: "Close", onClick: () => { update(r.id, { status: "CLOSED" }); push("success", "Request closed."); } },
      ]} />
    ) }] : []),
  ];

  return (
    <div>
      <PageHeader title="Service Requests" subtitle="Raise HR service requests and track their resolution."
        action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Request</button>} />

      <DataTable columns={cols} rows={rows} searchKeys={["subject", "requestType", "description"]} emptyTitle="No service requests" />

      <Modal open={open} onClose={() => setOpen(false)} title="New service request" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.subject.trim() || !f.description.trim()} onClick={() => { create({ userId: me.id, requestType: f.requestType, subject: f.subject, description: f.description, priority: f.priority }); push("success", "Service request submitted."); setOpen(false); }}>Submit</button></>}>
        <Field label="Request Type" required><Select value={f.requestType} onChange={(e) => setF({ ...f, requestType: e.target.value })}>{REQUEST_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Subject" required><TextInput value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></Field>
        <Field label="Priority" required><Select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as typeof f.priority })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></Select></Field>
        <Field label="Description" required><TextArea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      </Modal>

      <div className="mt-4">
        <Card><CardHeader title="About service requests" subtitle="HR responds to requests within the service SLA." />
          <p className="flex items-center gap-2 p-5 text-sm text-ink-500"><LifeBuoy className="h-4 w-4" /> Requests update their status live; HR admins can progress them.</p>
        </Card>
      </div>
    </div>
  );
}
