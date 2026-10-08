"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Badge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { analyseSentiment } from "@/lib/ai";

const CATEGORIES = ["Workplace", "Compensation", "Management", "Harassment", "Policy", "Other"];
const TONE: Record<string, "amber" | "blue" | "green"> = { OPEN: "amber", IN_REVIEW: "blue", RESOLVED: "green" };

export default function GrievancesPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const grievances = useStore((s) => s.grievances);
  const create = useStore((s) => s.createGrievance);
  const update = useStore((s) => s.updateGrievance);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ category: CATEGORIES[0], description: "" });

  if (!me) return null;
  const isHR = ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(me.role);
  const rows = isHR ? grievances : grievances.filter((g) => g.userId === me.id);

  return (
    <div>
      <PageHeader title="Grievance Management" subtitle="Raise and track grievances confidentially."
        action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Raise Grievance</button>} />

      {isHR ? (
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="chip bg-rose-100 text-rose-700">{rows.filter((g) => analyseSentiment(g.description).label === "Negative").length} negative</span>
          <span className="chip bg-emerald-100 text-emerald-700">{rows.filter((g) => analyseSentiment(g.description).label === "Positive").length} positive</span>
          <span className="chip bg-ink-100 text-ink-600">{rows.length} total · AI sentiment (simulated)</span>
        </div>
      ) : null}

      <div className="space-y-3">
        {rows.map((g) => {
          const s = analyseSentiment(g.description);
          return (
          <Card key={g.id} className="card-pad">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="purple">{g.category}</Badge>
                  <Badge tone={TONE[g.status]}>{g.status.replace("_", " ")}</Badge>
                  <Badge tone={s.label === "Negative" ? "red" : s.label === "Positive" ? "green" : "neutral"}>AI sentiment: {s.label}</Badge>
                  {s.themes.slice(0, 3).map((t) => <span key={t} className="chip bg-ink-100 text-ink-600">{t}</span>)}
                </div>
                <p className="mt-2 text-sm text-ink-700">{g.description}</p>
                <p className="mt-1 text-xs text-ink-400">{isHR ? `${nameOf(users, g.userId)} · ` : ""}{formatDate(g.createdAt)}</p>
                {g.resolution ? <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Resolution: {g.resolution}</p> : null}
              </div>
              {isHR && g.status !== "RESOLVED" ? (
                <div className="flex gap-2">
                  {g.status === "OPEN" ? <button className="btn-secondary btn-sm" onClick={() => { update(g.id, { status: "IN_REVIEW" }); push("success", "Marked in review."); }}>Start review</button> : null}
                  <button className="btn-primary btn-sm" onClick={() => { update(g.id, { status: "RESOLVED", resolution: "Addressed and closed by HR." }); push("success", "Grievance resolved."); }}>Resolve</button>
                </div>
              ) : null}
            </div>
          </Card>
          );
        })}
        {!rows.length ? <Card className="card-pad text-center text-sm text-ink-500">No grievances recorded.</Card> : null}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Raise a grievance" subtitle="Your grievance is handled confidentially by HR."
        footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.description.trim()} onClick={() => { create({ userId: me.id, category: f.category, description: f.description }); push("success", "Grievance submitted."); setOpen(false); }}>Submit</button></>}>
        <Field label="Category" required><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Description" required><TextArea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
