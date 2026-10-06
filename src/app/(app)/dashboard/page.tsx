"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Target, Clock, CheckCircle2, Undo2, TrendingUp, Users, Megaphone, CalendarDays, ArrowRight } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { kpisVisibleTo, pendingFor, nameOf, deptName } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, StatCard, ProgressBar, Badge, Avatar } from "@/components/ui/primitives";
import { achievement, averageAchievement, bandColor } from "@/lib/calc";
import { formatDate, monthName, num } from "@/lib/utils";

function serviceLength(joinISO?: string): string {
  if (!joinISO) return "—";
  const start = new Date(joinISO);
  const now = new Date();
  if (Number.isNaN(start.getTime())) return "—";
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  let days = now.getDate() - start.getDate();
  if (days < 0) { months -= 1; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  const years = Math.floor(months / 12);
  const rem = ((months % 12) + 12) % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  parts.push(`${rem} month${rem === 1 ? "" : "s"}`);
  parts.push(`${days} day${days === 1 ? "" : "s"}`);
  return parts.join(" ");
}

export default function DashboardPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const departments = useStore((s) => s.departments);
  const announcements = useStore((s) => s.announcements);
  const kpis = useStore((s) => s.kpis);
  const leaveBalances = useStore((s) => s.leaveBalances);
  const leaveTypes = useStore((s) => s.leaveTypes);
  const attendance = useStore((s) => s.attendance);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const visible = useMemo(() => kpisVisibleTo(useStore.getState(), me), [me, kpis]);
  const mine = useMemo(() => (me ? kpis.filter((k) => !k.deleted && k.ownerId === me.id) : []), [kpis, me]);
  const pending = useMemo(() => pendingFor(useStore.getState(), me), [me, kpis]);

  if (!me) return null;

  const isEmployeeOnly = me.role === "EMPLOYEE";
  const isHead = me.role === "DEPT_HEAD";
  const isExec = ["HR_ADMIN", "FINANCE_ADMIN", "AUDIT_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(me.role);

  const periodVisible = visible.filter((k) => k.periodMonth === month);
  const approved = periodVisible.filter((k) => ["APPROVED", "ADJUSTED", "COMPLETED"].includes(k.status));
  const avg = averageAchievement(approved);

  const myApproved = mine.filter((k) => ["APPROVED", "ADJUSTED", "COMPLETED"].includes(k.status));
  const myAvg = averageAchievement(myApproved);
  const myBalances = leaveBalances.filter((b) => b.userId === me.id);
  const todayAtt = attendance.find((a) => a.userId === me.id && a.date === "2026-10-06");
  const myNotifs = useStore.getState().notifications.filter((n) => n.userId === me.id && !n.read);

  /* Department leaderboard preview */
  const deptUsers = users.filter((u) => u.departmentId === me.departmentId && u.role === "EMPLOYEE");
  const leaderboard = deptUsers.map((u) => {
    const uk = periodVisible.filter((k) => k.ownerId === u.id && ["APPROVED", "ADJUSTED", "COMPLETED"].includes(k.status));
    return { user: u, avg: averageAchievement(uk), count: uk.length };
  }).sort((a, b) => b.avg - a.avg).slice(0, 5);

  const belowTarget = periodVisible.filter((k) => achievement(k.target, k.actual) < 100 && ["SUBMITTED", "APPROVED", "ADJUSTED"].includes(k.status));

  // Attendance calendar for the current month (PeopleDesk ESS style)
  const calNow = new Date();
  const calYear = calNow.getFullYear();
  const calM = calNow.getMonth();
  const daysInMonth = new Date(calYear, calM + 1, 0).getDate();
  const attByDate: Record<string, string> = {};
  for (const a of attendance) if (a.userId === me.id) attByDate[a.date] = a.status;
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const dow = new Date(calYear, calM, d).getDay();
    const iso = `${calYear}-${String(calM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const status = attByDate[iso] ?? (dow === 5 ? "OFFDAY" : dow === 6 ? "HOLIDAY" : "—");
    return { d, status, dow };
  });
  const calLead = new Date(calYear, calM, 1).getDay();
  const calLabel = `${monthName(calM + 1)} ${calYear}`;
  const CAL_TONE: Record<string, string> = {
    PRESENT: "bg-emerald-100 text-emerald-700", ABSENT: "bg-red-100 text-red-700", LATE: "bg-amber-100 text-amber-700",
    LEAVE: "bg-violet-100 text-violet-700", MOVEMENT: "bg-sky-100 text-sky-700", OFFDAY: "bg-ink-100 text-ink-400",
    HOLIDAY: "bg-blue-100 text-blue-700",
  };
  const presentCount = calendarDays.filter((x) => x.status === "PRESENT").length;
  const lateCount = calendarDays.filter((x) => x.status === "LATE").length;
  const leaveCount = calendarDays.filter((x) => x.status === "LEAVE").length;
  const absentCount = calendarDays.filter((x) => x.status === "ABSENT").length;

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-ink-500">{formatDate("2026-10-06")}</p>
        <h1 className="text-xl font-bold text-ink-900">Hello {me.fullName.split(" ")[0]}, welcome back!</h1>
      </div>

      {/* ---------- Employee view ---------- */}
      {isEmployeeOnly ? (
        <>
          {/* Today + service (PeopleDesk ESS header row) */}
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            <Card className="card-pad">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Clock className="h-6 w-6" /></span>
                <div className="min-w-[140px] flex-1">
                  <p className="text-xs uppercase tracking-wide text-ink-400">Today Working Period</p>
                  <p className="mt-0.5 text-sm font-semibold text-ink-800">{todayAtt?.inTime ? `Checked in at ${todayAtt.inTime}` : "Please check-in"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-ink-400">General</p>
                  <p className="mt-0.5 text-sm font-semibold text-ink-800">09:00 AM – 06:00 PM</p>
                </div>
                <Link href="/attendance" className="btn-primary btn-sm">Check in / out</Link>
              </div>
            </Card>
            <Card className="card-pad">
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-xs uppercase tracking-wide text-ink-400">Length of Service</p><p className="mt-1 text-sm font-semibold text-ink-800">{serviceLength(me.joiningDate)}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-ink-400">Joining Date</p><p className="mt-1 text-sm font-semibold text-ink-800">{formatDate(me.joiningDate)}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-ink-400">Confirmation Date</p><p className="mt-1 text-sm font-semibold text-ink-800">{me.confirmationDate ? formatDate(me.confirmationDate) : "N/A"}</p></div>
              </div>
            </Card>
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="My KPIs" value={mine.filter((k) => !k.deleted).length} hint="This year" icon={<Target className="h-5 w-5" />} />
            <StatCard label="Awaiting approval" value={mine.filter((k) => k.status === "SUBMITTED").length} tone="amber" icon={<Clock className="h-5 w-5" />} />
            <StatCard label="Approved" value={myApproved.length} tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
            <StatCard label="Avg achievement" value={`${num(myAvg, 1)}%`} tone="blue" icon={<TrendingUp className="h-5 w-5" />} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Attendance Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader
                title="Attendance Calendar"
                subtitle={calLabel}
                action={<Link href="/attendance" className="link text-sm">Full attendance</Link>}
              />
              <div className="flex flex-wrap items-center gap-4 border-b border-ink-100 px-5 py-2.5 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Present <span className="num text-ink-500">{presentCount}</span></span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Late <span className="num text-ink-500">{lateCount}</span></span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-violet-400" /> Leave <span className="num text-ink-500">{leaveCount}</span></span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Absent <span className="num text-ink-500">{absentCount}</span></span>
              </div>
              <div className="p-5">
                <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: calLead }).map((_, i) => <div key={`lead${i}`} />)}
                  {calendarDays.map((x) => (
                    <div key={x.d} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-ink-100 p-1">
                      <span className="num text-xs font-semibold text-ink-700">{x.d}</span>
                      <span className={`mt-0.5 rounded px-1 py-0.5 text-[9px] font-medium ${CAL_TONE[x.status] ?? "text-ink-300"}`}>
                        {x.status === "—" ? "" : x.status.charAt(0) + x.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Side panels */}
            <div className="space-y-4">
              <Card>
                <CardHeader title="My Manager" />
                <div className="space-y-3 p-5 pt-4">
                  {[["Supervisor", me.managerId], ["Line Manager", me.managerId]].map(([label, mid], i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar name={nameOf(users, mid as string)} size={34} />
                      <div>
                        <p className="text-sm font-medium text-ink-800">{nameOf(users, mid as string)}</p>
                        <p className="text-xs text-ink-400">{label}</p>
                      </div>
                    </div>
                  ))}
                  {!me.managerId ? <p className="text-sm text-ink-500">No manager assigned yet.</p> : null}
                </div>
              </Card>

              <Card>
                <CardHeader title="Leave Balance" />
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-ink-50/60"><tr><th className="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-500">Type</th><th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-500">Taken</th><th className="px-5 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-500">Remaining</th></tr></thead>
                    <tbody>
                      {myBalances.slice(0, 4).map((b) => {
                        const lt = leaveTypes.find((t) => t.id === b.leaveTypeId);
                        return (
                          <tr key={b.id} className="border-t border-ink-100">
                            <td className="px-5 py-2 text-sm text-ink-700">{lt?.name}</td>
                            <td className="num px-3 py-2 text-right text-sm text-ink-600">{b.taken}</td>
                            <td className="num px-5 py-2 text-right text-sm font-semibold text-ink-800">{Math.max(0, b.entitled - b.taken)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-ink-100 px-5 py-3">
                  <Link href="/leave" className="link text-sm">Apply for leave</Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Notice board */}
          <Card className="mt-4">
            <CardHeader title="Notice Board / Announcements" action={<Link href="/announcements" className="link text-sm">View all</Link>} />
            <ul className="divide-y divide-ink-100">
              {announcements.slice(0, 3).map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-4">
                  <Megaphone className="mt-0.5 h-4 w-4 text-brand-500" />
                  <div>
                    <p className="text-sm font-medium text-ink-800">{a.title}</p>
                    <p className="mt-0.5 text-sm text-ink-500">{a.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </>
      ) : null}

      {/* ---------- Head / exec view ---------- */}
      {!isEmployeeOnly ? (
        <>
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm text-ink-500">Period</label>
            <select className="input max-w-[180px]" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m)} 2026</option>)}
            </select>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={isExec ? "Org avg achievement" : "Department avg achievement"} value={`${num(avg, 1)}%`} hint={`${approved.length} approved KPIs`} icon={<TrendingUp className="h-5 w-5" />} />
            <StatCard label="Pending evaluations" value={pending.length} tone="amber" icon={<Clock className="h-5 w-5" />} />
            <StatCard label="Total approved" value={approved.length} tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
            <StatCard label="Rejected" value={periodVisible.filter((k) => k.status === "REJECTED").length} tone="red" icon={<Undo2 className="h-5 w-5" />} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="KPIs below target" subtitle="Achievement under 100% for the selected period" />
              <ul className="divide-y divide-ink-100">
                {belowTarget.length === 0 ? <li className="px-5 py-6 text-sm text-ink-500">No KPIs below target this period.</li> : belowTarget.slice(0, 6).map((k) => {
                  const o = users.find((u) => u.id === k.ownerId);
                  return (
                    <li key={k.id} className="flex items-center gap-3 px-5 py-3">
                      <Avatar name={o?.fullName ?? "?"} size={30} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink-800">{k.name}</p>
                        <p className="text-xs text-ink-400">{o?.fullName} · {o?.employeeId}</p>
                      </div>
                      <span className="num text-sm font-semibold text-red-600">{num(achievement(k.target, k.actual), 0)}%</span>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card>
              <CardHeader title="Leaderboard preview" subtitle={isExec ? "Top performers this period" : `${deptName({ departments }, me.departmentId)} — top performers`} action={<Link href="/leaderboard" className="link text-sm">Full leaderboard</Link>} />
              <ul className="divide-y divide-ink-100">
                {leaderboard.length === 0 ? <li className="px-5 py-6 text-sm text-ink-500">No approved KPIs yet.</li> : leaderboard.map((row, i) => (
                  <li key={row.user.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="num flex h-6 w-6 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600">{i + 1}</span>
                    <Avatar name={row.user.fullName} size={30} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink-800">{row.user.fullName}</p>
                      <ProgressBar value={row.avg} tone={bandColor(row.avg)} className="mt-1" />
                    </div>
                    <span className="num text-sm font-semibold text-ink-700">{num(row.avg, 0)}%</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {isExec ? (
            <Card className="mt-4">
              <CardHeader title="Departments" subtitle="Average achievement by department this period" />
              <div className="divide-y divide-ink-100">
                {departments.map((d) => {
                  const ids = new Set(users.filter((u) => u.departmentId === d.id).map((u) => u.id));
                  const dk = periodVisible.filter((k) => ids.has(k.ownerId) && ["APPROVED", "ADJUSTED", "COMPLETED"].includes(k.status));
                  const dAvg = averageAchievement(dk);
                  return (
                    <div key={d.id} className="flex items-center gap-4 px-5 py-3">
                      <Users className="h-4 w-4 text-ink-400" />
                      <span className="w-48 shrink-0 text-sm text-ink-700">{d.name}</span>
                      <ProgressBar value={dAvg} tone={bandColor(dAvg)} className="flex-1" />
                      <span className="num w-14 text-right text-sm font-semibold text-ink-700">{num(dAvg, 0)}%</span>
                      <Badge tone="neutral">{dk.length} KPIs</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null}
        </>
      ) : null}

      {isHead ? (
        <Card className="mt-4">
          <CardHeader title="Quick actions" />
          <div className="flex flex-wrap gap-2 p-5">
            <Link href="/kpi-requests" className="btn-primary btn-sm">Review KPI requests{pending.length ? ` (${pending.length})` : ""} <ArrowRight className="h-3.5 w-3.5" /></Link>
            <Link href="/my-kpi" className="btn-secondary btn-sm">My KPI</Link>
            <Link href="/leaderboard" className="btn-secondary btn-sm">Leaderboard</Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
