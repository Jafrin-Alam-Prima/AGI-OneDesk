# PeopleDesk — Feature Inventory (AGI OneDesk Reference)

**Purpose:** Exhaustive inventory of PeopleDesk features to be used as the UI/UX and functional reference for **AGI OneDesk**.
**Reference instance:** Akij Resource PeopleDesk ERP (`https://arl.peopledesk.io`), inspected via the local clone at `http://localhost:8091`.
**Signed-in reference user:** Alimool Razi (Intern, Operations) — a limited-permission account, so the live *sidebar* shows only 5 top-level menus. The **full** feature set below was reconstructed from three authoritative sources:

| Source | What it gave |
|---|---|
| Production SPA bundle route catalog | **613** distinct routes/modules (`_src/index-BBk3ntOs.js`) |
| `GET /api/Auth/GetMenuListPermissionWise` (redux `auth.menuList`) | Real navigation tree + submenu nesting for the signed-in role |
| `auth.permissionList` (redux) | **369** permission records → ~**300** named features with `isCreate/isEdit/isView/isClose` flags |

`OR` = Observed running live · `R` = Route present in bundle · `P` = Permission entry present.

---

## 1. Global application shell

Every PeopleDesk screen shares one shell. AGI OneDesk must reproduce it.

| Element | Location | Purpose | UI behaviour / interaction |
|---|---|---|---|
| Brand header | Top-left of top bar | Product identity + hamburger | Logo + name; hamburger toggles the left nav (collapse on desktop, drawer on mobile). `OR` |
| Global search | Top bar centre | "Type to get suggestions" | Free-text search with type-ahead suggestions. `OR` |
| Business-unit switcher | Top bar | Scope switching across BUs | Dropdown (e.g. "Akij Resource"); changing it re-scopes data. `OR` |
| Voice search / mic | Top bar | Speech input | Mic icon. `OR` |
| Bookmark / Favourites | Top bar | Saved screens | Star icon. `OR` |
| Help | Top bar | In-app help | Question-mark icon. `OR` |
| Notifications | Top bar | Alerts bell with unread badge | Bell icon + count; opens a notification list. `OR` |
| Chat | Top bar | Internal chat | Chat-bubble icon → chat app. `OR` |
| Profile menu | Top bar right | Account | Avatar + name; opens Profile / Log out. `OR` |
| Left sidebar | Left | Role-based module navigation | Accordion menu with nesting; active item highlighted (green); collapsible groups. `OR` |
| Breadcrumb / page title | Content top | Orientation | Module name shown as a green bar (e.g. "Employee Self Service"). `OR` |
| Content canvas | Centre | Cards, tables, forms | Light neutral background; card-based content; inner scroll for long lists. `OR` |
| Toast / confirmation | Overlay | Feedback after actions | Short success/error message after submit/decision. `OR` |
| Status badges | Tables/cards | Status at a glance | Colour-coded pills (e.g. Absent red, Holiday blue, Offday grey). `OR` |

**Recurring screen patterns (must be replicated):**
- **List + filter screen:** header filters (Year / Month / Employee search / business unit) → `View` button → data table → `Download .xlsx` / export. `OR`
- **Create/Edit form:** label-above-field, dropdowns, date pickers, file "Click to upload", primary action button bottom-left (green). `OR`
- **Approval queue:** filter bar → table of pending items → per-row action buttons (Approve/Reject/Details). `OR`
- **Dashboard:** tile row + calendar + side panels (manager, balances). `OR`

---

## 2. Module inventory

### 2.1 Overview / Home Dashboard
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Landing dashboard | `/` , `/dashboard` | App entry after login | App tiles (Dashboard, Approval, Employee Self Service, iBOS ERP, Google Admin Manager, Communication Template, Akij Air). `OR` | Real |
| Analytics tiles/cues | `/dashboard`, management dashboard | HR KPIs at a glance | Cues/tiles for Employees, Leave, Salary, Hiring, Helpdesk, F&F. `P` | Real |
| Management dashboard | `/administration/configuration/managementDashboardPermission` | Configurable exec dashboard | Permission-controlled widgets. `R` | Real |
| Dashboard component config | `/configuration/dashboardComponent` | Choose widgets | CRUD list. `R/P` | Real |

### 2.2 Employee / Personnel Management (Employee master)
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Employee list | `/employee`, `/profile/employee`, `/reports/employeeList` | Browse/search all employees | Filterable table (BU, dept, status, search). `R` | Real |
| Employee create/edit | `/employeecreateandedit`, `/Employee/CRUDEmployeeBasicInfo` | Full employee master CRUD | Multi-section form (basic, contact, ID, experience, education). `R/P` | Real |
| Employee bulk upload | `/employee/bulk`, `/profile/employee/bulk`, `/Employee/SaveEmployeeBulkUpload` | Mass create | Excel import. `R/P` | Real |
| Employee profile ("About Me") | `/aboutMe`, `/profile` | Rich employee profile | Card + tabs: General Info, Contact & Places, Identification, Experience, Education. `OR` | Real |
| Employee documents | `Employee/SaveEmployeeDocumentManagement`, `/DocumentsUpload` | Store employee docs | Upload/list/download. `R/P` | Real |
| Employee bank details | `Employee/CRUDEmployeeBankDetails` | Bank info | Form. `R` | Real |
| Employee transfer & promotion | `/transferandpromotion/*` | Move/promote | Request + approval. `R/P` | Real |
| Employee confirmation | `/confirmation/*` | Probation confirmation | Eligible → Supervisor Review → HR Acceptance → Letter → 30-60-90. `R/P` | Real |
| Employee separation/offboarding | `/separation/*` | Exit workflow | Application, Exit Interview, Clearance, Final Settlement, Release. `R/P` | Real |
| Employee work analytics | `/EmployeeWorkAnalytics`, `/reports/employeeOverallStatus` | Performance data | Reports. `P` | Real |
| Employee profile reports | `/reports/employeeProfile`, `/EmployeeFamilyInfo`, `/EmployeeServiceInfo` | Master reporting | Tables/exports. `P` | Real |
| Employee login/user provisioning | `/administration/roleManagement/usersInfo` | Accounts | Users Info CRUD. `R/P` | Real |

### 2.3 Recruitment / ATS (Applicant Tracking)
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Recruitment request (MRF) | `/Employee/SaveRecruitmentRequest` | Raise manpower requisition | Form + approval. `R/P` | Real |
| Recruitment tracker | `/reports/recruitementTracer`, `/recruitmentTracker` | Track requisitions/vacancies | Tracker table. `R/P` | Real |
| Recruitment tracker (self-service) | `/SelfService/recruitmentTracker`, `/recruitmentTracker/create` | Employee-side tracker | List + create. `OR/P` | Real |
| HireDesk integration | `/integration/HireDeskEmployee`, `HireDesk Employee` | External ATS bridge | Sync screen. `R/P` | Real |
| Requisition report | `/reports/requisitionReport` | Reporting | Table/export. `R` | Real |

### 2.4 Onboarding
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| 30-60-90 checklist | `/confirmation/306090ChecklistHR`, `/SelfService/306090Checklist` | Onboarding milestones | Checklist table. `R/P` | Real |
| Hire as employee | `/employeecreateandeditForHireDesk` | Convert candidate → employee | Form. `R/P` | Real |

### 2.5 Time Management (Attendance, Shifts, Roster)
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Attendance calendar | `/SelfService/dashboard` | Monthly attendance view | Calendar + legend (Working, Present, Late, Movement, Leave, Absent). `OR` | Real |
| e-Presence / clock in-out | `/SelfService/dashboard`, `e-Presence` | Daily punch | Clock-in/out widget. `OR/P` | Real |
| Attendance adjustment | `/attendenceAdjust`, `/timemanagement/attendenceadjust`, `/timeManagement/attendenceAdjustRequest` | Fix attendance | Request + approval. `R/P` | Real |
| Manual attendance | `Employee/ManualAttendance` | HR entry | Form. `R` | Real |
| Shift management | `Shift Management`, `/configuration/worklineConfig` | Define shifts | CRUD. `P` | Real |
| Roster setup | `/timeManagement/rosterSetup`, `/configuration/bucketSetup` | Roster planning | Setup + assign. `R/P` | Real |
| Holiday / calendar / off-day setup | `/timeManagement/holidaySetup`, `/calendarSetup`, `/offdaySetup`, `/exceptionOffDay` | Working calendar | Setup screens. `R/P` | Real |
| Assignments | `/timeManagement/holidayAndExceptionOffdayAssign`, `/calendarAssign`, `/offDayAssign`, `/locationAssign` | Assign to employees | Bulk assign. `R` | Real |
| Overtime (OT) | `/overTime/manualEntry`, `/overTime/autoGenerated`, `/overTimeBulkUpload`, `/configuration/overtimePolicy` | OT entry & policy | Entry + bulk upload + approval. `R/P` | Real |
| Remote attendance | `/remoteLocation/*`, `Remote Attendance`, `Market Visit` | Field staff | Location-based attendance. `R/P` | Real |
| Attendance processing | `/support/AttendanceProcess`, `Attendance Process` | Batch process | Utility screen. `R/P` | Real |

### 2.6 Leave & Movement
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Leave application | `/SelfService/leaveAndMovement/leaveApplication`, `/leaveAndMovement/leaveApplication` | Apply leave | Form (Leave Type, From/To, Location, Reason, upload) + balance table + Apply. `OR` | Real |
| Movement application | `/movementApplication`, `/SelfService/leaveAndMovement/movementApplication` | Out-door duty / movement | Form + approval. `OR/P` | Real |
| Leave encashment | `/leaveAndMovement/leaveEncashment`, `/leaveEncashmentApproval` | Encash leave | Application + approval. `R/P` | Real |
| Leave policy setup | `/leaveandmovement/leavePolicy`, `/yearlyLeavePolicy`, `/movementPolicy` | Configure policy | CRUD. `R/P` | Real |
| Leave types | `Leave Type`, `Movement Type` | Master data | CRUD. `P` | Real |
| Leave balance config | `/support/LeaveBalanceConfig`, `Leave Balance Config` | Ledger setup | Screen. `R/P` | Real |
| Leave/movement history | `/reports/leaveHistory`, `/reports/movementHistory` | History reports | Table/export. `R/P` | Real |

### 2.7 Loans, Advances & IOU
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Loan request | `/loanRequest`, `/loanFinancialAid/loanRequest`, `/SelfService/MyLoan` | Apply loan | Form + schedule. `R/P` | Real |
| Loan type / management | `/loanManagement/loanType`, `/configuration/loanType` | Configure loans | CRUD. `R/P` | Real |
| Loan approval | `/loan`, `/loanSupervisor`, `/approval/loanApprovalSupervisor` | Approve loans | Queue. `R/P` | Real |
| Loan reschedule | `/loanFinancialAid/loanReschedule`, `Employee/LoanReSchedule` | Reschedule | Form. `R/P` | Real |
| IOU application | `/iOU/application`, `/SelfService/iOU/application/create` | Advance request | Form. `R/P` | Real |
| IOU adjustment / report | `/iOU/adjustmentReport`, `/iOU/report`, `Adjustment Report` | Settle advance | Report + approval. `R/P` | Real |
| Loan history / schedule | `/reports/loanHistory`, `/reports/LoanSchedule` | Reporting | Table/export. `R/P` | Real |

### 2.8 Payroll & Compensation/Benefits
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Salary assign | `/employeeSalary/salaryAssign`, `/Payroll/EmployeeSalaryAssign` | Assign structure | Form + bulk. `R/P` | Real |
| Salary structure / breakdown | `/payrollConfiguration/salaryBreakdown`, `/payrollConfiguration/payrollElement` | Components | Config. `R/P` | Real |
| Salary policy & apply | `/payrollConfiguration/salaryPolicy`, `/payrollConfiguration/policyApply/{single,bulk,reassign}` | Policy engine | Config + apply. `R/P` | Real |
| Salary generate | `/payrollProcess/generateSalary`, `/emp/PayrollManagement/SalaryGenerateRequest` | Run payroll | Process + approval. `R/P` | Real |
| Bonus setup & generate | `/payrollConfiguration/bonusSetup`, `/emp/BonusManagement/CRUDBonusGenerate` | Bonus run | Setup + generate + approval. `R/P` | Real |
| Arrear salary | `/payrollProcess/arearSalaryGenerate` | Back-pay | Process. `R/P` | Real |
| Increment | `/compensationAndBenefits/increment/*` | Increment cycle | Request → Review HR → Audit → Finance → Final. `R/P` | Real |
| Allowance & deduction | `/employeeSalary/allowanceNDeduction/*` | Add/deduct | Single/bulk/manual. `R/P` | Real |
| Manual salary add/deduct | `/payrollProcess/manualSalaryAddDeduct` | Ad-hoc | Form. `R/P` | Real |
| PF & Gratuity | `/payrollConfiguration/PFAndGratuity`, `/pfandgratuity/pfInvestment`, `/pfandgratuity/pfWithdraw`, `/pfmanagement` | Statutory | Config + investment + withdrawal + approval. `R/P` | Real |
| Income tax | `/incometaxmgmt/taxassign`, `/tax/taxCalculation`, `/tax/taxDeduction`, `Tax Challan Config` | Tax | Assign + calculate. `R/P` | Real |
| Mobile bill allowance | `/employeeSalary/mobileBillAllowance` | Allowance | Form. `R/P` | Real |
| Bank advice / disburse | `/bankadvice`, `Bank Advice`, `Salary Report for Disburse` | Payment file | Screen/export. `R/P` | Real |
| Payroll elements & rules | `/configuration/payrollElementAndRule`, `/configuration/payFrequency`, `/configuration/payrollMonth` | Config | CRUD. `R/P` | Real |
| Salary certificates | `/salaryCertificate/*`, `/SelfService/MySalaryCertificate`, `/TaxReturnCertificate` | Certificates | Request + approval. `R/P` | Real |

### 2.9 Expense & Reimbursement
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Expense application | `/expense/expenseApplication`, `/SelfService/expense/expenseApplication/create` | Claim expenses | Form + receipts. `R/P` | Real |
| Expense approval | `/expenseApproval` | Approve claims | Queue. `R/P` | Real |
| Expense type | `Expense Type`, `/configuration/expenseType` | Master data | CRUD. `R/P` | Real |

### 2.10 Performance Management / KPI / OKR (KEY for AGI)
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Individual KPI entry | `/SelfService/IndividualKpiResult`, `/individualkpi`, `/performancePlanning/individualKpiEntry` | Employee KPI sheet | Filter (PM Type, Year, From/To Month) → View → KPI table (BSC, Objective, KPI, UOM, KPI Direction, SRF, Weight, Benchmark, Target, Ach., Progress, Score) + Presentation. `OR` | Real |
| Individual KPI result | `Individual KPI Result` | View results | Table. `OR/P` | Real |
| KPI approval | `/SelfService/KpiApproval`, `/kpi/presentation` | Supervisor approval | Filters (Year, Month, Employee) → table (Enrollment, Name, Designation, Dept, Total Target/Weight/Achievement/Benchmark) + Download XLSX. `OR/P` | Real |
| KPI config | `/pms/configuration/kpis`, `/configuration/kpis` | Define KPIs | CRUD. `R/P` | Real |
| KPI mapping | `/configuration/kpimapping/{employeeWise,departmentWise,designationWise}`, `Individual KPI Mapping`, `Departmental KPI Mapping`, `SBU KPI Mapping` | Map KPIs to roles/depts | CRUD. `R/P` | Real |
| Objective & perspectives | `/configuration/objective`, `/configuration/BehavioralFactor` | Objectives/BSC | CRUD. `R/P` | Real |
| Targets | `/targetsetup/{EmployeeTarget,DeptTarget,SBUTarget}`, `Individual Target`, `Departmental Target`, `SBU Target` | Set targets | Setup. `R/P` | Real |
| Period/monthly uploads | `/performancePlanning/monthlyAchievementUpload`, `/periodWiseKpiUpload`, `/bulkProcessing/KpiUpload`, `KPI Data Upload` | Bulk actuals | Upload. `R/P` | Real |
| Evaluation criteria | `/pms/configuration/EvaluationCriteria` | Scoring config | CRUD. `R/P` | Real |
| Performance assessments | `/performanceAssessment/{selfAssessment,supervisorAssessment,BARAssessment,assessmentByHr}`, `Performance Marking` | Assessments | Forms + scoring. `R/P` | Real |
| Scorecards | `/performancePlanning/individualScorecard`, `My Performance`, `Individual Dashboard` | Scorecard | Dashboard. `R/P` | Real |
| Coaching tools | `/performanceCoaching/{johariWindow,growModel,actionPlan*}` | Development | Tools. `R/P` | Real |
| IDP | `/idp`, `IDP Report` | Development plan | Screen/report. `R/P` | Real |
| 9-box grid | `9 Box Grid` | Talent matrix | Grid. `P` | Real |
| OKR | `OKRs`, `OKR Mapping`, `OKR Target`, `OKR Entry` | OKR module | Setup + entry. `P` | Real |
| BSC / Strategic | `/CorporateScorecard/StategicMap`, `BSC`, `Strategic Initiatives`, `5 Years Strategy Plan`, `Strategic Plans` | Strategy | Map + plans. `R/P` | Real |
| KPI reports | `KPI Report`, `Employee KPI Status Report`, `KPI Change Log`, `Income Statement vs KPI`, `Performance Report`, `Performance Evaluation Report` | Reporting | Reports/exports. `P` | Real |
| Promotion eligible | `/transferandpromotion/PromostionEligible` | Eligibility | List. `R/P` | Real |

### 2.11 Training & Development
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Training title / list | `/Training/Configuration/TrainingTitle`, `/trainingAndDevelopment/list` | Catalogue | CRUD. `R/P` | Real |
| Category / venue / organization | `/trainingAndDevelopment/{category,venue,organization}` | Master data | CRUD. `R/P` | Real |
| Training calendar / booking | `/Planning/TrainingCalendar`, `/traininganddevelopment/calendarbooking` | Schedule | Calendar. `R/P` | Real |
| Requisition / application | `/traininganddevelopment/{trainingrequisition,application}` | Requests | Forms. `R/P` | Real |
| Budget | `/traininganddevelopment/budget` | Budgeting | Form. `R/P` | Real |
| Execution / assessment / evaluation | `/Execution/TrainingExecution`, `/Execution/TrainingAssessment`, `/traininganddevelopment/trainingevaluation` | Deliver & score | Forms. `R/P` | Real |
| Enrollment & confirmation | `/Planning/ConfirmationNEnrollment` | Enrollment | Screen. `R/P` | Real |

### 2.12 Separation & Offboarding
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Separation application | `/separation/separationApplication/create`, `/SelfService/separation/application/create` | Resign/exit | Form. `R/P` | Real |
| Exit interview | `/separation/separationApplication/exitInterview` | Exit Q&A | Form. `R/P` | Real |
| Clearance application / approval / config | `/separation/ClearanceApplication`, `/ClearanceApproval`, `/ClearanceApprovalConfig` | Clearance workflow | Queue + config. `R/P` | Real |
| Final settlement | `/separation/FinalSettlement`, `EmployeeClearance/CreateFinalSettlement` | F&F | Calc + statement. `R/P` | Real |
| Employee release | `/separation/employeeRelease` | Mark inactive | Action. `R/P` | Real |
| Separation reports | `/reports/{separationReport,SettlementReport,attritionReport}` | Reporting | Reports. `R/P` | Real |

### 2.13 Rewards, Disciplinary, Grievance, Conduct
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Rewards & punishment | `/rewardsandpunishment/*`, `Rewards and Punishment` | Record rewards/penalties | CRUD + approval. `R/P` | Real |
| Grievance management | `/grievanceManagement/*`, `/rewardanddisciplinary/Grievance` | Raise/handle grievances | Dashboard + create + categories. `R/P` | Real |
| Conduct & compliance | `/actionToEmployee/conductCompliance`, `/SelfService/myConductCompliance` | Compliance records | Screen. `R/P` | Real |
| Disciplinary mgmt | `DisciplinaryMgmt/*` endpoints | Case handling | Screen. `R` | Real |

### 2.14 GRC (Governance, Risk, Compliance)
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Risk management | `/GRC/riskManagement/riskAssessment`, `/riskManagement/riskAssessment/create` | Risk register | CRUD. `R/P` | Real |
| Access control / audit | `/GRC/accessControl/{auditReport,digitalFootprintReport,duplicateAuditReport}` | Audit trail | Reports. `R/P` | Real |
| Process control / audit / fraud mgmt | `Process Control`, `Audit Management`, `Fraud Management` | Controls | Screens. `P` | Real |
| GRC report | `/SelfService/GRCReport`, `GRC Report` | Summary | Report. `OR/P` | Real |

### 2.15 Asset Management
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Asset registration | `/assetManagement/registration/items`, `Asset Registration`, `Items` | Register assets | CRUD. `R/P` | Real |
| Asset assign / transfer | `Asset Assign`, `Direct Assign`, `Requisition Assign`, `Asset Transfer`, `List of Asset` | Allocation | Screens. `P` | Real |

### 2.16 Task Management
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Projects & task boards | `/taskmanagement/taskmgmt/projects`, `/taskmgmt/dashboard`, `/taskMgmt/projects/create`, `/task-project` | Project/task tracking | Dashboard + Kanban board. `R/P` | Real |

### 2.17 Cafeteria / Food Corner
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Food corner | `/cafeteriaManagement/foodCorner`, `/SelfService/foodcorner`, `Food Corner` | Meal management | Screen. `OR/P` | Real |
| Take meal | `/cafeteriaManagement/TakeMeal`, `Take Meal` | Meal redemption | Action. `R/P` | Real |
| Cafeteria reports | `/cafeteriaManagement/detailsReport`, `Cafeteria Details Report` | Reporting | Report. `R/P` | Real |

### 2.18 Campus Ambassador
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Batch / ambassador / activity | `CampusAmbassador/*` endpoints | Program mgmt | CRUD lists. `R/P` | Real |
| Remuneration / offboarding / certificate | `CampusAmbassador/{GenerateRemuneration,SaveOffboarding,IssueCertificate}` | Program ops | Screens. `R/P` | Real |

### 2.19 Reports (suite)
| Group | Examples | Location |
|---|---|---|
| Employee master | Employee List, Birthday, Dept list, Personal details, Bank details, Assets, Family info, Service info | `/reports/*`, `Employee List` `P` |
| Attendance/timesheet | Monthly/Yearly timesheet, Dept presence, Shift-wise, Daily, Date-wise, Roster, Punch raw, Invalid IN/OUT, Monthly IN/OUT | `/reports/*` `R/P` |
| Leave | Leave register, Monthly checklist, Leave History, Earn Leave | `/reports/*` `R/P` |
| Salary | Salary Slip, Salary Register, Breakdown, Bank/Cheque payable, Payslip summary, Gratuity, Location-wise, Manpower | `/compensationAndBenefits/reports/*` `R/P` |
| Loan/IOU | Loan History, Loan Schedule, IOU report | `/reports/loanHistory` `R/P` |
| Training | Training-wise employees, employee-wise training | `P` |
| Statutory | PF Register, Gratuity Provision, Tax Deduction Statement, PF ECR, PT/ESIC (India) | `P` |
| HR analytics | Attrition, Turnover, Cost to Company, Resource Utilization, Contract Closing, Employee leaving prediction | `/reports/*` `R/P` |
| Custom | **Custom Report Builder** | `/customReportsBuilder/employeeReportBuilder` `R/P` |
| Bookmarks | Saved/scheduled reports | `/report/bookmarks` `R` |

### 2.20 Administration & Configuration
| Feature | Location | Purpose | Key UI | Data |
|---|---|---|---|---|
| Role management / users | `/administration/roleManagement/{usersInfo,userGroup,featureGroup,userRole,userRoleManager,userRoleExtension}` | RBAC | CRUD + assign to role/user. `R/P` | Real |
| Menu & feature permission | `MenuAndFeature/*`, `/support/menuManagement`, `Menu/GetAllMenu` | Configure menus | CRUD + assign. `R/P` | Real |
| Org masters | `/configuration/{business-unit,sbu,department,designation,hr-position,workplace,profitCenter,payScaleGrade,grade,bankBranch,religion}` | Organisational master data | CRUD. `R/P` | Real |
| Organogram | `/configuration/organogram`, `/Organogram/OrganogramReConstruct` | Org chart | Builder. `R/P` | Real |
| Document management | `/administration/DocumentManagement/{Policy,Procedure,Process,SOP,System,FormsManage}`, `/SOP`, `/policyUpload` | Documents | CRUD. `R/P` | Real |
| Announcements | `/announcement`, `/administration/announcement/create` | Broadcasts | CRUD. `R/P` | Real |
| Notification setup | `Notification Setup`, `/configuration/notificationConfig` | Alerts config | CRUD. `R/P` | Real |
| Common approval pipeline | `/configuration/commonapprovalpipeline` | Approval chains | Builder. `R/P` | Real |
| Account / external party | `/account`, `/configuration/externalParty` | Config | CRUD. `R/P` | Real |
| Dashboard permission | `/configuration/{dashboardComponentPermission,managementDashboardPermission}` | Widget access | Config. `R/P` | Real |
| ARL role / role profile / role map | `/ARLRole`, `/configuration/roleProfile`, `/configuration/roleMap`, `Role Wise JD & Spec` | Role definitions | CRUD. `R/P` | Real |

### 2.21 Approval engine (cross-cutting)
A reusable approval pipeline drives **~40 queues**: Leave, Movement, Attendance, Overtime, Salary, Loan, Bonus, Reward/Disciplinary, IOU, Salary Certificate, PF Withdraw, Transfer & Promotion, Allowance & Deduction, Arrear Salary, Increment, Expense, Market Visit, Master Location, SOP, Policy, Partner Benefits, Separation, Clearance, Manager Change, KPI, Salary Generate, Bonus Generate.

| Aspect | Behaviour |
|---|---|
| Location | `/approval/*`, `/SelfService/*Approval`, module-specific approval screens | `OR/P` |
| UI | Filter bar + pending table + Approve/Reject/Details per row + bulk | `OR` |
| Pipeline config | `/configuration/commonapprovalpipeline`, `emp/LeaveMovement/CreateLeaveAndMovementPipeline` | `R/P` |
| Outcome | Status change + history + notification | `OR` |

### 2.22 Communication & Chat
| Feature | Location | Purpose | Key UI |
|---|---|---|---|
| Chat app | `/chat-app`, `/chat`, `ChattingApp/*` | Direct/group chat | Chat UI. `R/P` |
| Communication templates | `/Communication/templateFinder`, `/templateFinder` | Message templates | Template browser. `OR` |
| Template categories | `/Communication/{Hr,ScmOpex,FinancePart,IT,Marketing,admin,salesOperation,assetCorner}` | Categorised templates | Lists. `OR` |
| Google Admin Manager (chat) | `/GoogleAdminManager/AdminChat` | Admin chat | Chat. `OR` |
| Contact book | `/SelfService/contactBook` | Directory | List. `OR` |

### 2.23 Employee Self Service (ESS)
The ESS is the employee-facing portal (web + mobile-responsive PWA). Live menu observed:

| ESS page | Location | Purpose |
|---|---|---|
| Dashboard | `/SelfService/dashboard` | Attendance calendar, clock in/out, service length, manager, leave balance `OR` |
| About Me | `/SelfService/aboutMe` | Profile with tabs `OR` |
| Individual CTC | `/SelfService/individualCTC` | Compensation view `OR` |
| Recruitment tracker | `/SelfService/recruitmentTracker` | Self-service recruitment `OR` |
| My conduct compliance | `/SelfService/myConductCompliance` | Compliance `OR` |
| Leave & movement | `/SelfService/leaveAndMovement/{leaveApplication,movementApplication}` | Apply leave/movement `OR` |
| Food corner | `/SelfService/foodcorner` | Meals `OR` |
| Contact book | `/SelfService/contactBook` | Directory `OR` |
| 30-60-90 checklist | `/SelfService/306090Checklist` | Onboarding `OR` |
| Separation | `/SelfService/separation/{application,clearanceApplication,clearanceStatus}` | Exit `OR` |
| PaySlip | `/SelfService/paySlip` | Payslips `OR` |
| My salary certificate | `/SelfService/MySalaryCertificate` | Certificate request `OR` |
| Tax return certificate | `/SelfService/TaxReturnCertificate` | Tax certificate `OR` |
| My loan | `/SelfService/MyLoan` | Loans `OR` |
| Grievance management | `/SelfService/grievanceManagement` | Grievances `OR` |
| Documents upload | `/SelfService/DocumentsUpload` | Upload docs `OR` |
| Forms | `/SelfService/Forms` | Forms library `OR` |
| Issue management | `/SelfService/IssueManagement` | Raise issues `OR` |
| GRC report | `/SelfService/GRCReport` | Compliance `OR` |
| Service request | `/SelfService/serviceRequest` | HR requests `OR` |
| Individual KPI result | `/SelfService/IndividualKpiResult` | KPI sheet `OR` |
| KPI approval | `/SelfService/KpiApproval` | Supervisor approvals `OR` |

### 2.24 Issue / Helpdesk, Service Request
| Feature | Location | Purpose | Key UI |
|---|---|---|---|
| Issue management | `/IssueManagement`, `/IssueManagement/create`, `/SelfService/IssueManagement` | Raise/track issues | List + form. `R/P` |
| HR ticket | `HRTicket/{CreateTicket,UpdateTicketStatus,CloseTicket,GetIssueTypes}` | Ticket lifecycle | Form + status. `R` |
| Service request | `/serviceRequest`, `/SelfService/serviceRequest` | HR services | List + create. `R/P` |

### 2.25 iBOS ERP & adjacent modules
| Module | Location | Note |
|---|---|---|
| iBOS ERP | `/ibosErp`, `iBOS ERP` | External ERP surface `P` |
| SCM/OPEX | `Purchase Request`, `Purchase Order`, `Bill Register`, `Gate Pass` | Supply chain `P` |
| Sales | `Sales Order`, `Bill Of Material` | Sales `P` |
| Finance | `Internal Expense`, `Account`, `Vessel Cash Accounts` | Finance `P` |
| Maritime/shipping | `Seafarer`, `Portage Bill`, `Crew Planning`, `Noon Report`, `ISM Documentation`, `Vessel Certificate`, `Bond Report`, `IMO Crew List` | Shipping vertical `P` |

---

## 3. Feature counts (PeopleDesk)

| Bucket | Count |
|---|---|
| Distinct SPA routes in bundle | **613** |
| Named features in `permissionList` (unique `menuReferenceName`) | **~300** |
| Permission records (feature × module) | **369** |
| Reusable approval queues | **~40** |
| Report screens | **~90** |
| Configuration/master-data screens | **~90** |
| ESS pages (live menu) | **24** |

---

## 4. Backend vs. simulated (for AGI OneDesk)

| Category | PeopleDesk reality | AGI OneDesk prototype approach |
|---|---|---|
| Auth / users / roles | Real JWT + cookies + RBAC + permissions | **Simulate** with local session + mock users (still role-gated) |
| Employee master | Real SQL + API | **Local store** seeded with Anwar sample employees |
| Leave / Movement | Real workflow + balance ledger | **Local store**, real create/approve/balance logic |
| Payroll | Real, statutory-heavy | **Simulate** (read-only views + payslip samples) |
| KPI / Goals | Real `PMS` module | **Real** — BRD-driven, fully interactive (the core of the prototype) |
| Approvals | Real pipeline engine | **Real** local approval engine (approve/reject/return/adjust) |
| Reports | Real, many | **Simulate** key reports; interactive tables + CSV export |
| Notifications | SignalR + config | **Local** notification store (in-app bell) |
| Documents / evidence | Real storage | **Local** upload (base64/object URL) + SHA-256 |
| Config / RBAC screens | Real, deep | **Simulate** read/edit key masters |
| Adjacent ERP (SCM, Finance, maritime) | Real | **Out of prototype scope** (display only or omit) |
