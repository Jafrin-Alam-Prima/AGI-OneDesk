"use client";

import { useEffect, useState } from "react";
import { Save, Lock } from "lucide-react";
import { KpiStatusBadge } from "@/components/ui/primitives";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { achievement, calculatedScore } from "@/lib/calc";
import { directionLabel, kpiTypeLabel } from "./kpi-entry";
import { num, cn } from "@/lib/utils";
import type { Kpi } from "@/lib/types";

type Draft = {
  benchmark: string;
  target: string;
  actual: string;
  evidenceLink: string;
  dataSource: string;
  kpiCharter: string;
  kpiDriver: string;
};

function fromKpi(k: Kpi): Draft {
  return {
    benchmark: k.benchmark != null ? String(k.benchmark) : "",
    target: String(k.target),
    actual: String(k.actual),
    evidenceLink: k.evidenceLink ?? "",
    dataSource: k.dataSource ?? "",
    kpiCharter: k.kpiCharter ?? "",
    kpiDriver: k.kpiDriver ?? "",
  };
}

/**
 * Employee KPI entry grid (PeopleDesk style): one row per assigned KPI.
 * HR-defined columns are read-only; employee columns are editable; Progress/Score/Status are system-calculated.
 */
export function KpiEntryTable({ kpis }: { kpis: Kpi[] }) {
  const objectives = useStore((s) => s.objectives);
  const updateKpi = useStore((s) => s.updateKpi);
  const { push } = useToast();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const k of kpis) if (!next[k.id]) { next[k.id] = fromKpi(k); changed = true; }
      return changed ? next : prev;
    });
  }, [kpis]);

  const set = (id: string, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  function save(k: Kpi) {
    const d = drafts[k.id];
    if (!d) return;
    updateKpi(k.id, {
      benchmark: d.benchmark === "" ? undefined : Number(d.benchmark),
      target: Number(d.target) || 0,
      actual: Number(d.actual) || 0,
      evidenceLink: d.evidenceLink || undefined,
      dataSource: d.dataSource || undefined,
      kpiCharter: d.kpiCharter || undefined,
      kpiDriver: d.kpiDriver || undefined,
    }, "Employee KPI entry");
    push("success", `Saved “${k.name}”.`);
  }

  const ro = "text-ink-600";

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/50 px-5 py-2 text-[11px] text-ink-500">
        <Lock className="h-3 w-3" /> The columns <b>SL → Weight</b> are defined by HR and are read-only. Enter your <b>Benchmark, Target, Achievement</b> and other fields, then Save.
      </div>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[1850px] border-collapse text-sm">
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
            <th className="px-3 py-3">Achievement</th>
            <th className="px-3 py-3">Evidence Data Link</th>
            <th className="px-3 py-3">Data Source</th>
            <th className="px-3 py-3">KPI Charter</th>
            <th className="px-3 py-3">KPI Driver</th>
            <th className="px-3 py-3">Progress</th>
            <th className="px-3 py-3">Score</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((k, i) => {
            const d = drafts[k.id] ?? fromKpi(k);
            const obj = objectives.find((o) => o.id === k.objectiveId);
            const t = Number(d.target) || 0;
            const a = Number(d.actual) || 0;
            const ach = t > 0 ? achievement(t, a) : 0;
            const score = t > 0 ? calculatedScore(t, a) : 0;
            const editable = k.status === "SUBMITTED" || k.status === "RETURNED";
            const lockCls = cn("input", !editable && "border-ink-200 bg-ink-100/70 text-ink-600");
            return (
              <tr key={k.id} className={cn("border-b border-ink-100 align-top", !editable && "bg-ink-50/30")}>
                <td className="px-3 py-3 text-ink-500">{i + 1}</td>
                <td className="px-3 py-3"><span className="chip bg-brand-100 text-brand-700">{obj?.perspective ?? "—"}</span></td>
                <td className="px-3 py-3 max-w-[240px]"><span className={ro}>{obj?.name ?? "—"}</span></td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-start gap-1.5 font-medium text-ink-800">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" /> {k.name}
                  </span>
                </td>
                <td className="px-3 py-3"><span className="chip bg-violet-100 text-violet-700">{kpiTypeLabel(k.kpiType)}</span></td>
                <td className="px-3 py-3"><span className={ro}>{k.uom}</span></td>
                <td className="px-3 py-3"><span className={ro}>{directionLabel(k.direction)}</span></td>
                <td className="px-3 py-3"><span className={ro}>{k.srf || "—"}</span></td>
                <td className="px-3 py-3 num"><span className={ro}>{k.weight}%</span></td>

                <td className="px-3 py-3"><input type="number" className={cn(lockCls, "w-24")} disabled={!editable} value={d.benchmark} placeholder="—" onChange={(e) => set(k.id, { benchmark: e.target.value })} /></td>
                <td className="px-3 py-3"><input type="number" className={cn(lockCls, "w-24")} disabled={!editable} value={d.target} onChange={(e) => set(k.id, { target: e.target.value })} /></td>
                <td className="px-3 py-3"><input type="number" className={cn(lockCls, "w-24")} disabled={!editable} value={d.actual} onChange={(e) => set(k.id, { actual: e.target.value })} /></td>
                <td className="px-3 py-3"><input className={cn(lockCls, "min-w-[170px]")} disabled={!editable} value={d.evidenceLink} placeholder="https://…" onChange={(e) => set(k.id, { evidenceLink: e.target.value })} /></td>
                <td className="px-3 py-3"><input className={cn(lockCls, "min-w-[150px]")} disabled={!editable} value={d.dataSource} placeholder="e.g. ERP report" onChange={(e) => set(k.id, { dataSource: e.target.value })} /></td>
                <td className="px-3 py-3"><input className={cn(lockCls, "min-w-[130px]")} disabled={!editable} value={d.kpiCharter} onChange={(e) => set(k.id, { kpiCharter: e.target.value })} /></td>
                <td className="px-3 py-3"><input className={cn(lockCls, "min-w-[130px]")} disabled={!editable} value={d.kpiDriver} onChange={(e) => set(k.id, { kpiDriver: e.target.value })} /></td>

                <td className="px-3 py-3 num text-ink-600">{t > 0 ? `${num(ach, 0)}%` : "—"}</td>
                <td className="px-3 py-3 num text-ink-600">{t > 0 ? num(score, 2) : "—"}</td>
                <td className="px-3 py-3"><KpiStatusBadge status={k.status} /></td>
                <td className="px-3 py-3">
                  {editable ? (
                    <button className="btn-primary btn-sm" onClick={() => save(k)}><Save className="h-3.5 w-3.5" /> Save</button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-ink-400"><Lock className="h-3.5 w-3.5" /> Locked</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
