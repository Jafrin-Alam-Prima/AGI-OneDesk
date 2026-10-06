# AGI OneDesk — Implementation Notes

This file records the important assumptions, decisions and known limitations made while building the
AGI OneDesk prototype, following the rule: *if something is ambiguous, inspect the source material and make the
smallest reasonable assumption, and record it here.*

## Product & scope

- **Product:** AGI OneDesk — Anwar Group of Industries HRMS + ESS + Performance (KPI) platform. Reference product: PeopleDesk.
- **Nature:** a fully interactive **prototype**. Backend behaviour is simulated with a client-side state store and
  browser local persistence (no external database, no server API), so it deploys to Vercel with zero infrastructure.
- **Location:** `D:\OneDesk\agi-onedesk` (Next.js 15 App Router · TypeScript · Tailwind CSS · Zustand).
- **Port used in testing:** 3100 (`npx next start -p 3100`). Dev: `npm run dev` (port 3000).

## Architecture decisions

1. **Client-side data store with persistence (Zustand + `persist` → `localStorage`, key `agi-onedesk-v1`).**
   Chosen over Prisma/Postgres because the brief requires a demonstrable prototype, local persistence during
   navigation, and Vercel deployability without a database. The store exposes real CRUD + workflow actions, so
   every screen reads and writes live application state (no hardcoded tables).
2. **Single source of truth for calculations** — `src/lib/calc.ts` implements both scoring profiles:
   - KPIFlow (BRD): `Achievement = Actual/Target×100`, score = Achievement (uncapped), weighted total.
   - Variable Income (spreadsheet): `Score = Weightage × MIN(Achievement%, 100%)` (capped) + grade bands.
3. **One reusable shell** (`AppShell`, `Sidebar`, `Topbar`) plus a UI kit (`Card`, `Badge`, `DataTable`, `Modal`,
   `Drawer`, `Field`, `Toast`, `Tabs`, `StatCard`, `ProgressBar`) reused across all modules — feature parity without
   duplicated code.
4. **Role + department scoping** enforced in selectors (`src/lib/selectors.ts`) and in the shell route guard.

## Assumptions (from analysis open items)

- **OI-01 / categories:** Variable KPIs have two categories — Project KPI and People & Culture KPI.
- **OI-03 / caps:** The KPIFlow profile is uncapped; the **Variable Income** profile is capped at 100% (`MIN(x,1)`),
  matching the spreadsheet. Both are implemented and labelled.
- **OI-10:** Targets and actuals are numeric only.
- **Grade bands (AGI-VK-01):** The spreadsheet shows total score `0.8894 → B+`. A band scale consistent with that
  was adopted: `A+ ≥0.95`, `A 0.90–0.9499`, `B+ 0.85–0.8999`, `B 0.80–0.8499`, `C+ 0.70–0.7999`, `C 0.60–0.6999`,
  `D <0.60`. Bands are editable in **Administration → Grade Bands**; confirm exact bands with Anwar HR.
- **Roles:** The BRD names three user types (Employee, Department Head, Super Admin). The prototype also models
  **HR / Finance / Audit / System Admin** and a configurable approval pipeline (KPI: Employee → Dept Head → HR →
  Finance → Audit), consistent with the existing prototype and the Variable Income sign-off chain (LM → HOD → HR → COO).
- **Passwords:** The prototype accepts any password of 4+ characters; the demo password is `demo1234`. This is a
  deliberate prototype simplification (no real credential store). Self-registration, the domain restriction, the
  secure single-use setup link, match check and eye toggles are all implemented for real.
- **Evidence:** Files are hashed with **real SHA-256** (Web Crypto) and stored as metadata; downloads emit a
  placeholder file. Actual bytes are not persisted (prototype).
- **Email:** Setup/reset emails are delivered to an in-app **Outbox** (`/dev/outbox`), as in the reference prototype.
- **Locale:** BDT currency, `Asia/Dhaka` display, fiscal year 2026–2027.
- **Branding:** Anwar master colour `#DE3332` with the AGI OneDesk mark. No PeopleDesk branding is exposed.

## Data seeding

- 10 Anwar business units, 9 departments, 10 designations, 7 grade bands.
- 38 users: Super Admin, System Admin, HR/Finance/Audit Admins, 5 Department Heads, ~28 employees with managers.
- 36 KPIs across the reference employee (history) and the wider teams, with evidence, versions and decisions.
- 2 Variable Income scorecards (including the exact reference figures: 0.8894 → B+).
- Attendance (Oct 2026), leave types/balances/applications, movement, regularization, loans, advances, expenses,
  service requests, grievances, announcements, policies, candidates, training, separations, transfers, rewards,
  confirmations, assets, tasks, tickets, meals, risks, audit logs, notifications, payslips, contacts and pipelines.

## Known limitations (prototype)

- **Not production security.** Auth is simulated; role/department checks run in the client (the shell guard +
  selector scoping), not on a server. The BRD's server-side enforcement (NFR-04) would be added with a real backend.
- Payroll processing, statutory reports, attendance devices, SignalR notifications and ERP integrations are simulated.
- A few PeopleDesk breadth modules are represented in a lighter form (assets, tasks, cafeteria, GRC, helpdesk).
- Screenshots in the automated browser could not always be captured due to desktop-window visibility; verification
  was done through DOM/state assertions instead.

## How to run

```bash
cd D:\OneDesk\agi-onedesk
npm install
npm run dev        # http://localhost:3000
# or production
npm run build && npx next start -p 3100
```

Deploy to Vercel by importing the `agi-onedesk` folder — no environment variables or database are required.
