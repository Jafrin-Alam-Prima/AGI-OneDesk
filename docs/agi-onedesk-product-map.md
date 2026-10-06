# AGI OneDesk — Complete Product Map

**Product:** **AGI OneDesk** — Anwar Group of Industries unified HRMS + ESS + Performance (KPI) platform.
**Reference product:** PeopleDesk (Akij Resource) — shell, navigation, module structure, interactions.
**Business source:** KPI Management System BRD (Anwar KPIFlow) + HRMS Goal Worksheet + Variable Income KPI sheet.
**Brand:** Anwar Group — master colour **#DE3332**, the **ANWARS** mark, BDT / `Asia/Dhaka`, fiscal year **2026-2027**.
**Nature:** a convincing, fully interactive **prototype** — simulated backend, real UX; every visible control works.

---

## 1. Product principles

1. **PeopleDesk feel** — same shell, navigation patterns, tables, forms, filters, approval queues.
2. **Anwar identity** — Anwar name, logo, business units, departments, employees, terminology.
3. **One KPI journey** — Traceable `Target → Actual → Evidence → Score → Review → Approval` (BRD).
4. **One standard process** for all departments; access differs only by role + department.
5. **No dead buttons** — every action performs real local state changes with feedback.
6. **Numbers are trustworthy** — one calculation service, empty periods show messages, not blanks.

---

## 2. User roles & landing

| Role | Home | Scope |
|---|---|---|
| **Employee (User)** | My KPI | Own KPIs, own ESS data |
| **Department Head (Admin)** | Dashboard (department) | Own + department KPIs, department approvals |
| **HR Admin** | Dashboard (HR) | All departments at HR stage |
| **Finance Admin** | Dashboard (Finance) | All departments at Finance stage |
| **Audit Admin** | Dashboard (Audit) | All departments at Audit stage |
| **System Admin** | Dashboard (admin) | Invitations, employees, org masters |
| **Super Admin (Upper Mgmt)** | Management Dashboard | Everything |

> The BRD names three types (Employee / Department Head / Super Admin); the existing prototype and VK sign-off block extend this to an **HR → Finance → Audit pipeline**. AGI OneDesk models both (pipeline is configurable).

### 2.1 Permission matrix (capability × role)
| Capability | Employee | Dept Head | HR | Finance | Audit | Sys Admin | Super Admin |
|---|---|---|---|---|---|---|---|
| Self-register | ✅ | invite | invite | invite | invite | — | — |
| Own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create/submit KPI | own | own | own | own | own | own | — |
| View KPIs | own | own+dept | all | all | all | all | all |
| Approve/return/adjust KPI | — | dept (stage 1) | stage 2 | stage 3 | stage 4 | — | all |
| Dept dashboard/leaderboard | — | own | all | all | all | all | all |
| Invite heads | — | — | — | — | — | ✅ | ✅ |
| Manage employees | — | — | — | — | — | ✅ | ✅ |
| Org masters | — | — | — | — | — | ✅ | ✅ |
| Versions & audit | — | — | view | view | view | ✅ | ✅ |
| Create/update/delete anything | — | — | — | — | — | partial | ✅ |

---

## 3. Complete navigation

### 3.1 Top bar (global)
Search (with suggestions) · Business-unit switcher · Notifications (bell + badge) · Chat · Help · Profile menu (Profile, Log out) · hamburger (sidebar toggle).

### 3.2 Sidebar — by role

#### Employee
```
My Workspace
  My KPI  →  My KPI (cards) · View KPI detail · Create KPI · Resubmit
  Performance Summary  →  Monthly / Quarterly / Yearly · charts · records table
  Variable Income  →  Monthly scorecard · Grade · History
  Attendance  →  Calendar · Clock In/Out · Regularization request · History
  Leave & Movement  →  Apply Leave · Apply Movement · Balance · History
  Loans & Advance  →  My Loan · IOU/Advance · History
  Expense  →  Claim · History
  Documents  →  My documents · Upload
  Payslip & Certificates  →  Payslip · Salary certificate · Tax certificate
  Requests & Feedback  →  Service Request · Grievance · Issue
  Profile (About Me)  →  General · Contact · Identification · Experience · Education
  Announcements & Policies · Contact Book
  Notifications
```

#### Department Head (adds)
```
Dashboard (department)  →  tiles · below-target list · period filter
Approval Center  →  KPI Pending Requests · other approvals (leave, attendance, expense, loan…)
Leaderboard  →  Department ranking
Team  →  My reportees · team attendance
```

#### HR / Finance / Audit Admin (adds)
```
Dashboard (stage)  →  requests at my stage
Approval Center  →  KPI requests (my stage) · stage-specific decisions
All KPIs  →  filters by dept/employee/period
```

#### System Admin / Super Admin (adds)
```
Management Dashboard  →  department picker · org-wide tiles
Goals & Performance Admin
  KPI Configuration (KPIs, Objectives, Perspectives, UOM, Direction, Evaluation criteria)
  KPI Mapping (employee / department / designation / SBU)
  Targets (employee / department / SBU) · Copy KPI
  Period & achievement upload · KPI data upload
  Grade & Variable-Income bands
Human Resource
  Employees (list, add, edit, move, deactivate, remove, bulk)
  Recruitment (requisition, vacancies, interview cycles, panelists, candidates, offers)
  Onboarding (30-60-90, hire-as-employee)
  Time Management (shifts, roster, holiday, calendar, off-day, assignments)
  Leave Config (types, policies, yearly policy, balance config)
  Payroll (salary assign, structure, policy, generate, bonus, arrear, increment, allowance/deduction, PF & gratuity, tax, bank advice)
  Training (title, category, venue, calendar, requisition, application, budget, execution, assessment)
  Separation (application, exit interview, clearance, final settlement, release)
  Transfer & Promotion · Confirmation
  Rewards & Disciplinary · Grievance · Conduct & compliance
Reports  →  Employee · Attendance · Leave · Salary · Loan · Training · KPI · Statutory · Custom builder
Administration
  Organisation (BU, SBU, Department, Section, Designation, HR Position, Workplace, PayScale/Grade, Bank Branch, Profit Center, Religion, Organogram)
  Roles & Permissions (users, user groups, feature groups, roles, role manager, user role extension, role profile)
  Menus (menu management, menu-feature group)
  Approval Pipeline (common approval pipeline builder)
  Notification Setup
  Documents (Policy, Procedure, Process, SOP, System, Forms manage, Policy upload)
  Announcements
  Audit Trail · Version Control — Departments · Master data
Communication  →  Chat · Templates · Contact Book
Workplace
  Assets  →  Registration · Assign · Transfer
  Tasks  →  Projects · Board · Dashboard
  Cafeteria  →  Food corner · Take meal · Reports
  Helpdesk  →  Service request · Issue management · Tickets
  GRC  →  Risk assessment · Access control · Audit / Digital footprint · Compliance
  Announcements · Policies
ESS Console  →  (admin view of employee self-service)
```

---

## 4. Major entities (data model)

| Entity | Key fields | Relations |
|---|---|---|
| **BusinessUnit** | id, name, code | has Departments, Users |
| **Department** | id, name, code | belongs to BU; has Users |
| **User / Employee** | id, fullName, email, employeeId, role, designation, department, BU, corporatePhone, status, managerId | owns KPIs; approves KPIs |
| **Invitation / AccountToken** | id, email, token, role, department, expiresAt, usedAt, status | belongs to inviter |
| **Objective** | id, name, perspective/BSC, period | has KRAs |
| **KRA** | id, objectiveId, name, description | has KPIs |
| **KPI / Goal** | id, ownerId, approverId, name, category (Project/People&Culture), perspective/KRA, period (year/month/quarter), uom, direction, srf, weight, benchmark, target, actual, achievement, score, finalScore, status, remarks, dataSource | has EvidenceFiles, Versions, Decisions |
| **EvidenceFile** | id, kpiId, name, size, type, sha256, url | belongs to KPI |
| **KpiVersion** | id, kpiId, versionNo, changedFields, oldValues, newValues, reason, changedBy, changedAt | belongs to KPI |
| **ReviewDecision** | id, kpiId, stage, decision (Approve/Adjust/Return/Reject), reason, actorId, at | belongs to KPI |
| **ApprovalPipeline / Step** | id, type, steps[{order, role, action}] | configures approvals |
| **LeaveType / LeavePolicy / LeaveBalance** | id, name, accrual, plan | per employee ledger |
| **LeaveApplication / MovementApplication** | id, employeeId, type, from, to, reason, status, approverId | approvals |
| **Attendance / Regularization** | id, employeeId, date, in, out, status, shift | |
| **Loan / Iou / Installment** | id, employeeId, amount, schedule, status | approvals |
| **ExpenseClaim** | id, employeeId, type, amount, receipts, status | approvals |
| **Salary / Payslip** | id, employeeId, period, components, net | view |
| **Training / Enrollment** | id, title, category, schedule, seats | |
| **Separation / Clearance / FinalSettlement** | id, employeeId, dates, status | approvals |
| **Notification** | id, userId, title, body, read, link | |
| **AuditLog** | id, actorId, action, entity, entityId, old, new, at | append-only |
| **Announcement / Policy / Document** | id, title, body, file, audience | |
| **GradeBand** | id, min, max, grade, label | variable income |

---

## 5. Major actions (all must work)

**Account:** register · verify email (outbox) · set password (eye toggle, match) · login · logout · forgot password · invite head · resend invite · accept invite.

**KPI/Goal:** create (draft) · edit draft · submit · view detail · download report · resubmit (after return) · approve · adjust (reason) · return (remarks) · reject (reason) · edit/update request · delete request (reason) · upload/remove evidence · start KPI · duplicate/copy KPI · change fixed target (reason).

**Performance:** switch period · filter month/year · export records · open chart tooltip.

**Reviews/Approvals:** open queue · filter/search · open item · decide · bulk actions · open pipeline config.

**HR:** add/edit/move/deactivate/remove employee · bulk upload · assign manager · assign shift/roster · apply/approve leave · regularize · raise/approve loan · claim/approve expense · generate salary (view) · generate payslip · issue certificate · assign training · record reward/penalty · raise grievance · initiate separation · run clearance · compute F&F.

**Admin:** CRUD BU/dept/designation/etc. · manage roles/users/menus/permissions · configure approval pipeline · configure notification · configure KPI catalogue/mapping/targets · configure grade bands · manage documents/policies · publish announcement · view/compare versions · view audit trail.

**ESS:** clock in/out · apply leave/movement · apply regularization · claim expense · request loan/advance · upload document · view payslip/CTC · raise service request/grievance · view team · approve (if head).

**Cross-cutting:** global search · BU switch · notification mark-read · toast after every action · confirm dialogs before destructive actions.

---

## 6. Workflows (complete list)

| # | Workflow | Trigger | Path | Roles |
|---|---|---|---|---|
| W1 | Employee self-registration | Sign up | form → domain check → setup email → set password → login | Employee |
| W2 | Department Head invitation | Invite | form → email → set password → assigned | Super/Sys Admin |
| W3 | Login & role routing | Login | credentials → home by role | All |
| W4 | Profile maintenance | Edit profile | profile form → save | Employee |
| W5 | **KPI create & submit** | Create KPI | form → validate → calc → evidence → submit → queued | Employee/Head |
| W6 | **KPI review & decision** | Open queue | filter → open → view calc/evidence → Approve/Adjust/Return/Reject | Head (+HR/Fin/Audit/Super) |
| W7 | KPI resubmission | Returned | edit → submit → new version | Employee |
| W8 | Performance summary | Open | select period → metrics + table + charts | Employee/Head |
| W9 | Department monitoring | Open dashboard | filter → tiles + below-target | Head/Super |
| W10 | Leaderboard | Open | filter → ranked list | Head/Super |
| W11 | Version comparison | Open versions | pick KPI → compare versions | Super/Admin |
| W12 | Audit inspection | Open audit | filter → entries | Super/Admin |
| W13 | Leave application & approval | Apply | form → balance → submit → approve/reject | Employee→Head |
| W14 | Movement / out-door duty | Apply | form → approve | Employee→Head |
| W15 | Attendance regularization | Apply | form → approve → attendance updated | Employee→Head |
| W16 | Overtime | Enter/upload → approve → payroll input | Employee/HR |
| W17 | Loan / advance | Apply → approve → schedule → settle | Employee→Head/Fin |
| W18 | Expense reimbursement | Claim → approve → reimburse | Employee→Head/Fin |
| W19 | Payroll run (simulated) | Generate → approve → payslip | HR/Fin |
| W20 | Training request & enrollment | Request → approve → enroll → assess | Employee/HR |
| W21 | Separation & clearance | Apply → exit interview → clearance → F&F → release | Employee/HR/Super |
| W22 | Transfer & promotion | Request → pipeline approval → apply | HR/Super |
| W23 | Confirmation | Eligible → supervisor → HR → letter | HR/Super |
| W24 | Grievance / disciplinary | Raise → investigate → action | Employee/HR |
| W25 | Service request / ticket | Raise → assign → resolve → close | Employee/Helpdesk |
| W26 | Announcement / policy publish | Create → publish → notify | HR/Admin |
| W27 | Variable Income scorecard | Monthly inputs → capped score → grade → sign-off → payout | Employee→LM→HOD→HR |
| W28 | Notification lifecycle | Event → notify → read | System/All |
| W29 | Master-data maintenance | CRUD → audit | Admin |
| W30 | Approval-pipeline configuration | Define steps → apply to type | Super Admin |

---

## 7. Dashboard & widget requirements

### 7.1 Employee — My Dashboard / ESS
- Greeting + date, Today working period (clock in/out), Length of service, Joining date, Confirmation date (PeopleDesk ESS pattern).
- Attendance calendar with legend (Working, Present, Late, Movement, Leave, Absent).
- My Manager panel; Leave balance panel.
- KPI summary tiles (my drafts / in review / approved); Announcements.

### 7.2 Employee — My KPI
- Create KPI (+) tile fixed right, inside parent card; scrolling aligned card grid.
- Card: name, status badge, category + weight, Target/Actual/Score, six-step tracker, time remaining, View Details.

### 7.3 Employee — Performance Summary
- Period switch (Monthly/Quarterly/Yearly) + month/year picker.
- Five metric tiles: Total KPI Score, Average Achievement, Previous KPI Score, Difference (with words), Approved KPIs (x/y).
- Ten-column records table; three bar charts (distinct colours).

### 7.4 Department Head Dashboard
- Tiles: Average Achievement (progress bar), Pending Evaluations, Total Approved, Rejected.
- KPIs-below-target list (employee, ID, KPI, target, actual, achievement).
- Period filter.

### 7.5 Leaderboard
- Rank number, name, designation, achievement %, horizontal bar; green/amber/red bands.

### 7.6 Management / Super Admin Dashboard
- Department picker; org-wide tiles (employees, pending, approved, rejected, avg achievement).
- Department Heads by department with invitation status.
- Pending-across-departments queue.

### 7.7 Variable Income Dashboard
- Monthly scorecard per employee: KRA rows, weight, target, achievement, ach%, score; total; grade; sign-off status.

---

## 8. Cross-cutting features

| Feature | Requirement |
|---|---|
| Search | Global suggestions + per-list search (name/ID). |
| Filters | Year, month/quarter, department, employee, status; reset. |
| Tables | Sortable columns, right-aligned tabular numbers, status badges, pagination/inner scroll, CSV/XLSX export. |
| Forms | Label-above-field, inline validation, required markers, primary action disabled until valid. |
| Modals/drawers | Create KPI (side panel), review (drawer), confirm-delete dialog, invite dialog. |
| Toasts | Success/error after every submit/decision. |
| Empty states | Friendly message + CTA (e.g. "Create your first KPI"). |
| Badges | Submitted (amber), Approved (green), Adjusted (green outline), Returned (red outline), Rejected (red). |
| Accessibility | Keyboard nav, ARIA labels, status never by colour alone (WCAG 2.1 AA intent). |
| Responsive | Desktop-first; usable on tablet/mobile (sidebar drawer). |
| Locale | BDT, `Asia/Dhaka`, fiscal year 2026–2027. |
| Audit | Every create/update/delete/decision logged (append-only). |
| Notifications | Bell + list, unread badge, deep link. |
| Security (simulated) | Role + department enforced in the app layer on every view/action. |

---

## 9. Scope boundaries

**In the prototype:** shell, dashboards, ESS, Goals/KPI (real), approvals, leave/attendance/loan/expense (real local), employee master, org masters, reports (subset), notifications, audit, variable income, recruitment/training/separation/rewards (light CRUD).

**Simulated:** payroll processing, statutory reports, email delivery (Outbox), attendance device, external integrations.

**Out of scope:** live PeopleDesk API, SCM/Finance/maritime ERP, production infra, India-specific statutory forms, real-time SignalR.

---

## 10. Recommended build order (summary — detailed in final report)

1. Shell + branding + roles/session + navigation.
2. Org masters + employee master (seeded Anwar data).
3. Goals/KPI core (create → submit → review → decide → detail → summary → dashboard → leaderboard).
4. Variable Income scorecard + grade bands.
5. Approvals engine + notifications.
6. ESS (attendance, leave, loan, expense, documents, payslips).
7. HRMS breadth (recruitment, training, separation, transfer, rewards, confirmation).
8. Reports + audit + versions.
9. Administration (RBAC, menus, pipeline, config) + remaining modules (asset, task, cafeteria, helpdesk, GRC, comms).
10. Polish, responsiveness, accessibility, export, empty states.
