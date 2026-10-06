"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Briefcase, Mail, Phone, MapPin } from "lucide-react";
import { useStore } from "@/lib/store";
import { deptName, buName } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Avatar, Badge, KpiStatusBadge, EmptyState, ProgressBar } from "@/components/ui/primitives";
import { achievement } from "@/lib/calc";
import { formatDate, monthName, num } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/navigation";

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const users = useStore((s) => s.users);
  const departments = useStore((s) => s.departments);
  const businessUnits = useStore((s) => s.businessUnits);
  const kpis = useStore((s) => s.kpis);
  const attendance = useStore((s) => s.attendance);

  const user = users.find((u) => u.id === params.id);
  if (!user) return <EmptyState title="Employee not found" action={<Link href="/employees" className="btn-primary">Back to Employees</Link>} />;

  const uk = kpis.filter((k) => !k.deleted && k.ownerId === user.id).sort((a, b) => b.periodMonth - a.periodMonth);
  const att = attendance.filter((a) => a.userId === user.id);
  const present = att.filter((a) => a.status === "PRESENT").length;
  const absent = att.filter((a) => a.status === "ABSENT").length;

  return (
    <div>
      <div className="mb-4"><Link href="/employees" className="btn-ghost btn-sm"><ArrowLeft className="h-4 w-4" /> Back to Employees</Link></div>
      <PageHeader title={user.fullName} subtitle={`${user.designation} · ${deptName({ departments }, user.departmentId)}`} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="card-pad">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user.fullName} size={72} />
            <h3 className="mt-3 text-lg font-bold text-ink-900">{user.fullName}</h3>
            <p className="text-sm text-ink-500">{user.designation}</p>
            <Badge tone="brand" className="mt-2">{user.employeeId}</Badge>
            <Badge tone={user.status === "ACTIVE" ? "green" : "amber"} className="mt-1">{ROLE_LABEL[user.role]}</Badge>
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center gap-2 text-ink-600"><Mail className="h-4 w-4 text-ink-400" /> {user.email}</li>
            <li className="flex items-center gap-2 text-ink-600"><Phone className="h-4 w-4 text-ink-400" /> {user.corporatePhone ?? "—"}</li>
            <li className="flex items-center gap-2 text-ink-600"><Briefcase className="h-4 w-4 text-ink-400" /> {deptName({ departments }, user.departmentId)}</li>
            <li className="flex items-center gap-2 text-ink-600"><MapPin className="h-4 w-4 text-ink-400" /> {buName({ businessUnits }, user.businessUnitId)}</li>
          </ul>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="card-pad"><p className="text-xs uppercase tracking-wide text-ink-500">KPIs</p><p className="num mt-1 text-2xl font-bold text-ink-900">{uk.length}</p></Card>
            <Card className="card-pad"><p className="text-xs uppercase tracking-wide text-ink-500">Present (Oct)</p><p className="num mt-1 text-2xl font-bold text-emerald-600">{present}</p></Card>
            <Card className="card-pad"><p className="text-xs uppercase tracking-wide text-ink-500">Absent (Oct)</p><p className="num mt-1 text-2xl font-bold text-red-600">{absent}</p></Card>
          </div>

          <Card>
            <CardHeader title="KPI history" subtitle={`${uk.length} KPI records`} />
            <div className="divide-y divide-ink-100">
              {uk.map((k) => (
                <div key={k.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-800">{k.name}</p>
                    <p className="text-xs text-ink-400">{monthName(k.periodMonth)} {k.periodYear} · Weight {k.weight}%</p>
                  </div>
                  <div className="hidden w-32 sm:block"><ProgressBar value={achievement(k.target, k.actual)} /></div>
                  <span className="num w-14 text-right text-sm font-semibold text-ink-700">{num(achievement(k.target, k.actual), 0)}%</span>
                  <KpiStatusBadge status={k.status} />
                </div>
              ))}
              {!uk.length ? <p className="px-5 py-4 text-sm text-ink-500">No KPIs recorded.</p> : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Employment" />
            <dl className="grid grid-cols-2 gap-4 p-5 text-sm">
              <div><dt className="text-ink-400">Joining date</dt><dd className="text-ink-800">{formatDate(user.joiningDate)}</dd></div>
              <div><dt className="text-ink-400">Confirmation</dt><dd className="text-ink-800">{user.confirmationDate ? formatDate(user.confirmationDate) : "N/A"}</dd></div>
              <div><dt className="text-ink-400">Blood group</dt><dd className="text-ink-800">{user.bloodGroup ?? "—"}</dd></div>
              <div><dt className="text-ink-400">Marital status</dt><dd className="text-ink-800">{user.maritalStatus ?? "—"}</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
