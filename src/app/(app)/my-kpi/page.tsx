"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Target, Search, Upload, PenLine, Info } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { PageHeader } from "@/components/ui/primitives";
import { canEditKpiDefinition } from "@/lib/navigation";
import { KpiCard } from "@/components/kpi/kpi-card";
import { TextInput } from "@/components/ui/field";

export default function MyKpiPage() {
  const me = useCurrentUser();
  const kpis = useStore((s) => s.kpis);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [onlyPending, setOnlyPending] = useState(false);

  const mine = useMemo(() => {
    if (!me) return [];
    return kpis
      .filter((k) => !k.deleted && k.ownerId === me.id)
      .sort((a, b) => (b.periodYear - a.periodYear) || (b.periodMonth - a.periodMonth));
  }, [kpis, me]);

  const needsInput = useMemo(() => mine.filter((k) => k.target === 0 && k.actual === 0 && k.status !== "DRAFT"), [mine]);

  const counts = {
    draft: mine.filter((k) => k.status === "DRAFT").length,
    review: mine.filter((k) => k.status === "SUBMITTED").length,
    approved: mine.filter((k) => ["APPROVED", "ADJUSTED", "COMPLETED"].includes(k.status)).length,
    returned: mine.filter((k) => k.status === "RETURNED").length,
  };

  const filtered = (onlyPending ? needsInput : mine).filter((k) => {
    if (status !== "ALL" && k.status !== status) return false;
    if (q && !k.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const canCreate = canEditKpiDefinition(me?.role);

  return (
    <div>
      <PageHeader
        title="My KPI"
        subtitle={canCreate
          ? `${counts.draft} draft · ${counts.review} in review · ${counts.approved} approved · ${counts.returned} returned for correction`
          : `${needsInput.length} awaiting your input · ${counts.review} in review · ${counts.approved} approved · ${counts.returned} returned`}
        action={
          canCreate ? (
            <div className="flex items-center gap-2">
              <Link href="/my-kpi/bulk" className="btn-secondary"><Upload className="h-4 w-4" /> Bulk Upload</Link>
              <Link href="/my-kpi/create" className="btn-primary"><Plus className="h-4 w-4" /> Create KPI</Link>
            </div>
          ) : (
            <button className={onlyPending ? "btn-secondary" : "btn-primary"} onClick={() => setOnlyPending((v) => !v)}>
              <PenLine className="h-4 w-4" /> {onlyPending ? "Show all KPIs" : `Input KPI (${needsInput.length})`}
            </button>
          )
        }
      />

      {!canCreate && needsInput.length ? (
        <p className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> You have {needsInput.length} KPI{needsInput.length === 1 ? "" : "s"} awaiting your input. Open a KPI and add your Benchmark, Target, Achievement and other details.
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <TextInput className="pl-9" placeholder="Search my KPIs…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="RETURNED">Returned</option>
          <option value="APPROVED">Approved</option>
          <option value="ADJUSTED">Adjusted</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-700">KPI cards</h3>
          <p className="text-xs text-ink-400">{filtered.length} shown · newest month first</p>
        </div>

        <div className="grid max-h-[62vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
          {canCreate && status === "ALL" && !q ? (
            <Link
              href="/my-kpi/create"
              className="flex min-h-[230px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50 sm:order-last xl:order-last"
            >
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
                <Plus className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-brand-700">Create KPI</span>
              <span className="mt-1 max-w-[200px] text-xs text-ink-500">Add one or more KPIs for the period and Save to send them for approval.</span>
            </Link>
          ) : null}

          {filtered.map((k) => <KpiCard key={k.id} kpi={k} />)}

          {!filtered.length ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <Target className="mb-3 h-8 w-8 text-ink-300" />
              <p className="text-sm font-semibold text-ink-700">No KPIs match your filters</p>
              <p className="mt-1 text-sm text-ink-500">{canCreate ? "Create your first KPI to get started." : onlyPending ? "Nothing left to input — all caught up." : "Nothing to show."}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
