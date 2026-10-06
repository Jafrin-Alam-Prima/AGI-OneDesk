"use client";

import { cn, initials, colorFor } from "@/lib/utils";
import type { KpiStatus, RequestStatus } from "@/lib/types";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function CardHeader({
  title, subtitle, action, className,
}: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4", className)}>
      <div>
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Avatar({ name, size = 36, src }: { name: string; size?: number; src?: string }) {
  const bg = colorFor(name);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: src ? undefined : bg, fontSize: size * 0.38 }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

export function Badge({
  children, tone = "neutral", className,
}: { children: React.ReactNode; tone?: "neutral" | "green" | "red" | "amber" | "blue" | "purple" | "brand"; className?: string }) {
  const tones = {
    neutral: "bg-ink-100 text-ink-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-sky-100 text-sky-700",
    purple: "bg-violet-100 text-violet-700",
    brand: "bg-brand-100 text-brand-700",
  };
  return <span className={cn("chip", tones[tone], className)}>{children}</span>;
}

const KPI_STATUS: Record<KpiStatus, { tone: Parameters<typeof Badge>[0]["tone"]; label: string }> = {
  DRAFT: { tone: "neutral", label: "Draft" },
  SUBMITTED: { tone: "amber", label: "Submitted" },
  RETURNED: { tone: "red", label: "Returned" },
  APPROVED: { tone: "green", label: "Approved" },
  ADJUSTED: { tone: "green", label: "Adjusted" },
  REJECTED: { tone: "red", label: "Rejected" },
  COMPLETED: { tone: "green", label: "Completed" },
};

export function KpiStatusBadge({ status }: { status: KpiStatus }) {
  const s = KPI_STATUS[status] ?? KPI_STATUS.DRAFT;
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

const REQ_STATUS: Record<RequestStatus, { tone: Parameters<typeof Badge>[0]["tone"]; label: string }> = {
  PENDING: { tone: "amber", label: "Pending" },
  APPROVED: { tone: "green", label: "Approved" },
  REJECTED: { tone: "red", label: "Rejected" },
  RETURNED: { tone: "red", label: "Returned" },
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const s = REQ_STATUS[status] ?? REQ_STATUS.PENDING;
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function ProgressBar({ value, tone = "brand", className }: { value: number; tone?: "brand" | "green" | "amber" | "red"; className?: string }) {
  const colors = { brand: "bg-brand-600", green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500" };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-100", className)}>
      <div className={cn("h-full rounded-full transition-all", colors[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function StatCard({
  label, value, hint, icon, tone = "brand",
}: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: React.ReactNode; tone?: "brand" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-sky-50 text-sky-600",
  };
  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
          <p className="num mt-2 text-2xl font-bold text-ink-900">{value}</p>
          {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
        </div>
        {icon ? <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tones[tone])}>{icon}</span> : null}
      </div>
    </div>
  );
}

export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, message, icon, action }: { title: string; message?: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-ink-200 px-6 py-12 text-center">
      {icon ? <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">{icon}</div> : null}
      <p className="text-sm font-semibold text-ink-700">{title}</p>
      {message ? <p className="mt-1 max-w-md text-sm text-ink-500">{message}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Tabs({
  tabs, active, onChange,
}: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-ink-200">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "-mb-px border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
            active === t.id ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-800"
          )}
        >
          {t.label}
          {typeof t.count === "number" ? (
            <span className={cn("ml-1.5 rounded-full px-1.5 py-0.5 text-xs", active === t.id ? "bg-brand-100 text-brand-700" : "bg-ink-100 text-ink-500")}>{t.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
