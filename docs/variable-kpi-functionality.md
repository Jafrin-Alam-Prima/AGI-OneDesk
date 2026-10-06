# Variable Income KPI — Functionality Analysis

**Source file:** `Variable Income KPI Setting- Aug'26-G.Sarwar Gazi.xlsx` — single sheet **`July'26`** (rows 1–22, columns A–H).
**What it is:** the operational monthly **Variable Income KPI scorecard** for one employee, used to compute a **weighted, capped score** that maps to a **grade** and drives **variable pay / incentive**. This is the concrete, numeric KPI model that AGI OneDesk's goal/KPI module must reproduce.

---

## 1. Header block (employee context)

| Field | Value in sample |
|---|---|
| Organisation | ANWAR GROUP OF INDUSTRIES |
| Sheet title | Variable Income monthly KPI – Aug'26 |
| Employee Name | Golam Sarwar Gazi |
| Employee ID | 13811 |
| Current Designation | Assistant Manager, Business Analyst |
| Department | Sales and Marketing |

> Note the file name says "Aug'26" but the sheet tab is "July'26" — the sheet is a monthly template reused per month.

---

## 2. The KPI table — columns

The table header (rows 9–10) defines the model. Physical columns are A–H; the row-10 "A / B / C / D / E" labels are *logical* KPI-field names.

| Physical col | Header (row 9) | Logical (row 10) | Meaning |
|---|---|---|---|
| A | SL | — | Row number |
| B | Key Result Areas (KRA)/Perspectives | — | KRA / BSC perspective |
| C | Action Plan | — | The activities behind the KPI |
| D | **Weightage** | **A** | KPI weight (0–1) |
| E | **Monthly Target** | **B** | Target value |
| F | **Monthly Achievement** | **C** | Actual value |
| G | **Monthly Achievement %** | **D = C/B** | attainment ratio |
| H | **Score** | **E = A×D** | weighted, capped score |

**Sample rows**
| SL | KRA / Perspective | Action Plan | Weight (A) | Target (B) | Achievement (C) | Ach% (D) | Score (E) |
|---|---|---|---|---|---|---|---|
| 1 | Financial Perspective (Sales Achievement AOPL) | Sales Target vs Achievement (AOPL) – Lion | 0.4 | 49.16 | 44.42 | 0.9036 | 0.3614 |
| 2 | Business Development | 1) Sales Forecasting … 11) Special incentive design | 0.6 | 100 | 88 | 0.88 | 0.528 |
| **Total** | | | **1.0** | **149.16** | **132.42** | **0.8878** | **0.8894** |

---

## 3. Exact formulas (from the workbook)

```
D (Achievement %)  = C / B                = Monthly Achievement ÷ Monthly Target
E (Score)          = A × MIN(D, 1)        = Weightage × MIN(Achievement %, 1)
Total weight       = SUM(A11:A12)         = 1
Total target       = SUM(B11:B12)         = 149.16
Total achievement  = SUM(C11:C12)         = 132.42
Total Ach %        = Total achievement ÷ Total target = 132.42 ÷ 149.16 = 0.88777
Total Score        = SUM(E11:E12)         = 0.88943
```

**Two important behaviours:**
1. **Score = Weightage × Achievement%** — the KPI contributes its weight scaled by how much was achieved.
2. **Cap at 100%** — row 1 uses `MIN(Achievement%, 1)`: achievement above plan is **capped at 100%** for scoring (row 2's `D*G` is equivalent because its achievement is below 100%). This is the "no over-achievement bonus" rule and directly answers **BRD OI-03** (caps) — for Variable Income, caps **do** apply, unlike Anwar KPIFlow's `Achievement = Actual/Target×100` with no cap.

> Cross-note: the **BRD KPI module** (Anwar KPIFlow) uses *uncapped* score = Achievement and a weighted average; the **Variable Income** model uses a *capped* `Weight × min(Achievement%,1)`. AGI OneDesk must support **both calculation profiles** (see §7).

---

## 4. Weighting rules

- **Weightage** is a fraction (0.4, 0.6) — equivalent to 40% / 60%.
- **Total weight = 1.0 (100%)** in the sample (BRD OI-07 leaves this unenforced in KPIFlow; Variable Income expects it to total 1).
- Each KPI's weight is fixed per period; score scales linearly with weight.
- Multiple KRAs can carry different weights (Financial 40%, Business Development 60%).

---

## 5. Grade mapping

The sheet computes: **"Avail Grade based on achieved mark" = `B+`** for a total score of **0.8894** (~88.9%).

- The grade is derived from the **total score**, not typed.
- The exact band table is **not present** in the sheet → treat as a **configurable grading scale** (super-admin maintained). A typical Bangla/enterprise scale: `A+ ≥ 0.90`, `A 0.80–0.89`, `B+ 0.70–0.79` … but the sample shows 0.889 → **B+**, so the actual bands are tighter and **must be confirmed with Anwar HR** (open item AGI-VK-01).

---

## 6. Approval / sign-off block

The sheet footer has four signature areas:

| Sign-off | Role |
|---|---|
| LM Signature | Line Manager |
| COO | Chief Operating Officer |
| HOD Signature | Head of Department |
| HOD, HR Signature | Head of HR |

This is the **manual signature chain the BRD replaces** with the digital `Target → Actual → Evidence → Score → Review → Approval` flow. In AGI OneDesk these four sign-offs map to the **approval pipeline stages** (Employee → Line Manager/Dept Head → HR → Finance/COO → Audit), exactly as modelled in the existing prototype's `DEMO_ACCOUNTS.md`.

---

## 7. Relationship to the BRD KPI model

| Concept | BRD (Anwar KPIFlow) | Variable Income sheet | AGI OneDesk |
|---|---|---|---|
| KPI name | KPI | Action Plan / KRA | **KPI** |
| Perspective | KPI Category (Project / People & Culture) | KRA/Perspective (Financial, Business Development) | **KRA / Perspective** |
| Weight | KPI Weight (%) | Weightage (0–1) | **Weight** |
| Target | Target | Monthly Target | **Target** |
| Actual | Actual | Monthly Achievement | **Actual** |
| Achievement | `Actual/Target×100` | `C/B` (ratio) | **Achievement %** |
| Score | `= Achievement` (uncapped) | `Weight × min(Ach%,1)` (capped) | **configurable profile** |
| Grade | — | derived from total score | **derived, configurable bands** |
| Cap | none (OI-03) | **min(x,1)** | **per-profile** |
| Approval | 4 decisions, one approver | 4 signatures (LM/COO/HOD/HOD-HR) | **pipeline** |
| Variable pay | — | implied payout by grade | **variable income** |

---

## 8. Worked example (from the sheet)

**Financial Perspective — Sales Achievement (AOPL)**
- Weight 0.40, Target 49.16, Achievement 44.42
- Achievement % = 44.42 / 49.16 = **0.9036 (90.36%)**
- Score = 0.40 × min(0.9036, 1) = **0.3614**

**Business Development**
- Weight 0.60, Target 100, Achievement 88
- Achievement % = 88 / 100 = **0.88**
- Score = 0.60 × 0.88 = **0.528**

**Total** = 0.3614 + 0.528 = **0.8894 → Grade B+**, eligible for variable income per band.

---

## 9. Rules & implications for AGI OneDesk

1. **KPI = KRA/Perspective + Action Plan + Weight + Target + Achievement + Achievement% + Score.**
2. **Achievement % = Achievement ÷ Target** (monthly).
3. **Two scoring profiles** must be supported:
   - *KPIFlow profile:* uncapped score = Achievement%, weighted average (BRD).
   - *Variable Income profile:* score = Weight × min(Achievement%,1), capped, sum of weighted scores.
4. **Grade** derived from total score via a **configurable band table** (bands to be confirmed).
5. **Monthly period** is first-class (header says Aug'26; tab says July'26 → per-month instances).
6. **Sign-off chain** (LM → COO → HOD → HOD-HR) becomes the digital approval pipeline.
7. **Variable pay** = grade/score input to payroll's variable-income component.
8. **Employee context** on the sheet (Name, ID, Designation, Department) must be auto-filled from the employee master, never typed (matches PeopleDesk KPI screen header and BRD FR-KPI fields).
9. **Export/sign** — the sheet is a printable, signable document; AGI OneDesk should offer a **PDF/XLSX scorecard export** with the sign-off block.
10. **Cap behaviour must be visible** in the calculation path (e.g. "capped at 100%") for auditability.

### Open items raised by this sheet
| ID | Point to confirm |
|---|---|
| AGI-VK-01 | Exact grade band boundaries (score → A+/A/B+/…). |
| AGI-VK-02 | Whether caps apply only to Variable Income KPIs or also to KPIFlow KPIs. |
| AGI-VK-03 | Whether weights must total 1.0 (100%) per period. |
| AGI-VK-04 | How the four sign-offs map to system roles (LM/COO/HOD/HOD-HR) vs. the 5-role pipeline in the prototype. |
| AGI-VK-05 | Whether variable income payout bands are fixed HR policy or per-grade multiplier. |
