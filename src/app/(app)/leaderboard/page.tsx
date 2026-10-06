"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { kpisVisibleTo, deptName } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, ProgressBar, Avatar } from "@/components/ui/primitives";
import { averageAchievement, bandColor } from "@/lib/calc";
import { monthName, num } from "@/lib/utils";

export default function LeaderboardPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const departments = useStore((s) => s.departments);
  const kpis = useStore((s) => s.kpis);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [dept, setDept] = useState(me?.departmentId ?? "dept1");

  if (!me) return null;
  const isExec = ["HR_ADMIN", "FINANCE_ADMIN", "AUDIT_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(me.role);
  const activeDept = isExec ? dept : me.departmentId;

  const rows = useMemo(() => {
    const period = kpis.filter((k) => !k.deleted && k.periodMonth === month && ["APPROVED", "ADJUSTED", "COMPLETED"].includes(k.status));
    const members = users.filter((u) => u.departmentId === activeDept && (u.role === "EMPLOYEE" || u.role === "DEPT_HEAD"));
    const mapped = members.map((u) => {
      const uk = period.filter((k) => k.ownerId === u.id);
      return { user: u, avg: averageAchievement(uk), count: uk.length };
    }).filter((r) => r.count > 0);
    mapped.sort((a, b) => b.avg - a.avg || a.user.fullName.localeCompare(b.user.fullName));
    // ties share a rank
    let rank = 0;
    return mapped.map((r, i) => {
      if (i === 0 || r.avg !== mapped[i - 1].avg) rank = i + 1;
      return { ...r, rank };
    });
  }, [kpis, users, activeDept, month]);

  return (
    <div>
      <PageHeader title="Leaderboard" subtitle="Department ranking by average achievement for the period." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {isExec ? (
          <select className="input max-w-[260px]" value={dept} onChange={(e) => setDept(e.target.value)}>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        ) : (
          <span className="chip bg-brand-50 text-brand-700">{deptName({ departments }, activeDept)}</span>
        )}
        <select className="input max-w-[180px]" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m)} 2026</option>)}
        </select>
      </div>

      <Card>
        <CardHeader title="Ranking" subtitle={`${rows.length} employees with approved KPIs`} action={<Trophy className="h-4 w-4 text-amber-500" />} />
        {rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-500">No approved KPIs for this department and period.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {rows.map((r) => {
              const band = bandColor(r.avg);
              return (
                <li key={r.user.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`num flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${r.rank === 1 ? "bg-amber-100 text-amber-700" : r.rank === 2 ? "bg-ink-200 text-ink-700" : r.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-ink-100 text-ink-500"}`}>{r.rank}</span>
                  <Avatar name={r.user.fullName} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-800">{r.user.fullName}</p>
                    <p className="text-xs text-ink-400">{r.user.designation} · {r.count} KPI{r.count === 1 ? "" : "s"}</p>
                    <ProgressBar value={r.avg} tone={band} className="mt-1.5" />
                  </div>
                  <span className={`num text-sm font-semibold ${band === "green" ? "text-emerald-600" : band === "amber" ? "text-amber-600" : "text-red-600"}`}>{num(r.avg, 1)}%</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
