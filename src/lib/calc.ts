import type { Grade, Kpi, KpiStatus, VariableIncomeRecord } from "./types";

/** Achievement % = Actual / Target * 100 (BRD §11.1). */
export function achievement(target: number, actual: number): number {
  if (!target || target <= 0) return 0;
  return (actual / target) * 100;
}

/** KPIFlow profile score = Achievement (no curve/cap) — BRD §11.2. */
export function calculatedScore(target: number, actual: number): number {
  return achievement(target, actual);
}

/** Weighted score = FinalScore * weight / 100. */
export function weightedScore(finalScore: number, weight: number): number {
  return (finalScore * weight) / 100;
}

/** Total KPI score = Σ(score*weight)/Σ(weight) — BRD §11.3. */
export function totalKpiScore(rows: { finalScore: number; weight: number }[]): number {
  const wsum = rows.reduce((s, r) => s + r.weight, 0);
  if (!wsum) return 0;
  const sum = rows.reduce((s, r) => s + r.finalScore * r.weight, 0);
  return sum / wsum;
}

export function averageAchievement(kpis: Kpi[]): number {
  if (!kpis.length) return 0;
  return kpis.reduce((s, k) => s + achievement(k.target, k.actual), 0) / kpis.length;
}

/** Final score for a KPI, preferring adjusted final values when present. */
export function finalScore(kpi: Kpi): number {
  if (kpi.status === "APPROVED" || kpi.status === "ADJUSTED" || kpi.status === "COMPLETED") {
    return calculatedScore(kpi.target, kpi.actual);
  }
  return calculatedScore(kpi.target, kpi.actual);
}

export const COUNTED_STATUSES: KpiStatus[] = ["APPROVED", "ADJUSTED", "COMPLETED"];

export function isCounted(kpi: Kpi): boolean {
  return COUNTED_STATUSES.includes(kpi.status) && !kpi.deleted;
}

/* ---------------- Variable Income (capped) ---------------- */

/** Achievement ratio = achievement / target (0..n). */
export function vkAchievementRatio(target: number, achieve: number): number {
  if (!target || target <= 0) return 0;
  return achieve / target;
}

/** Variable-income score = weight * min(ratio, 1) — capped at 100%. */
export function vkRowScore(target: number, achieve: number, weight: number): number {
  return weight * Math.min(vkAchievementRatio(target, achieve), 1);
}

export function vkRecordTotal(rec: VariableIncomeRecord): number {
  return rec.rows.reduce((s, r) => s + vkRowScore(r.target, r.achievement, r.weight), 0);
}

export function vkTotalWeight(rec: VariableIncomeRecord): number {
  return rec.rows.reduce((s, r) => s + r.weight, 0);
}

export function vkTotalTarget(rec: VariableIncomeRecord): number {
  return rec.rows.reduce((s, r) => s + r.target, 0);
}

export function vkTotalAchievement(rec: VariableIncomeRecord): number {
  return rec.rows.reduce((s, r) => s + r.achievement, 0);
}

export function gradeFor(score: number, grades: Grade[]): Grade | undefined {
  return grades.find((g) => score >= g.min && score <= g.max);
}

export function bandColor(pct: number): "green" | "amber" | "red" {
  if (pct >= 90) return "green";
  if (pct >= 70) return "amber";
  return "red";
}
