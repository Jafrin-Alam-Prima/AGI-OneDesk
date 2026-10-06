"use client";

import { useState } from "react";
import { Plus, BookText, FileText } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { PageHeader, Card, CardHeader, Badge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { PolicyDoc } from "@/lib/types";

const CATS: PolicyDoc["category"][] = ["POLICY", "PROCEDURE", "SOP", "PROCESS", "FORM"];

export default function PoliciesPage() {
  const me = useCurrentUser();
  const policies = useStore((s) => s.policies);
  const create = useStore((s) => s.createPolicy);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<PolicyDoc | null>(null);
  const [f, setF] = useState({ title: "", category: "POLICY" as PolicyDoc["category"], body: "", version: "1.0" });

  if (!me) return null;
  const canManage = ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(me.role);

  return (
    <div>
      <PageHeader title="Policy & Documents" subtitle="Organisation policies, procedures, SOPs and forms."
        action={canManage ? <button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Document</button> : undefined} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {policies.map((p) => (
          <Card key={p.id} className="card-pad">
            <BookText className="mb-2 h-5 w-5 text-brand-500" />
            <h3 className="text-sm font-semibold text-ink-900">{p.title}</h3>
            <div className="mt-1 flex items-center gap-2"><Badge tone="purple">{p.category}</Badge><span className="text-xs text-ink-400">v{p.version}</span></div>
            <p className="mt-2 line-clamp-2 text-xs text-ink-500">{p.body}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-ink-400">{formatDate(p.publishedAt)}</span>
              <button className="btn-secondary btn-sm" onClick={() => setViewing(p)}>Read</button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.title ?? ""} subtitle={viewing ? `${viewing.category} · v${viewing.version} · ${formatDate(viewing.publishedAt)}` : ""}>
        <p className="text-sm text-ink-600">{viewing?.body}</p>
      </Modal>

      <Modal open={open} onClose={() => setOpen(false)} title="New document" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.title.trim() || !f.body.trim()} onClick={() => { create({ ...f }); push("success", "Document published."); setOpen(false); }}>Publish</button></>}>
        <Field label="Title" required><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as PolicyDoc["category"] })}>{CATS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Version"><TextInput value={f.version} onChange={(e) => setF({ ...f, version: e.target.value })} /></Field>
        </div>
        <Field label="Content" required><TextArea rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
