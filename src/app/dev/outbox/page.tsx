"use client";

import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/primitives";
import { formatDateTime } from "@/lib/utils";
import { Logo } from "@/components/shell/logo";

export default function OutboxPage() {
  const tokens = useStore((s) => s.setupTokens);
  const users = useStore((s) => s.users);

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="border-b border-ink-200 bg-white px-6 py-3.5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8" />
            <span className="h-6 w-px bg-ink-200" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-ink-900">Email Outbox</p>
              <p className="text-[11px] text-ink-500">In-app mail delivery (prototype)</p>
            </div>
          </div>
          <Link href="/login" className="btn-secondary btn-sm">Back to Sign in</Link>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="mb-4 text-sm text-ink-500">
          In production these emails are delivered by a transactional email service. In this prototype they appear here so the whole flow works offline.
        </p>
        {tokens.length === 0 ? (
          <Card className="card-pad text-center text-sm text-ink-500">
            <Mail className="mx-auto mb-2 h-6 w-6 text-ink-300" />
            No emails yet. Register a new account or request a password reset.
          </Card>
        ) : (
          <div className="space-y-3">
            {tokens.map((t) => {
              const user = users.find((u) => u.id === t.userId);
              return (
                <Card key={t.id} className="card-pad">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-800">Set your AGI OneDesk password</p>
                      <p className="text-xs text-ink-500">To: {t.email} · {formatDateTime(t.createdAt)}</p>
                      <p className="mt-1 text-xs text-ink-500">
                        {user ? `For ${user.fullName} (${user.employeeId})` : ""} · {t.usedAt ? "Used" : new Date(t.expiresAt).getTime() < Date.now() ? "Expired" : "Valid for 48 hours"}
                      </p>
                    </div>
                    <Link href={`/setup-password?token=${t.token}`} className="btn-primary btn-sm">
                      Open secure link <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
