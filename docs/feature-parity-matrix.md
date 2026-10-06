# Feature Parity Matrix — PeopleDesk × BRD × HRMS Worksheet × Variable KPI

**Purpose:** decide exactly what AGI OneDesk must build, in which form, for the prototype.
**Inputs:** `peopledesk-feature-inventory.md`, `brd-requirements.md`, `hrms-goal-functionality.md`, `variable-kpi-functionality.md`, live PeopleDesk inspection.

Legend: ✅ covered · ⚠️ partial / different form · ❌ not covered · ➕ PeopleDesk exceeds · 🔧 needs AGI adaptation · 🧪 simulate for prototype

---

## A. PeopleDesk features that MUST exist in AGI OneDesk

These are the reference features that define the PeopleDesk "feel". All are **must-haves** for AGI OneDesk.

| # | PeopleDesk feature | Module | Why it must exist | Sim? |
|---|---|---|---|---|
| A1 | Global shell (top bar: search, BU switcher, notifications, chat, profile; collapsible sidebar) | Shell | Defines the entire product feel | 🧪 (local session) |
| A2 | Role-based sidebar navigation | Shell | Navigation model | 🧪 |
| A3 | Landing/dashboard with app tiles | Overview | Entry point | 🧪 |
| A4 | Employee master list + create/edit + bulk upload | Personnel | Core HRMS | 🧪 seeded |
| A5 | Employee profile ("About Me") with tabs | Personnel | ESS profile | 🧪 |
| A6 | Employee documents | Personnel | ESS docs | 🧪 |
| A7 | Org masters (BU, SBU, Department, Designation, Workplace, HR Position, Grade, Bank Branch) | Admin | Data foundation | 🧪 seeded |
| A8 | Organogram | Admin | Org view | 🧪 |
| A9 | Leave application + balance + history | Leave | ESS core | real local |
| A10 | Movement / out-door duty | Leave | ESS core | real local |
| A11 | Leave policy / types setup | Leave | Admin | 🧪 |
| A12 | Attendance calendar + clock in/out | Time | ESS core | 🧪 |
| A13 | Attendance adjustment / regularization | Time | ESS core | real local |
| A14 | Shift / roster / holiday / off-day setup | Time | Admin | 🧪 |
| A15 | Overtime entry + policy | Time | Payroll input | 🧪 |
| A16 | Loan request + schedule + approval | Loan | ESS core | real local |
| A17 | IOU / advance + adjustment | Loan | ESS core | real local |
| A18 | Expense claim + approval | Expense | ESS core | real local |
| A19 | Salary assign / generate (view) | Payroll | Core HRMS | 🧪 |
| A20 | Bonus / arrear / allowance-deduction | Payroll | Core HRMS | 🧪 |
| A21 | Payslip + salary certificate | Payroll/ESS | ESS core | 🧪 |
| A22 | PF & gratuity (view) | Payroll | Statutory | 🧪 |
| A23 | **KPI / PMS module** (Individual KPI entry, KPI approval, config, mapping, targets, reports) | Performance | Core of BRD | real local |
| A24 | Recruitment tracker / requisition | ATS | HRMS | 🧪 |
| A25 | Training catalogue + schedule + application | Training | HRMS | 🧪 |
| A26 | Separation / clearance / final settlement | Separation | HRMS | real local |
| A27 | Transfer & promotion / confirmation | Personnel | HRMS | 🧪 |
| A28 | Rewards & disciplinary / grievance | Rewards | HRMS | 🧪 |
| A29 | GRC (risk, audit trail, compliance) | GRC | PeopleDesk breadth | 🧪 |
| A30 | Asset management | Asset | PeopleDesk breadth | 🧪 |
| A31 | Task management (projects/board) | Tasks | PeopleDesk breadth | 🧪 |
| A32 | Cafeteria / food corner | Cafeteria | PeopleDesk breadth | 🧪 |
| A33 | Approval queues (~40 types) + pipeline config | Approval | Core workflow model | real local (subset) |
| A34 | Notification centre + setup | Notifications | Cross-cutting | real local |
| A35 | Reports suite + custom report builder | Reports | Cross-cutting | 🧪 subset |
| A36 | Announcements + policies | Comms | ESS | real local |
| A37 | Role management / users / menus / feature groups | Admin | RBAC | 🧪 |
| A38 | Communication templates + chat + contact book | Comms | PeopleDesk breadth | 🧪 |
| A39 | Issue / helpdesk / service request | Helpdesk | PeopleDesk breadth | real local |
| A40 | ESS portal (all 24 live ESS pages) | ESS | Employee experience | mixed |

---

## B. HRMS Goal Worksheet features PeopleDesk does NOT cover

| # | Worksheet feature | PeopleDesk reality | Gap type | AGI action |
|---|---|---|---|---|
| B1 | Deep **ATS**: interview cycles/stages, panelist management, feedback forms + reminders, vacancy skills/comp-range/deadlines | Recruitment is present (requisition, tracer, HireDesk) but this config depth was **not found** | ❌ functional | Build a **Recruitment module** with requisition → vacancy → interview cycle → panelists → feedback → offer |
| B2 | Dedicated **travel booking** (flights/hotels/cars, intimations, confirmation docs) | Handled as **movement + IOU**; no booking engine | ❌ functional | Build a **Tour & Booking** module (request → approve → booking docs → advance) |
| B3 | Full **employment-letter Word-template suite** (promotion/demotion/increment/warning/advisory) with email + history | Some letters exist; not a full template suite | ⚠️ partial | Build **Letter templates** (create → generate → email → store) |
| B4 | **Contract labour** tagging in employee card | Employment type config exists; no tagging route | ⚠️ partial | Add **contract-labour** flag + list |
| B5 | **Sandwich policy** (weekly-off + holiday) | Off-day/holiday setup exists; sandwich not explicit | ⚠️ partial | Add sandwich-rule config to leave policy |
| B6 | **India statutory forms** (PF/ESIC/PT Forms 5/28/04/13/18/19/36/15, PF ECR) | PF/Gratuity/tax reports exist; **not these forms** | ❌ statutory | Out of prototype scope or simulated as report stubs (BD context) |
| B7 | **Candidate Excel import with individual resume attach** | Not observed | ⚠️ | Cover under Recruitment module |
| B8 | **Booking intimations** notifications | Notification framework exists | ⚠️ | Use notification centre |

---

## C. BRD features PeopleDesk does NOT cover

The BRD (Anwar KPIFlow) is largely **conceptually present** in PeopleDesk's PMS/KPI module, but with specific rules that differ.

| # | BRD requirement | PeopleDesk reality | Gap type | AGI action |
|---|---|---|---|---|
| C1 | **Six-step traceable flow** Target→Actual→Evidence→Score→Review→Approval with a visual tracker on every KPI card | PeopleDesk KPI screen is a table (BSC/Objective/KPI/UOM/Direction/Weight/Benchmark/Target/Ach/Progress/Score); no six-step tracker | ⚠️ UX | Build the **card + six-step tracker** exactly as BRD |
| C2 | **Evidence file per KPI** with SHA-256 fingerprint + download in a calc path | Evidence handling not shown on KPI screen | ❌ | Build evidence upload + hash + calc path |
| C3 | **Adjustment History** (field, old→new, who, when, reason) | Not shown | ❌ | Build version/adjustment history |
| C4 | **4 decisions** Approve / Adjustment / Return / Reject with mandatory reasons | PeopleDesk has approval queues but not this KPI-specific decision model | ❌ | Build the review drawer with the 4 decisions |
| C5 | **Performance Summary**: 5 metrics + 10-column records table + 3 bar charts | PeopleDesk has KPI reports but not this exact summary | ⚠️ | Build per BRD (this is core) |
| C6 | **Department dashboard** tiles + below-target list | PeopleDesk has management dashboards | ⚠️ | Build per BRD |
| C7 | **Leaderboard** ranked, colour-banded, department-scoped | PeopleDesk has performance marking, not this leaderboard | ⚠️ | Build per BRD |
| C8 | **Version control + side-by-side compare** | PeopleDesk has `KPI Change Log` (permission exists) | ⚠️ | Build version compare |
| C9 | **Append-only audit trail** | PeopleDesk has audit/digital-footprint reports | ⚠️ | Build audit trail |
| C10 | **Self-signup restricted to `@anwargroup.net`** + secure setup link + eye-toggle passwords | PeopleDesk uses admin provisioning | ❌ auth model | Build self-signup + setup link + password UX |
| C11 | **Department-scoped approval** with several heads per department, no self-approval | PeopleDesk has department scoping | ⚠️ | Enforce BR-05/09/10 |
| C12 | **Two Variable KPI categories** (Project, People & Culture) | PeopleDesk has PM Type/BSC | ⚠️ | Add category field |
| C13 | **Uncapped** score = Achievement; weighted average total | PeopleDesk KPI uses weight/benchmark; caps unknown | ⚠️ | Implement BRD calc profile + VK capped profile |

---

## D. Overlapping features (PeopleDesk ∩ Worksheet ∩ BRD)

These exist in all three sources — build once, reuse.

| # | Feature | PeopleDesk | Worksheet | BRD | Notes |
|---|---|---|---|---|---|
| D1 | Employee master / profile | ✅ | ✅ | ✅ (FR-PRO) | Foundation for all |
| D2 | Leave & absence | ✅ | ✅ | — | ESS + approval |
| D3 | Attendance & regularization | ✅ | ✅ | — | ESS + approval |
| D4 | Approval workflow | ✅ | ✅ | ✅ | KPI approval is a queue |
| D5 | Dashboard / analytics tiles | ✅ | ✅ | ✅ (dept dashboard) | Different per role |
| D6 | KPI / goal sheet with target+achievement+score | ✅ | ✅ (KRA/KPI) | ✅ | Merge into one Goals/KPI model |
| D7 | Payroll (view) | ✅ | ✅ | — | Simulated |
| D8 | Reports | ✅ | ✅ | ✅ (perf reports) | Build the KPI reports |
| D9 | Documents / evidence upload | ✅ | ✅ | ✅ (evidence) | Reuse uploader + hash |
| D10 | Notifications | ✅ | ✅ | said in-app only | Shared centre |
| D11 | Training | ✅ | ✅ | — | Module exists |
| D12 | Separation / F&F | ✅ | ✅ | — | Module exists |
| D13 | Expense & reimbursement | ✅ | ✅ | — | Module exists |
| D14 | Roles & permissions | ✅ | ✅ | ✅ (§6) | RBAC + dept scoping |
| D15 | Announcements / policies | ✅ | ✅ | — | ESS |
| D16 | Grade / score mapping | ⚠️ | ✅ | ⚠️ (bands) | Configurable |

---

## E. Features that need modification for AGI

| # | PeopleDesk feature | AGI change |
|---|---|---|
| E1 | Branding (PeopleDesk logo, Akij Resource BU, green theme) | Rebrand to **AGI OneDesk** + Anwar colours (master red #DE3332 + ANWARS mark), Anwar BUs/departments |
| E2 | Employee data | Replace with **Anwar sample employees** (10 BUs, departments, names) |
| E3 | KPI calculation | Support **two profiles**: KPIFlow (uncapped weighted) + Variable Income (capped `Weight×min(Ach%,1)` + grade) |
| E4 | Grade banding | Add **configurable grade scale** (A+/A/B+…) and expose in scorecard |
| E5 | KPI category | Add **Project KPI / People & Culture KPI** (BRD) alongside BSC perspectives |
| E6 | KPI fields | Add **UOM, KPI Direction, SRF, Benchmark** (PeopleDesk) to the BRD 10 fields → unified KPI record |
| E7 | Approval pipeline | Map the **4 sign-offs** (LM/COO/HOD/HOD-HR) and the prototype's 5-role chain into one configurable pipeline |
| E8 | Sign-off/export | Add **PDF/XLSX scorecard** with signature block (like the VK sheet) |
| E9 | Login | Add **self-signup + secure setup link + eye-toggle** (BRD) on top of PeopleDesk-style login |
| E10 | Period model | Support **monthly / quarterly / yearly** + **fiscal year (2026-2027)** and per-month instances |
| E11 | Terminology | Use **KRA / Objective / Perspective / KPI / Weight / Target / Achievement / Grade / Variable Income** consistently |
| E12 | Currency/locale | **BDT**, `Asia/Dhaka`, `en-BD`/`en-US` formats |
| E13 | Evidence | Add **SHA-256 fingerprint** display (BRD NFR-13) |
| E14 | Leaderboard | Add **rank numbers + colour bands** (90/70 default, configurable) |

---

## F. Features to simulate for the prototype

Goal: a **convincing, fully interactive** prototype — not production infrastructure. Simulated where the real backend is heavy, but the **user experience must be real**.

| # | Area | Simulate how | Must still be real |
|---|---|---|---|
| F1 | Auth & users | Local session + mock users (role-gated) | Login, role routing, department scoping |
| F2 | Employees | Seeded local dataset (Anwar sample) | CRUD, search, filters, move/deactivate |
| F3 | Payroll | Read-only computed/stored values | Payslip view, salary summary, approval of add/deduct |
| F4 | Attendance | Seeded punches + calendar | Clock in/out, regularization request/approve |
| F5 | Leave balances | Local ledger computed from leave plans | Apply/approve/balance decrement |
| F6 | Notifications | Local notification store + bell | Badge, list, mark-read, deep-link |
| F7 | Documents/evidence | Local object URL + SHA-256 | Upload, preview, download, hash shown |
| F8 | Reports | Interactive tables + CSV/PDF export | Filters + live figures |
| F9 | Org masters | Seeded local config | CRUD in admin screens |
| F10 | Approvals | Local pipeline engine | Approve/Reject/Return/Adjust with reasons + history |
| F11 | KPI/Goals | **Real, fully interactive** | Create→submit→review→decide→summary→leaderboard |
| F12 | Training/Asset/Task/Cafeteria/GRC | Seeded list + light CRUD | Navigation, list, view, basic actions |
| F13 | Email (setup links) | In-app **Outbox** screen | Link generation + click-through |
| F14 | Adjacent ERP (SCM/Finance/Maritime) | Display-only or omit | n/a |
| F15 | Statutory forms (B6) | Report stubs | n/a |

---

## G. Parity scorecard

| Source | Features | ✅ in PeopleDesk | ⚠️ partial | ❌ missing |
|---|---|---|---|---|
| HRMS Goal Worksheet (KRA #1 HRMS + ESS) | ~70 measures | ~55 | ~8 | ~3 (+statutory) |
| BRD (Anwar KPIFlow) | 11 FR groups + 23 BR + 20 NFR | concept-level ✅ | ⚠️ most need UX build | ❌ auth model, evidence, versions |
| Variable Income KPI | 1 model, 8 fields, 2 formulas | ⚠️ concept only | ⚠️ | ❌ capped scoring + grade |

**Net position for AGI OneDesk:**
- **Reuse from PeopleDesk:** shell, navigation, module structure, tables/forms/filters, approvals, ESS, HRMS breadth (~40 modules).
- **Build new (BRD-driven):** six-step KPI flow, evidence+hash, adjustment history, 4 decisions, performance summary, dept dashboard, leaderboard, versions+audit, self-signup.
- **Build new (Worksheet-driven):** deep ATS, travel booking, letter templates, contract labour, sandwich policy.
- **Add (Variable KPI):** capped scoring profile, grade banding, scorecard export/sign-off.
- **Simulate:** payroll, statutory, adjacent ERP, notifications backend.

---

## H. Nothing-omitted checklist

Every source item is accounted for:
- **PeopleDesk**: 613 routes / ~300 named features → mapped in `peopledesk-feature-inventory.md` and §A/§D above.
- **HRMS worksheet**: 4 objectives, 21 KRAs, ~74 KPI measures, 29 in-scope → all listed in `hrms-goal-functionality.md`, gaps in §B.
- **BRD**: 11 FR groups, 23 BR, 27 AC, 20 NFR, 10 UC, 20 US, 15 OI → distilled in `brd-requirements.md`, gaps in §C.
- **Variable KPI**: 1 sheet, 8 columns, 2 formulas, 1 grade, 4 signatures → analysed in `variable-kpi-functionality.md`, folded into §E.
- **Comparison doc** (`PeopleDesk_vs_HRMS_Worksheet_Comparison.md`) → superseded and expanded here.
