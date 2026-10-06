"use client";

import { useState } from "react";
import { CheckCircle2, Undo2, XCircle, SlidersHorizontal, Pencil, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/modal";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store";
import { KpiDetailView } from "./kpi-detail";
import type { Kpi } from "@/lib/types";

type Action = "APPROVE" | "ADJUST" | "RETURN" | "REJECT" | "EDIT" | "DELETE" | null;

export function ReviewDrawer({
  kpi, open, onClose, canDecide,
}: { kpi: Kpi | null; open: boolean; onClose: () => void; canDecide: boolean }) {
  const { push } = useToast();
  const decideKpi = useStore((s) => s.decideKpi);
  const adjustKpi = useStore((s) => s.adjustKpi);
  const updateKpi = useStore((s) => s.updateKpi);
  const deleteKpi = useStore((s) => s.deleteKpi);

  const [action, setAction] = useState<Action>(null);
  const [reason, setReason] = useState("");
  const [adj, setAdj] = useState({ target: kpi?.target ?? 0, actual: kpi?.actual ?? 0, weight: kpi?.weight ?? 0, score: "" });

  if (!kpi) return null;

  function reset() { setAction(null); setReason(""); }

  function run() {
    if (!kpi) return;
    if (action === "APPROVE") { decideKpi(kpi.id, "APPROVE", ""); push("success", kpi.stage === "AUDIT" || kpi.stage === "FINANCE" ? "KPI completed and approved." : "KPI approved and advanced to the next stage."); }
    if (action === "ADJUST") { adjustKpi(kpi.id, { target: adj.target, actual: adj.actual, weight: adj.weight }, reason); push("success", "Adjustment applied and approved. The employee sees the change and its reason."); }
    if (action === "RETURN") { decideKpi(kpi.id, "RETURN", reason); push("success", "KPI returned to the employee for correction."); }
    if (action === "REJECT") { decideKpi(kpi.id, "REJECT", reason); push("success", "KPI rejected."); }
    if (action === "EDIT") { updateKpi(kpi.id, { remarks: reason }, "Reviewer edit"); push("success", "Request updated."); }
    if (action === "DELETE") { deleteKpi(kpi.id, reason); push("success", "Request deleted and retained in version history."); }
    reset();
    onClose();
  }

  const needsReason = action && action !== "APPROVE";
  const reasonOk = !needsReason || reason.trim().length >= 3;

  return (
    <Drawer
      open={open}
      onClose={() => { reset(); onClose(); }}
      width="max-w-2xl"
      title={`Review request — ${kpi.name}`}
      subtitle="Check target, actual, evidence and the calculation before deciding."
      footer={
        canDecide ? (
          action ? (
            <>
              <button className="btn-secondary" onClick={reset}>Back</button>
              <button className="btn-primary" disabled={!reasonOk} onClick={run}>Confirm {action.toLowerCase()}</button>
            </>
          ) : null
        ) : (
          <span className="text-sm text-ink-500">You are viewing this request in read-only mode.</span>
        )
      }
    >
      {canDecide && !action ? (
        <div className="mb-4 flex flex-wrap gap-2 rounded-lg border border-ink-200 bg-ink-50 p-3">
          <button className="btn-primary btn-sm" onClick={() => setAction("APPROVE")}><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
          <button className="btn-secondary btn-sm" onClick={() => { setAdj({ target: kpi.target, actual: kpi.actual, weight: kpi.weight, score: "" }); setAction("ADJUST"); }}><SlidersHorizontal className="h-3.5 w-3.5" /> Apply Adjustment</button>
          <button className="btn-secondary btn-sm" onClick={() => setAction("RETURN")}><Undo2 className="h-3.5 w-3.5" /> Return to Employee</button>
          <button className="btn-secondary btn-sm" onClick={() => setAction("REJECT")}><XCircle className="h-3.5 w-3.5" /> Reject</button>
          <span className="mx-1 hidden w-px bg-ink-200 sm:block" />
          <button className="btn-ghost btn-sm" onClick={() => setAction("EDIT")}><Pencil className="h-3.5 w-3.5" /> Edit / Update</button>
          <button className="btn-ghost btn-sm text-red-600" onClick={() => setAction("DELETE")}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
        </div>
      ) : null}

      {action === "ADJUST" ? (
        <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50/40 p-4">
          <p className="mb-3 text-sm font-semibold text-ink-800">Adjust values and approve</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Target"><TextInput type="number" value={adj.target} onChange={(e) => setAdj({ ...adj, target: Number(e.target.value) })} /></Field>
            <Field label="Actual"><TextInput type="number" value={adj.actual} onChange={(e) => setAdj({ ...adj, actual: Number(e.target.value) })} /></Field>
            <Field label="KPI Weight (%)"><TextInput type="number" value={adj.weight} onChange={(e) => setAdj({ ...adj, weight: Number(e.target.value) })} /></Field>
          </div>
        </div>
      ) : null}

      {action === "EDIT" ? (
        <div className="mb-4 rounded-lg border border-ink-200 bg-ink-50 p-4">
          <Field label="Updated remarks / notes"><TextArea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        </div>
      ) : null}

      {needsReason && action !== "EDIT" ? (
        <div className="mb-4">
          <Field label={action === "DELETE" ? "Reason for deletion (required)" : action === "ADJUST" ? "Reason for adjustment (required)" : action === "RETURN" ? "Remarks for the employee (required)" : "Reason for rejection (required)"}>
            <TextArea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain your decision — this is recorded in the audit trail and shown to the employee." />
          </Field>
        </div>
      ) : null}

      <KpiDetailView kpi={kpi} />
    </Drawer>
  );
}
