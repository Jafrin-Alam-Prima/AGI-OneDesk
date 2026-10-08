"use client";

import { Fragment, useMemo, useState } from "react";
import { AlertTriangle, ShieldCheck, CalendarClock, Flag, ChevronDown, Sparkles } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { deptName } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { attritionRisk } from "@/lib/ai";
import { cn } from "@/lib/utils";

const BAND_TONE = { HIGH: "red", MEDIUM: "amber", LOW: "green" } as const;

export default function AttritionPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const kpis = useStore((s) => s.kpis);
  const departments = useStore((s) => s.departments);
  const { push } = useToast();
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<string | null>(null);

  const scope = useMemo(() => {
    const staff = users.filter((u) => u.status === "ACTIVE" && u.role !== "SUPER_ADMIN");
    if (me?.role === "DEPT_HEAD") return staff.filter((u) => u.departmentId === me.departmentId);
    return staff;
  }, [users, me]);

  const scored = useMemo(
    () => scope.map((u) => ({ u, r: attritionRisk(u, kpis) })).sort((a, b) => b.r.score - a.r.score),
    [scope, kpis]
  );

  const high = scored.filter((s) => s.r.band === "HIGH").length;

  return (
    <div>
      <PageHeader
        title="AI — Attrition Prediction"
        subtitle="Explainable risk score per employee. AI suggests; a human decides. No automatic adverse action."
        action={<Badge tone="brand"><Sparkles className="mr-1 h-3 w-3" /> Simulated AI</Badge>}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <span className="chip bg-red-100 text-red-700">{high} high risk</span>
        <span className="chip bg-ink-100 text-ink-600">{scored.length} employees analysed</span>
        <span className="chip bg-emerald-100 text-emerald-700">{Object.values(flagged).filter(Boolean).length} flagged for review</span>
      </div>

      <Card>
        <CardHeader title="Risk register" subtitle="Top-3 contributing factors shown; open a row for the full explanation." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-ink-50/60"><tr>
              <th className="th">Employee</th><th className="th">Department</th><th className="th text-right">Risk</th>
              <th className="th">Band</th><th className="th">Top factors</th><th className="th text-right">Actions</th>
            </tr></thead>
            <tbody>
              {scored.map(({ u, r }) => (
                <Fragment key={u.id}>
                  <tr className="border-b border-ink-50">
                    <td className="td font-medium text-ink-800">{u.fullName}<span className="ml-2 text-xs text-ink-400">{u.designation}</span></td>
                    <td className="td text-sm text-ink-500">{deptName({ departments }, u.departmentId)}</td>
                    <td className="td num text-right font-semibold">{r.score}</td>
                    <td className="td"><Badge tone={BAND_TONE[r.band]}>{r.band}</Badge></td>
                    <td className="td text-sm text-ink-600">{r.factors.filter((f) => f.impact > 0).slice(0, 3).map((f) => f.label).join(", ") || "—"}</td>
                    <td className="td">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className={cn("btn-secondary btn-sm", flagged[u.id] && "border-brand-300 bg-brand-50 text-brand-700")} onClick={() => { setFlagged((f) => ({ ...f, [u.id]: !f[u.id] })); push("success", flagged[u.id] ? "Flag removed." : `Flagged ${u.fullName} for HR review.`); }}>
                          <Flag className="h-3.5 w-3.5" /> {flagged[u.id] ? "Flagged" : "Flag"}
                        </button>
                        <button className="btn-secondary btn-sm" onClick={() => push("info", `1:1 scheduled with ${u.fullName} (demo).`)}><CalendarClock className="h-3.5 w-3.5" /> 1:1</button>
                        <button className="btn-secondary btn-sm" onClick={() => setOpen(open === u.id ? null : u.id)}><ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open === u.id && "rotate-180")} /> Why</button>
                      </div>
                    </td>
                  </tr>
                  {open === u.id ? (
                    <tr key={`${u.id}-why`} className="border-b border-ink-50 bg-ink-50/40">
                      <td colSpan={6} className="td">
                        <div className="rounded-lg border border-ink-200 bg-white p-3">
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-800"><AlertTriangle className="h-4 w-4 text-amber-500" /> Why this score</p>
                          <p className="mt-1 text-sm text-ink-600">{r.why}</p>
                          <ul className="mt-2 space-y-1 text-xs text-ink-500">
                            {r.factors.map((f) => <li key={f.label}>• {f.label}: +{f.impact} — {f.detail}</li>)}
                          </ul>
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Human-in-the-loop: this is a recommendation only. Flag/Schedule are recorded as human actions.</p>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
