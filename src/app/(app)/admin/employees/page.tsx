"use client";

import { useState } from "react";
import { UserCog, UserPlus, Mail } from "lucide-react";
import { useStore } from "@/lib/store";
import { deptName } from "@/lib/selectors";
import { PageHeader, Avatar, Badge, Card, CardHeader } from "@/components/ui/primitives";
import { DataTable, ActionMenu, type Column } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABEL } from "@/lib/navigation";
import type { Role, User } from "@/lib/types";

export default function AdminEmployeesPage() {
  const users = useStore((s) => s.users);
  const departments = useStore((s) => s.departments);
  const businessUnits = useStore((s) => s.businessUnits);
  const updateEmployee = useStore((s) => s.updateEmployee);
  const createEmployee = useStore((s) => s.createEmployee);
  const setStatus = useStore((s) => s.setEmployeeStatus);
  const register = useStore((s) => s.register);
  const { push } = useToast();

  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState(false);
  const [f, setF] = useState({ fullName: "", email: "", employeeId: "", role: "EMPLOYEE" as Role, designation: "Officer", departmentId: departments[0]?.id ?? "", businessUnitId: businessUnits[0]?.id ?? "" });
  const [inv, setInv] = useState({ fullName: "", email: "", employeeId: "", designation: "Head of Department", departmentId: departments[0]?.id ?? "", businessUnitId: businessUnits[0]?.id ?? "" });

  const cols: Column<User>[] = [
    { key: "fullName", header: "User", render: (u) => <span className="flex items-center gap-2.5"><Avatar name={u.fullName} size={32} /><span><span className="block font-medium text-ink-800">{u.fullName}</span><span className="text-xs text-ink-400">{u.email}</span></span></span>, value: (u) => u.fullName },
    { key: "departmentId", header: "Department", render: (u) => deptName({ departments }, u.departmentId), value: (u) => deptName({ departments }, u.departmentId) },
    { key: "role", header: "Role", render: (u) => <Badge tone={u.role === "EMPLOYEE" ? "neutral" : "brand"}>{ROLE_LABEL[u.role]}</Badge>, value: (u) => ROLE_LABEL[u.role] },
    { key: "status", header: "Status", render: (u) => <Badge tone={u.status === "ACTIVE" ? "green" : u.status === "PENDING_SETUP" ? "amber" : "red"}>{u.status.replace("_", " ")}</Badge> },
  ];

  const pendingInvites = users.filter((u) => u.status === "PENDING_SETUP");

  return (
    <div>
      <PageHeader title="Users & Roles" subtitle="Manage roles, permissions and access across AGI OneDesk."
        action={<div className="flex gap-2"><button className="btn-secondary" onClick={() => setInvite(true)}><Mail className="h-4 w-4" /> Invite Department Head</button><button className="btn-primary" onClick={() => setOpen(true)}><UserPlus className="h-4 w-4" /> Add User</button></div>} />

      {pendingInvites.length ? (
        <Card className="mb-4 border-amber-200">
          <CardHeader title="Pending invitations" subtitle={`${pendingInvites.length} awaiting password setup`} action={<a href="/dev/outbox" className="link text-sm">Open Outbox</a>} />
          <ul className="divide-y divide-ink-100">
            {pendingInvites.map((u) => (
              <li key={u.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-ink-700">{u.fullName} — {u.email}</span>
                <Badge tone="amber">Invitation pending</Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <DataTable columns={cols} rows={users} searchKeys={["fullName", "email", "employeeId"]} searchPlaceholder="Search users…" pageSize={12}
        emptyTitle="No users" />

      <Card className="mt-5">
        <CardHeader title="Role assignment" subtitle="Change a user's role. Department-scoped roles see only their department." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-ink-50/60"><tr><th className="th">User</th><th className="th">Role</th><th className="th">Department</th><th className="th">Status</th></tr></thead>
            <tbody>
              {users.slice(0, 20).map((u) => (
                <tr key={u.id} className="border-b border-ink-50 last:border-0">
                  <td className="td">{u.fullName}</td>
                  <td className="td">
                    <select className="input max-w-[190px] py-1.5" value={u.role} onChange={(e) => { updateEmployee(u.id, { role: e.target.value as Role }); push("success", "Role updated."); }}>
                      {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="td text-sm text-ink-600">{deptName({ departments }, u.departmentId)}</td>
                  <td className="td"><ActionMenu items={[
                    { label: u.status === "DEACTIVATED" ? "Reactivate" : "Deactivate", onClick: () => { setStatus(u.id, u.status === "DEACTIVATED" ? "ACTIVE" : "DEACTIVATED"); push("success", "Status updated."); } },
                  ]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add user" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.fullName || !f.email} onClick={() => { createEmployee({ ...f, status: "ACTIVE" }); push("success", "User added."); setOpen(false); }}>Add user</button></>}>
        <Field label="Full Name" required><TextInput value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Email" required><TextInput value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="Employee ID" required><TextInput value={f.employeeId} onChange={(e) => setF({ ...f, employeeId: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Role"><Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>{Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
          <Field label="Department"><Select value={f.departmentId} onChange={(e) => setF({ ...f, departmentId: e.target.value })}>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field>
        </div>
      </Modal>

      <Modal open={invite} onClose={() => setInvite(false)} title="Invite Department Head" subtitle="Sends a secure setup link via the Outbox. Several heads per department are allowed." footer={<><button className="btn-secondary" onClick={() => setInvite(false)}>Cancel</button><button className="btn-primary" disabled={!inv.fullName || !inv.email} onClick={() => { const res = register({ ...inv }); if (res.ok) { updateEmployee(res.user.id, { role: "DEPT_HEAD", designation: inv.designation }); push("success", "Invitation sent — see the Outbox for the setup link."); setInvite(false); } else push("error", res.error); }}><UserCog className="h-4 w-4" /> Send invitation</button></>}>
        <Field label="Full Name" required><TextInput value={inv.fullName} onChange={(e) => setInv({ ...inv, fullName: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Email" required hint="Must be @anwargroup.net"><TextInput value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} /></Field>
          <Field label="Employee ID" required><TextInput value={inv.employeeId} onChange={(e) => setInv({ ...inv, employeeId: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Designation"><TextInput value={inv.designation} onChange={(e) => setInv({ ...inv, designation: e.target.value })} /></Field>
          <Field label="Department"><Select value={inv.departmentId} onChange={(e) => setInv({ ...inv, departmentId: e.target.value })}>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field>
        </div>
      </Modal>
    </div>
  );
}
