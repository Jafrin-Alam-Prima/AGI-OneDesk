"use client";

import { useState } from "react";
import { Plus, Headphones } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { PageHeader, Badge, StatCard } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DataTable, ActionMenu, type Column } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";
import type { HelpdeskTicket } from "@/lib/types";

const ISSUE_TYPES = ["IT Support", "Facilities", "HR", "Admin", "Payroll", "Other"];
const TONE: Record<string, "amber" | "blue" | "green"> = { OPEN: "amber", IN_PROGRESS: "blue", CLOSED: "green" };

export default function HelpdeskPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const tickets = useStore((s) => s.tickets);
  const create = useStore((s) => s.createTicket);
  const update = useStore((s) => s.updateTicket);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ issueType: ISSUE_TYPES[0], subject: "", description: "" });

  if (!me) return null;
  const isAgent = ["SYS_ADMIN", "HR_ADMIN", "SUPER_ADMIN"].includes(me.role);
  const rows = isAgent ? tickets : tickets.filter((t) => t.userId === me.id);

  const cols: Column<HelpdeskTicket>[] = [
    { key: "issueType", header: "Type" },
    ...(isAgent ? [{ key: "userId", header: "Raised by", render: (t: HelpdeskTicket) => nameOf(users, t.userId) }] : []),
    { key: "subject", header: "Subject" },
    { key: "createdAt", header: "Raised", render: (t) => formatDate(t.createdAt) },
    { key: "status", header: "Status", render: (t) => <Badge tone={TONE[t.status]}>{t.status.replace("_", " ")}</Badge> },
    ...(isAgent ? [{ key: "actions", header: "", align: "right" as const, render: (t: HelpdeskTicket) => (
      <ActionMenu items={[
        { label: "Start progress", onClick: () => { update(t.id, { status: "IN_PROGRESS" }); push("success", "Ticket in progress."); } },
        { label: "Close", onClick: () => { update(t.id, { status: "CLOSED" }); push("success", "Ticket closed."); } },
      ]} />
    ) }] : []),
  ];

  return (
    <div>
      <PageHeader title="Helpdesk" subtitle="Raise and track support tickets."
        action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Ticket</button>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Open" value={rows.filter((t) => t.status === "OPEN").length} tone="amber" icon={<Headphones className="h-5 w-5" />} />
        <StatCard label="In progress" value={rows.filter((t) => t.status === "IN_PROGRESS").length} tone="blue" />
        <StatCard label="Closed" value={rows.filter((t) => t.status === "CLOSED").length} tone="green" />
      </div>

      <DataTable columns={cols} rows={rows} searchKeys={["subject", "description", "issueType"]} emptyTitle="No tickets" />

      <Modal open={open} onClose={() => setOpen(false)} title="New support ticket" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.subject.trim() || !f.description.trim()} onClick={() => { create({ userId: me.id, issueType: f.issueType, subject: f.subject, description: f.description }); push("success", "Ticket created."); setOpen(false); }}>Create ticket</button></>}>
        <Field label="Issue Type" required><Select value={f.issueType} onChange={(e) => setF({ ...f, issueType: e.target.value })}>{ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Subject" required><TextInput value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></Field>
        <Field label="Description" required><TextArea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
