"use client";

import { useState } from "react";
import { Award, Plus, AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { PageHeader, Badge, StatCard } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DataTable, type Column } from "@/components/ui/data-table";
import { bdt, formatDate } from "@/lib/utils";
import type { RewardRecord } from "@/lib/types";

export default function RewardsPage() {
  const users = useStore((s) => s.users);
  const rewards = useStore((s) => s.rewards);
  const create = useStore((s) => s.createReward);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ userId: "", type: "REWARD" as "REWARD" | "PUNISHMENT", title: "", description: "", date: "2026-10-06", amount: "" });

  const employees = users.filter((u) => u.role !== "SUPER_ADMIN");
  const cols: Column<RewardRecord>[] = [
    { key: "userId", header: "Employee", render: (r) => nameOf(users, r.userId), value: (r) => nameOf(users, r.userId) },
    { key: "type", header: "Type", render: (r) => <Badge tone={r.type === "REWARD" ? "green" : "red"}>{r.type === "REWARD" ? "Reward" : "Disciplinary"}</Badge> },
    { key: "title", header: "Title" },
    { key: "description", header: "Description", render: (r) => <span className="text-xs text-ink-500">{r.description}</span> },
    { key: "amount", header: "Amount", align: "right", render: (r) => r.amount ? <span className="num">{bdt(r.amount)}</span> : "—" },
    { key: "date", header: "Date", render: (r) => formatDate(r.date) },
  ];

  return (
    <div>
      <PageHeader title="Rewards & Discipline" subtitle="Recognition and disciplinary actions across the group."
        action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Record Entry</button>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Rewards" value={rewards.filter((r) => r.type === "REWARD").length} tone="green" icon={<Award className="h-5 w-5" />} />
        <StatCard label="Disciplinary" value={rewards.filter((r) => r.type === "PUNISHMENT").length} tone="red" icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Reward value" value={bdt(rewards.filter((r) => r.type === "REWARD").reduce((s, r) => s + (r.amount ?? 0), 0))} tone="blue" />
      </div>

      <DataTable columns={cols} rows={rewards} searchKeys={["title", "description"]} emptyTitle="No records" />

      <Modal open={open} onClose={() => setOpen(false)} title="Record reward / disciplinary entry" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.userId || !f.title} onClick={() => { create({ userId: f.userId, type: f.type, title: f.title, description: f.description, date: f.date, amount: f.amount ? Number(f.amount) : undefined }); push("success", "Entry recorded."); setOpen(false); }}>Save</button></>}>
        <Field label="Employee" required><Select value={f.userId} onChange={(e) => setF({ ...f, userId: e.target.value })}><option value="">Select employee…</option>{employees.map((u) => <option key={u.id} value={u.id}>{u.fullName} — {u.employeeId}</option>)}</Select></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type"><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as typeof f.type })}><option value="REWARD">Reward</option><option value="PUNISHMENT">Disciplinary</option></Select></Field>
          <Field label="Date"><TextInput type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        </div>
        <Field label="Title" required><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Top Performer Q3" /></Field>
        <Field label="Description"><TextArea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        {f.type === "REWARD" ? <Field label="Reward Amount (BDT, optional)"><TextInput type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field> : null}
      </Modal>
    </div>
  );
}
