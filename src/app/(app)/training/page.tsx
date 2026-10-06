"use client";

import { useState } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Badge, StatCard } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { TrainingProgram } from "@/lib/types";

const CATEGORIES = ["Behavioural", "Technical", "Functional", "Compliance", "Leadership"];

export default function TrainingPage() {
  const me = useCurrentUser();
  const training = useStore((s) => s.training);
  const enrollments = useStore((s) => s.enrollments);
  const users = useStore((s) => s.users);
  const create = useStore((s) => s.createTraining);
  const enroll = useStore((s) => s.enrollTraining);
  const updateEnroll = useStore((s) => s.updateEnrollment);
  const { push } = useToast();

  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", category: CATEGORIES[0], trainer: "", startDate: "", endDate: "", seats: "20" });

  if (!me) return null;
  const isHR = ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(me.role);
  const myEnroll = enrollments.filter((e) => e.userId === me.id);

  return (
    <div>
      <PageHeader title="Training & Development" subtitle="Training catalogue, enrolment and completion tracking."
        action={isHR ? <button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Program</button> : undefined} />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Programs" value={training.length} icon={<GraduationCap className="h-5 w-5" />} />
        <StatCard label="My enrolments" value={myEnroll.length} tone="blue" />
        <StatCard label="Completed" value={myEnroll.filter((e) => e.status === "COMPLETED").length} tone="green" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {training.map((t) => {
          const enrolled = enrollments.filter((e) => e.programId === t.id);
          const mine = enrolled.find((e) => e.userId === me.id);
          return (
            <Card key={t.id} className="card-pad">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink-900">{t.title}</h3>
                <Badge tone="purple">{t.category}</Badge>
              </div>
              <p className="mt-1 text-xs text-ink-500">{t.trainer}</p>
              <p className="mt-2 text-xs text-ink-500">{formatDate(t.startDate)} → {formatDate(t.endDate)}</p>
              <p className="mt-1 text-xs text-ink-400">{enrolled.length}/{t.seats} enrolled</p>
              <div className="mt-3">
                {mine ? (
                  <Badge tone={mine.status === "COMPLETED" ? "green" : mine.status === "ENROLLED" ? "blue" : "amber"}>{mine.status}</Badge>
                ) : (
                  <button className="btn-primary btn-sm" onClick={() => { enroll(t.id, me.id); push("success", "Enrolment requested."); }}>Request enrolment</button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {isHR ? (
        <Card className="mt-5">
          <CardHeader title="Enrolments" subtitle="Approve, complete and score training" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-ink-50/60"><tr><th className="th">Employee</th><th className="th">Program</th><th className="th">Status</th><th className="th text-right">Score</th><th className="th"></th></tr></thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id} className="border-b border-ink-50 last:border-0">
                    <td className="td">{nameOf(users, e.userId)}</td>
                    <td className="td text-sm text-ink-600">{training.find((t) => t.id === e.programId)?.title}</td>
                    <td className="td"><Badge tone={e.status === "COMPLETED" ? "green" : e.status === "ENROLLED" ? "blue" : "amber"}>{e.status}</Badge></td>
                    <td className="td num text-right">{e.score ?? "—"}</td>
                    <td className="td text-right">
                      {e.status === "REQUESTED" ? <button className="btn-secondary btn-sm" onClick={() => { updateEnroll(e.id, { status: "ENROLLED" }); push("success", "Enrolment approved."); }}>Approve</button> : null}
                      {e.status === "ENROLLED" ? <button className="btn-secondary btn-sm" onClick={() => { updateEnroll(e.id, { status: "COMPLETED", attended: true, score: 85 }); push("success", "Marked completed."); }}>Complete</button> : null}
                    </td>
                  </tr>
                ))}
                {!enrollments.length ? <tr><td colSpan={5} className="td text-center text-ink-500">No enrolments.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title="New training program" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.title} onClick={() => { create({ title: f.title, category: f.category, trainer: f.trainer, startDate: f.startDate, endDate: f.endDate, seats: Number(f.seats) } as Omit<TrainingProgram, "id">); push("success", "Training program created."); setOpen(false); }}>Create</button></>}>
        <Field label="Title" required><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Trainer"><TextInput value={f.trainer} onChange={(e) => setF({ ...f, trainer: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date"><TextInput type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></Field>
          <Field label="End Date"><TextInput type="date" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></Field>
        </div>
        <Field label="Seats"><TextInput type="number" value={f.seats} onChange={(e) => setF({ ...f, seats: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
