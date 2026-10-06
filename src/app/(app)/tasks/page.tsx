"use client";

import { useState } from "react";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { PageHeader, Badge, Card } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { TaskItem } from "@/lib/types";

const COLS: { id: TaskItem["status"]; label: string }[] = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE", label: "Done" },
];
const NEXT: Record<string, TaskItem["status"] | null> = { TODO: "IN_PROGRESS", IN_PROGRESS: "DONE", DONE: null };
const PREV: Record<string, TaskItem["status"] | null> = { TODO: null, IN_PROGRESS: "TODO", DONE: "IN_PROGRESS" };

export default function TasksPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const tasks = useStore((s) => s.tasks);
  const create = useStore((s) => s.createTask);
  const move = useStore((s) => s.moveTask);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", project: "Growth Analytics", assigneeId: me?.id ?? "", priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH", dueDate: "2026-10-15" });

  if (!me) return null;

  return (
    <div>
      <PageHeader title="Tasks" subtitle="Project tasks and a simple Kanban board."
        action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Task</button>} />

      <div className="grid gap-4 lg:grid-cols-3">
        {COLS.map((col) => {
          const items = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="rounded-xl bg-ink-100/50 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-ink-700">{col.label}</h3>
                <Badge tone="neutral">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <Card key={t.id} className="card-pad">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-ink-800">{t.title}</p>
                      <Badge tone={t.priority === "HIGH" ? "red" : t.priority === "MEDIUM" ? "amber" : "neutral"}>{t.priority}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-500">{t.project} · {nameOf(users, t.assigneeId)}</p>
                    <p className="mt-1 text-xs text-ink-400">Due {formatDate(t.dueDate)}</p>
                    <div className="mt-2 flex items-center gap-1">
                      {PREV[t.status] ? <button className="btn-ghost btn-sm" onClick={() => move(t.id, PREV[t.status]!)}><ChevronLeft className="h-3.5 w-3.5" /></button> : null}
                      {NEXT[t.status] ? <button className="btn-secondary btn-sm" onClick={() => move(t.id, NEXT[t.status]!)}>Move <ChevronRight className="h-3.5 w-3.5" /></button> : <Badge tone="green">Completed</Badge>}
                    </div>
                  </Card>
                ))}
                {!items.length ? <p className="px-2 py-4 text-center text-xs text-ink-400">No tasks</p> : null}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New task" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.title} onClick={() => { create({ ...f, status: "TODO" }); push("success", "Task created."); setOpen(false); }}>Create</button></>}>
        <Field label="Title" required><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Project"><TextInput value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Assignee"><Select value={f.assigneeId} onChange={(e) => setF({ ...f, assigneeId: e.target.value })}>{users.filter((u) => u.status === "ACTIVE").map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}</Select></Field>
          <Field label="Priority"><Select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as typeof f.priority })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></Select></Field>
        </div>
        <Field label="Due Date"><TextInput type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
