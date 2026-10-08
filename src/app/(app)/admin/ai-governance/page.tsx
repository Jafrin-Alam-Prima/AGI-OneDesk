"use client";

import { useState } from "react";
import { ShieldCheck, Activity, SlidersHorizontal, MessageSquare, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, PageHeader, StatCard, Badge } from "@/components/ui/primitives";
import { Field, TextInput, TextArea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export default function AiGovernancePage() {
  const { push } = useToast();
  const [thresholds, setThresholds] = useState({ flagAt: 65, minExplain: 100, maxAutoAdverse: 0 });
  const [feedback, setFeedback] = useState("");
  const [log, setLog] = useState<{ at: string; text: string }[]>([]);

  return (
    <div>
      <PageHeader
        title="AI Governance"
        subtitle="Fairness thresholds, monitoring and feedback for the simulated AI features. No AI output triggers an automatic adverse decision."
        action={<Badge tone="brand"><ShieldCheck className="mr-1 h-3 w-3" /> Human-in-the-loop</Badge>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Explanation coverage" value={`${thresholds.minExplain}%`} tone="green" icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Auto adverse actions" value={`${thresholds.maxAutoAdverse}%`} tone="green" hint="Policy: always 0" />
        <StatCard label="AI suggestions accepted" value="72%" hint="Recruiter shortlists (demo)" tone="blue" />
        <StatCard label="AI suggestions overridden" value="28%" hint="Human overrides (demo)" tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Fairness & thresholds" subtitle="Guardrails applied to every AI result." action={<SlidersHorizontal className="h-4 w-4 text-ink-400" />} />
          <div className="grid gap-3 p-5 sm:grid-cols-3">
            <Field label="Flag when risk ≥"><TextInput type="number" value={thresholds.flagAt} onChange={(e) => setThresholds({ ...thresholds, flagAt: Number(e.target.value) })} /></Field>
            <Field label="Min explanation coverage (%)"><TextInput type="number" value={thresholds.minExplain} onChange={(e) => setThresholds({ ...thresholds, minExplain: Number(e.target.value) })} /></Field>
            <Field label="Max auto adverse actions (%)"><TextInput type="number" value={thresholds.maxAutoAdverse} onChange={(e) => setThresholds({ ...thresholds, maxAutoAdverse: Number(e.target.value) })} /></Field>
          </div>
          <p className="flex items-center gap-1.5 border-t border-ink-100 px-5 py-3 text-xs text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Every AI feature ships a “Why” panel and a human decision control (Flag / Shortlist / Escalate).
          </p>
        </Card>

        <Card>
          <CardHeader title="Monitoring" subtitle="Drift and quality signals (simulated)." action={<Activity className="h-4 w-4 text-ink-400" />} />
          <div className="divide-y divide-ink-100 p-5 pt-0">
            {[
              ["Attrition model", "Stable", "green"],
              ["Resume matcher", "Stable", "green"],
              ["Sentiment analyser", "Watch", "amber"],
              ["HR chatbot (off-scope)", "Not enabled", "neutral"],
            ].map(([name, status, tone]) => (
              <div key={name} className="flex items-center justify-between py-3">
                <span className="text-sm text-ink-700">{name}</span>
                <Badge tone={tone as "green" | "amber" | "neutral"}>{status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Feedback capture" subtitle="Report an unfair or wrong AI result — reviewed by HR governance." action={<MessageSquare className="h-4 w-4 text-ink-400" />} />
        <div className="p-5">
          <Field label="Feedback">
            <TextArea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="e.g. Attrition score for X looks too high because…" />
          </Field>
          <div className="flex justify-end">
            <button className="btn-primary" disabled={!feedback.trim()} onClick={() => { setLog((l) => [{ at: new Date().toISOString(), text: feedback.trim() }, ...l]); setFeedback(""); push("success", "Feedback recorded for review."); }}>Submit feedback</button>
          </div>
          {log.length ? (
            <ul className="mt-4 space-y-2">
              {log.map((f, i) => (
                <li key={i} className="rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700">{f.text}<span className="ml-2 text-xs text-ink-400">{f.at.slice(0, 16).replace("T", " ")}</span></li>
              ))}
            </ul>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
