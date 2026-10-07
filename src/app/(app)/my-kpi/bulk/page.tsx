"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Save, RotateCcw } from "lucide-react";
import { useStore, useCurrentUser } from "@/lib/store";
import { deptHeads } from "@/lib/selectors";
import { useToast } from "@/components/ui/toast";
import { monthName, download, cn } from "@/lib/utils";
import type { Kpi, KpiDirection } from "@/lib/types";

const HEADERS = [
  "KPI Code", "Employee ID", "Employee Name", "Department", "PM Type", "Year", "Month",
  "Objective", "KPI", "KPI Type", "UOM", "KPI Direction", "SRF", "Weight", "Benchmark", "Target", "Achievement", "Remarks",
];
const PM_TYPES = ["BSC", "ESG", "OKR"];
const UOMS = ["BDT", "%", "MT", "Count", "Days", "Score", "Ratio", "Number", "Amount", "Hours", "Units"];
const ADMIN_ROLES = ["HR_ADMIN", "SYS_ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN", "AUDIT_ADMIN"];

type Parsed = {
  index: number;
  code: string;
  employeeId: string;
  employeeName: string;
  pmType: string;
  kpiType: string;
  year: string;
  month: string;
  objective: string;
  name: string;
  uom: string;
  direction: string;
  srf: string;
  weight: string;
  benchmark: string;
  target: string;
  achievement: string;
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
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
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
  const departments = useStore((s) => s.departments);
  const updateKpi = useStore((s) => s.updateKpi);
  const createKpi = useStore((s) => s.createKpi);
  const submitKpi = useStore((s) => s.submitKpi);

  const [pmType, setPmType] = useState("BSC");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [allowCreate, setAllowCreate] = useState(true);
  const [rows, setRows] = useState<Parsed[]>([]);
  const [fileName, setFileName] = useState("");

  const isAdmin = !!me && ADMIN_ROLES.includes(me.role);
  const isHead = !!me && me.role === "DEPT_HEAD";
  const deptNameFor = (id?: string) => departments.find((d) => d.id === id)?.name ?? "";

  const scopedKpis = useMemo(() => {
    let list = kpis.filter((k) => !k.deleted && k.periodYear === year && k.periodMonth === month);
    if (me && !isAdmin) {
      if (isHead) {
        const deptUserIds = new Set(users.filter((u) => u.departmentId === me.departmentId).map((u) => u.id));
        list = list.filter((k) => deptUserIds.has(k.ownerId) || k.ownerId === me.id);
      } else {
        list = list.filter((k) => k.ownerId === me.id);
      }
    }
    return list.sort((a, b) => a.ownerId.localeCompare(b.ownerId));
  }, [kpis, year, month, me, isAdmin, isHead, users]);

  const userById = useMemo(() => new Map(users.map((u) => [u.employeeId.toLowerCase(), u])), [users]);
  const userByIdPlain = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const kpiByCode = useMemo(() => new Map(kpis.map((k) => [k.code.toLowerCase(), k])), [kpis]);

  function downloadTemplate() {
    const rowsOut = scopedKpis.map((k) => {
      const owner = userByIdPlain.get(k.ownerId);
      const obj = objectives.find((o) => o.id === k.objectiveId);
      return [
        k.code,
        owner?.employeeId ?? "",
        owner?.fullName ?? "",
        deptNameFor(owner?.departmentId),
        k.pmType ?? pmType,
        k.periodYear,
        k.periodMonth,
        obj?.name ?? "",
        k.name,
        k.kpiType === "VARIABLE" ? "Variable KPI" : "Non-Variable KPI",
        k.uom,
        k.direction === "HIGHER_BETTER" ? "Higher is better" : "Lower is better",
        k.srf ?? "",
        k.weight,
        k.benchmark ?? "",
        k.target,
        k.actual,
        k.remarks ?? "",
      ];
    });
    download(`kpi-bulk-${monthName(month)}-${year}.csv`, toCSVText(HEADERS, rowsOut), "text/csv");
    push("success", `Template downloaded (${rowsOut.length} KPI rows).`);
  }

  function resolveRow(cells: Record<string, string>, index: number): Parsed {
    const code = (cells["KPI Code"] || "").trim();
    const empId = (cells["Employee ID"] || "").trim();
    const name = (cells["KPI"] || "").trim();
    const base: Parsed = {
      index, code, employeeId: empId, employeeName: (cells["Employee Name"] || "").trim(),
      pmType: (cells["PM Type"] || pmType).trim() || pmType,
      kpiType: (cells["KPI Type"] || "Non-Variable KPI").trim(),
      year: (cells["Year"] || String(year)).trim(),
      month: (cells["Month"] || String(month)).trim(),
      objective: (cells["Objective"] || "").trim(), name,
      uom: (cells["UOM"] || "BDT").trim(), direction: (cells["KPI Direction"] || "Higher is better").trim(),
      srf: (cells["SRF"] || "").trim(), weight: (cells["Weight"] || "").trim(),
      benchmark: (cells["Benchmark"] || "").trim(), target: (cells["Target"] || "").trim(),
      achievement: (cells["Achievement"] || "").trim(), remarks: (cells["Remarks"] || "").trim(),
      status: "error", message: "",
    };

    const owner = userById.get(empId.toLowerCase());
    const y = Number(base.year);
    const m = Number(base.month);
    const weight = Number(base.weight);
    const target = Number(base.target);
    const achievement = base.achievement === "" ? 0 : Number(base.achievement);
    const benchmark = base.benchmark === "" ? undefined : Number(base.benchmark);

    const errors: string[] = [];
    if (!name) errors.push("KPI name missing");
    if (!owner) errors.push(`Employee ID '${empId}' not found`);
    if (!PM_TYPES.includes(base.pmType)) errors.push("invalid PM Type");
    if (!Number.isInteger(y) || y < 2000) errors.push("invalid Year");
    if (!Number.isInteger(m) || m < 1 || m > 12) errors.push("invalid Month");
    if (!(weight > 0 && weight <= 100)) errors.push("Weight must be 1–100");
    if (!(target >= 0) || Number.isNaN(target)) errors.push("Target must be a number");
    if (Number.isNaN(achievement)) errors.push("Achievement must be a number");
    if (benchmark !== undefined && Number.isNaN(benchmark)) errors.push("Benchmark must be a number");

    if (errors.length) { base.message = errors.join("; "); return base; }

    const byCode = code ? kpiByCode.get(code.toLowerCase()) : undefined;
    if (byCode) {
      base.status = "update"; base.kpiId = byCode.id; base.ownerId = byCode.ownerId;
      base.message = "Update existing KPI";
      return base;
    }
    const match = kpis.find((k) => !k.deleted && k.ownerId === owner!.id && k.name.toLowerCase() === name.toLowerCase() && k.periodYear === y && k.periodMonth === m);
    if (match) {
      base.status = "update"; base.kpiId = match.id; base.ownerId = match.ownerId;
      base.message = "Update existing KPI (matched by employee + name)";
      return base;
    }
    if (allowCreate) {
      base.status = "create"; base.ownerId = owner!.id;
      base.message = "Create new KPI";
      return base;
    }
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
    const ok = rows.filter((r) => r.status !== "error");
    if (!ok.length) { push("error", "Nothing valid to save."); return; }
    let updated = 0, created = 0;
    for (const r of ok) {
      const y = Number(r.year), m = Number(r.month);
      const patch: Partial<Kpi> = {
        name: r.name,
        uom: r.uom,
        direction: (r.direction.toLowerCase().startsWith("lower") ? "LOWER_BETTER" : "HIGHER_BETTER") as KpiDirection,
        srf: r.srf || undefined,
        weight: Number(r.weight),
        benchmark: r.benchmark === "" ? undefined : Number(r.benchmark),
        target: Number(r.target),
        actual: r.achievement === "" ? 0 : Number(r.achievement),
        remarks: r.remarks,
        pmType: (PM_TYPES.includes(r.pmType) ? r.pmType : pmType) as Kpi["pmType"],
        kpiType: (r.kpiType.trim().toLowerCase().startsWith("non") ? "NON_VARIABLE" : "VARIABLE") as Kpi["kpiType"],
        periodYear: y,
        periodMonth: m,
      };
      if (r.status === "update" && r.kpiId) {
        updateKpi(r.kpiId, patch, "Bulk KPI update");
        updated += 1;
      } else if (r.status === "create" && r.ownerId) {
        const owner = userByIdPlain.get(r.ownerId);
        const obj = objectives.find((o) => o.name.toLowerCase() === r.objective.toLowerCase());
        const head = owner ? deptHeads(users, owner.departmentId)[0] : undefined;
        const kpi = createKpi({
          ownerId: r.ownerId, approverId: head?.id ?? "", ...patch,
          name: r.name,
          objectiveId: obj?.id, perspective: obj?.perspective ?? "Financial", bscPerspective: obj?.perspective ?? "",
        });
        submitKpi(kpi.id);
        created += 1;
      }
    }
    push("success", `Bulk update complete — ${updated} updated, ${created} created.`);
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
          <h1 className="text-lg font-bold text-ink-900">Bulk KPI Update</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={downloadTemplate}><Download className="h-4 w-4" /> Download Template</button>
          <button className="btn-primary" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Upload CSV</button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files)} />
        </div>
      </div>

      <div className="card card-pad mb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">PM Type</label>
            <select className="input" value={pmType} onChange={(e) => setPmType(e.target.value)}>
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
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-ink-700">
              <input type="checkbox" className="h-4 w-4" checked={allowCreate} onChange={(e) => setAllowCreate(e.target.checked)} />
              Create KPIs that don&apos;t exist
            </label>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">
          <FileSpreadsheet className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Download the template (pre-filled with {scopedKpis.length} KPI rows for {monthName(month)} {year}), edit <b>Target</b> / <b>Achievement</b> / <b>Weight</b>, then upload. Match is by <b>KPI Code</b>, or by employee + KPI name. Only numeric columns are read.
        </p>
      </div>

      {rows.length ? (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-ink-700">{fileName}</span>
              <span className="chip bg-emerald-100 text-emerald-700">{counts.update} update</span>
              <span className="chip bg-sky-100 text-sky-700">{counts.create} create</span>
              <span className={cn("chip", counts.error ? "bg-red-100 text-red-700" : "bg-ink-100 text-ink-500")}>{counts.error} error</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary btn-sm" onClick={() => { setRows([]); setFileName(""); }}><RotateCcw className="h-3.5 w-3.5" /> Clear</button>
              <button className="btn-primary" disabled={counts.error > 0} onClick={commit}><Save className="h-4 w-4" /> Commit {counts.update + counts.create} rows</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">KPI</th>
                  <th className="px-3 py-2">Weight</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Achievement</th>
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
                    <td className="px-3 py-2 num">{r.weight}</td>
                    <td className="px-3 py-2 num">{r.target}</td>
                    <td className="px-3 py-2 num">{r.achievement}</td>
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
          <p className="mt-1 max-w-md text-sm text-ink-500">Download the template, edit the numeric columns, then upload it back to update many KPIs at once.</p>
        </div>
      )}
    </div>
  );
}
