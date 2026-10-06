"use client";

import { useState } from "react";
import { Plus, Trash2, GitBranch, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader, Card, CardHeader, Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABEL } from "@/lib/navigation";
import type { ApprovalPipeline, Role } from "@/lib/types";

export default function PipelinesPage() {
  const pipelines = useStore((s) => s.pipelines);
  const update = useStore((s) => s.updatePipeline);
  const { push } = useToast();
  const [editing, setEditing] = useState<string | null>(null);

  function addStep(p: ApprovalPipeline) {
    const order = p.steps.length + 1;
    update({ ...p, steps: [...p.steps, { order, role: "HR_ADMIN", label: "New Stage" }] });
    push("success", "Stage added.");
  }
  function removeStep(p: ApprovalPipeline, order: number) {
    update({ ...p, steps: p.steps.filter((s) => s.order !== order).map((s, i) => ({ ...s, order: i + 1 })) });
    push("success", "Stage removed.");
  }
  function setRole(p: ApprovalPipeline, order: number, role: Role) {
    update({ ...p, steps: p.steps.map((s) => (s.order === order ? { ...s, role, label: ROLE_LABEL[role] } : s)) });
  }

  return (
    <div>
      <PageHeader title="Approval Pipelines" subtitle="Configure the approval stages for KPIs, leave, loans and other workflows." />

      <div className="space-y-4">
        {pipelines.map((p) => (
          <Card key={p.id}>
            <CardHeader title={p.name} subtitle={`Applies to: ${p.appliesTo} · ${p.steps.length} stage(s)`}
              action={<div className="flex gap-2"><button className="btn-secondary btn-sm" onClick={() => setEditing(editing === p.id ? null : p.id)}>{editing === p.id ? "Done" : "Edit"}</button><button className="btn-ghost btn-sm" onClick={() => addStep(p)}><Plus className="h-3.5 w-3.5" /> Stage</button></div>} />
            <div className="flex flex-wrap items-center gap-2 p-5">
              {p.steps.map((s, i) => (
                <span key={s.order} className="flex items-center gap-2">
                  <span className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2">
                    <span className="num flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{s.order}</span>
                    {editing === p.id ? (
                      <select className="input max-w-[180px] py-1" value={s.role} onChange={(e) => setRole(p, s.order, e.target.value as Role)}>
                        {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    ) : <span className="text-sm text-ink-700">{s.label}</span>}
                    {editing === p.id && p.steps.length > 1 ? <button className="rounded p-0.5 text-ink-400 hover:text-red-600" onClick={() => removeStep(p, s.order)}><Trash2 className="h-3.5 w-3.5" /></button> : null}
                  </span>
                  {i < p.steps.length - 1 ? <ArrowRight className="h-4 w-4 text-ink-300" /> : null}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader title="Pipeline engine" subtitle="The same engine drives all approval queues." action={<GitBranch className="h-4 w-4 text-ink-400" />} />
        <p className="p-5 text-sm text-ink-500">
          A submitted item advances one stage at a time. Each decision writes a version and an audit entry, and notifies the next actor.
          KPI requests move Employee → Department Head → HR → Finance → Audit; leave and loans use their own configured chains.
        </p>
      </Card>
    </div>
  );
}
