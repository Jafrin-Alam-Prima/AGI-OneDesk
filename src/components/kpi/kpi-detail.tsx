"use client";

import { Download, FileText, ShieldCheck } from "lucide-react";
import { KpiStatusBadge, Card, CardHeader } from "@/components/ui/primitives";
import { Tracker } from "./tracker";
import { useStore } from "@/lib/store";
import { achievement, calculatedScore, weightedScore } from "@/lib/calc";
import { monthName, num, formatDateTime, download } from "@/lib/utils";
import type { Kpi } from "@/lib/types";
import { userName } from "@/lib/store";

export function CalculationPath({ kpi }: { kpi: Kpi }) {
  const ach = achievement(kpi.target, kpi.actual);
  const calc = calculatedScore(kpi.target, kpi.actual);
  const final = ["APPROVED", "ADJUSTED", "COMPLETED"].includes(kpi.status) ? calc : null;
  const rows: [string, string][] = [
    ["Formula", "Achievement = Actual ÷ Target × 100"],
    ["Target", num(kpi.target, 2)],
    ["Actual", num(kpi.actual, 2)],
    ["Achievement", `${num(ach, 2)}%`],
    ["Calculated Score", num(calc, 2)],
    ["Final Score", final === null ? "Pending approval" : num(final, 2)],
    ["KPI Weight", `${kpi.weight}%`],
    ["Weighted Score", num(weightedScore(final ?? calc, kpi.weight), 2)],
  ];
  return (
    <dl className="divide-y divide-ink-100">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-sm text-ink-500">{k}</dt>
          <dd className={`num text-sm font-medium ${k === "Final Score" && final === null ? "text-amber-600" : "text-ink-800"}`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function KpiDetailView({ kpi }: { kpi: Kpi }) {
  const users = useStore((s) => s.users);
  const objectives = useStore((s) => s.objectives);
  const kras = useStore((s) => s.kras);
  const evidence = useStore((s) => s.evidence).filter((e) => e.kpiId === kpi.id);
  const versions = useStore((s) => s.kpiVersions).filter((v) => v.kpiId === kpi.id).sort((a, b) => b.versionNo - a.versionNo);
  const decisions = useStore((s) => s.decisions).filter((d) => d.kpiId === kpi.id);

  const owner = users.find((u) => u.id === kpi.ownerId);
  const approver = users.find((u) => u.id === kpi.approverId);
  const ach = achievement(kpi.target, kpi.actual);

  function downloadReport() {
    const lines = [
      `AGI OneDesk — KPI Report`,
      `KPI: ${kpi.name} (${kpi.code})`,
      `Owner: ${owner?.fullName} (${owner?.employeeId})`,
      `Approval Person: ${approver?.fullName ?? "—"}`,
      `Category: ${kpi.category} | Weight: ${kpi.weight}%`,
      `Period: ${monthName(kpi.periodMonth)} ${kpi.periodYear}`,
      `Status: ${kpi.status}`,
      ``,
      `Target: ${kpi.target}`,
      `Actual: ${kpi.actual}`,
      `Achievement: ${num(ach, 2)}%`,
      `Calculated Score: ${num(calculatedScore(kpi.target, kpi.actual), 2)}`,
      ``,
      `Remarks: ${kpi.remarks || "—"}`,
      `Evidence: ${evidence.map((e) => `${e.name} [${e.sha256}]`).join(", ") || "—"}`,
    ];
    download(`${kpi.code}-report.txt`, lines.join("\n"), "text/plain");
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3 p-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-ink-900">{kpi.name}</h2>
              <KpiStatusBadge status={kpi.status} />
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {owner?.fullName} · {owner?.designation} · {kpi.category === "PROJECT" ? "Project KPI" : "People & Culture KPI"} · Weight {kpi.weight}% · {monthName(kpi.periodMonth)} {kpi.periodYear}
            </p>
            <p className="num mt-0.5 text-xs text-ink-400">{kpi.code} · Stage: {kpi.stage}</p>
          </div>
          <button className="btn-secondary btn-sm" onClick={downloadReport}><Download className="h-3.5 w-3.5" /> Download report</button>
        </div>
        <div className="border-t border-ink-100 px-5 py-4">
          <Tracker status={kpi.status} size="md" />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Target &amp; Actual" />
          <div className="grid grid-cols-2 gap-4 p-5">
            <div><p className="text-xs uppercase tracking-wide text-ink-400">Target</p><p className="num mt-1 text-xl font-bold text-ink-900">{num(kpi.target, 2)} <span className="text-xs font-normal text-ink-400">{kpi.uom}</span></p></div>
            <div><p className="text-xs uppercase tracking-wide text-ink-400">Latest Actual</p><p className="num mt-1 text-xl font-bold text-ink-900">{num(kpi.actual, 2)} <span className="text-xs font-normal text-ink-400">{kpi.uom}</span></p></div>
            <div><p className="text-xs uppercase tracking-wide text-ink-400">Achievement</p><p className="num mt-1 text-lg font-semibold text-brand-600">{num(ach, 2)}%</p></div>
            <div><p className="text-xs uppercase tracking-wide text-ink-400">Direction</p><p className="mt-1 text-sm text-ink-700">{kpi.direction === "HIGHER_BETTER" ? "Higher is better" : "Lower is better"}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-ink-400">Objective / KRA</p><p className="mt-1 text-sm text-ink-700">{objectives.find((o) => o.id === kpi.objectiveId)?.name ?? "—"} · {kras.find((k) => k.id === kpi.kraId)?.name ?? "—"}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-ink-400">Benchmark / SRF</p><p className="mt-1 text-sm text-ink-700">{kpi.benchmark != null ? num(kpi.benchmark, 0) : "—"}{kpi.srf ? ` · ${kpi.srf}` : ""}</p></div>
            <div className="col-span-2"><p className="text-xs uppercase tracking-wide text-ink-400">Reviewer / Approver</p><p className="mt-1 text-sm text-ink-700">{approver ? `${approver.fullName} (${approver.designation})` : "—"}</p></div>
            <div className="col-span-2"><p className="text-xs uppercase tracking-wide text-ink-400">Data source</p><p className="mt-1 text-sm text-ink-700">Employee-entered with uploaded evidence</p></div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Calculation path" subtitle="No curve, cap or score version is applied." />
          <div className="px-5 py-2"><CalculationPath kpi={kpi} /></div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Evidence" subtitle={`${evidence.length} file(s) with integrity fingerprint`} />
        <div className="p-5">
          {evidence.length === 0 ? (
            <p className="text-sm text-ink-500">No evidence attached.</p>
          ) : (
            <ul className="space-y-2">
              {evidence.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-ink-200 px-3 py-2.5">
                  <FileText className="h-4 w-4 text-ink-400" />
                  <span className="flex-1 truncate text-sm text-ink-700">{e.name}</span>
                  <span className="num hidden items-center gap-1 text-[10px] text-ink-400 sm:flex"><ShieldCheck className="h-3 w-3" /> SHA-256 {e.sha256.slice(0, 20)}…</span>
                  <button className="btn-secondary btn-sm" onClick={() => download(`${e.name}.txt`, `Evidence placeholder for ${e.name}\nSHA-256: ${e.sha256}`, "text/plain")}>
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Adjustment History" subtitle="Every change after submission, with reason" />
        <div className="overflow-x-auto">
          {versions.length === 0 ? (
            <p className="p-5 text-sm text-ink-500">No changes recorded yet.</p>
          ) : (
            <table className="w-full min-w-[720px]">
              <thead className="bg-ink-50/60"><tr>
                <th className="th">Ver</th><th className="th">What changed</th><th className="th">Old → New</th><th className="th">By</th><th className="th">When</th><th className="th">Reason</th>
              </tr></thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v.id} className="border-b border-ink-50 last:border-0">
                    <td className="td num">v{v.versionNo}</td>
                    <td className="td">{v.changedFields.join(", ")}</td>
                    <td className="td num text-xs">
                      {v.changedFields.map((cf) => (
                        <div key={cf}>{cf}: {String(v.oldValues[cf] ?? "—")} → {String(v.newValues[cf] ?? "—")}</div>
                      ))}
                    </td>
                    <td className="td">{userName(users, v.changedBy)}</td>
                    <td className="td text-xs text-ink-500">{formatDateTime(v.changedAt)}</td>
                    <td className="td text-xs text-ink-500">{v.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {decisions.length ? (
        <Card>
          <CardHeader title="Review decisions" />
          <ul className="divide-y divide-ink-100 p-5 pt-0">
            {decisions.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="text-sm"><span className="font-medium text-ink-800">{d.decision}</span> at {d.stage} stage by {userName(users, d.actorId)}</span>
                <span className="text-xs text-ink-400">{formatDateTime(d.at)}{d.reason ? ` · ${d.reason}` : ""}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
