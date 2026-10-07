"use client";

import { useMemo, useState } from "react";
import { Upload, Trash2, FileText, Info } from "lucide-react";
import { Drawer } from "@/components/ui/modal";
import { Field, FormGrid, Select, TextArea, TextInput } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useStore, useCurrentUser } from "@/lib/store";
import { deptHeads } from "@/lib/selectors";
import { canEditKpiDefinition } from "@/lib/navigation";
import { achievement, calculatedScore } from "@/lib/calc";
import { num, sha256Hex, cn } from "@/lib/utils";
import type { Kpi, KpiCategory, KpiDirection } from "@/lib/types";

interface FormState {
  name: string;
  category: KpiCategory;
  kpiType: NonNullable<Kpi["kpiType"]>;
  objectiveId: string;
  kraId: string;
  uom: string;
  direction: KpiDirection;
  srf: string;
  target: string;
  actual: string;
  weight: string;
  benchmark: string;
  remarks: string;
  periodMonth: number;
  periodYear: number;
  approverId: string;
}

const UOMS = ["BDT", "%", "MT", "Count", "Days", "Score", "Ratio"];

export function KpiForm({
  open, onClose, existing, mode = "create",
}: { open: boolean; onClose: () => void; existing?: Kpi; mode?: "create" | "resubmit" | "edit" }) {
  const me = useCurrentUser();
  const { push } = useToast();
  const users = useStore((s) => s.users);
  const objectives = useStore((s) => s.objectives);
  const kras = useStore((s) => s.kras);
  const createKpi = useStore((s) => s.createKpi);
  const updateKpi = useStore((s) => s.updateKpi);
  const submitKpi = useStore((s) => s.submitKpi);
  const resubmitKpi = useStore((s) => s.resubmitKpi);
  const addEvidence = useStore((s) => s.addEvidence);
  const removeEvidence = useStore((s) => s.removeEvidence);
  const allEvidence = useStore((s) => s.evidence);

  const [files, setFiles] = useState<{ name: string; size: number; type: string; sha256: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const heads = useMemo(() => (me ? deptHeads(users, me.departmentId) : []), [users, me]);
  const lockDef = !canEditKpiDefinition(me?.role);

  const [f, setF] = useState<FormState>(() => ({
    name: existing?.name ?? "",
    category: existing?.category ?? "PROJECT",
    kpiType: existing?.kpiType ?? "NON_VARIABLE",
    objectiveId: existing?.objectiveId ?? objectives[0]?.id ?? "",
    kraId: existing?.kraId ?? kras[0]?.id ?? "",
    uom: existing?.uom ?? "BDT",
    direction: existing?.direction ?? "HIGHER_BETTER",
    srf: existing?.srf ?? "",
    target: existing ? String(existing.target) : "",
    actual: existing ? String(existing.actual) : "",
    weight: existing ? String(existing.weight) : "",
    benchmark: existing?.benchmark ? String(existing.benchmark) : "",
    remarks: existing?.remarks ?? "",
    periodMonth: existing?.periodMonth ?? new Date().getMonth() + 1,
    periodYear: existing?.periodYear ?? 2026,
    approverId: existing?.approverId ?? heads[0]?.id ?? "",
  }));

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  const target = Number(f.target) || 0;
  const actual = Number(f.actual) || 0;
  const weight = Number(f.weight) || 0;
  const ach = achievement(target, actual);
  const score = calculatedScore(target, actual);

  const errors = {
    name: f.name.trim() ? "" : "KPI name is required.",
    target: target > 0 ? "" : "Target must be greater than 0.",
    actual: f.actual !== "" && !Number.isNaN(Number(f.actual)) ? "" : "Actual must be a number.",
    weight: weight > 0 && weight <= 100 ? "" : "Weight must be greater than 0 and at most 100.",
    approverId: f.approverId ? "" : "Select an approval person (a Department Head).",
  };
  const draftValid = !errors.name && !errors.target && !errors.weight;
  const submitValid = draftValid && !errors.actual && !errors.approverId && (files.length > 0 || allEvidence.some((e) => e.kpiId === existing?.id));

  async function onFiles(list: FileList | null) {
    if (!list) return;
    setBusy(true);
    const added: typeof files = [];
    for (const file of Array.from(list).slice(0, 4)) {
      const buf = await file.arrayBuffer();
      const sha256 = await sha256Hex(buf);
      added.push({ name: file.name, size: file.size, type: file.type || "application/octet-stream", sha256 });
    }
    setFiles((x) => [...x, ...added]);
    setBusy(false);
  }

  function persistEvidence(kpiId: string) {
    if (!me) return;
    for (const file of files) {
      addEvidence(kpiId, { name: file.name, size: file.size, type: file.type, sha256: file.sha256, uploadedBy: me.id });
    }
  }

  function saveDraft() {
    if (!me) return;
    if (mode === "create") {
      const kpi = createKpi({
        ownerId: me.id, name: f.name.trim(), category: f.category, kpiType: f.kpiType,
        objectiveId: f.objectiveId, kraId: f.kraId, uom: f.uom, direction: f.direction, srf: f.srf || undefined,
        target, actual, weight, benchmark: f.benchmark ? Number(f.benchmark) : undefined,
        remarks: f.remarks, periodMonth: f.periodMonth, periodYear: f.periodYear, approverId: f.approverId,
      });
      persistEvidence(kpi.id);
      push("success", "KPI saved as draft.");
    } else if (existing) {
      updateKpi(existing.id, {
        name: f.name.trim(), category: f.category, kpiType: f.kpiType, objectiveId: f.objectiveId, kraId: f.kraId,
        uom: f.uom, direction: f.direction, srf: f.srf || undefined, target, actual, weight,
        benchmark: f.benchmark ? Number(f.benchmark) : undefined, remarks: f.remarks,
        periodMonth: f.periodMonth, periodYear: f.periodYear, approverId: f.approverId,
      }, "Draft updated");
      persistEvidence(existing.id);
      push("success", "Draft updated.");
    }
    onClose();
  }

  function submit() {
    if (!me) return;
    if (mode === "create") {
      const kpi = createKpi({
        ownerId: me.id, name: f.name.trim(), category: f.category, kpiType: f.kpiType,
        objectiveId: f.objectiveId, kraId: f.kraId, uom: f.uom, direction: f.direction, srf: f.srf || undefined,
        target, actual, weight, benchmark: f.benchmark ? Number(f.benchmark) : undefined,
        remarks: f.remarks, periodMonth: f.periodMonth, periodYear: f.periodYear, approverId: f.approverId,
      });
      persistEvidence(kpi.id);
      submitKpi(kpi.id);
      push("success", "KPI submitted to your Department Head.");
    } else if (existing) {
      persistEvidence(existing.id);
      resubmitKpi(existing.id, {
        name: f.name.trim(), category: f.category, kpiType: f.kpiType, objectiveId: f.objectiveId, kraId: f.kraId,
        uom: f.uom, direction: f.direction, srf: f.srf || undefined, target, actual, weight,
        benchmark: f.benchmark ? Number(f.benchmark) : undefined, remarks: f.remarks,
      });
      push("success", "KPI corrected and resubmitted.");
    }
    onClose();
  }

  const targetLocked = mode !== "create";
  const evidenceForExisting = existing ? allEvidence.filter((e) => e.kpiId === existing.id) : [];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="max-w-2xl"
      title={mode === "create" ? "Create KPI" : mode === "resubmit" ? "Correct & resubmit KPI" : "Edit KPI"}
      subtitle="Every score must be traceable: Target → Actual → Evidence → Score → Review → Approval."
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {mode === "create" ? (
            <>
              <button className="btn-secondary" disabled={!draftValid} onClick={saveDraft}>Save as Draft</button>
              <button className="btn-primary" disabled={!submitValid} onClick={submit}>Submit KPI</button>
            </>
          ) : (
            <button className="btn-primary" disabled={!submitValid} onClick={submit}>Submit KPI</button>
          )}
        </>
      }
    >
      <Field label="KPI" required error={errors.name}>
        <TextInput value={f.name} disabled={lockDef} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sales Target vs Achievement (AOPL)" />
      </Field>

      <FormGrid>
        <Field label="KPI Category" required>
          <Select value={f.category} disabled={lockDef} onChange={(e) => set("category", e.target.value as KpiCategory)}>
            <option value="PROJECT">Project KPI</option>
            <option value="PEOPLE_CULTURE">People &amp; Culture KPI</option>
          </Select>
        </Field>
        <Field label="KPI Type" required>
          <Select value={f.kpiType} disabled={lockDef} onChange={(e) => set("kpiType", e.target.value as NonNullable<Kpi["kpiType"]>)}>
            <option value="VARIABLE">Variable KPI</option>
            <option value="NON_VARIABLE">Non-Variable KPI</option>
          </Select>
        </Field>
        <Field label="Unit of Measure">
          <Select value={f.uom} disabled={lockDef} onChange={(e) => set("uom", e.target.value)}>
            {UOMS.map((u) => <option key={u} value={u}>{u}</option>)}
          </Select>
        </Field>
        <Field label="Objective">
          <Select value={f.objectiveId} disabled={lockDef} onChange={(e) => set("objectiveId", e.target.value)}>
            {objectives.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.perspective})</option>)}
          </Select>
        </Field>
        <Field label="Key Result Area (KRA)">
          <Select value={f.kraId} disabled={lockDef} onChange={(e) => set("kraId", e.target.value)}>
            {kras.filter((k) => !f.objectiveId || k.objectiveId === f.objectiveId).map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
          </Select>
        </Field>
        <Field label="KPI Period (Month)">
          <Select value={f.periodMonth} disabled={lockDef} onChange={(e) => set("periodMonth", Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{new Date(2026, m - 1, 1).toLocaleString("en", { month: "long" })}</option>)}
          </Select>
        </Field>
        <Field label="Period Year">
          <Select value={f.periodYear} disabled={lockDef} onChange={(e) => set("periodYear", Number(e.target.value))}>
            {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
        </Field>
      </FormGrid>

      <FormGrid cols={3}>
        <Field label="Target" required error={errors.target} hint={targetLocked ? "Target is fixed after submission." : undefined}>
          <TextInput type="number" value={f.target} onChange={(e) => set("target", e.target.value)} disabled={targetLocked} invalid={!!errors.target} />
        </Field>
        <Field label="Actual" required error={errors.actual}>
          <TextInput type="number" value={f.actual} onChange={(e) => set("actual", e.target.value)} invalid={!!errors.actual} />
        </Field>
        <Field label="KPI Weight (%)" required error={errors.weight}>
          <TextInput type="number" value={f.weight} disabled={lockDef} onChange={(e) => set("weight", e.target.value)} invalid={!!errors.weight} />
        </Field>
      </FormGrid>

      <FormGrid cols={3}>
        <Field label="Achievement (calculated)">
          <TextInput value={target > 0 ? `${num(ach, 2)}%` : "—"} readOnly disabled />
        </Field>
        <Field label="Score (calculated)">
          <TextInput value={target > 0 ? num(score, 2) : "—"} readOnly disabled />
        </Field>
        <Field label="Benchmark (optional)">
          <TextInput type="number" value={f.benchmark} onChange={(e) => set("benchmark", e.target.value)} />
        </Field>
      </FormGrid>

      <FormGrid>
        <Field label="KPI Direction">
          <Select value={f.direction} disabled={lockDef} onChange={(e) => set("direction", e.target.value as KpiDirection)}>
            <option value="HIGHER_BETTER">Higher is better</option>
            <option value="LOWER_BETTER">Lower is better</option>
          </Select>
        </Field>
        <Field label="SRF" hint="Strategic Result Factor (optional)">
          <TextInput value={f.srf} disabled={lockDef} onChange={(e) => set("srf", e.target.value)} placeholder="e.g. Growth" />
        </Field>
      </FormGrid>

      <Field label="Evidence Report" required hint="PDF, image, Excel, Word, CSV or text up to 10 MB. A SHA-256 fingerprint is stored.">
        <label className={cn("flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-ink-300 px-4 py-5 text-center hover:border-brand-400 hover:bg-brand-50/40")}>
          <Upload className="mb-1.5 h-5 w-5 text-ink-400" />
          <span className="text-sm text-ink-600">{busy ? "Hashing file…" : "Click to upload evidence"}</span>
          <input type="file" className="hidden" multiple accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx,.csv,.txt" onChange={(e) => onFiles(e.target.files)} />
        </label>
      </Field>

      {(files.length > 0 || evidenceForExisting.length > 0) ? (
        <ul className="mb-4 space-y-2">
          {evidenceForExisting.map((e) => (
            <li key={e.id} className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2">
              <FileText className="h-4 w-4 text-ink-400" />
              <span className="flex-1 truncate text-sm text-ink-700">{e.name}</span>
              <span className="num hidden text-[10px] text-ink-400 sm:block">SHA-256 {e.sha256.slice(0, 12)}…</span>
              <button className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-600" onClick={() => removeEvidence(e.id)}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg border border-ink-200 bg-emerald-50/40 px-3 py-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span className="flex-1 truncate text-sm text-ink-700">{file.name} <span className="text-xs text-ink-400">({(file.size / 1024).toFixed(0)} KB, pending save)</span></span>
              <span className="num hidden text-[10px] text-ink-400 sm:block">SHA-256 {file.sha256.slice(0, 12)}…</span>
              <button className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-600" onClick={() => setFiles((x) => x.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      ) : null}

      <Field label="Remarks">
        <TextArea rows={3} value={f.remarks} onChange={(e) => set("remarks", e.target.value)} placeholder="Explain the result, assumptions or context." />
      </Field>

      <Field label="Approval Person" required error={errors.approverId} hint="Only Department Heads of your department are listed.">
        <Select value={f.approverId} disabled={lockDef} onChange={(e) => set("approverId", e.target.value)} invalid={!!errors.approverId}>
          <option value="">Select approval person…</option>
          {heads.map((h) => <option key={h.id} value={h.id}>{h.fullName} — {h.designation}</option>)}
        </Select>
      </Field>

      {!heads.length ? (
        <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> No Department Head exists for your department yet. Ask the System Admin to invite one before submitting.
        </p>
      ) : null}
    </Drawer>
  );
}
