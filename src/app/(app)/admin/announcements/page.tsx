"use client";

import { useState } from "react";
import { Plus, Megaphone, BookText } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { PageHeader, Card, CardHeader, Badge, Tabs } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { PolicyDoc } from "@/lib/types";

export default function AdminContentPage() {
  const me = useCurrentUser();
  const announcements = useStore((s) => s.announcements);
  const policies = useStore((s) => s.policies);
  const users = useStore((s) => s.users);
  const createAn = useStore((s) => s.createAnnouncement);
  const createPo = useStore((s) => s.createPolicy);
  const { push } = useToast();
  const [tab, setTab] = useState("ANNOUNCEMENTS");
  const [anOpen, setAnOpen] = useState(false);
  const [poOpen, setPoOpen] = useState(false);
  const [an, setAn] = useState({ title: "", body: "", audience: "All Employees" });
  const [po, setPo] = useState({ title: "", category: "POLICY" as PolicyDoc["category"], body: "", version: "1.0" });

  if (!me) return null;

  return (
    <div>
      <PageHeader title="Announcements & Documents" subtitle="Publish announcements and manage organisation documents."
        action={tab === "ANNOUNCEMENTS"
          ? <button className="btn-primary" onClick={() => setAnOpen(true)}><Plus className="h-4 w-4" /> New Announcement</button>
          : <button className="btn-primary" onClick={() => setPoOpen(true)}><Plus className="h-4 w-4" /> New Document</button>} />

      <div className="mb-4"><Tabs tabs={[{ id: "ANNOUNCEMENTS", label: "Announcements", count: announcements.length }, { id: "DOCUMENTS", label: "Documents", count: policies.length }]} active={tab} onChange={setTab} /></div>

      {tab === "ANNOUNCEMENTS" ? (
        <Card>
          <CardHeader title="Published announcements" />
          <ul className="divide-y divide-ink-100">
            {announcements.map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-5 py-4">
                <Megaphone className="mt-0.5 h-4 w-4 text-brand-500" />
                <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-ink-800">{a.title}</p><Badge tone="blue">{a.audience}</Badge></div><p className="mt-0.5 text-sm text-ink-500">{a.body}</p><p className="mt-1 text-xs text-ink-400">{nameOf(users, a.authorId)} · {formatDate(a.publishedAt)}</p></div>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Documents" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="bg-ink-50/60"><tr><th className="th">Title</th><th className="th">Category</th><th className="th">Version</th><th className="th">Published</th></tr></thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id} className="border-b border-ink-50 last:border-0">
                    <td className="td font-medium text-ink-800">{p.title}</td>
                    <td className="td"><Badge tone="purple">{p.category}</Badge></td>
                    <td className="td text-sm">v{p.version}</td>
                    <td className="td text-sm text-ink-500">{formatDate(p.publishedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={anOpen} onClose={() => setAnOpen(false)} title="New announcement" footer={<><button className="btn-secondary" onClick={() => setAnOpen(false)}>Cancel</button><button className="btn-primary" disabled={!an.title.trim() || !an.body.trim()} onClick={() => { createAn({ ...an, authorId: me.id }); push("success", "Announcement published."); setAnOpen(false); }}>Publish</button></>}>
        <Field label="Title" required><TextInput value={an.title} onChange={(e) => setAn({ ...an, title: e.target.value })} /></Field>
        <Field label="Audience"><Select value={an.audience} onChange={(e) => setAn({ ...an, audience: e.target.value })}><option>All Employees</option><option>Department Heads</option></Select></Field>
        <Field label="Message" required><TextArea rows={4} value={an.body} onChange={(e) => setAn({ ...an, body: e.target.value })} /></Field>
      </Modal>

      <Modal open={poOpen} onClose={() => setPoOpen(false)} title="New document" footer={<><button className="btn-secondary" onClick={() => setPoOpen(false)}>Cancel</button><button className="btn-primary" disabled={!po.title.trim() || !po.body.trim()} onClick={() => { createPo({ ...po }); push("success", "Document published."); setPoOpen(false); }}><BookText className="h-4 w-4" /> Publish</button></>}>
        <Field label="Title" required><TextInput value={po.title} onChange={(e) => setPo({ ...po, title: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category"><Select value={po.category} onChange={(e) => setPo({ ...po, category: e.target.value as PolicyDoc["category"] })}>{["POLICY", "PROCEDURE", "SOP", "PROCESS", "FORM"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Version"><TextInput value={po.version} onChange={(e) => setPo({ ...po, version: e.target.value })} /></Field>
        </div>
        <Field label="Content" required><TextArea rows={4} value={po.body} onChange={(e) => setPo({ ...po, body: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
