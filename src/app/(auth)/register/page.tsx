"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/primitives";
import { Field, Select, TextInput } from "@/components/ui/field";

export default function RegisterPage() {
  const register = useStore((s) => s.register);
  const businessUnits = useStore((s) => s.businessUnits);
  const departments = useStore((s) => s.departments);

  const [form, setForm] = useState({ fullName: "", email: "", employeeId: "", businessUnitId: "", departmentId: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ token: string } | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.email || !form.employeeId || !form.businessUnitId || !form.departmentId) {
      setError("All five fields are required."); return;
    }
    if (!form.email.toLowerCase().endsWith("@anwargroup.net")) {
      setError("Only @anwargroup.net company emails can be registered."); return;
    }
    const res = register(form);
    if (!res.ok) { setError(res.error); return; }
    setDone({ token: res.token.token });
  }

  if (done) {
    return (
      <Card className="card-pad text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h1 className="mt-3 text-lg font-bold text-ink-900">Check your inbox</h1>
        <p className="mt-1 text-sm text-ink-500">
          A secure, single-use setup link (valid 48 hours) was sent to your company email. In this prototype, open the in-app Outbox to continue.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link href={`/dev/outbox`} className="btn-primary w-full">Open Email Outbox</Link>
          <Link href={`/setup-password?token=${done.token}`} className="btn-secondary w-full">Continue to set password</Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-pad">
      <h1 className="text-xl font-bold text-ink-900">Create an account</h1>
      <p className="mt-1 text-sm text-ink-500">Employee self-registration with your company email.</p>
      <form onSubmit={submit} className="mt-5">
        <Field label="Full Name" required><TextInput value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="e.g. Ayesha Siddiqua" /></Field>
        <Field label="Company Email" required hint="Must end with @anwargroup.net"><TextInput type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@anwargroup.net" /></Field>
        <Field label="Employee ID" required><TextInput value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} placeholder="e.g. AG-1234" /></Field>
        <Field label="Business Unit" required>
          <Select value={form.businessUnitId} onChange={(e) => set("businessUnitId", e.target.value)}>
            <option value="">Select a business unit…</option>
            {businessUnits.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        </Field>
        <Field label="Department" required>
          <Select value={form.departmentId} onChange={(e) => set("departmentId", e.target.value)}>
            <option value="">Select a department…</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </Field>
        {error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button type="submit" className="btn-primary w-full">Register</button>
      </form>
      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-400">
        <Mail className="h-3.5 w-3.5" /> Setup emails appear in the in-app Outbox
      </p>
      <p className="mt-3 text-center text-sm text-ink-500">Already registered? <Link href="/login" className="link">Sign in</Link></p>
    </Card>
  );
}
