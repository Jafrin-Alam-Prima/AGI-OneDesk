"use client";

import { Fragment, useMemo, useState } from "react";
import { Plus, Trash2, Save, Info, Lock } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { deptHeads } from "@/lib/selectors";
import { useToast } from "@/components/ui/toast";
import { canEditKpiDefinition } from "@/lib/navigation";
import { monthName, cn } from "@/lib/utils";
import type { Kpi, KpiDirection } from "@/lib/types";

const UOMS = ["BDT", "BDT Lac", "%", "MT", "Count", "Days", "Score", "Ratio", "Number", "Amount", "Hours", "Units"];
const DIRECTIONS: { v: KpiDirection; l: string }[] = [
  { v: "HIGHER_BETTER", l: "Max" },
  { v: "LOWER_BETTER", l: "Min" },
];
const PM_TYPES = ["BSC", "ESG", "OKR"] as const;

type RowDraft = {
  key: string;
  objectiveId: string;
  name: string;
  kpiType: NonNullable<Kpi["kpiType"]>;
  uom: string;
  direction: KpiDirection;
  srf: string;
  weight: string;
  benchmark: string;
  target: string;
  actual: string;
  evidenceLink: string;
  dataSource: string;
  kpiCharter: string;
  kpiDriver: string;
};

let seq = 0;
function newRow(objectiveId: string): RowDraft {
  seq += 1;
  return {
    key: `hrrow-${seq}`,
    objectiveId,
    name: "",
    kpiType: "NON_VARIABLE",
    uom: "BDT",
    direction: "HIGHER_BETTER",
    srf: "",
    weight: "",
    benchmark: "",
    target: "",
    actual: "",
    evidenceLink: "",
    dataSource: "",
    kpiCharter: "",
    kpiDriver: "",
  };
}

/** HR authoring grid — mirror of PeopleDesk "Create Individual KPI". Writes KPI definitions (HR fields only). */
export function HrKpiDefinitionTable() {
  const me = useCurrentUser();
  const { push } = useToast();
  const users = useStore((s) => s.users);
  const objectives = useStore((s) => s.objectives);
  const createKpi = useStore((s) => s.createKpi);
  const submitKpi = useStore((s) => s.submitKpi);

  const isHr = canEditKpiDefinition(me?.role);
  const activeUsers = useMemo(() => users.filter((u) => u.status === "ACTIVE"), [users]);
  const [employeeId, setEmployeeId] = useState(activeUsers[0]?.id ?? "");
  const [pmType, setPmType] = useState<(typeof PM_TYPES)[number]>("BSC");
  const [year, setYear] = useState(2026);
  const [fromMonth, setFromMonth] = useState(new Date().getMonth() + 1);
  const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);
  const [rows, setRows] = useState<RowDraft[]>(() => [newRow(objectives[0]?.id ?? "")]);
  const [alsoSubmit, setAlsoSubmit] = useState(true);

  const employee = activeUsers.find((u) => u.id === employeeId);
  const kpiAdmin = users.find((u) => ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(u.role));

  const patchRow = (key: string, patch: Partial<RowDraft>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, newRow(objectives[0]?.id ?? "")]);
  const removeRow = (key: string) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));

  const rowErrors = (r: RowDraft) => ({
    name: r.name.trim() ? "" : "KPI required",
    weight: Number(r.weight) > 0 && Number(r.weight) <= 100 ? "" : "Weight 1–100",
  });
  const invalid = !employee || rows.some((r) => rowErrors(r).name || rowErrors(r).weight);

  function save() {
    if (!employee) return;
    const approverId = deptHeads(users, employee.departmentId)[0]?.id ?? kpiAdmin?.id ?? "";
    let n = 0;
    for (const r of rows) {
      const obj = objectives.find((o) => o.id === r.objectiveId);
      const kpi = createKpi({
        ownerId: employee.id,
        approverId,
        name: r.name.trim(),
        objectiveId: r.objectiveId || undefined,
        perspective: obj?.perspective ?? "Financial",
        bscPerspective: obj?.perspective ?? "",
        pmType,
        kpiType: r.kpiType,
        uom: r.uom,
        direction: r.direction,
        srf: r.srf || undefined,
        weight: Number(r.weight) || 0,
        benchmark: r.benchmark ? Number(r.benchmark) : undefined,
        target: Number(r.target) || 0,
        actual: Number(r.actual) || 0,
        evidenceLink: r.evidenceLink || undefined,
        dataSource: r.dataSource || undefined,
        kpiCharter: r.kpiCharter || undefined,
        kpiDriver: r.kpiDriver || undefined,
        periodYear: year,
        periodMonth: fromMonth,
      });
      if (alsoSubmit) submitKpi(kpi.id);
      n += 1;
    }
    push("success", `${n} KPI definition${n === 1 ? "" : "s"} saved${alsoSubmit ? " and sent to the employee's queue" : " as draft"}.`);
    setRows([newRow(objectives[0]?.id ?? "")]);
  }

  if (!isHr) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
        <Lock className="h-3.5 w-3.5 shrink-0" /> KPI definitions are authored by HR/Admin only.
      </div>
    );
  }

  const ro = "bg-ink-100/70 text-ink-600 border-ink-200";

  return (
    <div>
      {/* Context bar */}
      <div className="card card-pad mb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label">Select Employee <span className="text-brand-600">*</span></label>
            <select className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              {activeUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName} — {u.employeeId}</option>)}
            </select>
          </div>
          <div>
            <label className="label">PM Type <span className="text-brand-600">*</span></label>
            <select className="input" value={pmType} onChange={(e) => setPmType(e.target.value as (typeof PM_TYPES)[number])}>
              {PM_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Year <span className="text-brand-600">*</span></label>
            <select className="input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="label">From Month</label>
            <select className="input" value={fromMonth} onChange={(e) => setFromMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">To Month</label>
            <select className="input" value={toMonth} onChange={(e) => setToMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m)}</option>)}
            </select>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> HR defines these KPI fields. Benchmark / Target / Achievement / Evidence / Data Source / Charter / Driver are optional here and are normally filled in by the employee.
        </p>
      </div>

      {/* Grid */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-ink-700">KPI Definitions {employee ? <span className="font-normal text-ink-400">· {employee.fullName}</span> : null}</h3>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-600">
              <input type="checkbox" className="h-4 w-4" checked={alsoSubmit} onChange={(e) => setAlsoSubmit(e.target.checked)} />
              Send to employee queue on save
            </label>
            <span className="text-xs text-ink-400">{rows.length} row{rows.length === 1 ? "" : "s"} · Weight {rows.reduce((s, r) => s + (Number(r.weight) || 0), 0)}%</span>
            <button className="btn-secondary btn-sm" onClick={addRow}><Plus className="h-3.5 w-3.5" /> Add KPI</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1900px] border-collapse text-sm">
            <thead>
              <tr className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <th className="px-3 py-3">SL</th>
                <th className="px-3 py-3">BSC</th>
                <th className="px-3 py-3">Objective</th>
                <th className="px-3 py-3">KPI</th>
                <th className="px-3 py-3">KPI Type</th>
                <th className="px-3 py-3">UOM</th>
                <th className="px-3 py-3">KPI Direction</th>
                <th className="px-3 py-3">SRF</th>
                <th className="px-3 py-3">Weight</th>
                <th className="px-3 py-3 text-ink-400">Benchmark</th>
                <th className="px-3 py-3 text-ink-400">Target</th>
                <th className="px-3 py-3 text-ink-400">Achievement</th>
                <th className="px-3 py-3 text-ink-400">Evidence Data Link</th>
                <th className="px-3 py-3 text-ink-400">Data Source</th>
                <th className="px-3 py-3 text-ink-400">KPI Charter</th>
                <th className="px-3 py-3 text-ink-400">KPI Driver</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const obj = objectives.find((o) => o.id === r.objectiveId);
                const err = rowErrors(r);
                return (
                  <Fragment key={r.key}>
                    <tr className="border-b border-ink-100 align-top">
                      <td className="px-3 py-3 text-ink-500">{i + 1}</td>
                      <td className="px-3 py-3"><span className="chip bg-brand-100 text-brand-700">{obj?.perspective ?? "BSC"}</span></td>
                      <td className="px-3 py-3">
                        <select className="input min-w-[180px]" value={r.objectiveId} onChange={(e) => patchRow(r.key, { objectiveId: e.target.value })}>
                          <option value="">Select…</option>
                          {objectives.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input className={cn("input min-w-[220px]", err.name && "input-error")} value={r.name} placeholder="KPI name" onChange={(e) => patchRow(r.key, { name: e.target.value })} />
                      </td>
                      <td className="px-3 py-3">
                        <select className="input min-w-[150px]" value={r.kpiType} onChange={(e) => patchRow(r.key, { kpiType: e.target.value as NonNullable<Kpi["kpiType"]> })}>
                          <option value="VARIABLE">Variable KPI</option>
                          <option value="NON_VARIABLE">Non-Variable KPI</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <select className="input min-w-[100px]" value={r.uom} onChange={(e) => patchRow(r.key, { uom: e.target.value })}>
                          {UOMS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <select className="input min-w-[110px]" value={r.direction} onChange={(e) => patchRow(r.key, { direction: e.target.value as KpiDirection })}>
                          {DIRECTIONS.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3"><input className="input min-w-[110px]" value={r.srf} placeholder="e.g. Monthly" onChange={(e) => patchRow(r.key, { srf: e.target.value })} /></td>
                      <td className="px-3 py-3">
                        <input type="number" className={cn("input w-24", err.weight && "input-error")} value={r.weight} onChange={(e) => patchRow(r.key, { weight: e.target.value })} />
                      </td>
                      <td className="px-3 py-3"><input type="number" className={cn("input w-24", ro)} value={r.benchmark} onChange={(e) => patchRow(r.key, { benchmark: e.target.value })} /></td>
                      <td className="px-3 py-3"><input type="number" className={cn("input w-24", ro)} value={r.target} onChange={(e) => patchRow(r.key, { target: e.target.value })} /></td>
                      <td className="px-3 py-3"><input type="number" className={cn("input w-24", ro)} value={r.actual} onChange={(e) => patchRow(r.key, { actual: e.target.value })} /></td>
                      <td className="px-3 py-3"><input className={cn("input min-w-[160px]", ro)} value={r.evidenceLink} placeholder="https://…" onChange={(e) => patchRow(r.key, { evidenceLink: e.target.value })} /></td>
                      <td className="px-3 py-3"><input className={cn("input min-w-[140px]", ro)} value={r.dataSource} onChange={(e) => patchRow(r.key, { dataSource: e.target.value })} /></td>
                      <td className="px-3 py-3"><input className={cn("input min-w-[120px]", ro)} value={r.kpiCharter} onChange={(e) => patchRow(r.key, { kpiCharter: e.target.value })} /></td>
                      <td className="px-3 py-3"><input className={cn("input min-w-[120px]", ro)} value={r.kpiDriver} onChange={(e) => patchRow(r.key, { kpiDriver: e.target.value })} /></td>
                      <td className="px-3 py-3">
                        <button className="rounded p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600" title="Remove" onClick={() => removeRow(r.key)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
          <button className="btn-secondary btn-sm" onClick={addRow}><Plus className="h-3.5 w-3.5" /> Add KPI</button>
          <button className="btn-primary" disabled={invalid} onClick={save}><Save className="h-4 w-4" /> Save KPI Definition{rows.length === 1 ? "" : "s"}</button>
        </div>
      </div>

      {invalid ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Select an employee and give every row a KPI name and a weight between 1 and 100.
        </p>
      ) : null}
    </div>
  );
}
