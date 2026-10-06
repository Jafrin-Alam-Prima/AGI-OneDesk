"use client";

import { useRef, useState } from "react";
import { Upload, FileText, Trash2, Download, ShieldCheck, BookText } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { download, formatDate, sha256Hex } from "@/lib/utils";
import type { PolicyDoc } from "@/lib/types";

export default function DocumentsPage() {
  const me = useCurrentUser();
  const evidence = useStore((s) => s.evidence);
  const policies = useStore((s) => s.policies);
  const addEvidence = useStore((s) => s.addEvidence);
  const removeEvidence = useStore((s) => s.removeEvidence);
  const { push } = useToast();
  const [viewing, setViewing] = useState<PolicyDoc | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!me) return null;
  const mine = evidence.filter((e) => e.uploadedBy === me.id && e.kpiId === "PERSONAL");

  async function upload(list: FileList | null) {
    if (!list || !me) return;
    for (const file of Array.from(list).slice(0, 5)) {
      const buf = await file.arrayBuffer();
      const sha = await sha256Hex(buf);
      addEvidence("PERSONAL", { name: file.name, size: file.size, type: file.type || "application/octet-stream", sha256: sha, uploadedBy: me.id });
    }
    push("success", "Document(s) uploaded.");
  }

  return (
    <div>
      <PageHeader title="Documents" subtitle="Your personal documents and organisation policies."
        action={<><button className="btn-primary" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Upload Document</button><input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} /></>} />

      <Card className="mb-4">
        <CardHeader title="My documents" subtitle={`${mine.length} file(s) · SHA-256 fingerprint stored`} />
        <div className="divide-y divide-ink-100">
          {mine.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <FileText className="h-4 w-4 text-ink-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink-800">{e.name}</p>
                <p className="num text-xs text-ink-400 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> SHA-256 {e.sha256.slice(0, 20)}… · {(e.size / 1024).toFixed(0)} KB</p>
              </div>
              <button className="btn-secondary btn-sm" onClick={() => download(`${e.name}.txt`, `Placeholder for ${e.name}\nSHA-256 ${e.sha256}`, "text/plain")}><Download className="h-3.5 w-3.5" /> Download</button>
              <button className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-600" onClick={() => { removeEvidence(e.id); push("success", "Document removed."); }}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {!mine.length ? <p className="px-5 py-4 text-sm text-ink-500">No personal documents yet. Upload your documents (NID, certificates, etc.).</p> : null}
        </div>
      </Card>

      <Card>
        <CardHeader title="Organisation policies & documents" subtitle={`${policies.length} published`} />
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((p) => (
            <button key={p.id} onClick={() => setViewing(p)} className="rounded-lg border border-ink-200 p-4 text-left hover:border-brand-300 hover:bg-brand-50/40">
              <BookText className="mb-2 h-5 w-5 text-brand-500" />
              <p className="text-sm font-semibold text-ink-800">{p.title}</p>
              <p className="mt-0.5 text-xs text-ink-400">{p.category} · v{p.version} · {formatDate(p.publishedAt)}</p>
            </button>
          ))}
        </div>
      </Card>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.title ?? ""} subtitle={viewing ? `${viewing.category} · v${viewing.version}` : ""}>
        <p className="text-sm text-ink-600">{viewing?.body}</p>
      </Modal>
    </div>
  );
}
