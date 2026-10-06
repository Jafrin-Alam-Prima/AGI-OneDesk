"use client";

import Link from "next/link";
import { Clock, Eye } from "lucide-react";
import { KpiStatusBadge } from "@/components/ui/primitives";
import { Tracker } from "./tracker";
import { achievement, calculatedScore } from "@/lib/calc";
import { monthName, num } from "@/lib/utils";
import type { Kpi } from "@/lib/types";

function timeRemaining(k: Kpi): string {
  const end = new Date(k.periodYear, k.periodMonth, 0, 23, 59);
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return "Period closed";
  const days = Math.ceil(diff / 86400000);
  if (days > 45) return `${Math.ceil(days / 30)} months remaining`;
  return `${days} day${days === 1 ? "" : "s"} remaining`;
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const ach = achievement(kpi.target, kpi.actual);
  const score = calculatedScore(kpi.target, kpi.actual);
  return (
    <div className="flex h-full flex-col rounded-xl border border-ink-200 bg-white p-4 shadow-card transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold text-ink-900" title={kpi.name}>{kpi.name}</p>
        <KpiStatusBadge status={kpi.status} />
      </div>
      <p className="mt-1 text-xs text-ink-500">
        {kpi.category === "PROJECT" ? "Project KPI" : "People & Culture"} · Weight {kpi.weight}%
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-ink-50 px-3 py-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-400">Target</p>
          <p className="num text-sm font-semibold text-ink-800">{num(kpi.target, kpi.target % 1 ? 2 : 0)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-400">Actual</p>
          <p className="num text-sm font-semibold text-ink-800">{num(kpi.actual, kpi.actual % 1 ? 2 : 0)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-400">Score</p>
          <p className="num text-sm font-semibold text-brand-600">{kpi.status === "DRAFT" ? "—" : num(score, 0)}</p>
        </div>
      </div>

      <div className="mt-3">
        <Tracker status={kpi.status} />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
        <Clock className="h-3.5 w-3.5" /> {timeRemaining(kpi)}
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
        <span className="text-[11px] text-ink-400">{monthName(kpi.periodMonth)} {kpi.periodYear} · {num(ach, 0)}% achievement</span>
        <Link href={`/my-kpi/${kpi.id}`} className="btn-secondary btn-sm">
          <Eye className="h-3.5 w-3.5" /> View Details
        </Link>
      </div>
    </div>
  );
}
