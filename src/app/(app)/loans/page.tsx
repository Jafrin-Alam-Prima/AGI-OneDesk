"use client";

import { useMemo, useState } from "react";
import { Plus, HandCoins } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Tabs, RequestStatusBadge, StatCard } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DataTable, type Column } from "@/components/ui/data-table";
import { bdt, formatDate } from "@/lib/utils";
import type { IouRequest, LoanRequest } from "@/lib/types";

export default function LoansPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const loans = useStore((s) => s.loans);
  const ious = useStore((s) => s.ious);
  const applyLoan = useStore((s) => s.applyLoan);
  const applyIou = useStore((s) => s.applyIou);
  const decideLoan = useStore((s) => s.decideLoan);
  const decideIou = useStore((s) => s.decideIou);
  const { push } = useToast();

  const [tab, setTab] = useState("MY");
  const [loanOpen, setLoanOpen] = useState(false);
  const [iouOpen, setIouOpen] = useState(false);
  const [lf, setLf] = useState({ loanType: "Festival Loan", amount: "", installments: "10", reason: "" });
  const [inf, setInf] = useState({ amount: "", purpose: "" });

  if (!me) return null;
  const isHead = me.role === "DEPT_HEAD" || me.role === "SUPER_ADMIN";
  const deptUserIds = new Set(users.filter((u) => u.departmentId === me.departmentId).map((u) => u.id));

  const myLoans = loans.filter((l) => l.userId === me.id);
  const myIous = ious.filter((i) => i.userId === me.id);
  const teamLoans = loans.filter((l) => deptUserIds.has(l.userId));
  const teamIous = ious.filter((i) => deptUserIds.has(i.userId));
  const pendingLoans = teamLoans.filter((l) => l.status === "PENDING");
  const pendingIous = teamIous.filter((i) => i.status === "PENDING");

  const loanCols: Column<LoanRequest>[] = [
    ...(tab === "TEAM" ? [{ key: "userId", header: "Employee", render: (l: LoanRequest) => nameOf(users, l.userId) }] : []),
    { key: "loanType", header: "Type" },
    { key: "amount", header: "Amount", align: "right", render: (l) => <span className="num">{bdt(l.amount)}</span> },
    { key: "installments", header: "Instalments", align: "right" },
    { key: "reason", header: "Reason", render: (l) => <span className="text-xs text-ink-500">{l.reason}</span> },
    { key: "status", header: "Status", render: (l) => <RequestStatusBadge status={l.status} /> },
  ];
  const iouCols: Column<IouRequest>[] = [
    ...(tab === "TEAM" ? [{ key: "userId", header: "Employee", render: (i: IouRequest) => nameOf(users, i.userId) }] : []),
    { key: "purpose", header: "Purpose" },
    { key: "amount", header: "Amount", align: "right", render: (i) => <span className="num">{bdt(i.amount)}</span> },
    { key: "createdAt", header: "Date", render: (i) => formatDate(i.createdAt) },
    { key: "status", header: "Status", render: (i) => <RequestStatusBadge status={i.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Loans & Advances" subtitle="Apply for loans and advances, and track approval and recovery."
        action={<div className="flex gap-2"><button className="btn-secondary" onClick={() => setIouOpen(true)}>Request Advance</button><button className="btn-primary" onClick={() => setLoanOpen(true)}><Plus className="h-4 w-4" /> Apply for Loan</button></div>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active loans" value={myLoans.filter((l) => l.status === "APPROVED").length} icon={<HandCoins className="h-5 w-5" />} />
        <StatCard label="Total borrowed" value={bdt(myLoans.filter((l) => l.status === "APPROVED").reduce((s, l) => s + l.amount, 0))} tone="blue" />
        <StatCard label="Pending" value={myLoans.filter((l) => l.status === "PENDING").length + myIous.filter((i) => i.status === "PENDING").length} tone="amber" />
      </div>

      {isHead ? <div className="mb-4"><Tabs tabs={[{ id: "MY", label: "My Loans & Advances" }, { id: "TEAM", label: "Department" }]} active={tab} onChange={setTab} /></div> : null}

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink-700">Loans</h3>
          <DataTable columns={loanCols} rows={tab === "TEAM" ? teamLoans : myLoans} searchKeys={["loanType", "reason"]} emptyTitle="No loans" pageSize={6} />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink-700">Advances / IOU</h3>
          <DataTable columns={iouCols} rows={tab === "TEAM" ? teamIous : myIous} searchKeys={["purpose"]} emptyTitle="No advances" pageSize={6} />
        </div>
      </div>

      {isHead && tab === "TEAM" && (pendingLoans.length || pendingIous.length) ? (
        <Card className="mt-4">
          <CardHeader title="Pending approvals" />
          <ul className="divide-y divide-ink-100">
            {pendingLoans.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div><p className="text-sm text-ink-800">{nameOf(users, l.userId)} — {l.loanType} {bdt(l.amount)}</p><p className="text-xs text-ink-500">{l.reason}</p></div>
                <div className="flex gap-2"><button className="btn-primary btn-sm" onClick={() => { decideLoan(l.id, "APPROVED", "Approved"); push("success", "Loan approved."); }}>Approve</button><button className="btn-secondary btn-sm" onClick={() => { decideLoan(l.id, "REJECTED", "Rejected"); push("success", "Loan rejected."); }}>Reject</button></div>
              </li>
            ))}
            {pendingIous.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div><p className="text-sm text-ink-800">{nameOf(users, i.userId)} — Advance {bdt(i.amount)}</p><p className="text-xs text-ink-500">{i.purpose}</p></div>
                <div className="flex gap-2"><button className="btn-primary btn-sm" onClick={() => { decideIou(i.id, "APPROVED", "Approved"); push("success", "Advance approved."); }}>Approve</button><button className="btn-secondary btn-sm" onClick={() => { decideIou(i.id, "REJECTED", "Rejected"); push("success", "Advance rejected."); }}>Reject</button></div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Modal open={loanOpen} onClose={() => setLoanOpen(false)} title="Apply for a loan" footer={<><button className="btn-secondary" onClick={() => setLoanOpen(false)}>Cancel</button><button className="btn-primary" disabled={!lf.amount || !lf.reason.trim()} onClick={() => { applyLoan({ userId: me.id, loanType: lf.loanType, amount: Number(lf.amount), installments: Number(lf.installments), reason: lf.reason, approverId: me.managerId }); push("success", "Loan application submitted."); setLoanOpen(false); }}>Submit</button></>}>
        <Field label="Loan Type" required><Select value={lf.loanType} onChange={(e) => setLf({ ...lf, loanType: e.target.value })}><option>Festival Loan</option><option>Salary Advance</option><option>House Building Loan</option><option>Emergency Loan</option></Select></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount (BDT)" required><TextInput type="number" value={lf.amount} onChange={(e) => setLf({ ...lf, amount: e.target.value })} /></Field>
          <Field label="Instalments" required><TextInput type="number" value={lf.installments} onChange={(e) => setLf({ ...lf, installments: e.target.value })} /></Field>
        </div>
        {lf.amount && lf.installments ? <p className="mb-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">Monthly instalment: <span className="num font-semibold">{bdt(Number(lf.amount) / Number(lf.installments))}</span></p> : null}
        <Field label="Reason" required><TextArea rows={3} value={lf.reason} onChange={(e) => setLf({ ...lf, reason: e.target.value })} /></Field>
      </Modal>

      <Modal open={iouOpen} onClose={() => setIouOpen(false)} title="Request an advance (IOU)" footer={<><button className="btn-secondary" onClick={() => setIouOpen(false)}>Cancel</button><button className="btn-primary" disabled={!inf.amount || !inf.purpose.trim()} onClick={() => { applyIou({ userId: me.id, amount: Number(inf.amount), purpose: inf.purpose, approverId: me.managerId }); push("success", "Advance request submitted."); setIouOpen(false); }}>Submit</button></>}>
        <Field label="Amount (BDT)" required><TextInput type="number" value={inf.amount} onChange={(e) => setInf({ ...inf, amount: e.target.value })} /></Field>
        <Field label="Purpose" required><TextArea rows={3} value={inf.purpose} onChange={(e) => setInf({ ...inf, purpose: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
