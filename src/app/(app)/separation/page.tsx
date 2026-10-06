"use client";

import { CheckCircle2, Circle, DoorOpen } from "lucide-react";
import { useStore } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Badge, StatCard } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { bdt, formatDate } from "@/lib/utils";
import type { SeparationRequest } from "@/lib/types";

const FLOW: SeparationRequest["status"][] = ["PENDING", "CLEARANCE", "SETTLED", "RELEASED"];
const LABEL: Record<string, string> = { PENDING: "Applied", CLEARANCE: "Clearance", SETTLED: "F&F Settled", RELEASED: "Released", REJECTED: "Rejected" };

export default function SeparationPage() {
  const users = useStore((s) => s.users);
  const separations = useStore((s) => s.separations);
  const advance = useStore((s) => s.advanceSeparation);
  const toggle = useStore((s) => s.toggleClearance);
  const { push } = useToast();

  return (
    <div>
      <PageHeader title="Separation & Offboarding" subtitle="Resignations, clearance, final settlement and release." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="In process" value={separations.filter((s) => s.status !== "RELEASED").length} tone="amber" icon={<DoorOpen className="h-5 w-5" />} />
        <StatCard label="F&F settled" value={separations.filter((s) => s.status === "SETTLED" || s.status === "RELEASED").length} tone="blue" />
        <StatCard label="Released" value={separations.filter((s) => s.status === "RELEASED").length} tone="green" />
      </div>

      <div className="space-y-4">
        {separations.map((s) => {
          const idx = FLOW.indexOf(s.status);
          const clearedCount = s.clearance.filter((c) => c.cleared).length;
          return (
            <Card key={s.id}>
              <CardHeader title={`${nameOf(users, s.userId)} — ${s.type}`} subtitle={`Requested ${formatDate(s.createdAt)} · last working day ${formatDate(s.lastWorkingDate)}`}
                action={<div className="flex flex-wrap gap-2">{FLOW.map((st, i) => <Badge key={st} tone={i < idx ? "green" : i === idx ? "amber" : "neutral"}>{LABEL[st]}</Badge>)}</div>} />
              <div className="grid gap-4 p-5 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Clearance checklist ({clearedCount}/{s.clearance.length})</p>
                  <ul className="space-y-1.5">
                    {s.clearance.map((c) => (
                      <li key={c.department}>
                        <button className="flex w-full items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-left text-sm hover:bg-ink-50" onClick={() => { toggle(s.id, c.department); }}>
                          {c.cleared ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-ink-300" />}
                          <span className={c.cleared ? "text-ink-700" : "text-ink-500"}>{c.department} clearance</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Reason</p>
                  <p className="mt-1 text-sm text-ink-600">{s.reason}</p>
                  {s.settlementAmount ? <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Final settlement</p> : null}
                  {s.settlementAmount ? <p className="num mt-1 text-lg font-bold text-ink-900">{bdt(s.settlementAmount)}</p> : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.status !== "RELEASED" ? (
                      <button className="btn-primary btn-sm" onClick={() => { advance(s.id, FLOW[Math.min(idx + 1, FLOW.length - 1)]); push("success", "Separation advanced."); }}>
                        Advance → {LABEL[FLOW[Math.min(idx + 1, FLOW.length - 1)]]}
                      </button>
                    ) : <Badge tone="green">Employee released</Badge>}
                    {s.status !== "RELEASED" ? <button className="btn-secondary btn-sm" onClick={() => { advance(s.id, "REJECTED"); push("success", "Separation rejected."); }}>Reject</button> : null}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {!separations.length ? <Card className="card-pad text-center text-sm text-ink-500">No separations in process.</Card> : null}
      </div>
    </div>
  );
}
