# AGI OneDesk

**AGI OneDesk** — Anwar Group of Industries HRMS + ESS + Performance (KPI) platform.
A fully interactive prototype modelled on PeopleDesk, driven by the *KPI Management System BRD*,
the *HRMS Goal Worksheet* and the *Variable Income KPI* specification.

## Stack

- **Next.js 15** (App Router) · **TypeScript** · **Tailwind CSS**
- Client-side state with **Zustand** + `localStorage` persistence (no database required)
- Deploys to Vercel with zero configuration

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

## Demo accounts

Password for all accounts: **`demo1234`** (prototype only).

| Role | Email |
|---|---|
| Super Admin | superadmin@anwargroup.net |
| System Admin | sysadmin@anwargroup.net |
| HR Admin | hradmin@anwargroup.net |
| Finance Admin | financeadmin@anwargroup.net |
| Audit Admin | auditadmin@anwargroup.net |
| Department Head (Growth Analytics) | nasrin.islam@anwargroup.net |
| Employee (Growth Analytics) | jafrin.alam@anwargroup.net |
| Employee (Human Resources) | tania.karim@anwargroup.net |

The default signed-in user is **Jafrin Alam Prima** (Growth Analytics).

## Highlights

- PeopleDesk-style shell: sidebar navigation, header, module bar, cards, tables, filters, drawers, status badges, approvals.
- **KPI / Goals** — the six-step traceable flow `Target → Actual → Evidence → Score → Review → Approval`,
  evidence with SHA-256, adjustment history, version control, audit trail, performance summary and leaderboard.
- **Variable Income** — capped scoring (`Weightage × MIN(Achievement%, 1)`), grades, sign-offs and export.
- ESS: attendance, leave & movement, loans & advances, expenses, documents, payslips, requests, grievances, profile.
- HRMS: employees, recruitment/ATS, training, confirmation, transfer & promotion, separation, rewards & discipline.
- Administration: organisation, users & roles, KPI configuration, grade bands, approval pipelines, audit, versions.
- Reports with filters and CSV export; notifications; announcements and policies; templates; helpdesk; tasks; assets; cafeteria; GRC.

## Notes

- This is a **prototype**: authentication, payroll processing and external integrations are simulated client-side.
- Data persists in the browser (`localStorage`, key `agi-onedesk-v2`). Use **Reset demo data** in the user menu to restore the seed.

See `docs/` for the analysis and implementation documentation.
