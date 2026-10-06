"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Download, FileText } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { kpisVisibleTo, nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Tabs, KpiStatusBadge } from "@/components/ui/primitives";
import { achievement, averageAchievement, calculatedScore, isCounted, totalKpiScore } from "@/lib/calc";
import { download, monthName, num, toCSV } from "@/lib/utils";
import type { Kpi } from "@/lib/types";

type Gran = "MONTHLY" | "QUARTERLY" | "YEARLY";
const COLORS = ["#DE3332", "#1d4ed8", "#0f766e"];

export default function PerformancePage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const kpisAll = useStore((s) => s.kpis);
  const all = useMemo(() => kpisVisibleTo(useStore.getState(), me), [me, kpisAll]);
  const [gran, setGran] = useState<Gran>("MONTHLY");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(2026);

  const mine = useMemo(() => all.filter((k) => (me ? k.ownerId === me.id : false)), [all, me]);

  function inRange(k: Kpi, g: Gran, m: number, y: number): boolean {
    if (k.periodYear !== y) return false;
    if (g === "YEARLY") return true;
    if (g === "MONTHLY") return k.periodMonth === m;
    return Math.ceil(k.periodMonth / 3) === Math.ceil(m / 3);
  }

  const period = mine.filter((k) => inRange(k, gran, month, year));
  const counted = period.filter(isCounted);
  const totalScore = totalKpiScore(counted.map((k) => ({ finalScore: calculatedScore(k.target, k.actual), weight: k.weight })));
  const avgAch = averageAchievement(counted);
  const approved = counted.length;

  // previous period
  let prevTotal = 0;
  if (gran === "MONTHLY") { const pm = month === 1 ? 12 : month - 1; const py = month === 1 ? year - 1 : year; prevTotal = totalKpiScore(mine.filter((k) => isCounted(k) && k.periodYear === py && k.periodMonth === pm).map((k) => ({ finalScore: calculatedScore(k.target, k.actual), weight: k.weight }))); }
  else if (gran === "QUARTERLY") { const q = Math.ceil(month / 3); const pq = q === 1 ? 4 : q - 1; const py = q === 1 ? year - 1 : year; prevTotal = totalKpiScore(mine.filter((k) => isCounted(k) && k.periodYear === py && Math.ceil(k.periodMonth / 3) === pq).map((k) => ({ finalScore: calculatedScore(k.target, k.actual), weight: k.weight }))); }
  else { prevTotal = totalKpiScore(mine.filter((k) => isCounted(k) && k.periodYear === year - 1).map((k) => ({ finalScore: calculatedScore(k.target, k.actual), weight: k.weight }))); }

  const diff = totalScore - prevTotal;
  const dirWord = diff > 0 ? "above" : diff < 0 ? "below" : "equal to";
  const prevLabel = gran === "MONTHLY" ? "previous month" : gran === "QUARTERLY" ? "previous quarter" : "previous year";

  const chartData = mine
    .filter((k) => isCounted(k))
    .map((k) => ({ name: `${monthName(k.periodMonth).slice(0, 3)}`, score: Number(calculatedScore(k.target, k.actual).toFixed(1)) }));

  const periodLabel = gran === "YEARLY" ? `${year}` : gran === "QUARTERLY" ? `Q${Math.ceil(month / 3)} ${year}` : `${monthName(month)} ${year}`;

  function exportCsv() {
    const rows = period.map((k) => ({
      KPI: k.name, Target: k.target, Actual: k.actual, Achievement: num(achievement(k.target, k.actual), 2),
      "KPI Weight": k.weight, Score: num(calculatedScore(k.target, k.actual), 2),
      "Evidence Report": "1 file", Remarks: k.remarks, "KPI Status": k.status, "Approval Person": nameOf(users, k.approverId),
    }));
    download(`performance-${periodLabel}.csv`, toCSV(rows), "text/csv");
  }

  return (
    <div>
      <PageHeader title="Performance Summary" subtitle="Monthly, quarterly and yearly performance with KPI bar charts." action={
        <button className="btn-secondary btn-sm" onClick={exportCsv} disabled={!period.length}><Download className="h-3.5 w-3.5" /> Export CSV</button>
      } />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-auto"><Tabs tabs={[{ id: "MONTHLY", label: "Monthly" }, { id: "QUARTERLY", label: "Quarterly" }, { id: "YEARLY", label: "Yearly" }]} active={gran} onChange={(id) => setGran(id as Gran)} /></div>
        <select className="input max-w-[160px]" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m)}</option>)}
        </select>
        <select className="input max-w-[120px]" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricTile label="Total KPI Score" value={num(totalScore, 1)} />
        <MetricTile label="Average Achievement" value={`${num(avgAch, 1)}%`} />
        <MetricTile label="Previous KPI Score" value={num(prevTotal, 1)} />
        <MetricTile label="Difference" value={`${diff > 0 ? "+" : ""}${num(diff, 1)}`} hint={`${Math.abs(diff).toFixed(1)} ${dirWord} the ${prevLabel}`} />
        <MetricTile label="Approved KPIs" value={`${approved}/${period.length}`} />
      </div>

      {!period.length ? (
        <Card className="card-pad text-center text-sm text-ink-500">No KPIs for {periodLabel}. Choose another period.</Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {[["Monthly", COLORS[0]], ["Quarterly", COLORS[1]], ["Yearly", COLORS[2]]].map(([label, color]) => (
            <Card key={label}>
              <CardHeader title={`${label} KPI`} />
              <div className="h-56 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]} fill={color as string}>
                      {chartData.map((_, i) => <Cell key={i} fill={color as string} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-5">
        <CardHeader title="KPI Performance Records" subtitle={`${periodLabel} · ${period.length} records`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-ink-50/60"><tr>
              {["KPI", "Target", "Actual", "Achievement", "KPI Weight", "Score", "Evidence Report", "Remarks", "KPI Status", "Approval Person"].map((h) => <th key={h} className="th">{h}</th>)}
            </tr></thead>
            <tbody>
              {period.map((k) => (
                <tr key={k.id} className="border-b border-ink-50 last:border-0">
                  <td className="td font-medium text-ink-800">{k.name}</td>
                  <td className="td num text-right">{num(k.target, 0)}</td>
                  <td className="td num text-right">{num(k.actual, 0)}</td>
                  <td className="td num text-right">{num(achievement(k.target, k.actual), 2)}%</td>
                  <td className="td num text-right">{k.weight}%</td>
                  <td className="td num text-right font-semibold text-brand-600">{num(calculatedScore(k.target, k.actual), 2)}</td>
                  <td className="td"><span className="inline-flex items-center gap-1 text-xs text-ink-500"><FileText className="h-3.5 w-3.5" /> 1 file</span></td>
                  <td className="td max-w-[200px] truncate text-xs text-ink-500" title={k.remarks}>{k.remarks || "—"}</td>
                  <td className="td"><KpiStatusBadge status={k.status} /></td>
                  <td className="td text-sm">{nameOf(users, k.approverId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function MetricTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card card-pad">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="num mt-2 text-2xl font-bold text-ink-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}
