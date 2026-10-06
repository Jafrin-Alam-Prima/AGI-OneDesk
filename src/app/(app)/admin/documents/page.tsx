"use client";

import { useState } from "react";
import { Plus, FileStack } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { PageHeader, Card, CardHeader, Badge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { PolicyDoc } from "@/lib/types";

export default function AdminDocumentsPage() {
  const me = useCurrentUser();
  const policies = useStore((s) => s.policies);
  const create = useStore((s) => s.createPolicy);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<PolicyDoc | null>(null);
  const [f, setF] = useState({ title: "", category: "POLICY" as PolicyDoc["category"], body: "", version: "1.0" });

  if (!me) return null;

  return (
    <div>
      <PageHeader title="Document Management" subtitle="Policies, procedures, SOPs, processes and forms."
        action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Document</button>} />

      <Card>
        <CardHeader title="Published documents" subtitle={`${policies.length} document(s)`} action={<FileStack className="h-4 w-4 text-ink-400" />} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="bg-ink-50/60"><tr><th className="th">Title</th><th className="th">Category</th><th className="th">Version</th><th className="th">Published</th><th className="th"></th></tr></thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id} className="border-b border-ink-50 last:border-0">
                  <td className="td font-medium text-ink-800">{p.title}</td>
                  <td className="td"><Badge tone="purple">{p.category}</Badge></td>
                  <td className="td text-sm">v{p.version}</td>
                  <td className="td text-sm text-ink-500">{formatDate(p.publishedAt)}</td>
                  <td className="td text-right"><button className="btn-secondary btn-sm" onClick={() => setViewing(p)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.title ?? ""} subtitle={viewing ? `${viewing.category} · v${viewing.version}` : ""}>
        <p className="text-sm text-ink-600">{viewing?.body}</p>
      </Modal>

      <Modal open={open} onClose={() => setOpen(false)} title="New document" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.title.trim() || !f.body.trim()} onClick={() => { create({ ...f }); push("success", "Document published."); setOpen(false); }}>Publish</button></>}>
        <Field label="Title" required><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as PolicyDoc["category"] })}>{["POLICY", "PROCEDURE", "SOP", "PROCESS", "FORM"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Version"><TextInput value={f.version} onChange={(e) => setF({ ...f, version: e.target.value })} /></Field>
        </div>
        <Field label="Content" required><TextArea rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
