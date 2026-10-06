"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Inbox, Target } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { pendingFor } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Tabs, StatCard, Badge, RequestStatusBadge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, TextArea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { bdt, formatDate, monthName } from "@/lib/utils";

interface ApprItem {
  id: string;
  type: string;
  requesterId: string;
  summary: string;
  detail: string;
  amount?: number;
  date?: string;
  link?: string;
  onApprove: () => void;
  onReject: (note: string) => void;
  onReturn?: (note: string) => void;
}

export default function ApprovalsPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const s = useStore;
  const { push } = useToast();
  const [tab, setTab] = useState("PENDING");
  const [rejecting, setRejecting] = useState<ApprItem | null>(null);
  const [note, setNote] = useState("");

  const leaveApps = useStore((st) => st.leaveApplications);
  const movements = useStore((st) => st.movementApplications);
  const regularizations = useStore((st) => st.regularizations);
  const loans = useStore((st) => st.loans);
  const ious = useStore((st) => st.ious);
  const expenses = useStore((st) => st.expenses);
  const transfers = useStore((st) => st.transfers);
  const separations = useStore((st) => st.separations);

  const decideLeave = useStore((st) => st.decideLeave);
  const decideMovement = useStore((st) => st.decideMovement);
  const decideReg = useStore((st) => st.decideRegularization);
  const decideLoan = useStore((st) => st.decideLoan);
  const decideIou = useStore((st) => st.decideIou);
  const decideExpense = useStore((st) => st.decideExpense);
  const decideTransfer = useStore((st) => st.decideTransfer);

  const kpisForPending = useStore((st) => st.kpis);
  const kpiPending = useMemo(() => pendingFor(useStore.getState(), me), [me, kpisForPending]);

  const nameOf = (id: string) => users.find((u) => u.id === id)?.fullName ?? "—";

  const items: ApprItem[] = useMemo(() => {
    void s;
    const list: ApprItem[] = [];
    for (const l of leaveApps.filter((x) => x.status === "PENDING")) list.push({
      id: l.id, type: "Leave", requesterId: l.userId, summary: `${l.days} day leave`, detail: `${formatDate(l.fromDate)} → ${formatDate(l.toDate)} · ${l.reason}`, date: l.createdAt,
      onApprove: () => decideLeave(l.id, "APPROVED", "Approved"), onReject: (n) => decideLeave(l.id, "REJECTED", n),
    });
    for (const m of movements.filter((x) => x.status === "PENDING")) list.push({
      id: m.id, type: "Movement", requesterId: m.userId, summary: `Movement to ${m.location}`, detail: `${formatDate(m.date)} · ${m.purpose}`, date: m.createdAt,
      onApprove: () => decideMovement(m.id, "APPROVED", "Approved"), onReject: (n) => decideMovement(m.id, "REJECTED", n),
    });
    for (const r of regularizations.filter((x) => x.status === "PENDING")) list.push({
      id: r.id, type: "Regularization", requesterId: r.userId, summary: `Regularization for ${formatDate(r.date)}`, detail: r.reason, date: r.createdAt,
      onApprove: () => decideReg(r.id, "APPROVED", "Approved"), onReject: (n) => decideReg(r.id, "REJECTED", n),
    });
    for (const l of loans.filter((x) => x.status === "PENDING")) list.push({
      id: l.id, type: "Loan", requesterId: l.userId, summary: `${l.loanType}`, detail: `${l.installments} instalments · ${l.reason}`, amount: l.amount, date: l.createdAt,
      onApprove: () => decideLoan(l.id, "APPROVED", "Approved"), onReject: (n) => decideLoan(l.id, "REJECTED", n),
    });
    for (const i of ious.filter((x) => x.status === "PENDING")) list.push({
      id: i.id, type: "IOU / Advance", requesterId: i.userId, summary: "Advance request", detail: i.purpose, amount: i.amount, date: i.createdAt,
      onApprove: () => decideIou(i.id, "APPROVED", "Approved"), onReject: (n) => decideIou(i.id, "REJECTED", n),
    });
    for (const e of expenses.filter((x) => x.status === "PENDING")) list.push({
      id: e.id, type: "Expense", requesterId: e.userId, summary: `${e.expenseType} claim`, detail: `${formatDate(e.date)} · ${e.description}`, amount: e.amount, date: e.createdAt,
      onApprove: () => decideExpense(e.id, "APPROVED", "Approved"), onReject: (n) => decideExpense(e.id, "REJECTED", n),
    });
    for (const t of transfers.filter((x) => x.status === "PENDING")) list.push({
      id: t.id, type: t.type === "PROMOTION" ? "Promotion" : "Transfer", requesterId: t.userId, summary: t.newDesignation ? `Promotion to ${t.newDesignation}` : "Department transfer", detail: `${t.reason} · effective ${formatDate(t.effectiveDate)}`, date: t.createdAt,
      onApprove: () => decideTransfer(t.id, "APPROVED", "Approved"), onReject: (n) => decideTransfer(t.id, "REJECTED", n),
    });
    return list.sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? -1 : 1));
  }, [leaveApps, movements, regularizations, loans, ious, expenses, transfers, decideLeave, decideMovement, decideReg, decideLoan, decideIou, decideExpense, decideTransfer, s]);

  const decided = [
    ...leaveApps.filter((x) => x.status !== "PENDING").map((x) => ({ id: x.id, type: "Leave", requesterId: x.userId, status: x.status, summary: `${x.days} day leave`, date: x.createdAt })),
    ...loans.filter((x) => x.status !== "PENDING").map((x) => ({ id: x.id, type: "Loan", requesterId: x.userId, status: x.status, summary: x.loanType, date: x.createdAt })),
    ...expenses.filter((x) => x.status !== "PENDING").map((x) => ({ id: x.id, type: "Expense", requesterId: x.userId, status: x.status, summary: `${x.expenseType}`, date: x.createdAt })),
    ...transfers.filter((x) => x.status !== "PENDING").map((x) => ({ id: x.id, type: x.type, requesterId: x.userId, status: x.status, summary: x.reason, date: x.createdAt })),
  ];

  if (!me) return null;

  return (
    <div>
      <PageHeader title="Approval Center" subtitle="Approve leave, movement, overtime, loans, advances, expenses, transfers and KPIs — all in one place." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending business approvals" value={items.length} tone="amber" icon={<Inbox className="h-5 w-5" />} />
        <StatCard label="Pending KPI reviews" value={kpiPending.length} tone="brand" icon={<Target className="h-5 w-5" />} />
        <StatCard label="Decided (recent)" value={decided.length} tone="green" />
      </div>

      {kpiPending.length ? (
        <Card className="mb-4 border-brand-200">
          <CardHeader title="KPI requests awaiting your review" subtitle={`${kpiPending.length} pending`} action={<Link href="/kpi-requests" className="btn-primary btn-sm">Open KPI queue</Link>} />
        </Card>
      ) : null}

      <div className="mb-4"><Tabs tabs={[{ id: "PENDING", label: "Pending", count: items.length }, { id: "DECIDED", label: "Decision history", count: decided.length }]} active={tab} onChange={setTab} /></div>

      {tab === "PENDING" ? (
        items.length === 0 ? (
          <Card className="card-pad text-center text-sm text-ink-500">No pending approvals. You’re all caught up.</Card>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <Card key={it.id} className="card-pad">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone="blue">{it.type}</Badge>
                      <span className="text-sm font-semibold text-ink-800">{it.summary}</span>
                      {it.amount ? <span className="num text-sm text-ink-600">· {bdt(it.amount)}</span> : null}
                    </div>
                    <p className="mt-1 text-sm text-ink-500">{nameOf(it.requesterId)} · {it.detail}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary btn-sm" onClick={() => { it.onApprove(); push("success", `${it.type} approved.`); }}><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
                    <button className="btn-secondary btn-sm" onClick={() => { setRejecting(it); setNote(""); }}><XCircle className="h-3.5 w-3.5" /> Reject</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-ink-50/60"><tr><th className="th">Type</th><th className="th">Requester</th><th className="th">Summary</th><th className="th">Status</th><th className="th">When</th></tr></thead>
              <tbody>
                {decided.map((d) => (
                  <tr key={d.id} className="border-b border-ink-50 last:border-0">
                    <td className="td"><Badge tone="neutral">{d.type}</Badge></td>
                    <td className="td">{nameOf(d.requesterId)}</td>
                    <td className="td text-sm text-ink-600">{d.summary}</td>
                    <td className="td"><RequestStatusBadge status={d.status as "APPROVED" | "REJECTED" | "PENDING" | "RETURNED"} /></td>
                    <td className="td text-xs text-ink-400">{formatDate(d.date)}</td>
                  </tr>
                ))}
                {!decided.length ? <tr><td colSpan={5} className="td text-center text-ink-500">No decisions yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title={`Reject ${rejecting?.type ?? ""}`} size="sm"
        footer={<>
          <button className="btn-secondary" onClick={() => setRejecting(null)}>Cancel</button>
          <button className="btn-danger" disabled={note.trim().length < 3} onClick={() => { rejecting?.onReject(note); push("success", "Request rejected."); setRejecting(null); }}>Reject</button>
        </>}>
        <Field label="Reason (required)"><TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Explain the rejection — recorded in the audit trail." /></Field>
      </Modal>
    </div>
  );
}
