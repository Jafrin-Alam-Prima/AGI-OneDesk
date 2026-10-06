"use client";

import { useMemo, useState } from "react";
import { History, GitCompare } from "lucide-react";
import { useStore } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { PageHeader, Card, CardHeader, Badge, EmptyState } from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/data-table";
import { formatDateTime, num } from "@/lib/utils";
import type { Kpi } from "@/lib/types";

export default function VersionsPage() {
  const kpis = useStore((s) => s.kpis);
  const users = useStore((s) => s.users);
  const versions = useStore((s) => s.kpiVersions);
  const [selected, setSelected] = useState<Kpi | null>(null);

  const withVersions = useMemo(() => kpis.filter((k) => versions.some((v) => v.kpiId === k.id)), [kpis, versions]);

  const cols: Column<Kpi>[] = [
    { key: "code", header: "Code", render: (k) => <span className="num text-xs">{k.code}</span> },
    { key: "name", header: "KPI", sortable: true },
    { key: "ownerId", header: "Owner", render: (k) => nameOf(users, k.ownerId), value: (k) => nameOf(users, k.ownerId) },
    { key: "status", header: "Status", render: (k) => <Badge tone="neutral">{k.status}</Badge> },
    { key: "versions", header: "Versions", align: "right", render: (k) => <span className="num">{versions.filter((v) => v.kpiId === k.id).length}</span> },
    { key: "updatedAt", header: "Last change", render: (k) => <span className="text-xs text-ink-500">{formatDateTime(k.updatedAt)}</span> },
  ];

  const kver = selected ? versions.filter((v) => v.kpiId === selected.id).sort((a, b) => a.versionNo - b.versionNo) : [];

  return (
    <div>
      <PageHeader title="Version Control & History" subtitle="Every version of a KPI is retained. Compare what changed, who changed it and why." />

      {!selected ? (
        <DataTable columns={cols} rows={withVersions} searchKeys={["name", "code"]} searchPlaceholder="Find a KPI by name or code…" onRowClick={(k) => setSelected(k)} emptyTitle="No versioned KPIs" pageSize={12} />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <button className="btn-ghost btn-sm" onClick={() => setSelected(null)}>← Back to all KPIs</button>
            <Badge tone="brand">{selected.code}</Badge>
          </div>
          <Card>
            <CardHeader title={selected.name} subtitle={`${kver.length} version(s) · owner ${nameOf(users, selected.ownerId)}`} action={<History className="h-4 w-4 text-ink-400" />} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="bg-ink-50/60"><tr><th className="th">Ver</th><th className="th">Changed fields</th><th className="th">Old → New</th><th className="th">By</th><th className="th">When</th><th className="th">Reason</th></tr></thead>
                <tbody>
                  {kver.map((v) => (
                    <tr key={v.id} className="border-b border-ink-50 last:border-0">
                      <td className="td num">v{v.versionNo}</td>
                      <td className="td">{v.changedFields.map((f) => <Badge key={f} tone="neutral" className="mr-1">{f}</Badge>)}</td>
                      <td className="td num text-xs">
                        {v.changedFields.map((f) => <div key={f}>{f}: <span className="text-ink-400">{fmt(v.oldValues[f])}</span> → <span className="font-medium text-ink-800">{fmt(v.newValues[f])}</span></div>)}
                      </td>
                      <td className="td">{nameOf(users, v.changedBy)}</td>
                      <td className="td text-xs text-ink-500">{formatDateTime(v.changedAt)}</td>
                      <td className="td text-xs text-ink-500">{v.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {kver.length >= 2 ? (
            <Card className="mt-4">
              <CardHeader title="Side-by-side comparison" subtitle={`v${kver[0].versionNo} vs v${kver[kver.length - 1].versionNo}`} action={<GitCompare className="h-4 w-4 text-ink-400" />} />
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <VersionSnapshot title={`Version v${kver[0].versionNo}`} values={kver[0].newValues} />
                <VersionSnapshot title={`Version v${kver[kver.length - 1].versionNo}`} values={kver[kver.length - 1].newValues} />
              </div>
              <p className="px-5 pb-5 text-xs text-ink-400">Current KPI: Target {num(selected.target, 0)} · Actual {num(selected.actual, 0)} · Weight {selected.weight}% · Status {selected.status}.</p>
            </Card>
          ) : null}
        </>
      )}

      {!withVersions.length && !selected ? <EmptyState title="No versioned KPIs" message="Submit a KPI to begin building version history." /> : null}
    </div>
  );
}

function fmt(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function VersionSnapshot({ title, values }: { title: string; values: Record<string, unknown> }) {
  return (
    <div className="rounded-lg border border-ink-200 p-4">
      <p className="mb-2 text-sm font-semibold text-ink-700">{title}</p>
      <dl className="space-y-1">
        {Object.entries(values).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 text-sm"><dt className="text-ink-400">{k}</dt><dd className="num text-ink-800">{fmt(v)}</dd></div>
        ))}
      </dl>
    </div>
  );
}
