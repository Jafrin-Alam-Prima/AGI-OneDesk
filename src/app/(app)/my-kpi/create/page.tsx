"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { deptHeads } from "@/lib/selectors";
import { canEditKpiDefinition } from "@/lib/navigation";
import { achievement, calculatedScore } from "@/lib/calc";
import { Avatar } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { num, monthName, cn } from "@/lib/utils";
import type { Kpi, KpiDirection, User } from "@/lib/types";

const UOMS = ["BDT", "%", "MT", "Count", "Days", "Score", "Ratio", "Number", "Amount", "Hours", "Units"];
const DIRECTIONS: { v: KpiDirection; l: string }[] = [
  { v: "HIGHER_BETTER", l: "Higher is better" },
  { v: "LOWER_BETTER", l: "Lower is better" },
];
const PM_TYPES = ["BSC", "ESG", "OKR"] as const;
const AGGREGATION_TYPES = ["Sum", "Average", "Min", "Max", "Last", "Count"];
const KPI_FORMATS = ["Number", "Percentage", "Currency", "Ratio", "Duration"];
const TARGET_FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly"];

type RowDraft = {
  key: string;
  objectiveId: string;
  name: string;
  uom: string;
  direction: KpiDirection;
  kpiType: NonNullable<Kpi["kpiType"]>;
  srf: string;
  weight: string;
  benchmark: string;
  target: string;
  actual: string;
  aggregationType: string;
  kpiMeasurement: string;
  kpiFormat: string;
  targetFrequency: string;
  frequencyValue: string;
  evidenceLink: string;
  dataSource: string;
  kpiCharter: string;
  kpiDriver: string;
  showOnDashboard: boolean;
  open: boolean;
};

let seq = 0;
function newRow(objectiveId: string): RowDraft {
  seq += 1;
  return {
    key: `row-${seq}`,
    objectiveId,
    name: "",
    uom: "BDT",
    direction: "HIGHER_BETTER",
    kpiType: "NON_VARIABLE",
    srf: "",
    weight: "",
    benchmark: "",
    target: "",
    actual: "",
    aggregationType: "",
    kpiMeasurement: "",
    kpiFormat: "",
    targetFrequency: "Monthly",
    frequencyValue: "",
    evidenceLink: "",
    dataSource: "",
    kpiCharter: "",
    kpiDriver: "",
    showOnDashboard: true,
    open: false,
  };
}

export default function CreateIndividualKpiPage() {
  const router = useRouter();
  const me = useCurrentUser();
  const { push } = useToast();

  const users = useStore((s) => s.users);
  const objectives = useStore((s) => s.objectives);
  const departments = useStore((s) => s.departments);
  const createKpi = useStore((s) => s.createKpi);
  const submitKpi = useStore((s) => s.submitKpi);

  const canPickEmployee = !!me && ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN", "DEPT_HEAD"].includes(me.role);
  const lockDef = !canEditKpiDefinition(me?.role);
  const employeeOptions = useMemo(
    () => (canPickEmployee ? users.filter((u) => u.status === "ACTIVE") : me ? [me] : []),
    [canPickEmployee, users, me]
  );

  const [employeeId, setEmployeeId] = useState(me?.id ?? "");
  const employee: User | undefined = useMemo(
    () => users.find((u) => u.id === employeeId) ?? me ?? undefined,
    [users, employeeId, me]
  );

  const [pmType, setPmType] = useState<(typeof PM_TYPES)[number]>("BSC");
  const [year, setYear] = useState(2026);
  const [fromMonth, setFromMonth] = useState(new Date().getMonth() + 1);
  const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);

  const [rows, setRows] = useState<RowDraft[]>(() => [newRow(objectives[0]?.id ?? "")]);

  const deptNameFor = (id?: string) => departments.find((d) => d.id === id)?.name ?? "—";

  const patchRow = (key: string, patch: Partial<RowDraft>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const addRow = () => setRows((rs) => [...rs, newRow(objectives[0]?.id ?? "")]);
  const removeRow = (key: string) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));

  const rowErrors = (r: RowDraft) => ({
    name: r.name.trim() ? "" : "KPI required",
    weight: Number(r.weight) > 0 && Number(r.weight) <= 100 ? "" : "Weight 1–100",
  });
  const invalid = rows.some((r) => rowErrors(r).name || rowErrors(r).weight);

  function resolveApprover(user: User): string {
    const head = deptHeads(users, user.departmentId)[0];
    if (head) return head.id;
    const fallback = users.find((u) => ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(u.role) && u.id !== user.id);
    return fallback?.id ?? "";
  }

  function save() {
    if (!employee) return;
    if (invalid) {
      push("error", "Please complete every KPI row (name and weight are required).");
      return;
    }
    const approverId = resolveApprover(employee);
    let created = 0;
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
        uom: r.uom,
        direction: r.direction,
        kpiType: r.kpiType,
        srf: r.srf || undefined,
        weight: Number(r.weight) || 0,
        benchmark: r.benchmark ? Number(r.benchmark) : undefined,
        target: Number(r.target) || 0,
        actual: Number(r.actual) || 0,
        aggregationType: r.aggregationType || undefined,
        kpiMeasurement: r.kpiMeasurement || undefined,
        kpiFormat: r.kpiFormat || undefined,
        targetFrequency: r.targetFrequency || undefined,
        frequencyValue: r.frequencyValue ? Number(r.frequencyValue) : undefined,
        evidenceLink: r.evidenceLink || undefined,
        dataSource: r.dataSource || undefined,
        kpiCharter: r.kpiCharter || undefined,
        kpiDriver: r.kpiDriver || undefined,
        showOnDashboard: r.showOnDashboard,
        periodYear: year,
        periodMonth: fromMonth,
      });
      submitKpi(kpi.id);
      created += 1;
    }
    push("success", `${created} KPI${created === 1 ? "" : "s"} saved and sent for approval.`);
    router.push("/my-kpi");
  }

  const readonly = "bg-ink-50 text-ink-600";

  return (
    <div>
      {/* Header: Back + title + Save (PeopleDesk layout) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/my-kpi" className="btn-secondary btn-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-lg font-bold text-ink-900">Create Individual KPI</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => push("info", "Presentation view is available after saving.")}>Presentation</button>
          <button className="btn-primary" disabled={!employee || invalid} onClick={save}>
            <Save className="h-4 w-4" /> Save
          </button>
        </div>
      </div>

      {lockDef ? (
        <p className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> BSC, Objective, KPI, KPI Type, UOM, KPI Direction, SRF and Weight are set by HR and are read-only here. Add your Benchmark, Target, Achievement and other details.
        </p>
      ) : null}

      {/* Sheet context */}
      <div className="card card-pad mb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Select Employee <span className="text-brand-600">*</span></label>
            <select
              className="input"
              value={employeeId}
              disabled={!canPickEmployee}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              {employeeOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName} — {u.designation}</option>
              ))}
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
          <div className="grid grid-cols-2 gap-3">
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
        </div>

        {employee ? (
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-ink-100 pt-4">
            <div className="flex items-center gap-3">
              <Avatar name={employee.fullName} size={44} />
              <div>
                <p className="text-sm font-semibold text-ink-900">{employee.fullName}</p>
                <p className="text-xs text-ink-500">{employee.designation}, Full-time</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink-800">{employee.email}</p>
              <p className="text-xs text-ink-500">Email</p>
            </div>
            <div>
              <p className="text-sm font-medium text-ink-800">{employee.employeeId}</p>
              <p className="text-xs text-ink-500">Employee ID</p>
            </div>
            <div>
              <p className="text-sm font-medium text-ink-800">{deptNameFor(employee.departmentId)}</p>
              <p className="text-xs text-ink-500">Department</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* KPI grid */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-ink-700">KPI Details</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-400">{rows.length} KPI row{rows.length === 1 ? "" : "s"} · Weight total {rows.reduce((s, r) => s + (Number(r.weight) || 0), 0)}%</span>
            <button className="btn-secondary btn-sm" onClick={addRow}><Plus className="h-3.5 w-3.5" /> Add KPI</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px] border-collapse text-sm">
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
                <th className="px-3 py-3">Benchmark</th>
                <th className="px-3 py-3">Target</th>
                <th className="px-3 py-3">Ach.</th>
                <th className="px-3 py-3">Progress</th>
                <th className="px-3 py-3">Score</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const obj = objectives.find((o) => o.id === r.objectiveId);
                const t = Number(r.target) || 0;
                const a = Number(r.actual) || 0;
                const ach = t > 0 ? achievement(t, a) : 0;
                const score = t > 0 ? calculatedScore(t, a) : 0;
                const err = rowErrors(r);
                return (
                  <Fragment key={r.key}>
                    <tr className="border-b border-ink-100 align-top">
                      <td className="px-3 py-3 text-ink-500">{i + 1}</td>
                      <td className="px-3 py-3">
                        <span className="chip bg-brand-100 text-brand-700">{obj?.perspective ?? "BSC"}</span>
                      </td>
                      <td className="px-3 py-3">
                        <select className={cn("input min-w-[170px]", lockDef && readonly)} disabled={lockDef} value={r.objectiveId} onChange={(e) => patchRow(r.key, { objectiveId: e.target.value })}>
                          <option value="">Select…</option>
                          {objectives.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input className={cn("input min-w-[220px]", err.name && !lockDef && "input-error", lockDef && readonly)} disabled={lockDef} value={r.name} onChange={(e) => patchRow(r.key, { name: e.target.value })} placeholder="KPI name" />
                      </td>
                      <td className="px-3 py-3">
                        <select className={cn("input min-w-[150px]", lockDef && readonly)} disabled={lockDef} value={r.kpiType} onChange={(e) => patchRow(r.key, { kpiType: e.target.value as NonNullable<Kpi["kpiType"]> })}>
                          <option value="VARIABLE">Variable KPI</option>
                          <option value="NON_VARIABLE">Non-Variable KPI</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <select className={cn("input min-w-[100px]", lockDef && readonly)} disabled={lockDef} value={r.uom} onChange={(e) => patchRow(r.key, { uom: e.target.value })}>
                          {UOMS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <select className={cn("input min-w-[150px]", lockDef && readonly)} disabled={lockDef} value={r.direction} onChange={(e) => patchRow(r.key, { direction: e.target.value as KpiDirection })}>
                          {DIRECTIONS.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input className={cn("input min-w-[110px]", lockDef && readonly)} disabled={lockDef} value={r.srf} onChange={(e) => patchRow(r.key, { srf: e.target.value })} placeholder="e.g. Growth" />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" className={cn("input w-24", err.weight && !lockDef && "input-error", lockDef && readonly)} disabled={lockDef} value={r.weight} onChange={(e) => patchRow(r.key, { weight: e.target.value })} />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" className="input w-24" value={r.benchmark} onChange={(e) => patchRow(r.key, { benchmark: e.target.value })} />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" className="input w-24" value={r.target} onChange={(e) => patchRow(r.key, { target: e.target.value })} />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" className="input w-24" value={r.actual} onChange={(e) => patchRow(r.key, { actual: e.target.value })} />
                      </td>
                      <td className="px-3 py-3">
                        <input readOnly disabled className={cn("input w-20", readonly)} value={t > 0 ? `${num(ach, 0)}%` : "—"} />
                      </td>
                      <td className="px-3 py-3">
                        <input readOnly disabled className={cn("input w-20", readonly)} value={t > 0 ? num(score, 2) : "—"} />
                      </td>
                      <td className="px-3 py-3"><span className="chip bg-ink-100 text-ink-600">New</span></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button className="rounded p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="More attributes" onClick={() => patchRow(r.key, { open: !r.open })}>
                            {r.open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <button className="rounded p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600" title="Remove" onClick={() => removeRow(r.key)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {r.open ? (
                      <tr key={`${r.key}-more`} className="border-b border-ink-100 bg-ink-50/40">
                        <td></td>
                        <td colSpan={15} className="px-3 py-4">
                          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            <div>
                              <label className="label">Aggregation Type</label>
                              <select className={cn("input", lockDef && readonly)} disabled={lockDef} value={r.aggregationType} onChange={(e) => patchRow(r.key, { aggregationType: e.target.value })}>
                                <option value="">Select…</option>
                                {AGGREGATION_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="label">KPI Measurement</label>
                              <select className={cn("input", lockDef && readonly)} disabled={lockDef} value={r.kpiMeasurement} onChange={(e) => patchRow(r.key, { kpiMeasurement: e.target.value })}>
                                <option value="">Select…</option>
                                {UOMS.map((x) => <option key={x} value={x}>{x}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="label">KPI Format</label>
                              <select className={cn("input", lockDef && readonly)} disabled={lockDef} value={r.kpiFormat} onChange={(e) => patchRow(r.key, { kpiFormat: e.target.value })}>
                                <option value="">Select…</option>
                                {KPI_FORMATS.map((x) => <option key={x} value={x}>{x}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="label">Target Frequency</label>
                              <select className={cn("input", lockDef && readonly)} disabled={lockDef} value={r.targetFrequency} onChange={(e) => patchRow(r.key, { targetFrequency: e.target.value })}>
                                {TARGET_FREQUENCIES.map((x) => <option key={x} value={x}>{x}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="label">Frequency Value</label>
                              <input type="number" className={cn("input", lockDef && readonly)} disabled={lockDef} value={r.frequencyValue} onChange={(e) => patchRow(r.key, { frequencyValue: e.target.value })} />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="label">Evidence Data Link</label>
                              <input className="input" value={r.evidenceLink} onChange={(e) => patchRow(r.key, { evidenceLink: e.target.value })} placeholder="https://…" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="label">Data Source</label>
                              <input className="input" value={r.dataSource} onChange={(e) => patchRow(r.key, { dataSource: e.target.value })} placeholder="e.g. ERP / Sales report" />
                            </div>
                            <div>
                              <label className="label">KPI Charter</label>
                              <input className="input" value={r.kpiCharter} onChange={(e) => patchRow(r.key, { kpiCharter: e.target.value })} />
                            </div>
                            <div>
                              <label className="label">KPI Driver</label>
                              <input className="input" value={r.kpiDriver} onChange={(e) => patchRow(r.key, { kpiDriver: e.target.value })} />
                            </div>
                            <div className="flex items-end">
                              <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-ink-700">
                                <input type="checkbox" className="h-4 w-4" checked={r.showOnDashboard} onChange={(e) => patchRow(r.key, { showOnDashboard: e.target.checked })} />
                                Show on dashboard
                              </label>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
          <button className="btn-secondary btn-sm" onClick={addRow}><Plus className="h-3.5 w-3.5" /> Add KPI</button>
          <button className="btn-primary" disabled={!employee || invalid} onClick={save}><Save className="h-4 w-4" /> Save</button>
        </div>
      </div>

      {invalid ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Every KPI row needs a name and a weight between 1 and 100.
        </p>
      ) : null}
    </div>
  );
}
