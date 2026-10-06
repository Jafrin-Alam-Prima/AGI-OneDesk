"use client";

import { useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Tabs, RequestStatusBadge, StatCard } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { DataTable, type Column } from "@/components/ui/data-table";
import { bdt, formatDate, todayISO } from "@/lib/utils";
import type { ExpenseClaim } from "@/lib/types";

const TYPES = ["Travel", "Mobile Bill", "Client Meal", "Accommodation", "Office Supplies", "Other"];

export default function ExpensesPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const expenses = useStore((s) => s.expenses);
  const claim = useStore((s) => s.claimExpense);
  const decide = useStore((s) => s.decideExpense);
  const { push } = useToast();

  const [tab, setTab] = useState("MY");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ expenseType: TYPES[0], amount: "", date: todayISO(), description: "" });

  if (!me) return null;
  const isHead = me.role === "DEPT_HEAD" || me.role === "SUPER_ADMIN";
  const deptUserIds = new Set(users.filter((u) => u.departmentId === me.departmentId).map((u) => u.id));
  const myExp = expenses.filter((e) => e.userId === me.id);
  const teamExp = expenses.filter((e) => deptUserIds.has(e.userId));
  const pending = teamExp.filter((e) => e.status === "PENDING");

  const cols: Column<ExpenseClaim>[] = [
    ...(tab === "TEAM" ? [{ key: "userId", header: "Employee", render: (e: ExpenseClaim) => nameOf(users, e.userId) }] : []),
    { key: "expenseType", header: "Type" },
    { key: "date", header: "Date", render: (e) => formatDate(e.date) },
    { key: "amount", header: "Amount", align: "right", render: (e) => <span className="num">{bdt(e.amount)}</span> },
    { key: "description", header: "Description", render: (e) => <span className="text-xs text-ink-500">{e.description}</span> },
    { key: "status", header: "Status", render: (e) => <RequestStatusBadge status={e.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Expense & Reimbursement" subtitle="Submit expense claims and track reimbursement." action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Claim Expense</button>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Approved (YTD)" value={bdt(myExp.filter((e) => e.status === "APPROVED").reduce((s, e) => s + e.amount, 0))} icon={<Receipt className="h-5 w-5" />} tone="green" />
        <StatCard label="Pending" value={bdt(myExp.filter((e) => e.status === "PENDING").reduce((s, e) => s + e.amount, 0))} tone="amber" />
        <StatCard label="Claims" value={myExp.length} tone="blue" />
      </div>

      {isHead ? <div className="mb-4"><Tabs tabs={[{ id: "MY", label: "My Claims" }, { id: "TEAM", label: "Department" }]} active={tab} onChange={setTab} /></div> : null}

      <DataTable columns={cols} rows={tab === "TEAM" ? teamExp : myExp} searchKeys={["expenseType", "description"]} emptyTitle="No expense claims" />

      {isHead && tab === "TEAM" && pending.length ? (
        <Card className="mt-4">
          <CardHeader title="Pending approvals" subtitle={`${pending.length} claims`} />
          <ul className="divide-y divide-ink-100">
            {pending.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div><p className="text-sm text-ink-800">{nameOf(users, e.userId)} — {e.expenseType} {bdt(e.amount)}</p><p className="text-xs text-ink-500">{e.description}</p></div>
                <div className="flex gap-2"><button className="btn-primary btn-sm" onClick={() => { decide(e.id, "APPROVED", "Approved"); push("success", "Expense approved."); }}>Approve</button><button className="btn-secondary btn-sm" onClick={() => { decide(e.id, "REJECTED", "Rejected"); push("success", "Expense rejected."); }}>Reject</button></div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title="Claim an expense" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.amount || !f.description.trim()} onClick={() => { claim({ userId: me.id, expenseType: f.expenseType, amount: Number(f.amount), date: f.date, description: f.description, approverId: me.managerId }); push("success", "Expense claim submitted."); setOpen(false); }}>Submit claim</button></>}>
        <Field label="Expense Type" required><Select value={f.expenseType} onChange={(e) => setF({ ...f, expenseType: e.target.value })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount (BDT)" required><TextInput type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
          <Field label="Date" required><TextInput type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        </div>
        <Field label="Description" required><TextArea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="What was the expense for? Attach receipts to the evidence of related claims." /></Field>
      </Modal>
    </div>
  );
}
