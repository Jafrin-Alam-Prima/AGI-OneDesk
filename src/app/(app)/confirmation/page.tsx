"use client";

import { useStore } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { ConfirmationRecord } from "@/lib/types";

const FLOW: ConfirmationRecord["status"][] = ["ELIGIBLE", "SUPERVISOR_REVIEW", "HR_ACCEPTANCE", "CONFIRMED"];
const LABEL: Record<string, string> = { ELIGIBLE: "Eligible", SUPERVISOR_REVIEW: "Supervisor Review", HR_ACCEPTANCE: "HR Acceptance", CONFIRMED: "Confirmed" };

export default function ConfirmationPage() {
  const users = useStore((s) => s.users);
  const records = useStore((s) => s.confirmations);
  const advance = useStore((s) => s.advanceConfirmation);
  const { push } = useToast();

  return (
    <div>
      <PageHeader title="Employee Confirmation" subtitle="Probation confirmation: eligibility → supervisor review → HR acceptance → confirmed." />

      <Card>
        <CardHeader title="Confirmation pipeline" subtitle={`${records.length} employees in process`} />
        <div className="divide-y divide-ink-100">
          {records.map((r) => {
            const idx = FLOW.indexOf(r.status);
            return (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink-800">{nameOf(users, r.userId)}</p>
                  <p className="text-xs text-ink-500">Due {formatDate(r.dueDate)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {FLOW.map((st, i) => (
                    <span key={st} className="flex items-center gap-1">
                      <Badge tone={i < idx ? "green" : i === idx ? "amber" : "neutral"}>{LABEL[st]}</Badge>
                    </span>
                  ))}
                </div>
                {r.status !== "CONFIRMED" ? (
                  <button className="btn-primary btn-sm" onClick={() => { advance(r.id, FLOW[idx + 1]); push("success", `Advanced to ${LABEL[FLOW[idx + 1]]}.`); }}>Advance → {LABEL[FLOW[idx + 1]]}</button>
                ) : <Badge tone="green">Completed</Badge>}
              </div>
            );
          })}
          {!records.length ? <p className="px-5 py-4 text-sm text-ink-500">No employees in the confirmation pipeline.</p> : null}
        </div>
      </Card>
    </div>
  );
}
