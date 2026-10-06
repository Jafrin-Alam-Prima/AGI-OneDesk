"use client";

import { useState } from "react";
import { Download, Wallet } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { Card, CardHeader, PageHeader, StatCard } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { bdt, download, monthName, num } from "@/lib/utils";
import type { PayslipRecord } from "@/lib/types";

export default function PayslipsPage() {
  const me = useCurrentUser();
  const payslips = useStore((s) => s.payslips);
  const [viewing, setViewing] = useState<PayslipRecord | null>(null);

  if (!me) return null;
  const mine = payslips.filter((p) => p.userId === me.id).sort((a, b) => b.periodMonth - a.periodMonth);
  const latest = mine[0];

  function exportSlip(p: PayslipRecord) {
    const lines = [
      `AGI OneDesk — Payslip`,
      `Employee: ${me?.fullName} (${me?.employeeId})`,
      `Period: ${monthName(p.periodMonth)} ${p.periodYear}`,
      ``,
      `Earnings:`,
      ...p.basics.map((b) => `  ${b.label}: ${b.amount}`),
      ``,
      `Deductions:`,
      ...p.deductions.map((d) => `  ${d.label}: ${d.amount}`),
      ``,
      `Net Pay: ${p.net}`,
    ];
    download(`payslip-${monthName(p.periodMonth)}-${p.periodYear}.txt`, lines.join("\n"), "text/plain");
  }

  return (
    <div>
      <PageHeader title="Payslip" subtitle="View and download your monthly salary slips." />

      {latest ? (
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <StatCard label="Latest net pay" value={bdt(latest.net)} hint={`${monthName(latest.periodMonth)} ${latest.periodYear}`} icon={<Wallet className="h-5 w-5" />} tone="green" />
          <StatCard label="Gross" value={bdt(latest.basics.reduce((s, b) => s + b.amount, 0))} tone="blue" />
          <StatCard label="Deductions" value={bdt(latest.deductions.reduce((s, d) => s + d.amount, 0))} tone="red" />
        </div>
      ) : null}

      <Card>
        <CardHeader title="Salary slips" subtitle={`${mine.length} available`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-ink-50/60"><tr><th className="th">Period</th><th className="th text-right">Gross</th><th className="th text-right">Deductions</th><th className="th text-right">Net Pay</th><th className="th"></th></tr></thead>
            <tbody>
              {mine.map((p) => (
                <tr key={p.id} className="border-b border-ink-50 last:border-0">
                  <td className="td font-medium text-ink-800">{monthName(p.periodMonth)} {p.periodYear}</td>
                  <td className="td num text-right">{bdt(p.basics.reduce((s, b) => s + b.amount, 0))}</td>
                  <td className="td num text-right">{bdt(p.deductions.reduce((s, d) => s + d.amount, 0))}</td>
                  <td className="td num text-right font-semibold text-ink-900">{bdt(p.net)}</td>
                  <td className="td text-right">
                    <button className="btn-secondary btn-sm" onClick={() => setViewing(p)}>View</button>
                  </td>
                </tr>
              ))}
              {!mine.length ? <tr><td colSpan={5} className="td text-center text-ink-500">No payslips available.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `Payslip — ${monthName(viewing.periodMonth)} ${viewing.periodYear}` : ""}
        footer={viewing ? <button className="btn-primary" onClick={() => exportSlip(viewing)}><Download className="h-4 w-4" /> Download</button> : null}>
        {viewing ? (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Earnings</p>
              <ul className="divide-y divide-ink-100">
                {viewing.basics.map((b, i) => <li key={i} className="flex justify-between py-1.5 text-sm"><span className="text-ink-600">{b.label}</span><span className="num text-ink-800">{bdt(b.amount)}</span></li>)}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Deductions</p>
              <ul className="divide-y divide-ink-100">
                {viewing.deductions.map((d, i) => <li key={i} className="flex justify-between py-1.5 text-sm"><span className="text-ink-600">{d.label}</span><span className="num text-ink-800">{bdt(d.amount)}</span></li>)}
              </ul>
            </div>
            <div className="flex justify-between rounded-lg bg-ink-50 px-4 py-3"><span className="font-semibold text-ink-800">Net Pay</span><span className="num font-bold text-brand-600">{bdt(viewing.net)}</span></div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
