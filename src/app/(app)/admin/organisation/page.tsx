"use client";

import { useState } from "react";
import { Plus, Building2, Network, BadgeCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader, Card, CardHeader, Tabs } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { Field, Select, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export default function OrganisationPage() {
  const businessUnits = useStore((s) => s.businessUnits);
  const departments = useStore((s) => s.departments);
  const designations = useStore((s) => s.designations);
  const createBU = useStore((s) => s.createBusinessUnit);
  const createDept = useStore((s) => s.createDepartment);
  const createDesig = useStore((s) => s.createDesignation);
  const { push } = useToast();

  const [tab, setTab] = useState("BU");
  const [open, setOpen] = useState(false);
  const [bu, setBu] = useState({ name: "", code: "" });
  const [dept, setDept] = useState({ name: "", code: "", businessUnitId: businessUnits[0]?.id ?? "" });
  const [desig, setDesig] = useState({ name: "" });

  return (
    <div>
      <PageHeader title="Organisation" subtitle="Business units, departments and designations used across AGI OneDesk." />

      <div className="mb-4 flex items-center justify-between">
        <Tabs tabs={[{ id: "BU", label: "Business Units", count: businessUnits.length }, { id: "DEPT", label: "Departments", count: departments.length }, { id: "DESIG", label: "Designations", count: designations.length }]} active={tab} onChange={setTab} />
        <button className="btn-primary btn-sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5" /> Add</button>
      </div>

      {tab === "BU" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businessUnits.map((b) => (
            <Card key={b.id} className="card-pad flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Building2 className="h-5 w-5" /></span>
              <div><p className="text-sm font-semibold text-ink-800">{b.name}</p><p className="num text-xs text-ink-400">{b.code} · {departments.filter((d) => d.businessUnitId === b.id).length} departments</p></div>
            </Card>
          ))}
        </div>
      ) : tab === "DEPT" ? (
        <Card>
          <CardHeader title="Departments" subtitle={`${departments.length} departments`} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="bg-ink-50/60"><tr><th className="th">Department</th><th className="th">Code</th><th className="th">Business Unit</th><th className="th text-right">Employees</th></tr></thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id} className="border-b border-ink-50 last:border-0">
                    <td className="td font-medium text-ink-800">{d.name}</td>
                    <td className="td num">{d.code}</td>
                    <td className="td text-sm text-ink-600">{businessUnits.find((b) => b.id === d.businessUnitId)?.name}</td>
                    <td className="td num text-right">{useStore.getState().users.filter((u) => u.departmentId === d.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Designations" subtitle={`${designations.length} designations`} />
          <div className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {designations.map((d) => (
              <div key={d.id} className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2">
                <BadgeCheck className="h-4 w-4 text-ink-400" /><span className="text-sm text-ink-700">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={`Add ${tab === "BU" ? "business unit" : tab === "DEPT" ? "department" : "designation"}`}
        footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={() => {
            if (tab === "BU") { createBU(bu); push("success", "Business unit added."); }
            else if (tab === "DEPT") { createDept(dept); push("success", "Department added."); }
            else { createDesig(desig); push("success", "Designation added."); }
            setOpen(false);
          }}>Add</button></>}>
        {tab === "BU" ? (
          <><Field label="Name" required><TextInput value={bu.name} onChange={(e) => setBu({ ...bu, name: e.target.value })} /></Field>
          <Field label="Code" required><TextInput value={bu.code} onChange={(e) => setBu({ ...bu, code: e.target.value })} /></Field></>
        ) : tab === "DEPT" ? (
          <><Field label="Name" required><TextInput value={dept.name} onChange={(e) => setDept({ ...dept, name: e.target.value })} /></Field>
          <Field label="Code" required><TextInput value={dept.code} onChange={(e) => setDept({ ...dept, code: e.target.value })} /></Field>
          <Field label="Business Unit"><Select value={dept.businessUnitId} onChange={(e) => setDept({ ...dept, businessUnitId: e.target.value })}>{businessUnits.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></Field></>
        ) : (
          <Field label="Name" required><TextInput value={desig.name} onChange={(e) => setDesig({ name: e.target.value })} /></Field>
        )}
      </Modal>
      <p className="mt-4 flex items-center gap-2 text-xs text-ink-400"><Network className="h-3.5 w-3.5" /> Master data maintained here drives sign-up, invitations, KPI scoping and reports.</p>
    </div>
  );
}
