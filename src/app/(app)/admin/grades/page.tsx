"use client";

import { useState } from "react";
import { Plus, Trash2, Layers } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader, Card, CardHeader, Badge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { uid } from "@/lib/utils";
import type { Grade } from "@/lib/types";

export default function GradesPage() {
  const grades = useStore((s) => s.grades);
  const upsert = useStore((s) => s.upsertGrade);
  const del = useStore((s) => s.deleteGrade);
  const { push } = useToast();
  const [editing, setEditing] = useState<Grade | null>(null);

  const sorted = [...grades].sort((a, b) => b.min - a.min);

  return (
    <div>
      <PageHeader title="Grade Bands" subtitle="Variable income and performance grade thresholds (score → grade)."
        action={<button className="btn-primary" onClick={() => setEditing({ id: uid("g"), name: "", label: "", min: 0, max: 0 })}><Plus className="h-4 w-4" /> Add Band</button>} />

      <Card>
        <CardHeader title="Grade scale" subtitle="Bands apply to the total Variable Income score (0–1). The reference score 0.8894 maps to B+." action={<Layers className="h-4 w-4 text-ink-400" />} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="bg-ink-50/60"><tr><th className="th">Grade</th><th className="th">Label</th><th className="th text-right">Min</th><th className="th text-right">Max</th><th className="th"></th></tr></thead>
            <tbody>
              {sorted.map((g) => (
                <tr key={g.id} className="border-b border-ink-50 last:border-0">
                  <td className="td"><Badge tone="brand">{g.name}</Badge></td>
                  <td className="td text-sm text-ink-600">{g.label}</td>
                  <td className="td num text-right">{g.min.toFixed(4)}</td>
                  <td className="td num text-right">{g.max.toFixed(4)}</td>
                  <td className="td text-right">
                    <button className="btn-ghost btn-sm" onClick={() => setEditing(g)}>Edit</button>
                    <button className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-600" onClick={() => { del(g.id); push("success", "Band removed."); }}><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && grades.some((g) => g.id === editing.id) ? "Edit grade band" : "Add grade band"}
        footer={<><button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" disabled={!editing?.name} onClick={() => { if (editing) { upsert(editing); push("success", "Grade band saved."); } setEditing(null); }}>Save</button></>}>
        {editing ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Grade" required><TextInput value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. A+" /></Field>
              <Field label="Label"><TextInput value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} placeholder="e.g. Outstanding" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Min (0–1)"><TextInput type="number" step="0.0001" value={editing.min} onChange={(e) => setEditing({ ...editing, min: Number(e.target.value) })} /></Field>
              <Field label="Max (0–1)"><TextInput type="number" step="0.0001" value={editing.max} onChange={(e) => setEditing({ ...editing, max: Number(e.target.value) })} /></Field>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
