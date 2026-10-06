"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { ROLE_HOME } from "@/lib/navigation";
import { Field, PasswordInput, Select, TextInput } from "@/components/ui/field";
import { Card } from "@/components/ui/primitives";

export default function LoginPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const users = useStore((s) => s.users);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [demo, setDemo] = useState("");

  const demoAccounts = [
    ["Super Admin", "superadmin@anwargroup.net"],
    ["System Admin", "sysadmin@anwargroup.net"],
    ["HR Admin", "hradmin@anwargroup.net"],
    ["Finance Admin", "financeadmin@anwargroup.net"],
    ["Audit Admin", "auditadmin@anwargroup.net"],
    ["Department Head (Growth Analytics)", "nasrin.islam@anwargroup.net"],
    ["Employee (Growth Analytics)", "jafrin.alam@anwargroup.net"],
    ["Employee (Human Resources)", "tania.karim@anwargroup.net"],
  ];

  function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const user = login(email, password);
    if (!user) { setError("Invalid company email or password. Use any demo account with password “demo1234” or your own password."); return; }
    router.push(ROLE_HOME[user.role]);
  }

  function pickDemo(v: string) {
    setDemo(v);
    if (v.includes("@")) { setEmail(v); setPassword("demo1234"); }
  }

  return (
    <Card className="card-pad">
      <h1 className="text-xl font-bold text-ink-900">Sign in</h1>
      <p className="mt-1 text-sm text-ink-500">Use your company email and password.</p>

      <form onSubmit={signIn} className="mt-5">
        <Field label="Demo account" hint="Pick a user type to fill the form, then press Sign in.">
          <Select value={demo} onChange={(e) => pickDemo(e.target.value)}>
            <option value="">Select a demo account…</option>
            {demoAccounts.map(([label, mail]) => (
              <option key={mail} value={mail}>{label} — {mail}</option>
            ))}
          </Select>
        </Field>
        <Field label="Company Email" required>
          <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@anwargroup.net" />
        </Field>
        <Field label="Password" required>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>

        {error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="mb-4 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="link">Forgot password?</Link>
          <Link href="/register" className="link">Create an account</Link>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={!email || password.length < 4}>Sign in</button>
      </form>

      <p className="mt-4 text-center text-xs text-ink-400">
        {users.length} seeded Anwar Group accounts · password <span className="num">demo1234</span> for quick demo login
      </p>
    </Card>
  );
}
