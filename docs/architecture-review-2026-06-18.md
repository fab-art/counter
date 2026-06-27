# RSSB Pharmacy Counter Verification ERP — Architecture & Deployment Review

**Date:** June 18, 2026
**Auditor:** Lead Software Architect
**Status:** **NO-GO**

---

## 1. Executive Summary

The RSSB Pharmacy Counter Verification ERP has established a solid UI foundation and a partially implemented backend using Next.js, Supabase, and Drizzle ORM. However, several critical gaps prevent it from being production-ready. The most significant blockers are the complete absence of Row-Level Security (RLS) policies, architecture violations where UI components bypass the repository layer, and inconsistencies in the environment configuration (Node version mismatch, missing Zod-validated environment config).

---

## 2. Requirement Compliance Report

*   **Implemented:**
    *   Basic Authentication (pilot state).
    *   Dashboard shells.
    *   Case and Claim data models.
    *   Verification workspace (Three-panel layout).
    *   Basic Reporting module.
*   **Missing / Partially Implemented:**
    *   **RBAC Alignment:** Roles currently use pilot names (`LEAD_OFFICER`, `TECHNICAL_OFFICER`) instead of target names (`TEAM_LEAD`, `OFFICER`, `AUDITOR`).
    *   **Persistence:** Many pages still rely on mock data or partial implementations.
    *   **Auditing:** Coverage is incomplete; many actions (e.g., report generation) are not yet audited.
*   **Future Recommendation:** Align role model immediately and replace all remaining mock data with repository-backed queries.

---

## 3. Architecture Review

*   **Pattern:** Clean Architecture (Repository/Service/UI) is established but inconsistently followed.
*   **Violations:** Direct Supabase queries found in:
    *   `apps/web/src/app/dashboard/executive/page.tsx`
    *   `apps/web/src/app/dashboard/facilities/page.tsx`
    *   `apps/web/src/app/dashboard/medicines/page.tsx`
    *   `apps/web/src/app/cases/[id]/verification/[claimId]/page.tsx` (delete finding)
*   **Preservation:** Scalability is preserved in the repository layer, but UI-coupled queries will make future transitions (e.g., to a different data source) difficult.

---

## 4. Database Health Report

*   **Drizzle Schema:** Well-defined tables and relations.
*   **Indexes:** Proper indexes on `claims` (status, claim_number, patient_id, facility_id, case_id) and `audit_logs` (user_id, action, entity).
*   **Constraints:** Foreign keys and non-null constraints are correctly applied.
*   **Gaps:** SQL migrations and RLS policy definitions are missing from the repository.

---

## 5. Supabase Readiness Report

*   **Connectivity:** Build-time check (`verify-supabase.ts`) passes.
*   **Authentication:** Pilot credentials (`admin@example.com` / `password123`) must be removed.
*   **RLS Policies:** **CRITICAL MISSING BLOCKER**. No RLS policies are defined, posing a severe security risk.
*   **Storage:** Buckets for uploads and exports are mentioned but not fully integrated into workflows.

---

## 6. Environment Review

*   **Config Validation:** `apps/web/src/lib/env.ts` (Zod-based validation) is missing.
*   **Node Version:** CI uses Node 20; project requirement is Node 24.
*   **Secrets:** No secrets exposed in code, but `.env.example` needs updating for all future analytics/threshold variables.

---

## 7. Build Validation Report

*   **Status:** PASS with warnings.
*   **Warnings:** Multiple unused variables and ESLint warnings in verification and report pages.
*   **Type-Check:** Passes (`tsc --noEmit`).

---

## 8. Deployment Risk Report

*   **Vercel Configuration:** Root `vercel.json` is missing, which may cause deployment failures if the Vercel Root Directory is not manually set to `apps/web`.
*   **Environment Variables:** Heavy reliance on Supabase public keys; server-side role keys not yet fully utilized for secure operations.

---

## 9. Security Review

*   **Authentication:** Middleware protects routes but does not verify JWT signatures in the pilot state.
*   **Authorization:** RBAC is enforced at the UI level and partially in middleware, but lacks the backend enforcement layer (RLS).
*   **Injection:** Drizzle/Supabase usage minimizes SQL injection risks.
*   **Risk:** HIGH (due to missing RLS).

---

## 10. Performance Review

*   **Queries:** `claimRepository` correctly implements pagination with `.range()`.
*   **Rendering:** Charts in dashboards use dynamic imports, which is good for initial load performance.
*   **N+1:** Relations are mostly handled via joins or subsequent single-row fetches.

---

## 11. Future Sprint Compatibility

*   **Data Model:** Current `claims` and `findings` tables are compatible with Sprints 3-6.
*   **Scalability:** The repository pattern will support the Network Analysis (Sprint 7) and Executive Dashboard (Sprint 10) once architecture violations are fixed.

---

## 12. Technical Debt Register

| Issue | Severity | Type |
| --- | --- | --- |
| Missing RLS Policies | Critical | Security |
| Architecture Violations (Direct queries) | High | Architecture |
| Node Version Mismatch (20 vs 24) | Medium | Environment |
| Missing Environment Validation (`env.ts`) | Medium | Reliability |
| Hardcoded Pilot Credentials | Medium | Security |
| Unused Code/Warnings | Low | Clean Code |

---

## 13. Recommended Fixes

1.  **Implement RLS:** Define and apply Row-Level Security policies for all tables in `schema.ts`.
2.  **Refactor Architecture Violations:** Move all direct `supabase.from` calls from Page components to their respective repositories.
3.  **Upgrade Node:** Update `.github/workflows/ci.yml` and Vercel settings to Node 24.
4.  **Create env.ts:** Implement Zod validation for all environment variables.
5.  **Stabilize Root Deployment:** Add the missing root `vercel.json` to ensure monorepo deployment stability.

---

## 14. Go / No-Go Decision

**Status: NO-GO**

**Reason:** The absence of RLS policies and the presence of direct database queries in the UI layer violate the project's security and architecture standards. These must be addressed before the project can be considered production-ready or before moving to Sprint 3 (Verification Workspace completion).
