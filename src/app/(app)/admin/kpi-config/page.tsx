"use client";

import { useState } from "react";
import { Plus, Target, Layers, Crosshair } from "lucide-react";
import { useStore } from "@/lib/store";
import { deptName, nameOf } from "@/lib/selectors";
import { PageHeader, Card, CardHeader, Tabs, Badge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { num } from "@/lib/utils";
import { HrKpiDefinitionTable } from "@/components/kpi/hr-kpi-definition-table";

export default function KpiConfigPage() {
  const objectives = useStore((s) => s.objectives);
  const kras = useStore((s) => s.kras);
  const kpis = useStore((s) => s.kpis);
  const users = useStore((s) => s.users);
  const departments = useStore((s) => s.departments);
  const createObjective = useStore((s) => s.createObjective);
  const createKra = useStore((s) => s.createKra);
  const { push } = useToast();

  const [tab, setTab] = useState("DEFINITIONS");
  const [objOpen, setObjOpen] = useState(false);
  const [kraOpen, setKraOpen] = useState(false);
  const [obj, setObj] = useState({ name: "", perspective: "Financial" });
  const [kra, setKra] = useState({ name: "", objectiveId: objectives[0]?.id ?? "", description: "" });

  return (
    <div>
      <PageHeader title="KPI Configuration" subtitle="Objectives, KRAs, KPI catalogue and targets used in the performance module." />

      <div className="mb-4"><Tabs tabs={[
        { id: "DEFINITIONS", label: "KPI Definitions" },
        { id: "OBJECTIVES", label: "Objectives", count: objectives.length },
        { id: "KRAS", label: "KRAs", count: kras.length },
        { id: "CATALOGUE", label: "KPI Catalogue", count: kpis.filter((k) => !k.deleted).length },
        { id: "TARGETS", label: "Targets", count: kpis.filter((k) => !k.deleted).length },
      ]} active={tab} onChange={setTab} /></div>

      {tab === "DEFINITIONS" ? (
        <HrKpiDefinitionTable />
      ) : tab === "OBJECTIVES" ? (
        <>
          <div className="mb-4 flex justify-end"><button className="btn-primary btn-sm" onClick={() => setObjOpen(true)}><Plus className="h-3.5 w-3.5" /> Add Objective</button></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {objectives.map((o) => (
              <Card key={o.id} className="card-pad">
                <Target className="mb-2 h-5 w-5 text-brand-500" />
                <p className="text-sm font-semibold text-ink-800">{o.name}</p>
                <Badge tone="blue" className="mt-1">{o.perspective}</Badge>
                <p className="mt-2 text-xs text-ink-400">{kras.filter((k) => k.objectiveId === o.id).length} KRAs</p>
              </Card>
            ))}
          </div>
        </>
      ) : tab === "KRAS" ? (
        <>
          <div className="mb-4 flex justify-end"><button className="btn-primary btn-sm" onClick={() => setKraOpen(true)}><Plus className="h-3.5 w-3.5" /> Add KRA</button></div>
          <Card>
            <CardHeader title="Key Result Areas" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className="bg-ink-50/60"><tr><th className="th">KRA</th><th className="th">Objective</th><th className="th">Perspective</th></tr></thead>
                <tbody>
                  {kras.map((k) => {
                    const o = objectives.find((x) => x.id === k.objectiveId);
                    return <tr key={k.id} className="border-b border-ink-50 last:border-0"><td className="td font-medium text-ink-800">{k.name}</td><td className="td text-sm text-ink-600">{o?.name}</td><td className="td"><Badge tone="blue">{o?.perspective}</Badge></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : tab === "CATALOGUE" ? (
        <Card>
          <CardHeader title="KPI catalogue" subtitle="All KPIs in the system, filterable" action={<Layers className="h-4 w-4 text-ink-400" />} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="bg-ink-50/60"><tr><th className="th">KPI</th><th className="th">Owner</th><th className="th">Department</th><th className="th">Category</th><th className="th text-right">Weight</th><th className="th">Status</th></tr></thead>
              <tbody>
                {kpis.filter((k) => !k.deleted).map((k) => (
                  <tr key={k.id} className="border-b border-ink-50 last:border-0">
                    <td className="td font-medium text-ink-800">{k.name}</td>
                    <td className="td text-sm">{nameOf(users, k.ownerId)}</td>
                    <td className="td text-sm text-ink-600">{deptName({ departments }, users.find((u) => u.id === k.ownerId)?.departmentId)}</td>
                    <td className="td"><Badge tone="neutral">{k.category === "PROJECT" ? "Project" : "People & Culture"}</Badge></td>
                    <td className="td num text-right">{k.weight}%</td>
                    <td className="td"><Badge tone="neutral">{k.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Targets" subtitle="Employee, departmental and SBU targets" action={<Crosshair className="h-4 w-4 text-ink-400" />} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-ink-50/60"><tr><th className="th">KPI</th><th className="th">Owner</th><th className="th text-right">Target</th><th className="th text-right">Achievement</th><th className="th text-right">Ach %</th></tr></thead>
              <tbody>
                {kpis.filter((k) => !k.deleted).map((k) => (
                  <tr key={k.id} className="border-b border-ink-50 last:border-0">
                    <td className="td">{k.name}</td>
                    <td className="td text-sm">{nameOf(users, k.ownerId)}</td>
                    <td className="td num text-right">{num(k.target, 0)}</td>
                    <td className="td num text-right">{num(k.actual, 0)}</td>
                    <td className="td num text-right font-semibold text-brand-600">{num(k.target ? (k.actual / k.target) * 100 : 0, 1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={objOpen} onClose={() => setObjOpen(false)} title="Add objective" footer={<><button className="btn-secondary" onClick={() => setObjOpen(false)}>Cancel</button><button className="btn-primary" disabled={!obj.name} onClick={() => { createObjective(obj); push("success", "Objective added."); setObjOpen(false); }}>Add</button></>}>
        <Field label="Objective Name" required><TextInput value={obj.name} onChange={(e) => setObj({ ...obj, name: e.target.value })} /></Field>
        <Field label="BSC Perspective"><Select value={obj.perspective} onChange={(e) => setObj({ ...obj, perspective: e.target.value })}>{["Financial", "Customer", "Internal Process", "Learning & Growth"].map((p) => <option key={p}>{p}</option>)}</Select></Field>
      </Modal>

      <Modal open={kraOpen} onClose={() => setKraOpen(false)} title="Add KRA" footer={<><button className="btn-secondary" onClick={() => setKraOpen(false)}>Cancel</button><button className="btn-primary" disabled={!kra.name} onClick={() => { createKra(kra); push("success", "KRA added."); setKraOpen(false); }}>Add</button></>}>
        <Field label="KRA Name" required><TextInput value={kra.name} onChange={(e) => setKra({ ...kra, name: e.target.value })} /></Field>
        <Field label="Objective"><Select value={kra.objectiveId} onChange={(e) => setKra({ ...kra, objectiveId: e.target.value })}>{objectives.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</Select></Field>
      </Modal>
    </div>
  );
}
