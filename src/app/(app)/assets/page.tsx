"use client";

import { useState } from "react";
import { Plus, Boxes } from "lucide-react";
import { useStore } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { PageHeader, Badge, StatCard } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DataTable, ActionMenu, type Column } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";
import type { AssetItem } from "@/lib/types";

export default function AssetsPage() {
  const users = useStore((s) => s.users);
  const assets = useStore((s) => s.assets);
  const create = useStore((s) => s.createAsset);
  const assign = useStore((s) => s.assignAsset);
  const ret = useStore((s) => s.returnAsset);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [assigning, setAssigning] = useState<AssetItem | null>(null);
  const [f, setF] = useState({ name: "", category: "Laptop", code: "", status: "AVAILABLE" as AssetItem["status"] });
  const [assignTo, setAssignTo] = useState("");

  const cols: Column<AssetItem>[] = [
    { key: "name", header: "Asset", sortable: true },
    { key: "category", header: "Category" },
    { key: "code", header: "Code", render: (a) => <span className="num text-xs">{a.code}</span> },
    { key: "status", header: "Status", render: (a) => <Badge tone={a.status === "AVAILABLE" ? "green" : a.status === "ASSIGNED" ? "blue" : "amber"}>{a.status}</Badge> },
    { key: "assignedTo", header: "Assigned to", render: (a) => a.assignedTo ? nameOf(users, a.assignedTo) : "—" },
    { key: "assignedAt", header: "Since", render: (a) => a.assignedAt ? formatDate(a.assignedAt) : "—" },
    { key: "actions", header: "", align: "right", render: (a) => (
      <ActionMenu items={[
        { label: "Assign to employee", disabled: a.status === "ASSIGNED", onClick: () => { setAssigning(a); setAssignTo(""); } },
        { label: "Return to pool", disabled: a.status !== "ASSIGNED", onClick: () => { ret(a.id); push("success", "Asset returned to pool."); } },
      ]} />
    ) },
  ];

  return (
    <div>
      <PageHeader title="Asset Management" subtitle="Register, assign and track company assets."
        action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Register Asset</button>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total assets" value={assets.length} icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="Assigned" value={assets.filter((a) => a.status === "ASSIGNED").length} tone="blue" />
        <StatCard label="Available" value={assets.filter((a) => a.status === "AVAILABLE").length} tone="green" />
      </div>

      <DataTable columns={cols} rows={assets} searchKeys={["name", "category", "code"]} emptyTitle="No assets" />

      <Modal open={open} onClose={() => setOpen(false)} title="Register asset" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.name} onClick={() => { create(f); push("success", "Asset registered."); setOpen(false); }}>Register</button></>}>
        <Field label="Asset Name" required><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{["Laptop", "Monitor", "Mobile", "Furniture", "Vehicle", "Other"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Asset Code"><TextInput value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="AST-XXX-0001" /></Field>
        </div>
      </Modal>

      <Modal open={!!assigning} onClose={() => setAssigning(null)} title={`Assign ${assigning?.name ?? ""}`} footer={<><button className="btn-secondary" onClick={() => setAssigning(null)}>Cancel</button><button className="btn-primary" disabled={!assignTo} onClick={() => { if (assigning) assign(assigning.id, assignTo); push("success", "Asset assigned."); setAssigning(null); }}>Assign</button></>}>
        <Field label="Assign to employee" required><Select value={assignTo} onChange={(e) => setAssignTo(e.target.value)}><option value="">Select employee…</option>{users.filter((u) => u.status === "ACTIVE").map((u) => <option key={u.id} value={u.id}>{u.fullName} — {u.employeeId}</option>)}</Select></Field>
      </Modal>
    </div>
  );
}
