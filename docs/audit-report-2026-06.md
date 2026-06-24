# RSSB ERP Continuous Architecture & Deployment Review Report

**Date:** June 18, 2026
**Status:** **NO-GO**

---

## 1. Executive Summary
The RSSB Pharmacy Counter Verification ERP is currently in a "Partial Foundation" state. While the build system is stable and the UI framework is robust, there are significant gaps between the required enterprise architecture and the current implementation. Critical blockers include missing Row Level Security (RLS) policies, a mismatch in the role-based access control (RBAC) model, and direct database access violations in UI components. Furthermore, several advanced modules (Investigations, Task Assignments, Fraud Alerts) described in system documentation are absent from the current codebase.

---

## 2. Requirement Compliance Report
*   **Implemented:** Core UI for Dashboard, Case Management, Claims, and Reports; Supabase Auth integration; Basic Audit Logging.
*   **Missing:** Investigation Module, Task Management, Fraud Alert Engine, Cross-Facility Matching, Network Analysis.
*   **Partially Implemented:** RBAC (roles exist but names don't match target requirements); Case/Claim workflows (UI exists but persistence is inconsistent).
*   **Future Recommendation:** Align `roleEnum` immediately to `TEAM_LEAD`, `OFFICER`, and `AUDITOR` to prevent downstream refactoring of all permission checks.

---

## 3. Architecture Review
*   **Violation:** Direct Supabase queries bypassing the service/repository layer were found in:
    *   `src/app/dashboard/executive/page.tsx`
    *   `src/app/dashboard/medicines/page.tsx`
    *   `src/app/dashboard/facilities/page.tsx`
    *   `src/app/cases/[id]/verification/[claimId]/page.tsx`
    *   `src/app/(auth)/reset-password/reset-password-form.tsx`
*   **Status:** Clean Architecture is partially maintained but requires refactoring of the analytics and verification workspace pages into the `dataService` or `claimRepository`.

---

## 4. Database Health Report
*   **Status:** **CRITICAL CONCERN**
*   **Issues:**
    *   Drizzle `schema.ts` and `database.types.ts` are out of sync (e.g., `verification_batches` and `claim_medicines` exist in types but not in schema).
    *   Missing tables for Sprints 5-10: `investigations`, `investigation_evidence`, `fraud_alerts`, `task_assignments`.
    *   `officer_metrics` exists but lacks the granularity required for the target productivity module.
*   **Migrations:** No SQL migration files found in the repository.

---

## 5. Supabase Readiness Report
*   **Authentication:** Functional, but `reset-password` bypasses the service layer.
*   **Storage:** References to buckets exist but implementation of upload/export workflows is incomplete.
*   **RLS Policies:** **MISSING**. No RLS definitions or `ENABLE ROW LEVEL SECURITY` statements found in the codebase.
*   **Connectivity:** Build-time verification script is active and passing.

---

## 6. Environment Review
*   **.env.example:** Present and accurate.
*   **Validation:** **FAIL**. `src/lib/env.ts` with Zod validation is missing, violating deployment protocol.
*   **Hardcoding:** No hardcoded credentials detected in the audited files.

---

## 7. Build Validation Report
*   **`npm run lint`:** PASS (with minor unused variable warnings).
*   **`npm run type-check`:** PASS.
*   **`npm run test`:** PASS (9 tests).
*   **`npm run build`:** PASS.
*   **Status:** The application builds successfully in the sandbox environment.

---

## 8. Deployment Risk Report
*   **Root Directory:** Monorepo requires Vercel "Root Directory" to be set to `apps/web`.
*   **Connectivity:** Build fails if Supabase URL/Key are not in Vercel environment variables due to the `prebuild` check.
*   **PWA:** `manifest.json` and `sw.js` are present but not fully integrated into the Next.js build pipeline.

---

## 9. Security Review
*   **RBAC:** Enforced via `usePermissions` and Middleware, but role names are non-compliant (`TECHNICAL_OFFICER` instead of `OFFICER`).
*   **RLS:** **NOT ENFORCED**. This is the highest security risk; all database tables are currently vulnerable to unauthorized access if the anon key is leaked.
*   **Secrets:** `SUPABASE_SERVICE_ROLE_KEY` is correctly excluded from client-side bundles.

---

## 10. Performance Review
*   **Queries:** Direct UI queries lack pagination and proper error handling.
*   **Rendering:** Use of `useEffect` for data fetching in Client Components is present; should be moved to Server Components.
*   **Indexes:** Indexes are defined in `schema.ts` for `claims` and `cases`, which is positive for scale.

---

## 11. Future Sprint Compatibility
*   **Sprint 5-7:** Current data model is **NOT COMPATIBLE**. It lacks the link between claims and investigations/fraud alerts.
*   **Sprint 9-10:** Metrics tables need expansion to support advanced executive and productivity views.

---

## 12. Technical Debt Register
*   **Critical:** Missing RLS policies; Roles mismatch.
*   **High:** Missing environment validation (`env.ts`); Out-of-sync schema/types.
*   **Medium:** Direct Supabase calls in UI; Unused variables in build.
*   **Low:** Static UI mocks for User Management and Dashboard metrics.

---

## 13. Recommended Fixes
1.  **Immediate:** Align `roleEnum` in `schema.ts` with requirements: `ADMIN`, `MANAGER`, `TEAM_LEAD`, `OFFICER`, `AUDITOR`.
2.  **Security:** Define and apply SQL migrations to `ENABLE ROW LEVEL SECURITY` on all tables.
3.  **Refactor:** Move all `.from('...')` calls from `apps/web/src/app` into `src/services/data.ts`.
4.  **Stability:** Create `apps/web/src/lib/env.ts` using Zod to validate `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5.  **Synchronization:** Re-generate `database.types.ts` from the Drizzle schema to ensure consistency.

---

## 14. Go / No-Go Decision
**Status: NO-GO**

**Reasoning:** The absence of RLS policies and the mismatch in core RBAC roles represent critical security and architectural blockers. The build passes, but the application is not production-ready for an enterprise environment until the database security layer and role model are aligned with the RSSB ERP standards.
