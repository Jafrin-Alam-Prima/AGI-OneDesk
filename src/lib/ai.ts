import type { Kpi, User } from "./types";

/**
 * Simulated (deterministic) AI scorers — every result is explainable and
 * human-in-the-loop. No network/model calls; safe for the prototype.
 */

export interface AiFactor {
  label: string;
  impact: number;
  detail: string;
}

export interface AttritionResult {
  score: number; // 0..100
  band: "LOW" | "MEDIUM" | "HIGH";
  factors: AiFactor[];
  why: string;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}

/** Attrition risk from tenure, KPI trend, approval friction, compensation & engagement signals. */
export function attritionRisk(user: User, kpis: Kpi[]): AttritionResult {
  const mine = kpis.filter((k) => !k.deleted && k.ownerId === user.id);
  const factors: AiFactor[] = [];

  const joined = user.joiningDate ? new Date(user.joiningDate) : null;
  const months = joined ? Math.max(0, Math.round((Date.now() - joined.getTime()) / (30 * 86400000))) : 24;
  factors.push({ label: "Tenure", impact: months < 18 ? Math.max(0, 40 - months) : 0, detail: `${months} months in role` });

  const counted = mine.filter((k) => k.target > 0);
  const avg = counted.length ? (counted.reduce((s, k) => s + k.actual / k.target, 0) / counted.length) * 100 : 100;
  if (avg < 85) factors.push({ label: "Below-target performance", impact: Math.min(35, 85 - avg), detail: `Average achievement ${avg.toFixed(0)}%` });

  const friction = mine.filter((k) => k.status === "RETURNED" || k.status === "REJECTED").length;
  if (friction > 0) factors.push({ label: "Approval friction", impact: Math.min(20, friction * 8), detail: `${friction} KPI(s) returned/rejected` });

  const comp = hash(user.id + "comp") % 100;
  factors.push({ label: "Compensation percentile", impact: comp < 40 ? 15 : comp < 60 ? 6 : 0, detail: `Estimated ${comp}th percentile` });

  const eng = hash(user.id + "eng") % 100;
  factors.push({ label: "Engagement signal", impact: eng < 30 ? 18 : eng < 50 ? 8 : 0, detail: `${eng < 30 ? "Low" : eng < 50 ? "Medium" : "Healthy"} engagement` });

  factors.sort((a, b) => b.impact - a.impact);
  const score = Math.max(0, Math.min(100, Math.round(factors.reduce((s, f) => s + f.impact, 0))));
  const band: AttritionResult["band"] = score >= 65 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  const top = factors.filter((f) => f.impact > 0).slice(0, 3);
  const why = top.length
    ? `Risk ${score}/100 (${band}) driven by: ${top.map((f) => `${f.label} — ${f.detail}`).join("; ")}.`
    : `Risk ${score}/100 (${band}) — no material risk signals this period.`;
  return { score, band, factors, why };
}

const SKILLS = [
  "sales", "excel", "sql", "python", "communication", "leadership", "marketing", "finance",
  "recruitment", "power bi", "project management", "data analysis", "crm", "negotiation",
  "hr", "payroll", "analytics", "javascript", "react", "node", "customer service", "reporting",
];

export interface ResumeResult {
  match: number; // 0..100
  matched: string[];
  missing: string[];
  why: string;
}

/** Screen a resume against a JD by required-skill overlap (deterministic). */
export function screenResume(jd: string, resume: string): ResumeResult {
  const jdL = jd.toLowerCase();
  const rL = resume.toLowerCase();
  const required = SKILLS.filter((s) => jdL.includes(s));
  const matched = required.filter((s) => rL.includes(s));
  const missing = required.filter((s) => !rL.includes(s));
  const match = required.length
    ? Math.round((matched.length / required.length) * 100)
    : (rL.trim().length > 40 ? 55 : 15);
  const why = required.length
    ? `Matched ${matched.length}/${required.length} required skills${missing.length ? `; missing ${missing.join(", ")}` : ""}.`
    : "No explicit skills detected in the JD — heuristic match from resume length only.";
  return { match, matched, missing, why };
}

const NEG = ["delay", "late", "issue", "problem", "worried", "unfair", "poor", "frustrat", "angry", "bad", "harass", "stress", "not resolved", "no response"];
const POS = ["good", "great", "thanks", "appreciate", "resolved", "happy", "excellent", "helpful", "supportive"];

export interface SentimentResult {
  score: number; // -1..1
  label: "Positive" | "Neutral" | "Negative";
  themes: string[];
}

/** Keyword sentiment + themes for grievance/feedback text (deterministic). */
export function analyseSentiment(text: string): SentimentResult {
  const t = text.toLowerCase();
  let raw = 0;
  NEG.forEach((w) => { if (t.includes(w)) raw -= 1; });
  POS.forEach((w) => { if (t.includes(w)) raw += 1; });
  const score = Math.max(-1, Math.min(1, raw / 3));
  const label: SentimentResult["label"] = score <= -0.34 ? "Negative" : score >= 0.34 ? "Positive" : "Neutral";
  const themes: string[] = [];
  if (/leave|absence|holiday/.test(t)) themes.push("Leave");
  if (/salary|pay|allowance|increment|bonus/.test(t)) themes.push("Compensation");
  if (/manager|supervisor|team|lead/.test(t)) themes.push("Management");
  if (/training|skill|career|promotion/.test(t)) themes.push("Development");
  if (/attendance|late|shift|overtime/.test(t)) themes.push("Attendance");
  return { score, label, themes };
}
