"use client";

import { useState } from "react";
import { Copy, Check, Search, FileText, Plus } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

interface Template { id: string; title: string; category: string; body: string }

const SEED: Template[] = [
  { id: "t1", title: "Interview Invitation", category: "Recruitment", body: "Dear {candidate},\n\nThank you for your application for {position} at Anwar Group. We would like to invite you for an interview on {date} at {time}.\n\nRegards,\nHR Team, Anwar Group" },
  { id: "t2", title: "Offer Letter Cover", category: "Recruitment", body: "Dear {candidate},\n\nWe are pleased to offer you the position of {position}. Please find the attached offer letter. Kindly confirm your acceptance by {date}.\n\nRegards,\nHR Team, Anwar Group" },
  { id: "t3", title: "Password Setup Reminder", category: "HR", body: "Dear {employee},\n\nYour AGI OneDesk account is ready. Please use the secure link to set your password.\n\nRegards,\nHR Team" },
  { id: "t4", title: "KPI Submission Reminder", category: "Performance", body: "Dear {employee},\n\nThis is a reminder to submit your variable KPI scorecard for {month} before the cutoff on {date}.\n\nRegards,\nPerformance Team" },
  { id: "t5", title: "Leave Approval", category: "HR", body: "Dear {employee},\n\nYour leave request from {from} to {to} has been approved.\n\nRegards,\nHR Team" },
  { id: "t6", title: "Payment Voucher Note", category: "Finance", body: "Dear {vendor},\n\nPlease find attached the payment advice for invoice {invoice}. Payment has been released on {date}.\n\nRegards,\nFinance, Anwar Group" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(SEED);
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", category: "HR", body: "" });
  const { push } = useToast();

  const filtered = templates.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()) || t.category.toLowerCase().includes(q.toLowerCase()) || t.body.toLowerCase().includes(q.toLowerCase()));

  async function copy(t: Template) {
    try { await navigator.clipboard.writeText(t.body); } catch { /* clipboard may be unavailable */ }
    setCopied(t.id);
    push("success", `Copied “${t.title}”.`);
    setTimeout(() => setCopied((c) => (c === t.id ? null : c)), 1500);
  }

  return (
    <div>
      <PageHeader title="Communication Templates" subtitle="Reusable message templates for HR, recruitment, performance and finance."
        action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Template</button>} />

      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search templates…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Card key={t.id} className="flex flex-col card-pad">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-brand-500" /><p className="text-sm font-semibold text-ink-900">{t.title}</p></div>
              <Badge tone="purple">{t.category}</Badge>
            </div>
            <pre className="mt-2 flex-1 whitespace-pre-wrap font-sans text-xs text-ink-500">{t.body}</pre>
            <button className="btn-secondary btn-sm mt-3 self-start" onClick={() => copy(t)}>
              {copied === t.id ? <><Check className="h-3.5 w-3.5 text-emerald-600" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </button>
          </Card>
        ))}
        {!filtered.length ? <p className="text-sm text-ink-500">No templates match “{q}”.</p> : null}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New template" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.title.trim() || !f.body.trim()} onClick={() => { setTemplates((x) => [{ id: `t${Date.now()}`, ...f }, ...x]); push("success", "Template created."); setOpen(false); }}>Create</button></>}>
        <Field label="Title" required><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Category"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{["HR", "Recruitment", "Performance", "Finance", "Admin"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Body" required hint="Use {placeholders} for values filled at send time."><TextArea rows={5} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
