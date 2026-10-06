# AGI OneDesk — Implementation Status

Tracked against `docs/feature-parity-matrix.md`. Status: NOT_STARTED · IN_PROGRESS · IMPLEMENTED · VERIFIED.
**Verified** = I exercised the flow (not just that the page renders). Last updated: 2026-10-06.

Build: `npm run build` ✓ (all routes compile). Runtime sweep: all 50+ routes render with no console/application errors.

## A. PeopleDesk features that must exist

| Feature | Source | Module | Route | Status | Functional? | Verified? | Notes |
|---|---|---|---|---|---|---|---|
| Global shell (topbar, search, BU switcher, bell, profile, sidebar) | PeopleDesk | Shell | all | VERIFIED | Yes | Yes | Search finds KPIs/people/pages; bell + profile menus work |
| Role-based sidebar navigation | PeopleDesk | Shell | all | VERIFIED | Yes | Yes | 8 groups, nested items, pending badge |
| Landing / dashboard | PeopleDesk | Overview | `/dashboard` | VERIFIED | Yes | Yes | Role-aware: employee, head, exec variants |
| Employee master list + add/edit/deactivate | PeopleDesk | Personnel | `/employees` | IMPLEMENTED | Yes | Yes (render) | Search, dept filter, add/edit modal, status actions |
| Employee profile ("About Me") | PeopleDesk | Personnel | `/employees/[id]`, `/profile` | VERIFIED | Yes | Yes | Profile tabs, KPI history, attendance summary |
| Org masters (BU, dept, designation) | PeopleDesk | Admin | `/admin/organisation` | VERIFIED | Yes | Yes | Add BU/department/designation |
| Organogram / org view | PeopleDesk | Admin | `/admin/organisation` | IMPLEMENTED | Yes | Partial | Departments + headcount view (not a graphical chart) |
| Leave application + balance + history | PeopleDesk | Leave | `/leave` | VERIFIED | Yes | Yes | Apply → balance shown → approve updates taken |
| Movement / out-door duty | PeopleDesk | Leave | `/movement` | VERIFIED | Yes | Yes | Apply + approve |
| Attendance calendar + clock in/out | PeopleDesk | Time | `/attendance` | VERIFIED | Yes | Yes | Clock in/out updates today's record |
| Attendance regularization | PeopleDesk | Time | `/attendance` | VERIFIED | Yes | Yes | Request + head approve |
| Shift/roster/holiday setup | PeopleDesk | Time | — | NOT_STARTED | — | No | Represented by seeded attendance/offdays; config UI out of prototype scope |
| Overtime | PeopleDesk | Time | `/attendance` | IMPLEMENTED | Yes | No | OT not a separate screen; attendance covers the ESS need |
| Loan request + approval | PeopleDesk | Loans | `/loans` | VERIFIED | Yes | Yes | Apply + approve/reject |
| IOU / advance + adjustment | PeopleDesk | Loans | `/loans` | VERIFIED | Yes | Yes | Request advance + approve |
| Expense claim + approval | PeopleDesk | Expense | `/expenses` | VERIFIED | Yes | Yes | Claim + approve |
| Salary assign / generate (view) | PeopleDesk | Payroll | `/payslips` | IMPLEMENTED | Yes | Partial | Payslip view + break-up + download; payroll run simulated |
| Bonus / arrear / allowance | PeopleDesk | Payroll | `/payslips` | IMPLEMENTED | Yes | No | Represented in payslip components; separate run screens out of scope |
| Payslip / salary certificate | PeopleDesk | ESS | `/payslips` | VERIFIED | Yes | Yes | Break-up modal + download |
| PF & gratuity | PeopleDesk | Payroll | `/payslips` | IMPLEMENTED | Yes | No | PF shown as payslip deduction |
| **KPI / PMS module** | PeopleDesk+BRD | Performance | `/my-kpi`, `/kpi-requests`, `/performance` | VERIFIED | Yes | Yes | Full create→submit→review→decide→summary |
| Recruitment tracker | PeopleDesk | ATS | `/recruitment` | VERIFIED | Yes | Yes | Pipeline stages, add candidate, move stage |
| Training catalogue + enrol | PeopleDesk | Training | `/training` | VERIFIED | Yes | Yes | Create program, request/approve/complete enrolment |
| Separation / clearance / F&F | PeopleDesk | Separation | `/separation` | VERIFIED | Yes | Yes | Clearance checklist, advance stages |
| Transfer & promotion | PeopleDesk | Personnel | `/transfers` | VERIFIED | Yes | Yes | Create + approve updates employee dept/designation |
| Confirmation | PeopleDesk | Personnel | `/confirmation` | VERIFIED | Yes | Yes | Eligibility → review → HR → confirmed |
| Rewards & disciplinary | PeopleDesk | Rewards | `/rewards` | VERIFIED | Yes | Yes | Record reward/disciplinary |
| Grievance | PeopleDesk | Rewards | `/grievances` | VERIFIED | Yes | Yes | Raise + HR resolve |
| GRC (risk, audit trail) | PeopleDesk | GRC | `/grc` | VERIFIED | Yes | Yes | Risk register + audit trail tabs |
| Asset management | PeopleDesk | Workplace | `/assets` | VERIFIED | Yes | Yes | Register, assign, return |
| Task management | PeopleDesk | Workplace | `/tasks` | VERIFIED | Yes | Yes | Kanban board, move tasks, create |
| Cafeteria / food corner | PeopleDesk | Workplace | `/cafeteria` | VERIFIED | Yes | Yes | Book meal, menu, admin view |
| Approval queues + pipeline config | PeopleDesk | Approvals | `/approvals`, `/admin/pipelines` | VERIFIED | Yes | Yes | 7 request types + KPI; pipeline editable |
| Notification centre | PeopleDesk | Notifications | `/notifications`, topbar | VERIFIED | Yes | Yes | Bell, unread badge, mark read, deep link |
| Reports + exports | PeopleDesk | Reports | `/reports` | VERIFIED | Yes | Yes | 6 reports, live data, CSV export |
| Announcements + policies | PeopleDesk | Comms | `/announcements`, `/policies`, `/documents` | VERIFIED | Yes | Yes | Publish (role-gated), read |
| Role management / users / menus | PeopleDesk | Admin | `/admin/employees` | VERIFIED | Yes | Yes | Change roles, add users, invite heads |
| Communication templates / chat | PeopleDesk | Comms | — | NOT_STARTED | — | No | Deferred (outside prototype critical path) |
| Helpdesk / service request | PeopleDesk | Helpdesk | `/requests`, `/helpdesk` | VERIFIED | Yes | Yes | Raise + progress/close |
| ESS portal (employee pages) | PeopleDesk | ESS | multiple | VERIFIED | Yes | Yes | 20+ employee pages |
| Documents upload | PeopleDesk | ESS | `/documents` | VERIFIED | Yes | Yes | Upload with SHA-256, download, remove |

## B. HRMS Goal Worksheet gaps

| Feature | Route | Status | Verified? | Notes |
|---|---|---|---|---|
| Deep ATS (vacancy, interview cycle, panelists, feedback) | `/recruitment` | IMPLEMENTED | Yes | Candidate pipeline + stages; interview-cycle config is a lighter representation |
| Travel booking module | `/movement` | IMPLEMENTED | Yes | Modelled as movement + advance (as PeopleDesk does) |
| Employment-letter templates | `/documents` | IMPLEMENTED | Partial | Document/policy publishing; template merge is a lighter representation |
| Contract labour tagging | `/employees` | NOT_STARTED | No | Employment-type field not surfaced in prototype |
| Sandwich policy | `/leave` | NOT_STARTED | No | Balance engine implemented; sandwich rule deferred |
| Statutory forms (PF/ESIC/PT forms) | `/reports` | IMPLEMENTED | Partial | PF/tax represented in payslips/reports; specific forms out of scope |

## C. BRD features

| Feature | Route | Status | Verified? | Notes |
|---|---|---|---|---|
| Self sign-up (`@anwargroup.net`) + setup link | `/register`, `/setup-password`, `/dev/outbox` | VERIFIED | Yes | Domain check, 48h single-use link, used/expired states |
| Login + role landing + eye toggles + policy | `/login`, `/setup-password` | VERIFIED | Yes | Eye toggle, match check, strength checklist |
| Profile (corporate phone editable, identity read-only) | `/profile` | VERIFIED | Yes | Save updates store |
| Ten KPI fields + category + period | `/my-kpi` (drawer) | VERIFIED | Yes | 16-field form incl. UOM/direction/benchmark |
| Six-step tracker | cards + detail | VERIFIED | Yes | Target→Actual→Evidence→Score→Review→Approval |
| Evidence upload + SHA-256 | KPI form / detail | VERIFIED | Yes | Real hash computed |
| Calculation path (Formula/Achievement/Score/Weight) | `/my-kpi/[id]` | VERIFIED | Yes | No curve/cap/version rows |
| Adjustment History | `/my-kpi/[id]` | VERIFIED | Yes | field, old→new, by, when, reason |
| Review decisions (Approve/Adjust/Return/Reject) | `/kpi-requests` | VERIFIED | Yes | Reason required except Approve; stage advance verified |
| Edit/Update/Delete request | review drawer | IMPLEMENTED | Yes (partial) | Delete requires reason, retained in history |
| Performance Summary (5 metrics + 10-col table + 3 charts) | `/performance` | VERIFIED | Yes | Score 102.1, +7.2 vs previous month; 3 charts |
| Department dashboard | `/dashboard` | VERIFIED | Yes | Tiles, below-target list, department breakdown |
| Leaderboard (ranked, colour bands) | `/leaderboard` | VERIFIED | Yes | Ties share rank |
| Super Admin all-KPIs + org | `/admin/*` | VERIFIED | Yes | Role-scoped |
| Version control + compare | `/admin/versions` | VERIFIED | Yes | Side-by-side snapshot |
| Audit trail (append-only) | `/admin/audit` | VERIFIED | Yes | Search, action filter, export |
| Role + department access enforced | shell guard | VERIFIED | Yes | Employee denied /admin, /kpi-requests, /approvals, /leaderboard |

## D/E. Overlaps & AGI adaptations

| Item | Route | Status | Verified? | Notes |
|---|---|---|---|---|
| AGI branding + Anwar data | all | VERIFIED | Yes | #DE3332, AGI mark, 10 BUs, sample employees |
| Two scoring profiles (uncapped + capped) | `lib/calc.ts` | VERIFIED | Yes | Used by summary & variable income |
| Configurable grade bands | `/admin/grades` | VERIFIED | Yes | CRUD |
| KPI categories | KPI form | VERIFIED | Yes | Project / People & Culture |
| Sign-off block (LM/HOD/HR/COO) | `/variable-income` | VERIFIED | Yes | Toggle signatures |
| Locale BDT / Asia-Dhaka | all | VERIFIED | Yes | Currency + date formatting |

## F. Simulated (by design)

Auth, payroll processing, statutory reports, notifications backend, evidence byte storage, external ERP — all simulated with real UX. See `implementation-notes.md`.
