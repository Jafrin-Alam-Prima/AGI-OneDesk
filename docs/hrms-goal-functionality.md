# HRMS Goal Worksheet — Functionality Analysis

**Source file:** `Copy of HRMS Goal Worksheet.xlsx` — single sheet **`HRMS & ESS`** (237 rows × 16 columns A–P).
**What it actually is:** a **goal / scope worksheet** for a **Microsoft Dynamics 365 Business Central HRMS + Employee Self-Service (ESS)** implementation. It is written as a **KRA hierarchy** (Objective → KRA → KPI measure → Tasks), which is exactly the goal/KPI terminology AGI OneDesk must adopt.

---

## 1. How the worksheet is used

The sheet is a *planning and scope-sign-off artifact*, not a data-entry form. A consulting/implementation team uses it to:

1. Enumerate every **Objective** (e.g. "#1 HRMS", "#2 TRAINING & UAT").
2. Break each objective into **Key Result Areas (KRAs)** (e.g. "Leave & Absence", "Payroll Management").
3. Break each KRA into **KPI measures** — a named deliverable (e.g. "Vacancy Management", "Salary Structure").
4. Break each KPI measure into **Tasks** — concrete system behaviours (e.g. "Create vacancies and Attach Skills").
5. Mark each item **Category** (Standard), **Availability** (Currently Available / NA for services), and **In Scope** (`Y`).
6. Optionally capture **Phase, Efforts, Responsibility** for delivery planning (columns present but largely empty).

**Structural facts observed:**
- **105 merged-cell ranges** create the visual hierarchy (e.g. `A7:A146` merges the top objective across all HRMS rows; `C9:C28`, `D50:D68`, `F17:F19` merge KRA/KPI labels down their task rows).
- **0 formulas** — it is a document, not a calculation model.
- **1 data validation** (a dropdown for `CATEGORY` sourced from `$O$32:$O$34`, which is empty), so category is effectively free text, always "Standard".
- **Category:** 227 rows = `Standard` (no "Custom" items recorded).
- **Availability:** 216 = `Currently Available`, 11 = `NA` (the TRAINING/UAT, GO-LIVE and HYPERCARE service rows).
- **In Scope:** 29 `Y` (the items the client explicitly confirmed in scope); all other rows are unscored context.
- Columns **PHASE, EFFORTS, RESPONSIBILITY, PHASES, CUSTOMIZATION EFFORTS (Mandays), P** are empty.

---

## 2. Column dictionary

| Col | Header | Meaning | Sample values |
|---|---|---|---|
| A | **ID** | Hierarchical row ID | `101`, `101.1`, `101.2`, `102`… |
| B | **OBJECTIVES** | High-level goal / project objective | `#1 HRMS`, `#2 TRAINING & UAT`, `#3 TRAIN TO TRAINER`, `#4 HYPERCARE SUPPORT` |
| C | **OBJECTIVE ID** | Numbered objective | `101.1.1`, `101.1.2`, `101.2.1` |
| D | **KEY RESULT AREA (KRA)** | Functional area | Dashboard and overview, ATS/Recruitment, OnBoarding, Personnel Management, Leave & Absence, Payroll Management, Training Management, Full & Final, Off-Boarding, Tours/Bookings/Advances, Expense & Reimbursement, Reports |
| E | **KRA ID** | Numbered KRA | `101.1.1.1`, `101.1.2.1`, … |
| F | **DESCRIPTION OF KPI MEASURE** | Named deliverable within a KRA | Manpower Requisition, Vacancy Management, Leave Types, Salary Structure, Bonus… |
| G | **CATEGORY** | Standard / Custom | `Standard` (all) |
| H | **AVAILABILITY** | Is it already available? | `Currently Available`, `NA` |
| I | **TASKS** | Concrete system behaviours / acceptance statements | Free-text bullets |
| J | **IN SCOPE** | Confirmed in scope? | `Y` (29 rows) |
| K | **PHASE** | Delivery phase (empty) | — |
| L | **EFFORTS** | Effort estimate (empty) | — |
| M | **RESPONSIBILITY** | Owner (empty) | — |
| N | **PHASES** | Phases (empty) | — |
| O | **CUSTOMIZATION EFFORTS (Mandays)** | Customisation days (empty; also the source list for the Category dropdown) | — |
| P | **P** | Unlabelled flag (empty) | — |

---

## 3. The goal / KRA / KPI model (reusable for AGI OneDesk)

The worksheet encodes a four-level goal hierarchy. AGI OneDesk should reuse this vocabulary:

```
Objective (ID)
  └─ Key Result Area / KRA (KRA ID)
        └─ KPI Measure (named deliverable)
              └─ Task  ── Category · Availability · In Scope
```

| Level | Worksheet entity | AGI OneDesk term |
|---|---|---|
| Objective | `#1 HRMS`, `#2 TRAINING & UAT` | **Objective** / **Perspective** (BSC) |
| KRA | Dashboard, Leave & Absence, Payroll… | **Key Result Area (KRA)** |
| KPI Measure | "Vacancy Management", "Salary Structure" | **KPI / Goal** |
| Task | "Create vacancies and Attach Skills" | **KPI task / description** |
| Category / Availability / In Scope | Standard / Available / Y | **KPI attributes** |

This matches PeopleDesk's own KPI screen columns (BSC, Objective, KPI, UOM, KPI Direction, Weight, Benchmark, Target, Achievement, Progress, Score) and the BRD's KPI record.

---

## 4. HRMS functionality specified by the worksheet (by KRA)

The worksheet's KRA content = the HRMS+ESS feature backlog. Full detail in `feature-parity-matrix.md`; summary here.

### 4.1 Objective #1 — HRMS
| KRA | KPI measures (deliverables) |
|---|---|
| **Dashboard & overview** | Analytics display (cues/tiles) for employees, leave & absence, training, recruitment, loans, payroll, F&F, helpdesk |
| **ATS / Recruitment** | Manpower requisition; vacancy management (skills, comp range, job tasks, deadlines); interview cycles & stages; panelist management; candidate management; feedback forms + reminders; offer & selection (CTC, letter, candidate→employee) |
| **OnBoarding** | Hire as employee; auto-fill employee card; documents migrate |
| **Personnel Management** | Employment letters (promotion/demotion/increment/warning/advisory, Word templates); employee documents; employee information (central DB); documentation; timesheet & shift (roster); contract labour management |
| **Leave & Absence** | Leave types; leave plans (accrual pro-rata/fixed, assign by grade/designation/department); sandwich policy; manage leaves (ledgers/balances); approval (one level); leave encashment; comp-off |
| **Payroll Management** | Wage types (daily/monthly); salary structure (grades, CTC, revision); attendance import (Excel, shifts, presence/absence/half-day/OT/late/comp-off/OD/early-exit); multiple shifts; leave extension; overhead payments (variable/ad-hoc); bonus; arrears; OT; salary advance & settlement; loan (disbursement, EMI, hold); salary calculation (process & post, ledger entries) |
| **Training Management** | Faculty list; training category; training list; assign training to employees |
| **Full & Final** | F&F calculation; ad-hoc additions/deductions; F&F statement |
| **Off-Boarding** | PIP; exit employee (mark inactive); exit documentation (relieving/experience, F&F); system-generated email with attachments |
| **Tours, Bookings & Advances** | Tour intimation; tour approval; booking request/approval; booking intimations; booking confirmation documents; tour advance & settlement |
| **Expense & Reimbursement** | Expense policy; expense claims & approvals; reimbursement & advance settlement |
| **Reports** | Employee master; timesheet; salary; leave; training; statutory (PF, PT, ESIC, PF ECR, Forms PT-5/28/04/13/18/19/36/15) |

### 4.2 Objective #2 — ESS (mobile + web)
Login & dashboard; employee details; documents; attendance (clock in/out, shift, daily, regularization, out-door duty); leaves (short leave, balance, history, apply); finances (CTC, payslips, last salary); tour; booking; advance; expenses; my teams (manager, reportees, team attendance); approvals (leave, attendance reg., expenses, comp-off, tour, booking, advance, short leave, out-door duty); notifications; org policies; announcements.

### 4.3 Objectives #3–#5 — service KRAs (not software)
Train key users / training materials / LMS help (Objective #2 TRAINING & UAT), Go-Live certificate & UAT sign-off (#3), Hypercare support & continuity (#4). These are **implementation services**, not app screens.

---

## 5. Business rules implied by the worksheet

1. **One standard process** for all departments — no department-specific screens.
2. **Standard product** preferred — everything marked "Standard / Currently Available"; no customisation mandated.
3. **Central employee database** in predefined fields; documents in SharePoint/BC depending on size.
4. **Single-level approval** for leave ("One level of approval workflow available").
5. **Salary calculation monthly; postings monthly** with ledger entries.
6. **Attendance** can be imported from Excel; shifts drive attendance marking.
7. **Leave accrual** pro-rata and fixed, based on date of joining; plans assigned by grade/designation/department.
8. **No bulk resume import** — candidates created via Excel import with resumes attached individually.
9. **Auto Teams-link for panelists** is *not* standard — HR pastes the link manually.
10. **Only the F&F, loans, encashment, comp-off, letters, and selected reports** are explicitly in scope (`Y`) — the rest is standard baseline.

---

## 6. Data-entry behaviour (as a worksheet)

- Rows are added under a KRA; KPI measure cells merge down across task rows.
- Category chosen from a dropdown (Standard/Custom); Availability text; In-scope `Y` flag.
- No calculations, no cross-sheet links, no dependencies — purely descriptive.
- Reporting use: filter by KRA/objective to scope a work package; the `Y` flags define the committed backlog.

---

## 7. How AGI OneDesk uses this worksheet

1. **Feature backlog** — the KRA/KPI list becomes the module checklist for AGI OneDesk (HRMS + ESS).
2. **Goal vocabulary** — adopt Objective → KRA → KPI measure → Task naming in the Goals/KPI module.
3. **Scoping** — items the worksheet marks `NA` (training/go-live/hypercare) are **out of prototype app scope**; items marked `Y` are priority.
4. **Cross-check with PeopleDesk** — PeopleDesk already covers most KRAs natively (see `feature-parity-matrix.md`); the worksheet confirms which are baseline vs. custom.
5. **Gap handling** — worksheet items PeopleDesk lacks (deep ATS, travel booking, statutory forms) are AGI-specific modules or simulated.
