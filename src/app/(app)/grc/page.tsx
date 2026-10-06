"use client";

import { useState } from "react";
import { Plus, ShieldCheck, Activity, FileSearch } from "lucide-react";
import { useStore } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { PageHeader, Badge, StatCard, Card, CardHeader, Tabs } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatDateTime } from "@/lib/utils";
import type { RiskItem } from "@/lib/types";

const CATS = ["Market", "Operational", "Financial", "Compliance", "Strategic", "IT"];

export default function GrcPage() {
  const risks = useStore((s) => s.risks);
  const create = useStore((s) => s.createRisk);
  const auditLogs = useStore((s) => s.auditLogs);
  const users = useStore((s) => s.users);
  const { push } = useToast();
  const [tab, setTab] = useState("RISK");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", category: CATS[0], likelihood: "3", impact: "3", owner: "Finance", status: "OPEN" as RiskItem["status"] });

  const cols: Column<RiskItem>[] = [
    { key: "title", header: "Risk", sortable: true },
    { key: "category", header: "Category", render: (r) => <Badge tone="neutral">{r.category}</Badge> },
    { key: "score", header: "Score", align: "right", render: (r) => <span className={`num font-semibold ${r.likelihood * r.impact >= 15 ? "text-red-600" : r.likelihood * r.impact >= 8 ? "text-amber-600" : "text-ink-600"}`}>{r.likelihood * r.impact}</span>, value: (r) => r.likelihood * r.impact },
    { key: "owner", header: "Owner" },
    { key: "status", header: "Status", render: (r) => <Badge tone={r.status === "CLOSED" ? "neutral" : r.status === "MITIGATED" ? "green" : "amber"}>{r.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Governance, Risk & Compliance" subtitle="Risk register, audit trail and digital footprint."
        action={tab === "RISK" ? <button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add Risk</button> : undefined} />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Open risks" value={risks.filter((r) => r.status === "OPEN").length} tone="red" icon={<ShieldCheck className="h-5 w-5" />} />
        <StatCard label="Mitigated" value={risks.filter((r) => r.status === "MITIGATED").length} tone="green" />
        <StatCard label="Audit entries" value={auditLogs.length} tone="blue" icon={<FileSearch className="h-5 w-5" />} />
      </div>

      <div className="mb-4"><Tabs tabs={[{ id: "RISK", label: "Risk Register" }, { id: "AUDIT", label: "Audit Trail" }]} active={tab} onChange={setTab} /></div>

      {tab === "RISK" ? (
        <DataTable columns={cols} rows={risks} searchKeys={["title", "category", "owner"]} emptyTitle="No risks recorded" />
      ) : (
        <Card>
          <CardHeader title="Audit trail" subtitle={`${auditLogs.length} append-only entries`} action={<Activity className="h-4 w-4 text-ink-400" />} />
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full min-w-[640px]">
              <thead className="sticky top-0 bg-ink-50/90"><tr><th className="th">When</th><th className="th">Actor</th><th className="th">Action</th><th className="th">Detail</th></tr></thead>
              <tbody>
                {auditLogs.slice(0, 60).map((a) => (
                  <tr key={a.id} className="border-b border-ink-50 last:border-0">
                    <td className="td text-xs text-ink-400">{formatDateTime(a.at)}</td>
                    <td className="td">{nameOf(users, a.actorId)}</td>
                    <td className="td"><Badge tone="blue">{a.action}</Badge></td>
                    <td className="td text-sm text-ink-600">{a.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add risk" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.title} onClick={() => { create({ title: f.title, category: f.category, likelihood: Number(f.likelihood), impact: Number(f.impact), owner: f.owner, status: f.status }); push("success", "Risk added."); setOpen(false); }}>Add risk</button></>}>
        <Field label="Risk Title" required><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Owner"><TextInput value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Likelihood (1-5)"><Select value={f.likelihood} onChange={(e) => setF({ ...f, likelihood: e.target.value })}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
          <Field label="Impact (1-5)"><Select value={f.impact} onChange={(e) => setF({ ...f, impact: e.target.value })}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
        </div>
        <Field label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as RiskItem["status"] })}><option value="OPEN">Open</option><option value="MITIGATED">Mitigated</option><option value="CLOSED">Closed</option></Select></Field>
      </Modal>
    </div>
  );
}
