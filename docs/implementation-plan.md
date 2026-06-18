# RSSB Counter Verification ERP — Repository Inspection and Implementation Plan

Inspection date: 2026-06-18

## Current repository state

The repository is a Next.js App Router application under `apps/web` with TypeScript, Tailwind CSS, shadcn-style UI primitives, Supabase client integration, Drizzle schema definitions, Vitest, and a GitHub Actions CI workflow.

## Sprint 1 verification

| Capability | Status | Evidence | Gap |
| --- | --- | --- | --- |
| Authentication | Partial | Login, forgot password, and reset password screens exist and call Supabase-backed auth service. | No server-side route protection is enforced across protected pages; auth flows need integration tests beyond services. |
| RBAC | Partial | Role and permission helpers exist. | Role names do not match the requested target roles exactly (`TEAM_LEAD`, `OFFICER`, `AUDITOR` are missing); route, API, action, and report authorization enforcement is incomplete. |
| User Management | UI mock only | `/users` page renders a static table. | CRUD actions, Supabase persistence, audit logging, and role assignment workflows are missing. |
| Dashboard Foundation | UI mock only | `/dashboard` page renders cards and charts. | Dashboard uses static data rather than real cases, claims, findings, deductions, and productivity metrics. |
| Case Management | Partial UI/schema | Case schema exists and `/cases` pages render static case lists/details/create form. | Server actions, persistence, assignment workflow, filtering, pagination, and audit integration are incomplete. |
| Audit Framework | Partial schema/service/UI | `audit_logs` table schema and audit page exist. | Audit page uses mock data; action coverage is incomplete; report generation and verification actions are not audited yet. |

## Sprint 2 verification

| Capability | Status | Evidence | Gap |
| --- | --- | --- | --- |
| Claim Import | Not implemented in app surface | Data service references uploads and claims. | No import route/page, parser, import workflow, or server action found. |
| Excel Processing | Missing | No spreadsheet parser or validation module found. | Need XLSX parsing, row normalization, batch insertion, and error reporting. |
| Validation Engine | Missing | No validation service found. | Need row-level required field/type validation and import-level validation summary. |
| Claim Repository | Partial references only | Data service references `claims`. | Drizzle schema lacks claims/uploads/facilities definitions used by the service; no repository UI exists. |
| Claim Details | Missing | No claim detail route found. | Need claim detail page with import lineage, verification state, findings, and adjustments. |
| Import Auditing | Missing | Audit service exists but no import actions found. | Need auditable upload, validation, claim creation, and import error events. |
| Storage Integration | Partial script/config only | Supabase client and verification script exist. | Upload storage bucket interactions are not implemented in the user workflow. |

## Critical architecture gaps

1. The application currently contains static UI shells for many ERP areas, but most workflows are not backed by persistent Supabase data.
2. Drizzle schema and generated Supabase types are out of sync with service references to `facilities`, `claims`, `uploads`, `verification_queue`, and `verification_results`.
3. Target ERP roles differ from the current role enum and permission model.
4. Verification workspace, findings management, adjustment engine, duplicate detection, cross-facility matching, network analysis, reporting, executive dashboards, and production-grade CI/CD are not yet implemented.
5. CI uses Node 20, while the delivery requirement specifies Node 24.

## Implementation plan

### Phase 0 — Stabilize foundation

1. Align role model with target roles: `ADMIN`, `MANAGER`, `TEAM_LEAD`, `OFFICER`, `AUDITOR`.
2. Add missing database schema for facilities, imports/uploads, claims, verification statuses, findings catalog, findings, summaries, officer metrics, duplicate matches, cross-facility matches, network nodes, network edges, and report audit records.
3. Create safe migrations and seed/reference data for finding categories and finding types.
4. Replace mock dashboard/case/user/audit data with typed data-access functions and paginated queries.
5. Update CI to Node 24 and add `type-check` script.

### Phase 1 — Complete Sprint 2 claim import properly

1. Build `/claims/import` and `/claims` pages.
2. Implement Excel parsing for the provided source columns.
3. Implement validation with row-level errors and import summaries.
4. Store original files in Supabase Storage and import metadata in PostgreSQL.
5. Batch insert claims with indexes and audit all import actions.

### Phase 2 — Verification workspace and findings

1. Build `/cases/[id]/verification` with a paginated verification queue and claim review panel.
2. Add claim statuses: `UNREVIEWED`, `IN_PROGRESS`, `VERIFIED`, `FLAGGED`.
3. Implement findings entry using the master catalog.
4. Implement adjustment entry and calculated verification summaries.
5. Audit verification start, finding creation, adjustment changes, and submission.

### Phase 3 — Manager and executive analytics

1. Implement officer metrics and scheduled/transactional updates.
2. Replace static dashboard metrics with real progress, productivity, category trend, deduction, and monthly trend queries.
3. Build executive dashboard cards and facility risk rankings.

### Phase 4 — Detection engines

1. Implement duplicate detection for same patient/date/amount/paper code with scores and flags.
2. Implement cross-facility matching for same RAMA number across facilities, nearby dates, and similar amounts.
3. Generate patient-practitioner-facility network nodes and edges.
4. Build network visualization dashboard with server-side filtered graph queries.

### Phase 5 — Reporting and exports

1. Build report generation for cases, findings, deductions, officer performance, and fraud analysis.
2. Add CSV, Excel, and PDF exports.
3. Enforce report RBAC and audit every report generation.

### Phase 6 — Production hardening

1. Add RLS-compatible access patterns and policy documentation.
2. Add indexes for high-volume claim/finding history and all analytics joins.
3. Add unit, integration, and component tests for imports, verification, findings, reporting, analytics, auth, and RBAC.
4. Run and fix `npm install`, `npm run lint`, `npm run type-check`, `npm run test`, and `npm run build` under Node 24.
5. Produce deployment readiness review for Supabase and Vercel.

## Current delivery status

STATUS = NO-GO

The repository is not production-ready yet. The next implementation step should be Phase 0, starting with schema alignment and CI/type-check stabilization before adding verification workspace features.
