# SDV Farms — agent cheat sheet

Bilingual EN/TE land marketplace. Live: sdv-farms.vercel.app  
Stack: Next 16 App Router · Tailwind · Supabase · Resend · Playwright · **JS/JSX only — no TS**

## Where things live

- `src/app/` pages · `src/components/` UI · `src/lib/` helpers · `src/data/content.js` (all copy en+te) · `src/data/locations.json` AP/TS/KA
- Auth: browser `lib/supabase.js` · server `lib/supabase-server.js` · service role **only** `lib/supabase-admin.js` + `/api/admin/users`
- Guards: `src/proxy.js`
- PWA `@ducanh2912/next-pwa` · root `manifest` / icons as in app/
- Biz docs: `/business`, `/business/flows`, `/business/design`; static `public/business-*.html`
- CI: `.github/workflows/ci.yml`

## Patterns

- Server page wrapper: `export const dynamic = 'force-dynamic'` + metadata; heavy UI → `*Client.jsx` + `'use client'`
- Email: **`sendNotification` from `lib/notify`** — never Resend raw in components
- Colors: `paddy-*`, `turmeric-*`, `marigold-*`, `terracotta-*`, `cream`
- Upload: `components/ui/FileUpload.jsx` buckets `property-docs` | `property-photos`
- Admin hub: `app/admin/AdminClient.jsx` · tabs = enquiries, users (admin-only), plots, properties, appointments, requests, flags, services
- **Admin-only** (staff hidden): Add property `/admin/property/new`, Excel bulk **`/admin/property/import`** (.xlsx, `exceljs` + `lib/excelPropertyImport.js`), **`/api/admin/users`**

## Roles → home

buyer→`/dashboard` · seller→`/seller` · admin|staff→`/admin` (`lib/authRedirects.js`, `lib/roles.js`)  
Staff: **no** `/seller`, **no** Users / approve-reject listings / property new/import. RLS phase8 widened admin+staff on ops tables.

## DB (nutshell)

profiles, enquiries, plots, seller_properties (listing + SDV‑YYYY‑NNN), appointments, buyer_wishlist, buyer_requests (+ notes, sdvf), service_bookings, feature_flags (`GET /api/feature-flags` public payload only). Schema: `supabase/migrations/`.

## Env

`NEXT_PUBLIC_SUPABASE_*` anon ok client · **`SUPABASE_SERVICE_ROLE_KEY`** + **`RESEND_API_KEY`** server only · never NEXT_PUBLIC_* for secrets

## Test / build

`npm test` · `npm run test:e2e` · `npm run build`

## Rules

✅ bilingual keys paired in content.js · server wrapper pattern · notify.js for mail · metadata jsonb + updated_at on new tables · tests with feature  
❌ TS · secrets in repo · Math.random/Date.now in SSR JSX · EN/TE hardcoded outside content.js · service role client in browser code

Cursor: `.cursor/rules/*.mdc` · **`caveman.mdc`** = terse chat output ([caveman](https://github.com/JuliusBrussee/caveman) rule mirror) · `.cursor/skills/`
