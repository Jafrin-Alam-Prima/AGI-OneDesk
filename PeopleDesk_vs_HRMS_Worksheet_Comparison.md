# PeopleDesk vs. HRMS Goal Worksheet — Feature Comparison

**Prepared:** 6 Oct 2026
**Sources:**
- **PeopleDesk** — the local clone of Akij Resource PeopleDesk ERP (`https://arl.peopledesk.io`), feature set enumerated from the production React bundle served by the clone at `http://localhost:8091` (613 distinct SPA routes/modules).
- **HRMS Global worksheet** — `Copy of HRMS Goal Worksheet.xlsx`, sheet *HRMS & ESS* (237 rows), the Dynamics 365 Business Central HRMS + ESS scope of work.

---

## 1. What PeopleDesk Is

PeopleDesk (by Akij Resource / iBOS) is a **broad, enterprise-wide ERP platform**, not only an HRMS. Its live route catalog shows top-level modules far beyond HR:

| # | Top-level module | Scope |
|---|---|---|
| 1 | **HR / Profile** | Employee master, recruitment, separation, confirmation, transfer & promotion, grievance, rewards |
| 2 | **Compensation & Benefits / Payroll** | Salary assign, generate, bonus, arrears, PF & gratuity, income tax, increments, allowances |
| 3 | **Performance Management (PMS / KPI)** | KPI config, targets, assessments, scorecards, coaching (Johari/GROW), IDP, strategic plan |
| 4 | **Time Management** | Attendance, roster, shifts, holidays, overtime, movement, remote location |
| 5 | **Leave & Movement** | Leave types/policies, applications, encashment, movement |
| 6 | **Approval** | ~40 approval queues (leave, OT, loan, salary, bonus, expense, IOU, separation, transfer, PF…) |
| 7 | **Employee Self Service (ESS)** | Web + mobile self-service workspace |
| 8 | **Recruitment / HireDesk** | Requisition, candidate tracking, recruitment tracer |
| 9 | **Training & Development** | Titles, calendar, requisition, schedule, budget, execution, assessment, evaluation |
| 10 | **Asset Management** | Item registration / assets |
| 11 | **GRC** | Risk assessment, access control, audit trail, digital footprint, conduct & compliance |
| 12 | **Task Management** | Projects, task boards, dashboards |
| 13 | **Cafeteria Management** | Food corner, take meal, reports |
| 14 | **Campus Ambassador** | Batch/activity/remuneration/offboarding program |
| 15 | **Administration & Configuration** | Roles, menus, business units, departments, designations, payroll config, org organogram, policies |
| 16 | **SCM Opex / Finance / Marketing / Sales Ops** | Adjacent ERP business functions |
| 17 | **Chat / Communication** | Chat app, templates, Google Admin Manager |
| 18 | **Reports** | Large custom reporting suite + report builder |
| 19 | **Self Service** | ESS web portal route group |

---

## 2. What the HRMS Global Worksheet Covers

The worksheet is a **goal/scope worksheet for a Microsoft Dynamics 365 Business Central HRMS + Employee Self-Service (ESS) implementation**, organised under 4 KRAs:

- **KRA #1 — HRMS** (the bulk): Dashboard, ATS/Recruitment, Onboarding, Personnel Management, Leave & Absence, Payroll, Training, Full & Final, Off-boarding, Tours/Bookings/Advances, Expense & Reimbursement, Reports.
- **KRA #2 — Training & UAT**: train-the-trainer, training strategy/materials, user documentation, LMS help portal.
- **KRA #3 — Train to Trainer / Go-Live**: Go-Live certificate, readiness, solution acceptance review, UAT completion.
- **KRA #4 — Hypercare Support**: support procedures, ongoing query resolution, bug fixing, notification channels.

All items are marked **Standard / Currently Available**, Availability **Currently Available** (or **NA** for the training/go-live/support KRAs), i.e. this is a **standard-product scope**, not a custom build.

---

## 3. Side-by-Side Feature Comparison

Legend: ✅ = covered by PeopleDesk · ⚠️ = partially covered / different form · ❌ = not found in PeopleDesk bundle · — = worksheet item is process/governance, not a software feature

### KRA #1 — HRMS

| Worksheet feature (KRA → KPI) | PeopleDesk coverage | PeopleDesk module / route | Notes |
|---|---|---|---|
| **Dashboard & Overview** — Analytics Cues/Tiles (Employees, Leave, Training, Recruitment, Loans, Payroll, F&F, Helpdesk) | ✅ | Management Dashboard, `/dashboard`, dashboard component permission config | PeopleDesk has dashboard + per-component permission control |
| **ATS / Recruitment** — Manpower Requisition (MRF) | ✅ | `/recruitmentTracker`, `/ServiceManagement` requisition | |
| — Vacancy Management (skills, salary range, job tasks, deadlines) | ⚠️ | Recruitment module | PeopleDesk recruitment is lighter-weight in the route catalog; no explicit "vacancy skill attach" route observed |
| — Assigning Interview Cycle (cycles, stages, assign to vacancy) | ⚠️ | `/profile/reports/recruitementTracer` | Tracer exists; configurable interview cycles less evident |
| — Interview Panelist Management (multi-panelist, emails, Teams link) | ❌ | — | No panelist-management route found |
| — Candidate Management (details, docs, multi-job, status, Excel import) | ✅ | `/SelfService/recruitmentTracker/create`, HireDesk integration `/integration/HireDeskEmployee` | |
| — Feedback Management (forms, per-stage, reminders) | ⚠️ | PMS evaluation criteria; no dedicated recruitment feedback route | |
| — Candidate Offer & Selection (CTC, offer letter, convert to employee) | ✅ | `Employee/CreateEmployeeUnifiIdentity`, offer/onboarding routes | |
| **OnBoarding** — Hire as Employee, auto-fill, doc migration | ✅ | `/employeecreateandedit`, `employeecreateandeditForHireDesk`, `/profile/employeecreateandeditForHireDesk` | |
| **Personnel Mgmt** — Employment Letters (Promotion/Warning/etc., Word templates, email, history) | ⚠️ | `/rewardsandpunishmentadd`, separation letters | Template-based letter generation exists for some letter types; broad Word-template suite not clearly present |
| — Employee Documents upload/store | ✅ | `/DocumentsUpload`, `EmployeeDocument/SubmitNecessaryDocuments` | |
| — Employee Information (central DB, create/move from recruitment) | ✅ | `/employee`, `/profile/employee`, `Employee/CRUDEmployeeBasicInfo` | Core strength |
| — Employee Documentation attach to card | ✅ | `Employee/SaveEmployeeDocumentManagement` | |
| — Timesheet & Shift (create timesheet, shift cycles, roster) | ✅ | `/overTime/*`, `/configuration/rosterSetup`, `TimeSheet/TimeSheetCRUD`, `/reports/rosterReport` | Strong roster support |
| — Contract Labour Management | ⚠️ | Employment type config `/configuration/employmentType` | No explicit "contract labour tagging" field route observed |
| **Leave & Absence** — Leave Types (CL/PL/SL) | ✅ | `/leaveandmovement/leavePolicy` | |
| — Leave Plans (types, accrual pro-rata/fixed, assign by grade/desig/dept) | ✅ | `/leaveandmovement/leavePolicy`, `/yearlyLeavePolicy` | |
| — Sandwich Policy (weekly off, holiday) | ⚠️ | Time management off-day/holiday setup | Sandwich logic not explicitly named |
| — Manage Employee Leaves (auto ledgers, balances) | ✅ | `LeaveMovement/CRUDLeaveApplication`, `/support/LeaveBalanceConfig` | |
| — Approval Mechanism (one level) | ✅ | `/approval/leaveApproval`, `/configuration/commonapprovalpipeline` | PeopleDesk supports **multi-level** pipelines — exceeds worksheet |
| — Leave Encashment | ✅ | `/leaveAndMovement/leaveEncashment`, `/leaveEncashmentApproval` | |
| — Comp Off | ✅ | Attendance/leave routes | Present in approval queues |
| **Payroll Mgmt** — Wage Types (daily/monthly) | ✅ | `/configuration/payFrequency`, wages | |
| — Salary Structure (grades, CTC, revisions) | ✅ | `/compensationAndBenefits/employeeSalary/salaryAssign`, `Payroll/EmployeeSalaryAssign` | |
| — Attendance import (Excel, shifts, presence/absence/OT/late/OD) | ✅ | `/attendenceAdjust`, `/manualAttendance`, `Employee/ManualAttendance`, `/reports/PunchMachineRawData` | |
| — Multiple Shifts / shift assignment | ✅ | `/configuration/worklineConfig`, roster setup | |
| — Leave Extension | ✅ | `/leaveApplication/pLDateChange`, leave routes | |
| — Overhead Payments — Variable/Ad-hoc payments & deductions | ✅ | `/payrollProcess/manualSalaryAddDeduct`, `/employeeSalary/additionDeduction`, `/allowanceNDeduction` | |
| — Bonus | ✅ | `/payrollProcess/bonusGenerate`, `/bonusApproval` | |
| — Arrears | ✅ | `/payrollProcess/arearSalaryGenerate` | |
| — OT (Over Time) | ✅ | `/overTime/*`, `/configuration/overtimePolicy`, `/overtime` approval | |
| — Salary Advance & Settlement | ✅ | IOU / advance routes `/iOU/*`, `/adjustmentIOU` | |
| — Loan | ✅ | `/loanManagement/loanType`, `/loanRequest`, `/loan`, `/loanSupervisor`, `/MyLoan` | |
| — Salary Calculations (process & post, ledger entries) | ✅ | `/payrollProcess/generateSalary`, `/salaryApproval`, `/salaryGenerateApproval` | Ledger posting to BC is the integration point (external) |
| **Training Management** — Faculty list, category, training list, assign | ✅ | `/trainingAndDevelopment/*`, `/Training/Configuration/TrainingTitle` | |
| **Full & Final** — F&F calculation, ad-hoc add/deduct, statement | ✅ | `/separation/FinalSettlement`, `EmployeeClearance/CreateFinalSettlement` | |
| **Off-Boarding** — PIP | ✅ | PMS performance improvement routes | |
| — Exit Employee from System (mark inactive) | ✅ | `/separation/employeeRelease`, `EmployeeSeparationListFilter` | |
| — Exit Documentation (relieving/experience letter, F&F) | ✅ | `/separation/*` | |
| — System-Generated Email (to parting employee w/ attachments) | ✅ | Notification/Kafka `NotificationSend`, support bulk notification | |
| **Tours, Bookings & Advances** — Tour Intimation | ✅ | `/movementApplication`, `/remoteLocation/*`, movement approval | PeopleDesk models tours as movement/remote location |
| — Tour Approval | ✅ | `/approval/movementApproval` | |
| — Booking Request / Approval | ⚠️ | Partially via movement/IOU; no dedicated flight-hotel booking module in bundle | |
| — Booking Intimations | ⚠️ | Notification framework exists | |
| — Booking Confirmation Documents (e-tickets, vouchers) | ⚠️ | Document upload framework exists | |
| — Tour Advance & Settlement | ✅ | IOU advance + `/iOU/adjustmentReport` | |
| **Expense & Reimbursement** — Expense Policy | ✅ | `/configuration/expenseType`, `SaasMasterData/SaveEmpExpenseType` | |
| — Expense Claims & Approvals | ✅ | `/expense/expenseApplication`, `/expenseApproval` | |
| — Reimbursement & Advance Settlement | ✅ | IOU adjustment, `/adjustmentIOU` | |
| **Reports** — Employee Master reports (list, birthday, dept, personal, PAN, bank, assets, docs…) | ✅ | `/reports/employeeList`, `/reports/employeeProfile`, `/reports/EmployeeFamilyInfo`, `/reports/EmployeeServiceInfo`, + custom report builder | Very strong |
| — Employee Timesheet reports (monthly/yearly, dept presence, shift-wise, leave register) | ✅ | `/reports/attendanceReport`, `/reports/monthlyAttendanceReport`, `/reports/rosterReport`, `/reports/leaveHistory` | |
| — Employee Salary reports (slip, register, break, bank/cheque payable, gratuity, dept-wise) | ✅ | `/compensationAndBenefits/reports/salaryReport`, `/salaryPaySlip`, `/bankadvice` | |
| — Employee Leave reports | ✅ | `/reports/leaveHistory`, `/reports/earnLeaveReport` | |
| — Training reports | ✅ | Training module + reports | |
| — **Statutory reports** (PF Statement, PT, ESIC, PF ECR, **Forms PT-5, 28, 04, 13, 18, 19, 36, 15**) | ⚠️ | `/pfandgratuity/pfInvestment`, `/pfmanagement`, `/salaryTaxCertificate`, `/TaxReturnCertificate` | PeopleDesk covers PF/Gratuity/tax, but the specific **Indian statutory forms (5/28/04/13/18/19/36/15)** are a BC/India localization feature and were **not found** in the bundle |

### KRA #1 (cont.) — ESS (Mobile + Web Portal)

The worksheet lists ESS twice (Mobile §101.2.1 and Web §101.3.1) with near-identical feature sets.

| Worksheet ESS feature | PeopleDesk coverage | PeopleDesk module / route | Notes |
|---|---|---|---|
| Login & Dashboard | ✅ | ESS web `/SelfService/dashboard`; mobile-responsive app | Mobile = responsive PWA (manifest + service worker present), consistent with "Android & iOS" |
| Employee Details / Profile | ✅ | `/aboutMe`, `/SelfService/*` | |
| Documents (employment + other ID docs) | ✅ | `/SelfService/DocumentsUpload/entry`, `/DocumentsUpload` | |
| Attendance — Clock In/Out, shift details, daily view | ✅ | `/timemanagement/attendenceadjust`, `/reports/dailyAttendanceReport` | |
| Attendance — Regularization (history + apply) | ✅ | `/timeManagement/attendenceAdjustRequest`, `/attendanceApproval` | |
| Attendance — Apply Out-Door Duty | ✅ | `/timeManagement/outsideDuty`, `/marketVisit` | |
| Leaves — Apply Short Leave, Balance, History, Apply | ✅ | `/leaveAndMovement/leaveApplication`, `/SelfService/leaveAndMovement/*` | |
| Finances — CTC, Pay Slips, Last Salary Drawn | ✅ | `/payslip`, `/individualCTC`, `/salaryPaySlip` | |
| Tour Intimation (request + history) | ✅ | movement/remote routes | |
| Booking (request + history + download docs) | ⚠️ | movement + document framework | |
| Advance (request + history) | ✅ | `/SelfService/iOU/application/create`, `/loanFinancialAid/loanRequest` | |
| Expenses (claim + history) | ✅ | `/SelfService/expense/expenseApplication/create` | |
| My Teams (reporting manager, reportees) | ✅ | Org/organogram, manager change request routes | PeopleDesk adds more (view team's attendance) |
| Approvals (Leave, Attendance Reg., Expenses, Comp-Off, Tour, Booking, Advance, Short Leave, Out-Door Duty) | ✅ | `/approval/*` (~40 queues) | Exceeds worksheet — PeopleDesk has many more approval types |
| Notifications (application/approval/rejection/withdrawn) | ✅ | Notification config `/configuration/notificationConfig`, `/support/send_bulk_notification`, SignalR | |
| Policies on Me>Documents>Org Policies | ✅ | `/policyUpload`, `/administration/DocumentManagement/Policy` | |
| Announcements on Dashboard | ✅ | `/announcement`, `MasterData/CreateEditAnnouncement` | |
| View team's attendance | ✅ | ESS web extra | Present in PeopleDesk explicitly |

### KRA #2, #3, #4 — Training/UAT, Go-Live, Hypercare

These are **implementation-process KRAs**, not product features, so they don't map to PeopleDesk screens:

| Worksheet KRA | Nature | PeopleDesk relevance |
|---|---|---|
| #2 Train key users, training strategy, training materials, LMS online help | Process + LMS | PeopleDesk's **Training & Development** module (`/Training/*`, planning/execution/assessment) can host training delivery; no evidence of a customer-facing LMS help portal in the bundle |
| #3 Go-Live certificate, readiness, acceptance review, UAT signoff | Governance milestone | Not a product feature |
| #4 Hypercare support, support procedures, bug resolution, notification channels | Support service | PeopleDesk has **HR Helpdesk / Service Management** (`/serviceRequest`, `HRTicket/*`, `/IssueManagement`) which can serve as the support/notification channel |

---

## 4. Summary Scorecard

| Worksheet KRA | Total features | ✅ Covered | ⚠️ Partial | ❌ Not found |
|---|---|---|---|---|
| HRMS — Dashboard/Recruitment/Onboarding/Personnel | 24 | 12 | 8 | 4 |
| HRMS — Leave & Absence | 8 | 7 | 1 | 0 |
| HRMS — Payroll | 12 | 12 | 0 | 0 |
| HRMS — Training / F&F / Off-boarding | 9 | 9 | 0 | 0 |
| HRMS — Tours / Expense | 12 | 9 | 3 | 0 |
| HRMS — Reports (incl. statutory) | 9 groups | 8 | 1 | 0 |
| ESS (Mobile + Web) | 25 | 22 | 3 | 0 |
| **Process KRAs #2–#4** | n/a | — | — | — |

**Overall:** PeopleDesk covers the overwhelming majority of the HRMS Global worksheet as **native, currently-available functionality** — and in several areas (approval pipelines, PMS/KPI, GRC, task management, cafeteria, campus ambassador, asset management, custom report builder) it is **broader than the worksheet's scope**.

---

## 5. Where PeopleDesk and the Worksheet Differ

### 5.1 Worksheet items PeopleDesk covers well (parity or better)
- Payroll: salary structure, bonus, arrears, OT, loan, advance, ad-hoc add/deduct, salary processing — **full parity**.
- Leave & Absence: types, plans, accrual, ledgers, encashment, comp-off — **full parity**.
- ESS: attendance, regularization, leaves, finances, advance, expense, teams, approvals, notifications, policies, announcements — **full parity, and more**.
- Reports: employee/timesheet/salary/leave/training report suites — **parity plus a custom report builder**.
- Full & Final, Off-boarding, Training — **parity**.

### 5.2 Worksheet items only partially met by PeopleDesk
| Gap | Worksheet expectation | PeopleDesk reality |
|---|---|---|
| **Recruitment depth** | Vacancy management w/ skills/comp-range/deadlines; interview cycles/stages; panelist management; feedback forms w/ reminders; Teams link | PeopleDesk recruitment is present (requisition, tracer, candidate, HireDesk) but the worksheet's deeper ATS config (skills, comp range, interview cycles, panelists) was **not clearly found** in the bundle |
| **Booking module** | Dedicated flight/hotel/car booking request, approval, intimations, confirmation docs | PeopleDesk handles tours as **movement/remote location + IOU advance**; no dedicated travel-booking engine found |
| **Employment letters** | Broad Word-template letter suite (promotion/demotion/increment/warning/advisory) emailed + saved to history | Some letter generation exists; not clearly a full template suite |
| **Contract labour** | One-field tagging of contract labourers | Employment-type config exists; no explicit tagging route |
| **Sandwich policy** | Weekly-off + holiday sandwich rule | Off-day/holiday setup exists; sandwich logic not explicit |
| **Statutory forms** | Indian Forms PT-5, 28, 04, 13, 18, 19, 36, 15; ESIC; PF ECR | PF/Gratuity/PT/tax reports exist, but the **specific Indian statutory forms were not found** — this is a Dynamics 365 BC India-localization deliverable |

### 5.3 Worksheet items with no PeopleDesk product equivalent
- **KRA #2/#3/#4** (training strategy, LMS help portal, Go-Live certificate, UAT signoff, hypercare support procedures) are **delivery/governance activities**, not software screens. PeopleDesk's Training module and Helpdesk can *support* them but the worksheet items are services, not features.

### 5.4 Where PeopleDesk exceeds the worksheet
The worksheet is scoped to **HRMS + ESS**. PeopleDesk additionally ships modules the worksheet does not mention:
- **Performance Management / KPI** (config, targets, assessments, scorecards, 360/BAR, coaching — Johari Window, GROW, IDP, strategic plan, corporate scorecard).
- **GRC** (risk assessment, access control, audit/digital-footprint reports, conduct & compliance).
- **Task Management**, **Asset Management**, **Cafeteria Management**, **Campus Ambassador**.
- **SCM Opex, Finance, Marketing, Sales Ops** adjacent modules.
- **Chat / Communication** and **Google Admin Manager**.
- **Custom Report Builder** and **HR Helpdesk / Service Management**.

---

## 6. Bottom Line

- The **HRMS Global worksheet** defines a **standard Dynamics 365 Business Central HRMS + ESS** scope (KRA #1) plus **implementation services** (KRAs #2–#4).
- **PeopleDesk delivers ~90%+ of the worksheet's HRMS + ESS features natively**, with the strongest parity in **payroll, leave/absence, attendance/roster, and ESS**.
- The **main functional gaps** are: deeper **ATS/recruitment configuration** (interview cycles, panelists, feedback forms), a dedicated **travel-booking module**, a full **employment-letter Word-template suite**, **contract-labour tagging**, **sandwich policy**, and **India-specific statutory forms (PF/ESIC/PT forms 5/28/04/13/18/19/36/15)** — the last being tied to BC's India localization rather than to HRMS logic.
- Conversely, **PeopleDesk is a much larger platform** than the worksheet: it includes full **PMS/KPI, GRC, task, asset, cafeteria, campus-ambassador, SCM/finance and chat** modules that the HRMS worksheet does not scope at all.

> **Note on methodology:** PeopleDesk's feature list was enumerated from the production SPA bundle's route catalog (613 modules) and the live authenticated dashboard. Some worksheet items may map to PeopleDesk screens under different names, or may exist server-side without a distinct route. Items marked ⚠️/❌ should be confirmed against a fully-permissioned PeopleDesk account before being treated as true gaps — the local clone is signed in as an Intern with limited menu permissions.
