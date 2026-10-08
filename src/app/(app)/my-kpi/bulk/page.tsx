"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Save, RotateCcw } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { deptHeads } from "@/lib/selectors";
import { canEditKpiDefinition } from "@/lib/navigation";
import { useToast } from "@/components/ui/toast";
import { monthName, download, cn } from "@/lib/utils";
import type { Kpi, KpiDirection } from "@/lib/types";

/* HR mode: architecture fields only (HR-owned). Employee mode: employee fields only. */
const HR_HEADERS = ["KPI Code", "Employee ID", "Employee Name", "PM Type", "Year", "Month", "BSC Perspective", "Objective", "KPI", "KPI Type", "UOM", "KPI Direction", "SRF", "Weight"];
const EMP_HEADERS = ["KPI Code", "Employee ID", "KPI", "Benchmark", "Target", "Achievement", "Evidence Data Link", "Data Source", "KPI Charter", "KPI Driver", "Remarks"];
const PM_TYPES = ["BSC", "ESG", "OKR"];

type Mode = "HR" | "EMPLOYEE";

type Parsed = {
  index: number;
  code: string;
  employeeId: string;
  employeeName: string;
  pmType: string;
  kpiType: string;
  year: string;
  month: string;
  bscPerspective: string;
  objective: string;
  name: string;
  uom: string;
  direction: string;
  srf: string;
  weight: string;
  benchmark: string;
  target: string;
  achievement: string;
  evidenceLink: string;
  dataSource: string;
  kpiCharter: string;
  kpiDriver: string;
  remarks: string;
  status: "update" | "create" | "error";
  message: string;
  kpiId?: string;
  ownerId?: string;
};

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function toCSVText(headers: string[], rows: (string | number)[][]): string {
  return [headers.join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\r\n");
}
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; } }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { cur.push(field); field = ""; }
    else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

export default function BulkKpiUploadPage() {
  const me = useCurrentUser();
  const { push } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const users = useStore((s) => s.users);
  const kpis = useStore((s) => s.kpis);
  const objectives = useStore((s) => s.objectives);
  const updateKpi = useStore((s) => s.updateKpi);
  const createKpi = useStore((s) => s.createKpi);
  const submitKpi = useStore((s) => s.submitKpi);

  const isHr = canEditKpiDefinition(me?.role);
  const [mode, setMode] = useState<Mode>(() => (canEditKpiDefinition(me?.role) ? "HR" : "EMPLOYEE"));
  const [pmType, setPmType] = useState("BSC");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [allowCreate, setAllowCreate] = useState(true);
  const [rows, setRows] = useState<Parsed[]>([]);
  const [fileName, setFileName] = useState("");

  const userById = useMemo(() => new Map(users.map((u) => [u.employeeId.toLowerCase(), u])), [users]);
  const userByIdPlain = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const kpiByCode = useMemo(() => new Map(kpis.map((k) => [k.code.toLowerCase(), k])), [kpis]);

  const periodKpis = useMemo(
    () => kpis.filter((k) => !k.deleted && k.periodYear === year && k.periodMonth === month).sort((a, b) => a.ownerId.localeCompare(b.ownerId)),
    [kpis, year, month]
  );
  const templateKpis = mode === "HR" || isHr ? periodKpis : periodKpis.filter((k) => k.ownerId === me?.id);

  function switchMode(m: Mode) {
    setMode(m);
    setRows([]);
    setFileName("");
  }

  function downloadTemplate() {
    if (mode === "HR") {
      const out = templateKpis.map((k) => {
        const owner = userByIdPlain.get(k.ownerId);
        const obj = objectives.find((o) => o.id === k.objectiveId);
        return [k.code, owner?.employeeId ?? "", owner?.fullName ?? "", k.pmType ?? pmType, k.periodYear, k.periodMonth,
          obj?.perspective ?? k.bscPerspective ?? "", obj?.name ?? "", k.name,
          k.kpiType === "VARIABLE" ? "Variable KPI" : "Non-Variable KPI", k.uom,
          k.direction === "LOWER_BETTER" ? "Min" : "Max", k.srf ?? "", k.weight];
      });
      download(`kpi-definition-${monthName(month)}-${year}.csv`, toCSVText(HR_HEADERS, out), "text/csv");
      push("success", `HR template downloaded (${out.length} KPI rows).`);
    } else {
      const out = templateKpis.map((k) => {
        const owner = userByIdPlain.get(k.ownerId);
        return [k.code, owner?.employeeId ?? "", k.name, k.benchmark ?? "", k.target, k.actual,
          k.evidenceLink ?? "", k.dataSource ?? "", k.kpiCharter ?? "", k.kpiDriver ?? "", k.remarks ?? ""];
      });
      download(`kpi-achievement-${monthName(month)}-${year}.csv`, toCSVText(EMP_HEADERS, out), "text/csv");
      push("success", `Employee template downloaded (${out.length} KPI rows).`);
    }
  }

  function resolveRow(cells: Record<string, string>, index: number): Parsed {
    const defaultEmp = mode === "EMPLOYEE" && !isHr ? me?.employeeId ?? "" : "";
    const code = (cells["KPI Code"] || "").trim();
    const empId = (cells["Employee ID"] || defaultEmp).trim();
    const name = (cells["KPI"] || "").trim();
    const base: Parsed = {
      index, code, employeeId: empId, employeeName: (cells["Employee Name"] || "").trim(),
      pmType: (cells["PM Type"] || pmType).trim() || pmType,
      kpiType: (cells["KPI Type"] || "Non-Variable KPI").trim(),
      year: (cells["Year"] || String(year)).trim(),
      month: (cells["Month"] || String(month)).trim(),
      bscPerspective: (cells["BSC Perspective"] || "").trim(),
      objective: (cells["Objective"] || "").trim(), name,
      uom: (cells["UOM"] || "BDT").trim(), direction: (cells["KPI Direction"] || "Max").trim(),
      srf: (cells["SRF"] || "").trim(), weight: (cells["Weight"] || "").trim(),
      benchmark: (cells["Benchmark"] || "").trim(), target: (cells["Target"] || "").trim(),
      achievement: (cells["Achievement"] || "").trim(),
      evidenceLink: (cells["Evidence Data Link"] || "").trim(), dataSource: (cells["Data Source"] || "").trim(),
      kpiCharter: (cells["KPI Charter"] || "").trim(), kpiDriver: (cells["KPI Driver"] || "").trim(),
      remarks: (cells["Remarks"] || "").trim(),
      status: "error", message: "",
    };

    const owner = userById.get(empId.toLowerCase());
    const errors: string[] = [];
    if (!name) errors.push("KPI name missing");
    if (!owner) errors.push(`Employee ID '${empId}' not found`);

    if (mode === "EMPLOYEE") {
      if (base.target !== "" && Number.isNaN(Number(base.target))) errors.push("Target must be a number");
      if (base.achievement !== "" && Number.isNaN(Number(base.achievement))) errors.push("Achievement must be a number");
      if (base.benchmark !== "" && Number.isNaN(Number(base.benchmark))) errors.push("Benchmark must be a number");
      if (owner && !isHr && owner.id !== me?.id) errors.push("You can only input your own KPIs");
      if (errors.length) { base.message = errors.join("; "); return base; }

      const byCode = code ? kpiByCode.get(code.toLowerCase()) : undefined;
      if (byCode) {
        if (byCode.ownerId !== owner!.id) { base.message = `KPI Code ${code} does not belong to ${owner!.employeeId}`; return base; }
        base.status = "update"; base.kpiId = byCode.id; base.ownerId = byCode.ownerId; base.message = "Input achievement (existing KPI)";
        return base;
      }
      const match = kpis.find((k) => !k.deleted && k.ownerId === owner!.id && k.name.toLowerCase() === name.toLowerCase());
      if (match) { base.status = "update"; base.kpiId = match.id; base.ownerId = match.ownerId; base.message = "Input achievement (matched by employee + KPI)"; return base; }
      base.message = "KPI not found — use a valid KPI Code or employee + KPI name";
      return base;
    }

    // HR mode
    const y = Number(base.year), m = Number(base.month), weight = Number(base.weight);
    if (!PM_TYPES.includes(base.pmType)) errors.push("invalid PM Type");
    if (!Number.isInteger(y) || y < 2000) errors.push("invalid Year");
    if (!Number.isInteger(m) || m < 1 || m > 12) errors.push("invalid Month");
    if (!(weight > 0 && weight <= 100)) errors.push("Weight must be 1–100");
    if (errors.length) { base.message = errors.join("; "); return base; }

    const byCode = code ? kpiByCode.get(code.toLowerCase()) : undefined;
    if (byCode) { base.status = "update"; base.kpiId = byCode.id; base.ownerId = byCode.ownerId; base.message = "Update KPI definition"; return base; }
    const match = kpis.find((k) => !k.deleted && k.ownerId === owner!.id && k.name.toLowerCase() === name.toLowerCase() && k.periodYear === y && k.periodMonth === m);
    if (match) { base.status = "update"; base.kpiId = match.id; base.ownerId = match.ownerId; base.message = "Update KPI definition (employee + name)"; return base; }
    if (allowCreate) { base.status = "create"; base.ownerId = owner!.id; base.message = "Create KPI definition"; return base; }
    base.message = "No matching KPI and 'create' is off";
    return base;
  }

  async function onFile(list: FileList | null) {
    if (!list || !list[0]) return;
    const file = list[0];
    setFileName(file.name);
    const text = await file.text();
    const table = parseCSV(text);
    if (table.length < 2) { push("error", "The file has no data rows."); setRows([]); return; }
    const headers = table[0].map((h) => h.trim());
    const parsed = table.slice(1).map((cells, i) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, ci) => { obj[h] = cells[ci] ?? ""; });
      return resolveRow(obj, i + 1);
    });
    setRows(parsed);
    const errs = parsed.filter((r) => r.status === "error").length;
    push(errs ? "error" : "success", `${parsed.length} rows parsed · ${errs} with errors.`);
  }

  function commit() {
    if (mode === "HR" && !isHr) { push("error", "HR KPI definition upload is HR/Admin only."); return; }
    const ok = rows.filter((r) => r.status !== "error");
    if (!ok.length) { push("error", "Nothing valid to save."); return; }
    const kpiAdmin = users.find((u) => ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN"].includes(u.role));
    let updated = 0, created = 0;

    for (const r of ok) {
      const y = Number(r.year), m = Number(r.month);
      if (mode === "EMPLOYEE") {
        // Employee mode: employee fields only — architecture fields are stripped.
        updateKpi(r.kpiId!, {
          benchmark: r.benchmark === "" ? undefined : Number(r.benchmark),
          target: r.target === "" ? 0 : Number(r.target),
          actual: r.achievement === "" ? 0 : Number(r.achievement),
          evidenceLink: r.evidenceLink || undefined,
          dataSource: r.dataSource || undefined,
          kpiCharter: r.kpiCharter || undefined,
          kpiDriver: r.kpiDriver || undefined,
          remarks: r.remarks,
        }, "Bulk KPI achievement");
        updated += 1;
        continue;
      }

      // HR mode: architecture fields.
      const owner = userByIdPlain.get(r.ownerId!);
      const obj = objectives.find((o) => o.name.toLowerCase() === r.objective.toLowerCase());
      const arch: Partial<Kpi> = {
        name: r.name,
        uom: r.uom,
        direction: (r.direction.toLowerCase().startsWith("min") || r.direction.toLowerCase().startsWith("lower") ? "LOWER_BETTER" : "HIGHER_BETTER") as KpiDirection,
        srf: r.srf || undefined,
        weight: Number(r.weight),
        pmType: (PM_TYPES.includes(r.pmType) ? r.pmType : pmType) as Kpi["pmType"],
        kpiType: (r.kpiType.trim().toLowerCase().startsWith("non") ? "NON_VARIABLE" : "VARIABLE") as Kpi["kpiType"],
        periodYear: y,
        periodMonth: m,
        objectiveId: obj?.id,
        perspective: obj?.perspective ?? (r.bscPerspective || "Financial"),
        bscPerspective: obj?.perspective ?? r.bscPerspective,
      };
      if (r.status === "update" && r.kpiId) { updateKpi(r.kpiId, arch, "Bulk HR KPI definition"); updated += 1; }
      else if (r.status === "create" && r.ownerId) {
        const head = owner ? deptHeads(users, owner.departmentId)[0] : undefined;
        const kpi = createKpi({ ownerId: r.ownerId, approverId: head?.id ?? kpiAdmin?.id ?? "", ...arch, name: r.name });
        submitKpi(kpi.id);
        created += 1;
      }
    }
    push("success", `${mode === "HR" ? "HR definition" : "Achievement"} bulk update — ${updated} updated, ${created} created.`);
    setRows([]);
    setFileName("");
  }

  const counts = {
    update: rows.filter((r) => r.status === "update").length,
    create: rows.filter((r) => r.status === "create").length,
    error: rows.filter((r) => r.status === "error").length,
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/my-kpi" className="btn-secondary btn-sm"><ArrowLeft className="h-4 w-4" /> Back</Link>
          <h1 className="text-lg font-bold text-ink-900">Bulk KPI Upload</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={downloadTemplate}><Download className="h-4 w-4" /> {mode === "HR" ? "HR template" : "Employee template"}</button>
          {mode === "HR" && !isHr ? (
            <span className="chip bg-amber-100 text-amber-700">HR/Admin only</span>
          ) : (
            <button className="btn-primary" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Upload CSV</button>
          )}
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files)} />
        </div>
      </div>

      {/* Mode segmented */}
      <div className="mb-4 inline-flex rounded-lg border border-ink-200 bg-white p-0.5">
        <button
          className={cn("rounded-md px-3.5 py-1.5 text-sm font-medium", mode === "HR" ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-50", !isHr && "cursor-not-allowed opacity-50")}
          disabled={!isHr}
          onClick={() => switchMode("HR")}
        >
          HR KPI definition
        </button>
        <button
          className={cn("rounded-md px-3.5 py-1.5 text-sm font-medium", mode === "EMPLOYEE" ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-50")}
          onClick={() => switchMode("EMPLOYEE")}
        >
          Employee achievement
        </button>
      </div>

      <div className="card card-pad mb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">PM Type</label>
            <select className="input" value={pmType} disabled={mode === "EMPLOYEE"} onChange={(e) => setPmType(e.target.value)}>
              {PM_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <select className="input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Month</label>
            <select className="input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m)}</option>)}
            </select>
          </div>
        </div>
        {mode === "HR" ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" className="h-4 w-4" checked={allowCreate} onChange={(e) => setAllowCreate(e.target.checked)} />
              Create KPIs that don&apos;t exist
            </label>
            <p className="text-xs text-ink-400">{templateKpis.length} KPI rows for {monthName(month)} {year}</p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-ink-400">{templateKpis.length} of your KPI rows for {monthName(month)} {year}</p>
        )}
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">
          <FileSpreadsheet className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {mode === "HR"
            ? "HR mode writes only the KPI definition fields (KPI Code, Employee, PM Type, Year, Month, BSC Perspective, Objective, KPI, KPI Type, UOM, KPI Direction, SRF, Weight)."
            : "Employee mode writes only your entries (Benchmark, Target, Achievement, Evidence Data Link, Data Source, KPI Charter, KPI Driver, Remarks). HR fields are stripped."}
        </p>
      </div>

      {rows.length ? (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-ink-700">{fileName}</span>
              <span className="chip bg-emerald-100 text-emerald-700">{counts.update} update</span>
              {mode === "HR" ? <span className="chip bg-sky-100 text-sky-700">{counts.create} create</span> : null}
              <span className={cn("chip", counts.error ? "bg-red-100 text-red-700" : "bg-ink-100 text-ink-500")}>{counts.error} error</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary btn-sm" onClick={() => { setRows([]); setFileName(""); }}><RotateCcw className="h-3.5 w-3.5" /> Clear</button>
              <button className="btn-primary" disabled={counts.error > 0 || (mode === "HR" && !isHr)} onClick={commit}><Save className="h-4 w-4" /> Commit {counts.update + counts.create} rows</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">KPI</th>
                  {mode === "HR" ? (
                    <><th className="px-3 py-2">KPI Type</th><th className="px-3 py-2">UOM</th><th className="px-3 py-2">Direction</th><th className="px-3 py-2">Weight</th></>
                  ) : (
                    <><th className="px-3 py-2">Target</th><th className="px-3 py-2">Achievement</th></>
                  )}
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.index} className={cn("border-b border-ink-100", r.status === "error" && "bg-red-50/50")}>
                    <td className="px-3 py-2 text-ink-400">{r.index}</td>
                    <td className="px-3 py-2">
                      {r.status === "error" ? (
                        <span className="inline-flex items-center gap-1 text-red-600"><AlertTriangle className="h-3.5 w-3.5" /> Error</span>
                      ) : r.status === "create" ? (
                        <span className="inline-flex items-center gap-1 text-sky-600"><CheckCircle2 className="h-3.5 w-3.5" /> Create</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Update</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-ink-700">{r.employeeName || r.employeeId || "—"}</td>
                    <td className="px-3 py-2 text-ink-700">{r.name}</td>
                    {mode === "HR" ? (
                      <>
                        <td className="px-3 py-2">{r.kpiType.toLowerCase().startsWith("non") ? "Non-Variable" : "Variable"}</td>
                        <td className="px-3 py-2">{r.uom}</td>
                        <td className="px-3 py-2">{r.direction}</td>
                        <td className="px-3 py-2 num">{r.weight}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2 num">{r.target}</td>
                        <td className="px-3 py-2 num">{r.achievement}</td>
                      </>
                    )}
                    <td className={cn("px-3 py-2 text-xs", r.status === "error" ? "text-red-600" : "text-ink-500")}>{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
          <FileSpreadsheet className="mb-3 h-8 w-8 text-ink-300" />
          <p className="text-sm font-semibold text-ink-700">No file uploaded</p>
          <p className="mt-1 max-w-md text-sm text-ink-500">
            {mode === "HR"
              ? "Download the HR template (definition fields only), edit it, then upload to create/update KPI definitions for employees."
              : "Download the employee template (your fields only), enter Benchmark / Target / Achievement, then upload."}
          </p>
        </div>
      )}
    </div>
  );
}
