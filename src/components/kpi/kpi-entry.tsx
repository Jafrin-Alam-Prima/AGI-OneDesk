"use client";

import { useState } from "react";
import { Lock, Save, ShieldCheck, Calculator } from "lucide-react";
import { Card, CardHeader, Badge, KpiStatusBadge } from "@/components/ui/primitives";
import { Field, TextInput, Select } from "@/components/ui/field";
import { useStore, useCurrentUser } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { achievement, calculatedScore } from "@/lib/calc";
import { canEditKpiDefinition } from "@/lib/navigation";
import { num, cn } from "@/lib/utils";
import type { Kpi, KpiDirection } from "@/lib/types";

const UOMS = ["BDT", "BDT Lac", "%", "MT", "Count", "Days", "Score", "Ratio", "Number", "Amount", "Hours", "Units"];

export function kpiTypeLabel(t?: Kpi["kpiType"]): string {
  return t === "VARIABLE" ? "Variable KPI" : "Non-Variable KPI";
}
export function directionLabel(d: KpiDirection): string {
  return d === "LOWER_BETTER" ? "Min" : "Max";
}

function ReadRow({ label, value, locked }: { label: string; value: React.ReactNode; locked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="flex items-center gap-1.5 text-sm text-ink-500">
        {locked ? <Lock className="h-3.5 w-3.5 text-ink-400" /> : null}
        {label}
      </dt>
      <dd className="max-w-[62%] text-right text-sm font-medium text-ink-800">{value}</dd>
    </div>
  );
}

export function KpiEntrySection({ kpi }: { kpi: Kpi }) {
  const me = useCurrentUser();
  const { push } = useToast();
  const objectives = useStore((s) => s.objectives);
  const updateKpi = useStore((s) => s.updateKpi);

  const canDefine = canEditKpiDefinition(me?.role);
  const isOwner = !!me && me.id === kpi.ownerId;
  const canEnter = isOwner || canDefine;

  const [name, setName] = useState(kpi.name);
  const [objectiveId, setObjectiveId] = useState(kpi.objectiveId ?? "");
  const [kpiType, setKpiType] = useState<NonNullable<Kpi["kpiType"]>>(kpi.kpiType ?? "NON_VARIABLE");
  const [uom, setUom] = useState(kpi.uom);
  const [direction, setDirection] = useState<KpiDirection>(kpi.direction);
  const [srf, setSrf] = useState(kpi.srf ?? "");
  const [weight, setWeight] = useState(String(kpi.weight));

  const [benchmark, setBenchmark] = useState(kpi.benchmark != null ? String(kpi.benchmark) : "");
  const [target, setTarget] = useState(String(kpi.target));
  const [actual, setActual] = useState(String(kpi.actual));
  const [evidenceLink, setEvidenceLink] = useState(kpi.evidenceLink ?? "");
  const [dataSource, setDataSource] = useState(kpi.dataSource ?? "");
  const [kpiCharter, setKpiCharter] = useState(kpi.kpiCharter ?? "");
  const [kpiDriver, setKpiDriver] = useState(kpi.kpiDriver ?? "");

  const selectedObjective = objectives.find((o) => o.id === objectiveId);
  const bsc = selectedObjective?.perspective ?? kpi.bscPerspective ?? "—";
  const t = Number(target) || 0;
  const a = Number(actual) || 0;
  const ach = achievement(t, a);
  const score = calculatedScore(t, a);

  function save() {
    const patch: Partial<Kpi> = {};
    if (canDefine) {
      Object.assign(patch, {
        name: name.trim() || kpi.name,
        objectiveId: objectiveId || undefined,
        kpiType,
        uom,
        direction,
        srf: srf || undefined,
        weight: Number(weight) || 0,
        bscPerspective: selectedObjective?.perspective,
        perspective: selectedObjective?.perspective ?? kpi.perspective,
      });
    }
    if (canEnter) {
      Object.assign(patch, {
        benchmark: benchmark === "" ? undefined : Number(benchmark),
        target: t,
        actual: a,
        evidenceLink: evidenceLink || undefined,
        dataSource: dataSource || undefined,
        kpiCharter: kpiCharter || undefined,
        kpiDriver: kpiDriver || undefined,
      });
    }
    updateKpi(kpi.id, patch, canDefine && !isOwner ? "HR KPI configuration update" : "Employee KPI entry");
    push("success", "KPI entry saved.");
  }

  const ro = "bg-ink-100/70 text-ink-600 border-ink-200";

  return (
    <div className="space-y-4">
      {/* Flow strip */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ink-100 bg-ink-50/60 px-4 py-2.5 text-xs text-ink-500">
        <span className="inline-flex items-center gap-1.5 font-medium text-ink-700"><Lock className="h-3.5 w-3.5" /> HR defines KPI</span>
        <span className="text-ink-300">→</span>
        <span>Employee receives KPI</span>
        <span className="text-ink-300">→</span>
        <span className="font-medium text-ink-700">Employee enters achievement</span>
        <span className="text-ink-300">→</span>
        <span className="inline-flex items-center gap-1.5"><Calculator className="h-3.5 w-3.5" /> System calculates Score</span>
      </div>

      {/* HR-defined definition */}
      <Card>
        <CardHeader
          title="KPI Definition"
          subtitle={canDefine ? "HR-controlled fields — editable by HR/Admin." : "Set by HR — read only."}
          action={<Badge tone={canDefine ? "brand" : "neutral"}>{kpiTypeLabel(kpi.kpiType)}</Badge>}
        />
        {canDefine ? (
          <div className="grid gap-x-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="BSC"><TextInput value={bsc} disabled className={ro} /></Field>
            <Field label="Objective" className="sm:col-span-2">
              <Select value={objectiveId} onChange={(e) => setObjectiveId(e.target.value)}>
                {objectives.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </Field>
            <Field label="KPI"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="KPI Type">
              <Select value={kpiType} onChange={(e) => setKpiType(e.target.value as NonNullable<Kpi["kpiType"]>)}>
                <option value="VARIABLE">Variable KPI</option>
                <option value="NON_VARIABLE">Non-Variable KPI</option>
              </Select>
            </Field>
            <Field label="UOM">
              <Select value={uom} onChange={(e) => setUom(e.target.value)}>
                {UOMS.map((u) => <option key={u} value={u}>{u}</option>)}
              </Select>
            </Field>
            <Field label="KPI Direction">
              <Select value={direction} onChange={(e) => setDirection(e.target.value as KpiDirection)}>
                <option value="HIGHER_BETTER">Max</option>
                <option value="LOWER_BETTER">Min</option>
              </Select>
            </Field>
            <Field label="SRF"><TextInput value={srf} onChange={(e) => setSrf(e.target.value)} /></Field>
            <Field label="Weight (%)"><TextInput type="number" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
          </div>
        ) : (
          <dl className="grid gap-x-8 px-5 py-3 sm:grid-cols-2 lg:grid-cols-3">
            <ReadRow label="BSC" value={bsc} locked />
            <ReadRow label="Objective" value={objectives.find((o) => o.id === kpi.objectiveId)?.name ?? "—"} locked />
            <ReadRow label="KPI" value={kpi.name} locked />
            <ReadRow label="KPI Type" value={<Badge tone="brand">{kpiTypeLabel(kpi.kpiType)}</Badge>} locked />
            <ReadRow label="UOM" value={kpi.uom} locked />
            <ReadRow label="KPI Direction" value={directionLabel(kpi.direction)} locked />
            <ReadRow label="SRF" value={kpi.srf || "—"} locked />
            <ReadRow label="Weight" value={`${kpi.weight}%`} locked />
          </dl>
        )}
      </Card>

      {/* Employee entry */}
      <Card>
        <CardHeader
          title="Employee Entry"
          subtitle={canEnter ? "Enter your performance information." : "View only."}
          action={<Badge tone={kpiType === "VARIABLE" ? "purple" : "blue"}>{kpiTypeLabel(kpiType)}</Badge>}
        />
        <div className="grid gap-x-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Benchmark">
            <TextInput type="number" value={benchmark} disabled={!canEnter} className={cn(!canEnter && ro)} onChange={(e) => setBenchmark(e.target.value)} />
          </Field>
          <Field label="Target">
            <TextInput type="number" value={target} disabled={!canEnter} className={cn(!canEnter && ro)} onChange={(e) => setTarget(e.target.value)} />
          </Field>
          <Field label="Achievement">
            <TextInput type="number" value={actual} disabled={!canEnter} className={cn(!canEnter && ro)} onChange={(e) => setActual(e.target.value)} />
          </Field>
          <Field label="Evidence Data Link" className="sm:col-span-2">
            <TextInput value={evidenceLink} disabled={!canEnter} className={cn(!canEnter && ro)} placeholder="https://…" onChange={(e) => setEvidenceLink(e.target.value)} />
          </Field>
          <Field label="Data Source">
            <TextInput value={dataSource} disabled={!canEnter} className={cn(!canEnter && ro)} placeholder="e.g. ERP / Finance report" onChange={(e) => setDataSource(e.target.value)} />
          </Field>
          <Field label="KPI Charter">
            <TextInput value={kpiCharter} disabled={!canEnter} className={cn(!canEnter && ro)} onChange={(e) => setKpiCharter(e.target.value)} />
          </Field>
          <Field label="KPI Driver">
            <TextInput value={kpiDriver} disabled={!canEnter} className={cn(!canEnter && ro)} onChange={(e) => setKpiDriver(e.target.value)} />
          </Field>
        </div>

        {/* System controlled */}
        <div className="grid gap-x-8 border-t border-ink-100 px-5 py-3 sm:grid-cols-3">
          <ReadRow label="Progress (system)" value={t > 0 ? `${num(ach, 2)}%` : "—"} />
          <ReadRow label="Score (system)" value={t > 0 ? num(score, 2) : "—"} />
          <ReadRow label="Status (system)" value={<KpiStatusBadge status={kpi.status} />} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs text-ink-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Progress, Score and Status are calculated by the system.
          </p>
          <button className="btn-primary" disabled={!canEnter} onClick={save}><Save className="h-4 w-4" /> Save KPI Entry</button>
        </div>
      </Card>
    </div>
  );
}
