"use client";

import { useState } from "react";
import { Save, Mail, Phone, MapPin, IdCard, Briefcase, CalendarDays } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { deptName, buName } from "@/lib/selectors";
import { Card, CardHeader, PageHeader, Avatar, Badge } from "@/components/ui/primitives";
import { Field, Select, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const me = useCurrentUser();
  const updateProfile = useStore((s) => s.updateProfile);
  const departments = useStore((s) => s.departments);
  const businessUnits = useStore((s) => s.businessUnits);
  const { push } = useToast();

  const [f, setF] = useState({ corporatePhone: me?.corporatePhone ?? "", personalEmail: me?.personalEmail ?? "", bloodGroup: me?.bloodGroup ?? "", maritalStatus: me?.maritalStatus ?? "Single" });

  if (!me) return null;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your employee information. Company identity fields are read-only." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="card-pad lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={me.fullName} size={72} />
            <h3 className="mt-3 text-lg font-bold text-ink-900">{me.fullName}</h3>
            <p className="text-sm text-ink-500">{me.designation}</p>
            <Badge tone="brand" className="mt-2">{me.employeeId}</Badge>
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center gap-2 text-ink-600"><Briefcase className="h-4 w-4 text-ink-400" /> {deptName({ departments }, me.departmentId)}</li>
            <li className="flex items-center gap-2 text-ink-600"><MapPin className="h-4 w-4 text-ink-400" /> {buName({ businessUnits }, me.businessUnitId)}</li>
            <li className="flex items-center gap-2 text-ink-600"><Mail className="h-4 w-4 text-ink-400" /> {me.email}</li>
            <li className="flex items-center gap-2 text-ink-600"><IdCard className="h-4 w-4 text-ink-400" /> {me.status}</li>
            <li className="flex items-center gap-2 text-ink-600"><CalendarDays className="h-4 w-4 text-ink-400" /> Joined {formatDate(me.joiningDate)}</li>
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Edit profile" subtitle="Update your contact details. Company identity fields are managed by the System Admin." />
          <div className="p-5">
            <div className="grid gap-x-4 sm:grid-cols-2">
              <Field label="Full Name" hint="Read-only"><TextInput value={me.fullName} disabled /></Field>
              <Field label="Company Email" hint="Read-only"><TextInput value={me.email} disabled /></Field>
              <Field label="Employee ID" hint="Read-only"><TextInput value={me.employeeId} disabled /></Field>
              <Field label="Department" hint="Read-only"><TextInput value={deptName({ departments }, me.departmentId)} disabled /></Field>
              <Field label="Corporate Phone Number"><TextInput value={f.corporatePhone} onChange={(e) => setF({ ...f, corporatePhone: e.target.value })} placeholder="+8801…" /></Field>
              <Field label="Personal Email"><TextInput value={f.personalEmail} onChange={(e) => setF({ ...f, personalEmail: e.target.value })} /></Field>
              <Field label="Blood Group">
                <Select value={f.bloodGroup} onChange={(e) => setF({ ...f, bloodGroup: e.target.value })}>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => <option key={b}>{b}</option>)}
                </Select>
              </Field>
              <Field label="Marital Status">
                <Select value={f.maritalStatus} onChange={(e) => setF({ ...f, maritalStatus: e.target.value })}>
                  <option>Single</option><option>Married</option>
                </Select>
              </Field>
            </div>
            <button className="btn-primary" onClick={() => { updateProfile(me.id, f); push("success", "Profile updated."); }}><Save className="h-4 w-4" /> Save changes</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
