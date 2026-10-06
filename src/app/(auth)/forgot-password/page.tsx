"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/primitives";
import { Field, TextInput } from "@/components/ui/field";

export default function ForgotPasswordPage() {
  const issueSetupLink = useStore((s) => s.issueSetupLink);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = issueSetupLink(email);
    setToken(t?.token ?? null);
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="card-pad text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-6 w-6" /></span>
        <h1 className="mt-3 text-lg font-bold text-ink-900">Reset link sent</h1>
        <p className="mt-1 text-sm text-ink-500">
          {token ? "A secure reset link was sent to your company email. Continue in the Outbox." : "If that email exists, a reset link has been sent."}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link href="/dev/outbox" className="btn-primary w-full">Open Email Outbox</Link>
          {token ? <Link href={`/setup-password?token=${token}`} className="btn-secondary w-full">Continue to set password</Link> : null}
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-pad">
      <h1 className="text-xl font-bold text-ink-900">Forgot password</h1>
      <p className="mt-1 text-sm text-ink-500">We’ll email you a secure link to set a new password.</p>
      <form onSubmit={submit} className="mt-5">
        <Field label="Company Email" required>
          <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@anwargroup.net" />
        </Field>
        <button type="submit" className="btn-primary w-full" disabled={!email.includes("@")}>Send reset link</button>
      </form>
      <p className="mt-4 text-center text-sm text-ink-500"><Link href="/login" className="link">Back to sign in</Link></p>
    </Card>
  );
}
