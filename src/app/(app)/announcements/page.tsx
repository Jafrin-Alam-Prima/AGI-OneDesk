"use client";

import { useState } from "react";
import { Plus, Megaphone } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { nameOf } from "@/lib/selectors";
import { PageHeader, Card, Badge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

export default function AnnouncementsPage() {
  const me = useCurrentUser();
  const announcements = useStore((s) => s.announcements);
  const users = useStore((s) => s.users);
  const create = useStore((s) => s.createAnnouncement);
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", body: "", audience: "All Employees" });

  if (!me) return null;
  const canManage = ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(me.role);

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Company-wide announcements and notices."
        action={canManage ? <button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Announcement</button> : undefined} />

      <div className="space-y-3">
        {announcements.map((a) => (
          <Card key={a.id} className="card-pad">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Megaphone className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink-900">{a.title}</h3>
                  <Badge tone="blue">{a.audience}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-600">{a.body}</p>
                <p className="mt-1 text-xs text-ink-400">{nameOf(users, a.authorId)} · {formatDate(a.publishedAt)}</p>
              </div>
            </div>
          </Card>
        ))}
        {!announcements.length ? <Card className="card-pad text-center text-sm text-ink-500">No announcements.</Card> : null}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New announcement" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.title.trim() || !f.body.trim()} onClick={() => { create({ ...f, authorId: me.id }); push("success", "Announcement published."); setOpen(false); }}>Publish</button></>}>
        <Field label="Title" required><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Audience"><Select value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })}><option>All Employees</option><option>Department Heads</option><option>Specific Department</option></Select></Field>
        <Field label="Message" required><TextArea rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
