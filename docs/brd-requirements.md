# BRD Requirements — Anwar KPIFlow (Variable KPI Phase 01)

**Source:** `BRD of KPI Management System.docx` v1.0 (Sep 30, 2026 · @Sarwar). Pre-extracted text: `Variable-KPI-Management-Platform/docs/BRD_extracted.md`. Product name in the BRD is "Anwar KPIFlow"; in AGI OneDesk this becomes the **Performance / KPI module**.

This document distils the BRD into buildable requirements. Nothing material is omitted; IDs are preserved for traceability.

---

## 1. Purpose & business context

Replace the manual, signature-based KPI approval process with one platform where every variable-KPI score is traceable **Target → Actual Achievement → Evidence → Score → Review → Approval**.

**Current problems:** invisible calculation, scattered data, subjective scoring, number-only approvals, limited reporting, untraceable adjustments.

**Required shift:** from `KPI Name → Score → Signature → Approval` to `Target → Actual Achievement → Evidence Report → Score → Review → Approval`.

**The five questions every KPI must answer on-screen:** what was the target, what was actually achieved, what evidence supports it, how was the score calculated, who reviewed/approved it.

### 1.1 Organisation model
- **10 business units:** Anwar Cement Limited, Anwar Cement Sheet Limited, Anwar Ispat Limited, Anwar Galvanizing Limited, A-One Polymer Limited, Anwar Textile, Anwar Landmark, Anwar Jute Spinning Mills Limited, Anwar Technologies, Anwar Organic.
- Departments (examples: Growth Analytics, Marketing, Human Resources). **Every employee belongs to one BU and one department; that pairing decides who reviews/approves.**

### 1.2 Scope (Phase 01)
- **In:** accounts/access, employee workspace (Profile, My KPI, Performance Summary), KPI record with evidence + calc path + adjustment history, review/approval queue, department dashboard + leaderboard, Super Admin workspace, monthly/quarterly/yearly reporting, audit.
- **Out:** Fixed KPIs; other ANWAR KPI modules; automatic import of actuals from ERP/sales; department-specific screens.
- **Two Variable KPI categories:** **Project KPI** and **People & Culture KPI** (OI-01 wording conflict resolved this way).

---

## 2. User roles & permissions

Exactly **three user types** (BR-02). Screens/process identical for every department (BR-11).

### 2.1 Role summary
| Role | Own KPIs | Sees | Approves | Admin powers |
|---|---|---|---|---|
| **Employee (User)** | Create/submit/view own | Own only | No | No |
| **Department Head (Admin)** | Same as employee | Own + own department | Own department | No (except seat on queue) |
| **Super Admin** | Not applicable to create | All departments, all users, all heads' KPIs | Any KPI, any department | Full CRUD, invitations, versions |

### 2.2 Permission matrix (BRD §6.1)
| Capability | Employee | Department Head | Super Admin |
|---|---|---|---|
| Register own account | Yes (self) | By invitation | n/a |
| View/edit own Profile | Own | Own | All |
| Create & submit KPIs | Own | Own | n/a |
| View KPI detail / calc path / adjustment history | Own | Own + dept | All |
| View Performance Summary | Own | Own | All |
| View Pending Requests | No | Own dept | All |
| Approve / Reject / Adjust / Return | No | Own dept | All |
| Edit / Update / Delete a request | No | Own dept | All |
| Dept dashboard + leaderboard | No | Own dept | All depts |
| Invite Department Heads | No | No | Yes |
| Add/manage employees | No | No | Yes |
| Version control & history | No | No | Yes |
| Create/update/delete any record | No | No | Yes |

### 2.3 Access rules
- Employee sees only their own KPIs (BR-06). Department Head sees own + department (BR-07). Super Admin sees all (BR-08).
- Approver for an employee's KPI **must be a Department Head of that employee's department** (BR-09); the approver list is filtered accordingly.
- No one approves their own KPI (BR-10). A Department Head's own KPIs → Super Admin (OI-04).
- A department may have several Department Heads (BR-05); each sees the same queue.
- Server enforces role **and** department on every page/API/file; UI hiding is never the only control (NFR-04).

---

## 3. Business rules (BR-01 … BR-23)

**Accounts & roles**
- BR-01 Only `@anwargroup.net` emails hold accounts.
- BR-02 Exactly three user types.
- BR-03 Every employee/head belongs to one BU + one department.
- BR-04 Heads join only by Super Admin invitation, assigned to the named department.
- BR-05 A department may have more than one head.

**Visibility & approval**
- BR-06 Employee sees own KPIs only.
- BR-07 Head sees own + own department.
- BR-08 Super Admin sees all.
- BR-09 Approver must be a head of the employee's department.
- BR-10 No self-approval.
- BR-11 Same interface/process for all departments.

**KPI content**
- BR-12 Variable KPIs only; categories Project KPI and People & Culture KPI.
- BR-13 The **ten required fields**: KPI, Target, Actual, Achievement, KPI Weight, Score, Evidence Report, Remarks, KPI Status, Approval Person.
- BR-14 Achievement & Score are system-calculated; employees cannot type them.
- BR-15 Every submitted KPI must carry ≥1 evidence file.
- BR-16 No curve/cap/score-version in the employee calc path; KPI Weight is shown.

**Review & change control**
- BR-17 Decision ∈ {Approve, Adjustment, Return to Employee, Reject}.
- BR-18 Any approver change to Score/Weight/field needs a reason and is visible with history.
- BR-19 Only Approved + Adjusted KPIs count toward totals/rank.
- BR-20 Submitted KPI is read-only for the employee until Returned.
- BR-21 No version overwritten; each change = new version, managed by Super Admin.
- BR-22 Delete requires a reason and is retained in version history.
- BR-23 Audit trail is immutable.

---

## 4. Functional requirements

### 4.1 Accounts, password setup, login (§9.1)
| ID | Requirement |
|---|---|
| FR-AUTH-01 | Sign-up form: Full Name, Company Email, Employee ID, Business Unit, Department — all mandatory. |
| FR-AUTH-02 | BU from the ten units; Department from Super-Admin-maintained list. |
| FR-AUTH-03 | Only `@anwargroup.net`; other domains refused with a message. |
| FR-AUTH-04 | Uniqueness on email and Employee ID. |
| FR-AUTH-05 | Setup email with a secure password link after valid sign-up. |
| FR-AUTH-06 | Link unique, single-use, time-limited; expired/used shows message + re-request. |
| FR-AUTH-07 | Password page: New + Confirm Password. |
| FR-AUTH-08 | Eye on/off toggle per password field, state always accurate. |
| FR-AUTH-09 | Match check before password creation. |
| FR-AUTH-10 | Password strength policy shown before typing. |
| FR-AUTH-11 | Login with email+password; lands on role home (Employee → My KPI; Head/Super Admin → Dashboard). |

### 4.2 Profile (§9.2)
| ID | Requirement |
|---|---|
| FR-PRO-01 | Profile lists all sign-up values. |
| FR-PRO-02 | Employee can add/edit Corporate Phone Number. |
| FR-PRO-03 | Email, Employee ID, BU, Department read-only for employee (Super Admin edits). |

### 4.3 My KPI — create (§9.3)
| ID | Requirement |
|---|---|
| FR-KPI-01 | Create KPI (+) always visible, right of the cards, inside the parent card. |
| FR-KPI-02 | Ten required fields (see BR-13); Achievement/Score/Status read-only. |
| FR-KPI-03 | Capture KPI Category (Project / People & Culture) and KPI Period (OI-02). |
| FR-KPI-04 | Submit disabled until valid: numeric Target/Actual, Weight >0 and ≤100, evidence attached, approver chosen; per-field messages. |
| FR-KPI-05 | Submit → status Submitted, appears in department Pending Request queue. |
| FR-KPI-06 | Locked while in review; editable only when Returned. |
| FR-KPI-07 | Returned KPI can be corrected/resubmitted; previous version kept. |

### 4.4 My KPI — card list (§9.4)
| ID | Requirement |
|---|---|
| FR-KPI-08 | Card shows: KPI name; status badge; category + weight; Target/Actual/Score; six-step tracker (Target, Actual, Evidence, Score, Review, Approval); time remaining; View Details. |
| FR-KPI-09 | Create option + cards inside one parent card. |
| FR-KPI-10 | Inner scroll; Create (+) stays visible. |
| FR-KPI-11 | Equal-size, aligned cards on a grid at all widths. |

### 4.5 KPI detail (§9.5)
| ID | Requirement |
|---|---|
| FR-DET-01 | Header: KPI name, owner, category, weight, period, status badge, Download report. |
| FR-DET-02 | Six-step tracker repeated across the top. |
| FR-DET-03 | Target/Actual panel: Target, latest Actual, data source, Reviewer/Approver. |
| FR-DET-04 | Evidence panel: file name(s), Download, integrity fingerprint (hash). |
| FR-DET-05 | Calculation path: Formula, Achievement, Calculated Score, Final Score (or pending), KPI Weight. **Not** Curve Applied/Adjustment/Score Version. |
| FR-DET-06 | Live changes shown when approver edits Score/Weight/field. |
| FR-DET-07 | Adjustment History: field, old→new, who, when, reason. |

### 4.6 Performance Summary (§9.6)
| ID | Requirement |
|---|---|
| FR-PS-01 | Monthly/Quarterly/Yearly + month/year filters; everything recalculates. |
| FR-PS-02 | Five metrics: Total KPI Score, Average Achievement, Previous KPI Score, Difference (with words), Approved KPIs (x/y). |
| FR-PS-03 | KPI Performance Records table — exactly ten columns: KPI, Target, Actual, Achievement, KPI Weight, Score, Evidence Report, Remarks, KPI Status, Approval Person. |
| FR-PS-04 | Evidence cell shows file count and opens/downloads. |
| FR-PS-05 | Three bar charts (Monthly, Quarterly, Yearly), distinct colours. |
| FR-PS-06 | No empty values; period with no KPIs shows a clear message. |

### 4.7 KPI Pending Request — Department Head (§9.7)
| ID | Requirement |
|---|---|
| FR-REV-01 | Queue of own-department pending KPIs, oldest first, with count. |
| FR-REV-02 | Card: status, KPI, Employee Name + Employee ID, View Request. |
| FR-REV-03 | Filter by month/quarter/year and employee; search by name or ID. |
| FR-REV-04 | Detail without leaving queue; link to full record. |
| FR-REV-05 | View Detail, Edit, Update, Delete a pending request. |
| FR-REV-06 | Decisions: Approve, Adjustment, Return to Employee, Reject. |
| FR-REV-07 | Reason required for Adjustment/Return/Reject; Delete requires confirm + reason. |
| FR-REV-08 | After decision: leaves queue, employee sees new status/values, change written to history. |
| FR-REV-09 | Super Admin holds the same rights anywhere. |

### 4.8 Department Head dashboard (§9.8)
| ID | Requirement |
|---|---|
| FR-DD-01 | Dedicated department dashboard, filter by month/quarter/year. |
| FR-DD-02 | Average Achievement with progress bar. |
| FR-DD-03 | Pending Evaluations count, links to queue. |
| FR-DD-04 | Total Approved KPIs. |
| FR-DD-05 | Rejected KPIs. |
| FR-DD-06 | KPIs below target (Actual < Target) with employee name. |

### 4.9 Department leaderboard (§9.9)
| ID | Requirement |
|---|---|
| FR-LB-01 | Department leaderboard in sidebar. |
| FR-LB-02 | Rank number, name, role/designation, achievement %, progress bar. |
| FR-LB-03 | Ranked high→low; bars colour-banded (high/middle/low). |
| FR-LB-04 | Own department only; Super Admin any department. |

### 4.10 Super Admin (§9.10)
| ID | Requirement |
|---|---|
| FR-SA-01 | Create/update/delete any record. |
| FR-SA-02 | Invite Department Head (Full Name, Company Email, Employee ID, BU, Role, Department). |
| FR-SA-03 | Several heads per department. |
| FR-SA-04 | Department-scoped heads. |
| FR-SA-05 | Sees every head's KPIs. |
| FR-SA-06 | Add/move/deactivate/remove employees. |
| FR-SA-07 | Maintain BU and Department lists. |
| FR-SA-08 | Invitation status (pending/accepted/expired) + resend. |
| FR-SA-09 | View/manage all versions of every KPI. |

### 4.11 Versions, history, audit (§9.11)
| ID | Requirement |
|---|---|
| FR-AUD-01 | Every post-submission change creates a new version; earlier never overwritten. |
| FR-AUD-02 | Each version records what/old/new/who/when/why → Adjustment History. |
| FR-AUD-03 | Super Admin lists/compares/inspects all versions. |
| FR-AUD-04 | Audit trail: account creation, invitations, logins, submissions, decisions, edits, deletes, evidence up/download; immutable. |
| FR-AUD-05 | Deletion traceable — removed from normal screens but kept in history with reason. |

---

## 5. Workflow & status lifecycle

**Six stages:** Target → Actual → Evidence → Score → Review → Approval. Only approved KPIs count.

**End-to-end flow**
1. **Create** — employee opens My KPI → Create KPI (+) → all fields; system computes Achievement & Score; shows status.
2. **Submit** — to a Department Head of own department; status `Submitted`; card appears with tracker.
3. **Queue** — appears in every head's Pending Request with Employee Name + ID.
4. **Review** — head opens View Detail: target, actual, evidence, calculation; may edit/update.
5. **Decide** — Approve / Adjustment (change + reason) / Return to Employee (remarks) / Reject (reason).
6. **Report** — approved KPIs update Performance Summary, department dashboard, leaderboard; every decision in audit.

**Status lifecycle (5 statuses, 1 return loop)**
| Status | Meaning |
|---|---|
| `Submitted` | Sent to approver; in queue; employee cannot edit. |
| `Returned` | Sent back with remarks; employee may correct & resubmit. |
| `Approved` | Calculated score becomes final. |
| `Adjusted` | Approver changed Score/Weight/field with reason and approved. |
| `Rejected` | Closed with reason; excluded from scoring. |

**Tracker mapping**
- Target/Actual/Evidence/Score tick on submit.
- Review highlighted while Submitted (and again after resubmit).
- Approval ticks on Approved/Adjusted; Returned/Rejected show outcome at Review.

**System behaviour per event**
- Submit → calculate, save v1, set Submitted, enqueue, bump Pending Evaluations.
- Approve/Adjust → fix final score, new version, update summary/dashboard/leaderboard.
- Return → save remarks, unlock for employee, remove from queue until resubmitted.
- Reject → save reason, close, increment Rejected count.
- Every event → write audit entry (who/what/when/old/new).

---

## 6. Calculations (§11)

**Achievement** = `Actual / Target × 100` (2 dp; Target > 0).
**Calculated Score** = Achievement (no curve/cap in Phase 01). Final = calculated (Approve) or adjusted (Adjustment).
**Weighted Score** = `Final Score × KPI Weight% / 100`.
**Total KPI Score** = `Σ(Final Score × Weight) / Σ(Weight)`. When weights total 100%, it is the weighted sum. Only Approved + Adjusted count.
*Worked example:* Target 500,000; Actual 610,000 → Achievement 122.00%; Score 122; weight 15% → weighted 18.3.

**Performance Summary metrics**
- Total KPI Score; Average Achievement (simple average of Achievement % over Approved+Adjusted); Previous KPI Score (prior same-type period); Difference (number + "above/below the previous month/quarter/year"); Approved KPIs (approved/total submitted).

**Department dashboard / leaderboard metrics**
- Dept Average Achievement (avg of each employee's Average Achievement) with progress bar; Pending Evaluations (Submitted count); Total Approved (Approved+Adjusted); Rejected; KPIs below target (Achievement < 100%); Leaderboard rank by Average Achievement desc (ties share rank, alphabetical).

**Period assignment:** each KPI belongs to its captured period; month/quarter/year views include KPIs in range.

---

## 7. Validation rules

- Sign-up: 5 mandatory fields; domain `@anwargroup.net`; unique email & Employee ID.
- Password: New = Confirm; strength policy.
- KPI: Target & Actual numeric; Target > 0; Weight > 0 and ≤ 100; ≥1 evidence file; approver chosen.
- Decisions: reason required (Adjustment/Return/Reject/Delete).
- All forms: per-field inline error messages; primary action disabled until valid.

---

## 8. Reporting requirements

- **Performance Summary** (employee): Monthly/Quarterly/Yearly with the five metrics, ten-column KPI Performance Records table, three bar charts.
- **Department dashboard**: 4 tiles + below-target list, period filter.
- **Leaderboard**: ranked, colour-banded.
- **Super Admin**: all KPIs + versions + audit.
- Empty periods show a message — never blank/zero-filled cells (NFR-02).

---

## 9. Dashboard requirements

- **Employee**: My KPI (card list), Performance Summary.
- **Department Head**: department dashboard tiles + queue + leaderboard.
- **Super Admin**: department picker dashboard, all KPIs, Department Heads, Employees, Versions, Audit, Organisation.

---

## 10. Edge cases & open items (OI-01 … OI-15)

| ID | Issue | Working position |
|---|---|---|
| OI-01 | Project KPI stated both excluded and included | Phase 01 = two Variable categories: Project KPI + People & Culture KPI |
| OI-02 | Ten fields lack category/period | Add both as required (FR-KPI-03) |
| OI-03 | Inverse KPIs / caps | Achievement = Actual/Target×100, no cap |
| OI-04 | Who approves a Head's KPI | Super Admin |
| OI-05 | Quarterly = "6-month"? fiscal vs calendar | Configurable; default calendar |
| OI-06 | Adjustment final or edit | Adjustment approves adjusted values |
| OI-07 | Must weights total 100%? | Not enforced; weighted average |
| OI-08 | Perf/availability targets | 3s loads, business-hours |
| OI-09 | Stack/hosting | Open |
| OI-10 | Non-numeric target (rubric) | Numeric only |
| OI-11 | Leaderboard band thresholds | Configurable (default 90/70) |
| OI-12 | Super Admin can decide in head section | Both Super Admin & head hold rights |
| OI-13 | Self-register vs admin-add | Both |
| OI-14 | Decision emails | In-app only |
| OI-15 | Forgot password, file types/size | Reuse setup link; types/size to agree |

**Edge cases to handle:** no KPIs in period; no approver exists yet for a department; deleted KPI removed from screens but kept in history; department move keeps submitted KPIs with origin department; deactivated user cannot log in but history remains.

---

## 11. Acceptance criteria (AC-01 … AC-27)

**Accounts/access:** AC-01 non-company email rejected · AC-02 valid sign-up delivers working link · AC-03 eye toggle both fields · AC-04 mismatch blocks password · AC-05 login lands on role home · AC-06 HR head sees HR only, cross-dept link refused · AC-07 two heads see same queue.

**My KPI:** AC-08 Create (+) right of cards in parent card · AC-09 invalid form disables Submit with field messages · AC-10 Target 500,000/Actual 610,000 → 122.00% and Score 122 · AC-11 approver list = own-department heads only · AC-12 submitted card shows all elements + Review highlighted · AC-13 inner scroll keeps cards aligned.

**Detail/history:** AC-14 calc path shows the five rows and not Curve/Adjustment/Score Version · AC-15 approver change reflected + Adjustment History with old/new/who/when/reason.

**Performance:** AC-16 metrics recalculate per period · AC-17 exactly ten columns · AC-18 three different-coloured charts · AC-19 no-data message, no blanks.

**Review/dashboard/leaderboard:** AC-20 in queue with Name+ID, searchable · AC-21 decision changes status, reason required except Approve, employee sees result · AC-22 Edit/Update/Delete versioned, delete retained · AC-23 dashboard tiles match records · AC-24 leaderboard ranked, colour-banded, department-only.

**Super Admin/audit:** AC-25 full visibility + CRUD · AC-26 full version history, immutable audit · AC-27 identical layout/process across departments.

---

## 12. Non-functional requirements (NFR-01 … NFR-20)

- **Usability:** NFR-01 create/submit without training · NFR-02 no blanks/null · NFR-03 Chrome/Edge/Safari/Firefox, mobile→desktop.
- **Security:** NFR-04 server-side role+dept on every page/API/file · NFR-05 salted hashes · NFR-06 HTTPS + encryption at rest · NFR-07 evidence type/size checks, guarded download · NFR-08 login throttling/lockout · NFR-09 session expiry + logout everywhere · NFR-10 OWASP Top 10.
- **Audit/integrity:** NFR-11 reproducible scores · NFR-12 append-only audit/version · NFR-13 evidence hash.
- **Performance/scale:** NFR-14 <3s for typical dept · NFR-15 all 10 BUs without code change · NFR-16 extensible to Fixed KPI.
- **Availability:** NFR-17 business-hours · NFR-18 daily backups + tested restore.
- **Maintainability:** NFR-19 masters managed in UI · NFR-20 one server-side calculation service.

---

## 13. Use cases (UC-01 … UC-10) & user stories

- **UC-01** Register employee · **UC-02** Set password & log in · **UC-03** Maintain profile · **UC-04** Create & submit KPI · **UC-05** Follow KPI + adjustment history · **UC-06** Review performance summary · **UC-07** Review pending request (Approve/Adjust/Return/Reject/Edit/Update/Delete) · **UC-08** Monitor department · **UC-09** Invite Department Head · **UC-10** Manage versions & history.
- **US-01…US-10** employee stories; **US-11…US-16** department head; **US-17…US-20** Super Admin. (Each maps to FR IDs as listed in BRD §14.)

---

## 14. Application to AGI OneDesk

The BRD's KPI module is the **performance core** of AGI OneDesk. In AGI OneDesk it must:
- keep the exact 6-stage traceable flow, 5 statuses, 10 fields, 4 decisions, and calculation rules;
- adopt **Anwar Group** branding, terminology, sample org (10 BUs, departments, sample employees), and **BDT/BD** locale;
- support the **Variable Income KPI** scoring model from the spreadsheet (weightage × capped achievement → grade) as an *additional* calculation profile (see `variable-kpi-functionality.md`);
- sit inside a PeopleDesk-style shell so it feels like one product, not a standalone app.
