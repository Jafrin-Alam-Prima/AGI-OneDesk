"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, Search } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { pendingFor, canDecideKpi, kpisVisibleTo } from "@/lib/selectors";
import { PageHeader, StatCard, KpiStatusBadge } from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/data-table";
import { TextInput } from "@/components/ui/field";
import { ReviewDrawer } from "@/components/kpi/review-drawer";
import { achievement } from "@/lib/calc";
import { monthName, num } from "@/lib/utils";
import type { Kpi } from "@/lib/types";

export default function KpiRequestsPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const [selected, setSelected] = useState<Kpi | null>(null);
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState("ALL");

  const kpisAll = useStore((s) => s.kpis);
  const pending = useMemo(() => pendingFor(useStore.getState(), me), [me, kpisAll, users]);
  const all = useMemo(() => kpisVisibleTo(useStore.getState(), me), [me, kpisAll, users]);

  const filtered = useMemo(() => {
    return pending.filter((k) => {
      const owner = users.find((u) => u.id === k.ownerId);
      if (q && !(k.name.toLowerCase().includes(q.toLowerCase()) || owner?.fullName.toLowerCase().includes(q.toLowerCase()) || owner?.employeeId.toLowerCase().includes(q.toLowerCase()))) return false;
      if (period !== "ALL" && String(k.periodMonth) !== period) return false;
      return true;
    });
  }, [pending, q, period, users]);

  const columns: Column<Kpi>[] = [
    { key: "name", header: "KPI", sortable: true, render: (k) => <span className="font-medium text-ink-800">{k.name}</span> },
    { key: "ownerId", header: "Employee", render: (k) => { const o = users.find((u) => u.id === k.ownerId); return <span><span className="block text-ink-800">{o?.fullName}</span><span className="num text-xs text-ink-400">{o?.employeeId}</span></span>; }, value: (k) => users.find((u) => u.id === k.ownerId)?.fullName ?? "" },
    { key: "weight", header: "Weight", align: "right", sortable: true, render: (k) => <span className="num">{k.weight}%</span> },
    { key: "target", header: "Target", align: "right", render: (k) => <span className="num">{num(k.target, 0)}</span> },
    { key: "actual", header: "Actual", align: "right", render: (k) => <span className="num">{num(k.actual, 0)}</span> },
    { key: "ach", header: "Achievement", align: "right", render: (k) => <span className="num font-medium text-brand-600">{num(achievement(k.target, k.actual), 1)}%</span> },
    { key: "period", header: "Period", render: (k) => `${monthName(k.periodMonth)} ${k.periodYear}` },
    { key: "stage", header: "Stage" },
    { key: "status", header: "Status", render: (k) => <KpiStatusBadge status={k.status} /> },
  ];

  if (!me) return null;
  const isDecider = ["DEPT_HEAD", "HR_ADMIN", "FINANCE_ADMIN", "AUDIT_ADMIN", "SUPER_ADMIN"].includes(me.role);

  return (
    <div>
      <PageHeader
        title="KPI Requests"
        subtitle="Pending KPI submissions awaiting your review, oldest first."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending my review" value={pending.length} tone="amber" icon={<ClipboardCheck className="h-5 w-5" />} />
        <StatCard label="Approved" value={all.filter((k) => ["APPROVED", "ADJUSTED", "COMPLETED"].includes(k.status)).length} tone="green" />
        <StatCard label="Returned / Rejected" value={all.filter((k) => ["RETURNED", "REJECTED"].includes(k.status)).length} tone="red" />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        searchKeys={(k) => { const o = users.find((u) => u.id === k.ownerId); return `${k.name} ${o?.fullName} ${o?.employeeId}`; }}
        searchPlaceholder="Search by Employee Name or Employee ID…"
        onRowClick={(k) => setSelected(k)}
        emptyTitle="No pending requests"
        emptyMessage="When employees submit KPIs, they appear here for review."
        toolbar={
          <select className="input max-w-[180px]" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="ALL">All periods</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={String(m)}>{monthName(m)}</option>)}
          </select>
        }
      />

      <ReviewDrawer kpi={selected} open={!!selected} onClose={() => setSelected(null)} canDecide={selected ? canDecideKpi(useStore.getState(), me, selected) && isDecider : false} />
    </div>
  );
}
