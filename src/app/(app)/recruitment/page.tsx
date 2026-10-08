"use client";

import { useState } from "react";
import { UserPlus, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { deptName } from "@/lib/selectors";
import { PageHeader, Badge, StatCard, Card, CardHeader } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { screenResume } from "@/lib/ai";
import { DataTable, ActionMenu, type Column } from "@/components/ui/data-table";
import { bdt, formatDate } from "@/lib/utils";
import type { Candidate } from "@/lib/types";

const STAGES: Candidate["stage"][] = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"];
const TONE: Record<string, "neutral" | "blue" | "amber" | "brand" | "green" | "red"> = { APPLIED: "neutral", SCREENING: "blue", INTERVIEW: "amber", OFFER: "brand", HIRED: "green", REJECTED: "red" };

export default function RecruitmentPage() {
  const candidates = useStore((s) => s.candidates);
  const departments = useStore((s) => s.departments);
  const create = useStore((s) => s.createCandidate);
  const move = useStore((s) => s.moveCandidate);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [jd, setJd] = useState("");
  const [f, setF] = useState({ name: "", position: "", departmentId: departments[0]?.id ?? "", skills: "", salaryExpectation: "" });

  const cols: Column<Candidate>[] = [
    { key: "name", header: "Candidate", sortable: true, render: (c) => <span className="font-medium text-ink-800">{c.name}</span> },
    { key: "position", header: "Position" },
    { key: "departmentId", header: "Department", render: (c) => deptName({ departments }, c.departmentId), value: (c) => deptName({ departments }, c.departmentId) },
    { key: "skills", header: "Skills", render: (c) => <span className="text-xs text-ink-500">{c.skills}</span> },
    { key: "salaryExpectation", header: "Expectation", align: "right", render: (c) => <span className="num">{bdt(c.salaryExpectation)}</span> },
    { key: "stage", header: "Stage", render: (c) => <Badge tone={TONE[c.stage]}>{c.stage}</Badge> },
    { key: "appliedAt", header: "Applied", render: (c) => formatDate(c.appliedAt) },
    { key: "actions", header: "", align: "right", render: (c) => (
      <ActionMenu items={[
        ...STAGES.map((st) => ({ label: `Move to ${st}`, disabled: st === c.stage || c.stage === "HIRED", onClick: () => { move(c.id, st); push("success", `Moved to ${st}.`); } })),
        { label: "Reject", danger: true, disabled: c.stage === "REJECTED", onClick: () => { move(c.id, "REJECTED"); push("success", "Candidate rejected."); } },
      ]} />
    ) },
  ];

  const pipeline = STAGES.map((st) => ({ stage: st, count: candidates.filter((c) => c.stage === st).length }));

  return (
    <div>
      <PageHeader title="Recruitment" subtitle="Applicant tracking: requisitions, candidates and interview pipeline."
        action={<button className="btn-primary" onClick={() => setOpen(true)}><UserPlus className="h-4 w-4" /> Add Candidate</button>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {pipeline.map((p) => <StatCard key={p.stage} label={p.stage} value={p.count} tone={p.stage === "INTERVIEW" ? "amber" : p.stage === "OFFER" ? "brand" : p.stage === "HIRED" ? "green" : "blue"} />)}
      </div>

      <Card className="mb-4"><CardHeader title="Pipeline" subtitle="Candidates by stage" />
        <div className="flex flex-wrap items-center gap-2 p-5">
          {STAGES.map((st, i) => (
            <span key={st} className="flex items-center gap-2">
              <Badge tone={TONE[st]}>{st} · {candidates.filter((c) => c.stage === st).length}</Badge>
              {i < STAGES.length - 1 ? <ChevronRight className="h-3.5 w-3.5 text-ink-300" /> : null}
            </span>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <CardHeader title="AI — Resume Screening" subtitle="Paste a job description; candidates are scored by required-skill overlap. AI suggests; the recruiter decides." />
        <div className="p-5">
          <Field label="Job description">
            <TextArea rows={3} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="e.g. FMCG sales role requiring negotiation, CRM, excel, data analysis and reporting" />
          </Field>
          {jd.trim().length >= 5 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-ink-50/60"><tr>
                  <th className="th">Candidate</th><th className="th">Position</th><th className="th text-right">Match</th>
                  <th className="th">Matched skills</th><th className="th">Missing</th><th className="th text-right">Action</th>
                </tr></thead>
                <tbody>
                  {candidates.map((c) => ({ c, m: screenResume(jd, `${c.position} ${c.skills}`) })).sort((a, b) => b.m.match - a.m.match).map(({ c, m }) => (
                    <tr key={c.id} className="border-b border-ink-50 last:border-0">
                      <td className="td font-medium text-ink-800">{c.name}</td>
                      <td className="td text-sm text-ink-500">{c.position}</td>
                      <td className="td num text-right font-semibold text-brand-600">{m.match}%</td>
                      <td className="td text-xs text-emerald-600">{m.matched.join(", ") || "—"}</td>
                      <td className="td text-xs text-red-600">{m.missing.join(", ") || "—"}</td>
                      <td className="td text-right"><button className="btn-secondary btn-sm" onClick={() => { move(c.id, "SCREENING"); push("success", `${c.name} shortlisted (AI suggestion accepted).`); }}>Shortlist</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-ink-400">Why: each match is the JD↔resume skill overlap. Shortlisting is a human action; the AI never rejects a candidate.</p>
            </div>
          ) : (
            <p className="text-xs text-ink-400">Enter a job description to screen candidates.</p>
          )}
        </div>
      </Card>

      <DataTable columns={cols} rows={candidates} searchKeys={["name", "position", "skills"]} searchPlaceholder="Search candidates…" emptyTitle="No candidates" />

      <Modal open={open} onClose={() => setOpen(false)} title="Add candidate" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.name || !f.position} onClick={() => { create({ name: f.name, position: f.position, departmentId: f.departmentId, skills: f.skills, salaryExpectation: Number(f.salaryExpectation) || 0, stage: "APPLIED" }); push("success", "Candidate added to the pipeline."); setOpen(false); }}>Add candidate</button></>}>
        <Field label="Full Name" required><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Position" required><TextInput value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} /></Field>
          <Field label="Department"><Select value={f.departmentId} onChange={(e) => setF({ ...f, departmentId: e.target.value })}>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field>
        </div>
        <Field label="Skills"><TextInput value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="e.g. FMCG sales, negotiation" /></Field>
        <Field label="Salary Expectation (BDT)"><TextInput type="number" value={f.salaryExpectation} onChange={(e) => setF({ ...f, salaryExpectation: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
