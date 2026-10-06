"use client";

import { useMemo, useState } from "react";
import { Banknote, Plus, Trash2, PenLine, Award, Download } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Badge, StatCard, EmptyState } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { vkRowScore, vkRecordTotal, vkTotalWeight, vkTotalTarget, vkTotalAchievement, gradeFor } from "@/lib/calc";
import { monthName, num, uid, download } from "@/lib/utils";
import type { VariableIncomeRecord, VariableIncomeRow } from "@/lib/types";

const SIGN_ROLES: { key: keyof VariableIncomeRecord["signatures"]; label: string }[] = [
  { key: "lm", label: "Line Manager" },
  { key: "coo", label: "COO" },
  { key: "hod", label: "Head of Department" },
  { key: "hodHr", label: "Head of HR" },
];

export default function VariableIncomePage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const grades = useStore((s) => s.grades);
  const records = useStore((s) => s.variableIncome);
  const saveRecord = useStore((s) => s.saveVariableIncome);
  const toggleSign = useStore((s) => s.toggleViSignature);
  const { push } = useToast();

  const [month, setMonth] = useState(8);
  const [year] = useState(2026);
  const [editing, setEditing] = useState<VariableIncomeRecord | null>(null);

  const isEmployee = me?.role === "EMPLOYEE" || me?.role === "DEPT_HEAD";
  const mine = useMemo(() => records.find((r) => r.employeeId === me?.id && r.periodMonth === month && r.periodYear === year), [records, me, month, year]);

  const visibleRecords = useMemo(() => {
    if (!me) return [];
    if (isEmployee) return records.filter((r) => r.employeeId === me.id);
    if (me.role === "DEPT_HEAD") {
      const ids = new Set(users.filter((u) => u.departmentId === me.departmentId).map((u) => u.id));
      return records.filter((r) => ids.has(r.employeeId));
    }
    return records;
  }, [records, users, me, isEmployee]);

  if (!me) return null;

  function startEdit() {
    setEditing(
      mine ?? {
        id: uid("vi"), employeeId: me!.id, periodYear: year, periodMonth: month, rows: [],
        signatures: { lm: false, coo: false, hod: false, hodHr: false }, createdAt: "", updatedAt: "",
      }
    );
  }

  function exportScorecard(rec: VariableIncomeRecord) {
    const total = vkRecordTotal(rec);
    const g = gradeFor(total, grades);
    const lines = [
      "ANWAR GROUP OF INDUSTRIES",
      `Variable Income monthly KPI — ${monthName(rec.periodMonth)} ${rec.periodYear}`,
      `Employee Name : ${me?.fullName ?? ""}`,
      `Employee ID   : ${me?.employeeId ?? ""}`,
      `Designation   : ${me?.designation ?? ""}`,
      "",
      "SL | KRA/Perspective | Action Plan | Weightage | Target | Achievement | Ach % | Score",
      ...rec.rows.map((r, i) => {
        const ratio = r.target ? r.achievement / r.target : 0;
        return `${i + 1} | ${r.kra} | ${r.actionPlan} | ${r.weight} | ${r.target} | ${r.achievement} | ${(ratio * 100).toFixed(2)}% | ${vkRowScore(r.target, r.achievement, r.weight).toFixed(4)}`;
      }),
      "",
      `Total Weight      : ${(vkTotalWeight(rec) * 100).toFixed(0)}%`,
      `Total Target      : ${num(vkTotalTarget(rec), 2)}`,
      `Total Achievement : ${num(vkTotalAchievement(rec), 2)}`,
      `Total Score       : ${total.toFixed(4)}`,
      `Grade             : ${g?.name ?? "—"} (${g?.label ?? ""})`,
      "",
      "Sign-off: " + [
        rec.signatures.lm ? "Line Manager ✓" : "Line Manager —",
        rec.signatures.coo ? "COO ✓" : "COO —",
        rec.signatures.hod ? "HOD ✓" : "HOD —",
        rec.signatures.hodHr ? "HOD HR ✓" : "HOD HR —",
      ].join(" | "),
    ];
    download(`variable-income-${monthName(rec.periodMonth)}-${rec.periodYear}.txt`, lines.join("\n"), "text/plain");
    push("success", "Scorecard exported.");
  }

  return (
    <div>
      <PageHeader
        title="Variable Income"
        subtitle="Monthly variable income KPI scorecard — weightage × capped achievement, graded for payout."
        action={isEmployee ? (
          <div className="flex gap-2">
            {mine ? <button className="btn-secondary" onClick={() => exportScorecard(mine)}><Download className="h-4 w-4" /> Export scorecard</button> : null}
            <button className="btn-primary" onClick={startEdit}><PenLine className="h-4 w-4" /> {mine ? "Edit scorecard" : "Create scorecard"}</button>
          </div>
        ) : undefined}
      />

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-ink-500">Period</label>
        <select className="input max-w-[180px]" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m)} {year}</option>)}
        </select>
      </div>

      {/* Employee own scorecard */}
      {isEmployee ? (
        mine ? (
          <ScorecardView rec={mine} onSign={(k) => { toggleSign(mine.id, k); push("info", "Signature updated."); }} grades={grades} />
        ) : (
          <EmptyState
            icon={<Banknote className="h-6 w-6" />}
            title={`No variable income scorecard for ${monthName(month)} ${year}`}
            message="Create your monthly variable income scorecard with your KRAs, weights, targets and achievements."
            action={<button className="btn-primary" onClick={startEdit}>Create scorecard</button>}
          />
        )
      ) : (
        <Card>
          <CardHeader title="Employee scorecards" subtitle="Total score and grade per employee" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-ink-50/60"><tr>
                <th className="th">Employee</th><th className="th">Department</th><th className="th">Period</th>
                <th className="th text-right">Total Weight</th><th className="th text-right">Total Score</th><th className="th">Grade</th><th className="th">Sign-offs</th>
              </tr></thead>
              <tbody>
                {visibleRecords.map((r) => {
                  const total = vkRecordTotal(r);
                  const g = gradeFor(total, grades);
                  const u = users.find((x) => x.id === r.employeeId);
                  const signs = Object.values(r.signatures).filter(Boolean).length;
                  return (
                    <tr key={r.id} className="border-b border-ink-50 last:border-0">
                      <td className="td">{u?.fullName}</td>
                      <td className="td text-sm text-ink-500">{u?.designation}</td>
                      <td className="td">{monthName(r.periodMonth)} {r.periodYear}</td>
                      <td className="td num text-right">{(vkTotalWeight(r) * 100).toFixed(0)}%</td>
                      <td className="td num text-right font-semibold">{num(total, 4)}</td>
                      <td className="td"><Badge tone="brand">{g?.name ?? "—"}</Badge></td>
                      <td className="td text-xs text-ink-500">{signs}/4 signed</td>
                    </tr>
                  );
                })}
                {!visibleRecords.length ? <tr><td colSpan={7} className="td text-center text-ink-500">No scorecards yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Employee own history for admins to see totals */}
      {isEmployee && visibleRecords.length > 1 ? (
        <Card className="mt-4">
          <CardHeader title="Scorecard history" />
          <div className="divide-y divide-ink-100">
            {visibleRecords.map((r) => {
              const total = vkRecordTotal(r);
              const g = gradeFor(total, grades);
              return (
                <div key={r.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-ink-700">{monthName(r.periodMonth)} {r.periodYear}</span>
                  <span className="flex items-center gap-3">
                    <span className="num text-sm text-ink-600">{num(total, 4)}</span>
                    <Badge tone="brand">{g?.name ?? "—"}</Badge>
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      <Card className="mt-4">
        <CardHeader title="Grade scale" subtitle="Total Variable Income score → grade. Bands are configurable in Administration → Grade Bands." />
        <div className="flex flex-wrap gap-2 p-5">
          {[...grades].sort((a, b) => b.min - a.min).map((g) => (
            <Badge key={g.id} tone="brand">{g.name} · {g.label} ({g.min.toFixed(2)}–{g.max.toFixed(2)})</Badge>
          ))}
        </div>
      </Card>

      {editing ? (
        <ScorecardEditor
          rec={editing}
          onClose={() => setEditing(null)}
          onSave={(r) => { saveRecord(r); push("success", "Scorecard saved."); setEditing(null); }}
        />
      ) : null}
    </div>
  );
}

function ScorecardView({ rec, onSign, grades }: { rec: VariableIncomeRecord; onSign: (k: keyof VariableIncomeRecord["signatures"]) => void; grades: ReturnType<typeof useStore.getState>["grades"] }) {
  const total = vkRecordTotal(rec);
  const g = gradeFor(total, grades);
  const totalAch = vkTotalWeight(rec) ? rec.rows.reduce((s, r) => s + r.achievement, 0) / (rec.rows.reduce((s, r) => s + r.target, 0) || 1) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Weight" value={`${(vkTotalWeight(rec) * 100).toFixed(0)}%`} />
        <StatCard label="Total Score" value={num(total, 4)} tone="blue" />
        <StatCard label="Grade" value={g?.name ?? "—"} hint={g?.label} tone="green" icon={<Award className="h-5 w-5" />} />
        <StatCard label="Achievement" value={`${num(totalAch * 100, 1)}%`} />
      </div>

      <Card>
        <CardHeader title={`${monthName(rec.periodMonth)} ${rec.periodYear} — KRA scorecard`} subtitle="Score = Weightage × MIN(Achievement%, 100%) — capped at plan" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-ink-50/60"><tr>
              <th className="th">SL</th><th className="th">KRA / Perspective</th><th className="th">Action Plan</th>
              <th className="th text-right">Weight</th><th className="th text-right">Target</th><th className="th text-right">Achievement</th>
              <th className="th text-right">Ach %</th><th className="th text-right">Score</th>
            </tr></thead>
            <tbody>
              {rec.rows.map((row, i) => {
                const ratio = row.target ? row.achievement / row.target : 0;
                return (
                  <tr key={row.id} className="border-b border-ink-50 last:border-0">
                    <td className="td num">{i + 1}</td>
                    <td className="td font-medium text-ink-800">{row.kra}</td>
                    <td className="td max-w-[280px] text-sm text-ink-600">{row.actionPlan}</td>
                    <td className="td num text-right">{(row.weight * 100).toFixed(0)}%</td>
                    <td className="td num text-right">{num(row.target, 2)}</td>
                    <td className="td num text-right">{num(row.achievement, 2)}</td>
                    <td className="td num text-right">{(ratio * 100).toFixed(2)}%{ratio > 1 ? <span className="ml-1 text-[10px] text-amber-600">capped</span> : null}</td>
                    <td className="td num text-right font-semibold text-brand-600">{vkRowScore(row.target, row.achievement, row.weight).toFixed(4)}</td>
                  </tr>
                );
              })}
              <tr className="bg-ink-50 font-semibold">
                <td className="td" colSpan={3}>Total</td>
                <td className="td num text-right">{(vkTotalWeight(rec) * 100).toFixed(0)}%</td>
                <td className="td num text-right">{num(rec.rows.reduce((s, r) => s + r.target, 0), 2)}</td>
                <td className="td num text-right">{num(rec.rows.reduce((s, r) => s + r.achievement, 0), 2)}</td>
                <td className="td" />
                <td className="td num text-right text-brand-700">{total.toFixed(4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Sign-off" subtitle="Line Manager · COO · Head of Department · Head of HR" />
        <div className="grid gap-4 p-5 sm:grid-cols-4">
          {SIGN_ROLES.map((s) => (
            <button key={s.key} onClick={() => onSign(s.key)} className={`rounded-lg border p-3 text-left ${rec.signatures[s.key] ? "border-emerald-300 bg-emerald-50" : "border-ink-200 hover:bg-ink-50"}`}>
              <p className="text-xs uppercase tracking-wide text-ink-400">Signature</p>
              <p className="mt-0.5 text-sm font-medium text-ink-800">{s.label}</p>
              <p className={`mt-1 text-xs ${rec.signatures[s.key] ? "text-emerald-600" : "text-ink-400"}`}>{rec.signatures[s.key] ? "✓ Signed" : "Pending"}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ScorecardEditor({ rec, onClose, onSave }: { rec: VariableIncomeRecord; onClose: () => void; onSave: (r: VariableIncomeRecord) => void }) {
  const [rows, setRows] = useState<VariableIncomeRow[]>(rec.rows.length ? rec.rows : [{ id: uid("vir"), recordId: rec.id, kra: "", actionPlan: "", weight: 0.5, target: 0, achievement: 0 }]);

  const addRow = () => setRows((r) => [...r, { id: uid("vir"), recordId: rec.id, kra: "", actionPlan: "", weight: 0, target: 0, achievement: 0 }]);
  const delRow = (id: string) => setRows((r) => r.filter((x) => x.id !== id));
  const setRow = (id: string, patch: Partial<VariableIncomeRow>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const totalWeight = rows.reduce((s, r) => s + (Number(r.weight) || 0), 0);
  const total = rows.reduce((s, r) => s + vkRowScore(Number(r.target), Number(r.achievement), Number(r.weight)), 0);

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title="Variable Income scorecard"
      subtitle={`${monthName(rec.periodMonth)} ${rec.periodYear} — weights should total 100%`}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave({ ...rec, rows })} disabled={rows.some((r) => !r.kra || !r.target)}>Save scorecard</button>
        </>
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-ink-500">Total weight: <span className={`num font-semibold ${Math.abs(totalWeight - 1) < 0.001 ? "text-emerald-600" : "text-amber-600"}`}>{(totalWeight * 100).toFixed(0)}%</span> · Total score: <span className="num font-semibold text-brand-600">{total.toFixed(4)}</span></p>
        <button className="btn-secondary btn-sm" onClick={addRow}><Plus className="h-3.5 w-3.5" /> Add KRA</button>
      </div>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={row.id} className="rounded-lg border border-ink-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-500">KRA {i + 1}</span>
              {rows.length > 1 ? <button className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-600" onClick={() => delRow(row.id)}><Trash2 className="h-4 w-4" /></button> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="KRA / Perspective"><TextInput value={row.kra} onChange={(e) => setRow(row.id, { kra: e.target.value })} placeholder="e.g. Financial Perspective" /></Field>
              <Field label="Action Plan"><TextInput value={row.actionPlan} onChange={(e) => setRow(row.id, { actionPlan: e.target.value })} placeholder="e.g. Sales Target vs Achievement" /></Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Weightage (0–1)"><TextInput type="number" step="0.05" value={row.weight} onChange={(e) => setRow(row.id, { weight: Number(e.target.value) })} /></Field>
              <Field label="Monthly Target"><TextInput type="number" value={row.target} onChange={(e) => setRow(row.id, { target: Number(e.target.value) })} /></Field>
              <Field label="Monthly Achievement"><TextInput type="number" value={row.achievement} onChange={(e) => setRow(row.id, { achievement: Number(e.target.value) })} /></Field>
            </div>
            <p className="num text-xs text-ink-500">Score = {row.weight} × MIN({row.target ? (row.achievement / row.target).toFixed(4) : "0"}, 1) = <span className="font-semibold text-brand-600">{vkRowScore(Number(row.target), Number(row.achievement), Number(row.weight)).toFixed(4)}</span></p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
