# RSSB ERP Architecture & Deployment Review — 2026-06-19

## 1. Executive Summary
The RSSB Pharmacy Counter Verification ERP has successfully established its technical foundation (Next.js 14, Supabase, Drizzle, Tailwind). The build is stable and passing (`npm run build` succeeds). However, the project is currently designated as **NO-GO** for production readiness due to critical security gaps (missing RLS, mock credentials), architectural inconsistencies (direct Supabase calls in UI), and role misalignment with the target requirements.

## 2. Requirement Compliance Report
| Requirement | Status | Note |
|---|---|---|
| **Auth System** | Partially Implemented | UI exists; mock credentials present; Middleware route protection incomplete. |
| **RBAC** | Partially Implemented | Roles (`LEAD_OFFICER`, etc.) do not match target (`TEAM_LEAD`, etc.). |
| **Dashboard** | Partially Implemented | UI shells exist; some components still use mock data or direct DB calls. |
| **Case Management** | Partially Implemented | Core schema and list views exist; persistence logic needs hardening. |
| **Reporting** | Partially Implemented | Export utilities and UI exist; data integration pending. |
| **Claim Import** | Missing | No Excel parser or upload workflow implemented in UI. |

## 3. Architecture Review
*   **Clean Architecture:** Violated in several pages (`executive`, `facilities`, `medicines`, `verification`) where `supabase-js` is called directly from the component.
*   **Separation of Concerns:** Repository and Service layers exist but are bypassed.
*   **Folder Structure:** Correctly follows Clean Architecture (app, components, services, repositories, database).

## 4. Database Health Report
*   **Schema:** Drizzle schema is comprehensive but missing some performance indexes on foreign keys (`uploads.facilityId`, `verification_queue.claimId`).
*   **Migrations:** SQL migration files are missing from the repository.
*   **Constraints:** Foreign key constraints are correctly defined in Drizzle.

## 5. Supabase Readiness Report
*   **Authentication:** Functional, but relies on a singleton client.
*   **RLS Policies:** **MISSING.** No SQL policies found in the repo to enforce data isolation.
*   **Storage:** Buckets are referenced in code but configuration/creation scripts are missing.

## 6. Environment Review
*   **.env.example:** Present and accurate for basic connectivity.
*   **env.ts:** **MISSING.** No Zod-based environment validation found, increasing runtime risk.
*   **Hardcoded Values:** Mock credentials found in `authService.ts`.

## 7. Build Validation Report
*   **npm install:** PASS
*   **npm run lint:** PASS (with warnings)
*   **npm run type-check:** PASS
*   **npm run test:** PASS (9/9 tests)
*   **npm run build:** PASS

## 8. Deployment Risk Report
*   **Vercel:** Configuration present, but monorepo Root Directory setting must be verified as `apps/web`.
*   **Database:** High risk of drift due to missing migration files.
*   **Connectivity:** Pre-build Supabase check passes.

## 9. Security Review
*   **Hardcoded Secrets:** Mock credentials `admin@example.com` / `password123` in `authService.ts`.
*   **Authorization:** Middleware only enforces ADMIN role for `/users` and `/settings`. Other roles are not strictly enforced at the route level.
*   **Data Leakage:** High risk due to lack of RLS.

## 10. Performance Review
*   **Queries:** Dashboard performs multiple head-only queries; could be optimized into a single RPC or view.
*   **Rendering:** Recharts used with `next/dynamic` to avoid hydration issues (PASS).
*   **Pagination:** Implemented in `dataService` but not consistently used in all UI tables.

## 11. Future Sprint Compatibility
*   **Sprint 3 (Verification):** At risk due to architecture violations in the workspace page.
*   **Sprint 0 (Stabilization):** Still requires alignment of role enums.

## 12. Technical Debt Register
*   **CRITICAL:** Mock credentials in `authService.ts`.
*   **HIGH:** Architecture violations (Direct Supabase calls in UI).
*   **HIGH:** Missing SQL Migrations and RLS policies.
*   **MEDIUM:** Incomplete RBAC role mapping.
*   **LOW:** ESLint warnings (unused variables).

## 13. Recommended Fixes
1.  **Security:** Immediately remove mock credentials from `authService.ts`.
2.  **Architecture:** Refactor `dashboard/executive`, `facilities`, `medicines`, and `verification` pages to use `claimRepository` and `dataService`.
3.  **Database:** Export current database schema and RLS policies as SQL migrations.
4.  **Configuration:** Create `src/lib/env.ts` for Zod environment validation.
5.  **Alignment:** Update `roleEnum` in `schema.ts` to: `ADMIN`, `MANAGER`, `TEAM_LEAD`, `OFFICER`, `AUDITOR`.

## 14. Go / No-Go Decision
**Status: NO-GO**

**Reason:** Critical security (mock credentials, no RLS) and architecture (Repository bypass) issues must be resolved before this can be considered production-ready.
