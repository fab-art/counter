# RSSB ERP Deployment Audit

Audit date: 2026-06-18
Deployment ID reviewed: `cpt1:cpt1::dk2tx-1781774133470-fad4b1418f37`

## Root Cause Analysis

The repository is a monorepo-style layout. The deployable Next.js application is not at the repository root; it is located at `apps/web`.

A root-level Vercel configuration file was missing. If Vercel targets the repository root without an explicit Root Directory of `apps/web`, it will not auto-detect the Next.js app from the root. That can produce a deployment with no valid Next.js route output for `/`, causing the deployed URL to return `404: NOT_FOUND` even though the app source exists in the repository.

The exact deployment root cause is therefore:

```text
Vercel is targeting the wrong directory or lacks root-level monorepo build configuration.
Correct Next.js application directory: apps/web
Correct homepage route file: apps/web/src/app/page.tsx
```

## Repository Structure Report

```text
/workspace/counter
├── .github/workflows/ci.yml
├── .env.local                         # local only; must be mirrored in Vercel env settings
├── vercel.json                        # root Vercel monorepo deployment config
├── docs/
│   ├── deployment-audit.md
│   └── implementation-plan.md
└── apps/web/
    ├── package.json                   # Next.js scripts and dependencies
    ├── package-lock.json
    ├── next.config.ts
    ├── tsconfig.json
    ├── src/app/layout.tsx             # App Router root layout exists
    ├── src/app/page.tsx               # App Router homepage exists
    ├── src/app/dashboard/page.tsx
    ├── src/app/(auth)/login/page.tsx
    └── src/lib/supabase.ts
```

## Deployment Configuration Report

### Next.js application verification

| Check | Status | Result |
| --- | --- | --- |
| Next.js app exists | PASS | `apps/web/package.json` contains `next` dependency and Next scripts. |
| `app/page.tsx` exists | PASS | `apps/web/src/app/page.tsx` exists and redirects `/` to `/dashboard`. |
| `app/layout.tsx` exists | PASS | `apps/web/src/app/layout.tsx` exists and renders the root document. |
| `next.config.ts` exists | PASS | `apps/web/next.config.ts` exists. |
| Production build artifacts | PASS | `npm run build --prefix apps/web` generates `.next` output. |

### Vercel configuration

The repository now includes root-level `vercel.json` so Vercel can deploy correctly even when the Vercel project Root Directory is set to the repository root.

```json
{
  "framework": "nextjs",
  "installCommand": "npm install --prefix apps/web",
  "buildCommand": "npm run build --prefix apps/web",
  "outputDirectory": "apps/web/.next"
}
```

Recommended Vercel dashboard setting:

```text
Root Directory: apps/web
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
Node.js Version: 24.x
```

If the Vercel project must keep repository root as the Root Directory, the committed root `vercel.json` should be used and the dashboard should not override its install/build/output commands.

## Environment Variable Report

The application requires these variables for production deployment:

| Variable | Required | Source / Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL used by browser and build verification. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key used by browser and build verification. |
| `SUPABASE_SERVICE_ROLE_KEY` | Future server-only workflows | Required for privileged server-side operations; do not expose to browser. |
| `NEXT_PUBLIC_APP_NAME` | Optional | Display/config metadata. |
| `NEXT_PUBLIC_APP_ENV` | Optional | Environment label. |
| `SUPABASE_UPLOAD_BUCKET` | Future imports | Upload bucket name. |
| `SUPABASE_EXPORT_BUCKET` | Future reports | Export bucket name. |
| `NEXT_PUBLIC_ENABLE_OFFLINE_MODE` | Optional | Feature flag. |
| `NEXT_PUBLIC_ENABLE_PWA` | Optional | Feature flag. |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Optional | Feature flag. |
| `NEXT_PUBLIC_MATCH_THRESHOLD` | Future analytics | Matching threshold. |
| `NEXT_PUBLIC_AUTO_APPROVE_THRESHOLD` | Future verification | Auto approval threshold. |
| `NEXT_PUBLIC_DEFAULT_PAGE_SIZE` | Optional | Default pagination size. |

Local `.env.local` contains the required Supabase public variables. Vercel does not read this local file automatically; the same variable names must be configured in Vercel Project Settings for Production, Preview, and Development as appropriate.

## Fixes Required

1. Keep the committed root-level `vercel.json` so root-targeted Vercel deployments can find, install, build, and serve the `apps/web` Next.js app.
2. In the Vercel dashboard, prefer setting Root Directory to `apps/web`. If that is not changed, ensure Vercel uses the committed root `vercel.json` commands.
3. Configure required Supabase environment variables in Vercel Project Settings.
4. Redeploy the failed deployment after these configuration changes.
5. Verify that `/` resolves to the app and redirects to `/dashboard` instead of returning `404: NOT_FOUND`.

## Go/No-Go Deployment Status

STATUS = GO AFTER REDEPLOY

The application source, App Router files, build scripts, and production build are present and valid. The 404 cause is deployment targeting/configuration, not a missing homepage route. With the root Vercel monorepo configuration committed and/or the Vercel Root Directory set to `apps/web`, the homepage should load successfully after redeployment.
