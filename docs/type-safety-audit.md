# Verification Type-Safety Audit

Audit date: 2026-06-18

## Root Cause

The `never` errors came from Supabase query chains where table metadata was incomplete or absent from the generated database type map. When a table is not represented as a complete Supabase table definition, Supabase's generic query builder cannot infer valid `Row`, `Insert`, or `Update` shapes and falls back to `never` for write payloads and selected rows.

The affected verification code referenced domain objects that did not yet have explicit application interfaces and, in some cases, referenced tables that were present in service calls but not represented consistently across Supabase types and Drizzle schema definitions.

## Locations Audited

| Area | Result |
| --- | --- |
| `src/services/verification.ts` | Added explicit service return types and typed Supabase `.returns<T>()` calls. |
| `src/app/cases/[id]/verification/page.tsx` | Added a typed server-rendered verification queue page. |
| `src/app/cases/[id]/verification/[claimId]/page.tsx` | Added a typed server-rendered claim verification detail page. |
| `src/lib/database.types.ts` | Rebuilt table definitions with complete `Row`, `Insert`, `Update`, and `Relationships` metadata. |
| `src/database/schema.ts` | Added Drizzle definitions for facilities, uploads, claims, verification queue/results, findings, and officer metrics. |
| `src/types/verification.ts` | Added explicit verification domain interfaces. |

## Why Inference Failed

1. Supabase table definitions were incomplete for verification tables.
2. `findings` and `officer_metrics` were not represented in the Supabase generated type map before the audit.
3. Drizzle schema only covered early Sprint 1 entities and did not define the verification tables used by services.
4. Verification service methods did not have explicit return types and typed `.returns<T>()` calls.
5. React pages that consume verification data needed concrete `Claim`, `Finding`, `VerificationSession`, and `VerificationStats` shapes instead of relying on inferred query output.

## Types Added

- `Claim`
- `Finding`
- `VerificationSession`
- `VerificationStats`
- `OfficerPerformance`
- `ClaimVerificationDetail`
- `FindingInput`

## Tables Verified / Added to Type Maps

- `claims`
- `findings`
- `verification_queue`
- `verification_results`
- `officer_metrics`
- `facilities`
- `uploads`

## Files Fixed

- `apps/web/src/lib/database.types.ts`
- `apps/web/src/database/schema.ts`
- `apps/web/src/types/verification.ts`
- `apps/web/src/services/verification.ts`
- `apps/web/src/app/cases/[id]/verification/page.tsx`
- `apps/web/src/app/cases/[id]/verification/[claimId]/page.tsx`

## Remaining Issues

- Existing lint warnings remain in unrelated Sprint 1 UI/service files. They do not block `type-check` or `build`.
- The Supabase type file is hand-maintained in this repository. It should be regenerated from the live Supabase project once the production database migrations are finalized.
- Database migrations for the added Drizzle verification tables still need to be generated and applied as part of the production database hardening work.

## Validation

- `npm run type-check --prefix apps/web` completed with zero TypeScript errors.
- `npm run build --prefix apps/web` completed successfully and included the verification routes in the production route manifest.

## Status

STATUS = GO

The verification service and verification pages now compile with explicit domain types and typed Supabase query results. No `never` inference remains in the verification implementation.
