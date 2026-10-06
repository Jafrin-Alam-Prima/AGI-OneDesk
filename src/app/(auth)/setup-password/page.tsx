"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/primitives";
import { Field, PasswordInput } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const POLICY = [
  { id: "len", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { id: "digit", label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { id: "special", label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

function SetupForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const setPassword = useStore((s) => s.setPassword);
  const tokens = useStore((s) => s.setupTokens);
  const users = useStore((s) => s.users);

  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const tokenRec = tokens.find((t) => t.token === token);
  const valid = POLICY.every((p) => p.test(pw));
  const match = pw.length > 0 && pw === confirm;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!valid) { setError("Password does not meet the strength policy."); return; }
    if (!match) { setError("New Password and Confirm Password do not match."); return; }
    const res = setPassword(token, pw);
    if (!res.ok) { setError(res.error ?? "Could not set password."); return; }
    setOk(true);
  }

  if (!token || !tokenRec) {
    return (
      <Card className="card-pad text-center">
        <h1 className="text-lg font-bold text-ink-900">Invalid or missing setup link</h1>
        <p className="mt-1 text-sm text-ink-500">This setup link is invalid. Please register again or request a new link.</p>
        <Link href="/dev/outbox" className="btn-primary mt-4 w-full">Open Outbox</Link>
      </Card>
    );
  }

  if (tokenRec.usedAt) {
    return (
      <Card className="card-pad text-center">
        <h1 className="text-lg font-bold text-ink-900">Link already used</h1>
        <p className="mt-1 text-sm text-ink-500">This setup link has already been used. Please sign in, or request a new link.</p>
        <Link href="/login" className="btn-primary mt-4 w-full">Go to Sign in</Link>
      </Card>
    );
  }

  if (new Date(tokenRec.expiresAt).getTime() < Date.now()) {
    return (
      <Card className="card-pad text-center">
        <h1 className="text-lg font-bold text-ink-900">Link expired</h1>
        <p className="mt-1 text-sm text-ink-500">This setup link has expired. Please request a new one.</p>
        <Link href="/forgot-password" className="btn-primary mt-4 w-full">Request a new link</Link>
      </Card>
    );
  }

  const owner = users.find((u) => u.id === tokenRec.userId);

  if (ok) {
    return (
      <Card className="card-pad text-center">
        <h1 className="text-lg font-bold text-ink-900">Password created</h1>
        <p className="mt-1 text-sm text-ink-500">Your account is now active. Sign in with your company email and password.</p>
        <Link href="/login" className="btn-primary mt-4 w-full">Go to Sign in</Link>
      </Card>
    );
  }

  return (
    <Card className="card-pad">
      <h1 className="text-xl font-bold text-ink-900">Set your password</h1>
      <p className="mt-1 text-sm text-ink-500">For {owner?.email ?? tokenRec.email}</p>
      <form onSubmit={submit} className="mt-5">
        <Field label="New Password" required>
          <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Create a strong password" />
        </Field>
        <Field label="Confirm Password" required error={confirm.length > 0 && !match ? "Passwords do not match." : undefined}>
          <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" invalid={confirm.length > 0 && !match} />
        </Field>

        <div className="mb-4 rounded-lg bg-ink-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Password policy</p>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {POLICY.map((p) => {
              const passed = p.test(pw);
              return (
                <li key={p.id} className={cn("flex items-center gap-2 text-xs", passed ? "text-emerald-600" : "text-ink-500")}>
                  {passed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-ink-300" />} {p.label}
                </li>
              );
            })}
          </ul>
        </div>

        {error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <button type="submit" className="btn-primary w-full" disabled={!valid || !match}>Create password</button>
      </form>
    </Card>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<Card className="card-pad">Loading…</Card>}>
      <SetupForm />
    </Suspense>
  );
}
