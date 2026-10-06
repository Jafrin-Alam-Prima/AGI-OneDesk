"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { deptName } from "@/lib/selectors";
import { PageHeader, Avatar, Badge } from "@/components/ui/primitives";
import { DataTable, ActionMenu, type Column } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABEL } from "@/lib/navigation";
import { formatDate } from "@/lib/utils";
import type { Role, User } from "@/lib/types";

export default function EmployeesPage() {
  const me = useCurrentUser();
  const users = useStore((s) => s.users);
  const departments = useStore((s) => s.departments);
  const businessUnits = useStore((s) => s.businessUnits);
  const createEmployee = useStore((s) => s.createEmployee);
  const updateEmployee = useStore((s) => s.updateEmployee);
  const setStatus = useStore((s) => s.setEmployeeStatus);
  const { push } = useToast();

  const [dept, setDept] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [f, setF] = useState({ fullName: "", email: "", employeeId: "", role: "EMPLOYEE" as Role, designation: "Officer", departmentId: departments[0]?.id ?? "", businessUnitId: businessUnits[0]?.id ?? "" });

  const canManage = me ? ["SYS_ADMIN", "SUPER_ADMIN"].includes(me.role) : false;

  const rows = useMemo(() => users.filter((u) => dept === "ALL" || u.departmentId === dept), [users, dept]);

  const openAdd = () => { setEditing(null); setF({ fullName: "", email: "", employeeId: "", role: "EMPLOYEE", designation: "Officer", departmentId: departments[0]?.id ?? "", businessUnitId: businessUnits[0]?.id ?? "" }); setOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setF({ fullName: u.fullName, email: u.email, employeeId: u.employeeId, role: u.role, designation: u.designation, departmentId: u.departmentId, businessUnitId: u.businessUnitId }); setOpen(true); };

  function save() {
    if (editing) { updateEmployee(editing.id, f); push("success", "Employee updated."); }
    else { createEmployee({ ...f, status: "ACTIVE" }); push("success", "Employee added."); }
    setOpen(false);
  }

  const cols: Column<User>[] = [
    { key: "fullName", header: "Employee", sortable: true, render: (u) => (
      <span className="flex items-center gap-2.5"><Avatar name={u.fullName} size={32} /><span><span className="block font-medium text-ink-800">{u.fullName}</span><span className="num text-xs text-ink-400">{u.employeeId}</span></span></span>
    ), value: (u) => u.fullName },
    { key: "designation", header: "Designation" },
    { key: "departmentId", header: "Department", render: (u) => deptName({ departments }, u.departmentId), value: (u) => deptName({ departments }, u.departmentId) },
    { key: "role", header: "Role", render: (u) => <Badge tone={u.role === "EMPLOYEE" ? "neutral" : "brand"}>{ROLE_LABEL[u.role]}</Badge>, value: (u) => ROLE_LABEL[u.role] },
    { key: "status", header: "Status", render: (u) => <Badge tone={u.status === "ACTIVE" ? "green" : u.status === "PENDING_SETUP" ? "amber" : "red"}>{u.status.replace("_", " ")}</Badge> },
    { key: "joiningDate", header: "Joined", render: (u) => formatDate(u.joiningDate) },
    { key: "actions", header: "", align: "right", render: (u) => (
      <ActionMenu items={[
        { label: "View profile", onClick: () => { window.location.href = `/employees/${u.id}`; } },
        ...(canManage ? [
          { label: "Edit", onClick: () => openEdit(u) },
          { label: u.status === "DEACTIVATED" ? "Reactivate" : "Deactivate", onClick: () => { setStatus(u.id, u.status === "DEACTIVATED" ? "ACTIVE" : "DEACTIVATED"); push("success", "Status updated."); } },
        ] : []),
      ]} />
    ) },
  ];

  return (
    <div>
      <PageHeader title="Employees" subtitle={`${users.length} employees across ${departments.length} departments`}
        action={canManage ? <button className="btn-primary" onClick={openAdd}><UserPlus className="h-4 w-4" /> Add Employee</button> : undefined} />

      <div className="mb-4 flex flex-wrap gap-3">
        <select className="input max-w-[240px]" value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="ALL">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <DataTable columns={cols} rows={rows} searchKeys={["fullName", "employeeId", "email", "designation"]} searchPlaceholder="Search by name, ID or email…" pageSize={12} emptyTitle="No employees" />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit employee" : "Add employee"}
        footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!f.fullName || !f.email || !f.employeeId} onClick={save}>{editing ? "Save changes" : "Add employee"}</button></>}>
        <Field label="Full Name" required><TextInput value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Email" required><TextInput value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="name@anwargroup.net" disabled={!!editing} /></Field>
          <Field label="Employee ID" required><TextInput value={f.employeeId} onChange={(e) => setF({ ...f, employeeId: e.target.value })} disabled={!!editing} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Designation"><TextInput value={f.designation} onChange={(e) => setF({ ...f, designation: e.target.value })} /></Field>
          <Field label="Role"><Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>{Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
        </div>
        <Field label="Department"><Select value={f.departmentId} onChange={(e) => setF({ ...f, departmentId: e.target.value })}>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field>
        <p className="text-xs text-ink-400">New employees added here become active immediately. Self-registered employees appear as PENDING SETUP until they set a password via the Outbox link.</p>
      </Modal>
    </div>
  );
}
