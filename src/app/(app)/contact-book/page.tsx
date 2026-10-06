"use client";

import { useStore } from "@/lib/store";
import { deptName } from "@/lib/selectors";
import { PageHeader, Avatar } from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/data-table";
import type { User } from "@/lib/types";

export default function ContactBookPage() {
  const users = useStore((s) => s.users);
  const departments = useStore((s) => s.departments);

  const cols: Column<User>[] = [
    { key: "fullName", header: "Name", sortable: true, render: (u) => <span className="flex items-center gap-2.5"><Avatar name={u.fullName} size={30} /><span className="font-medium text-ink-800">{u.fullName}</span></span>, value: (u) => u.fullName },
    { key: "designation", header: "Designation" },
    { key: "departmentId", header: "Department", render: (u) => deptName({ departments }, u.departmentId), value: (u) => deptName({ departments }, u.departmentId) },
    { key: "email", header: "Email", render: (u) => <a className="link" href={`mailto:${u.email}`}>{u.email}</a> },
    { key: "corporatePhone", header: "Phone", render: (u) => <span className="num">{u.corporatePhone ?? "—"}</span> },
  ];

  return (
    <div>
      <PageHeader title="Contact Book" subtitle={`${users.length} people across Anwar Group`} />
      <DataTable columns={cols} rows={users.filter((u) => u.status === "ACTIVE")} searchKeys={["fullName", "designation", "email", "employeeId"]} searchPlaceholder="Search by name, designation or email…" pageSize={12} emptyTitle="No contacts" />
    </div>
  );
}
