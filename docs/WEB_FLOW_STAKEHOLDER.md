# Web flow — stakeholder document

**Source file (repo root):** [`../SDV_Farms_Web_Flow_Document.docx`](../SDV_Farms_Web_Flow_Document.docx)

Word doc = business feedback on nav, homepage stats, PDP, land request, dashboards, monetisation ideas, etc.

**Live product docs (derived, not a 1:1 of the Word file):**

- `/business/flows` · `/business/design` · `public/business-user-flows.html`

Track the `.docx` in git if stakeholders should always get the same version as the repo (`git add SDV_Farms_Web_Flow_Document.docx`).

## Deploy checklist — homepage KPI strip

Sold listings and enquiry totals need the SECURITY DEFINER function `public.public_marketing_stats()` from [`supabase/migrations/phase14_public_marketing_stats.sql`](../supabase/migrations/phase14_public_marketing_stats.sql). Apply it on Supabase. Until then, `/api/platform-stats` uses anon-safe fallback counts (sold may stay 0 without service role fallback).

Staff can flag **documents verified** and **physical / site verification** from **Admin → Properties → All details** or when editing **`/admin/property/[id]/edit`** (Documents step). Home “Clear” uses `seller_properties.doc_verified`; PDP physical badge reads `metadata.verification.physical`.

## Shipped UX — hubs, services routing, KPI strip visuals

Keep this aligned with **`/business/flows`** (`src/app/business/flows/page.jsx`) when behaviour changes.

| Area | Current behaviour |
|------|-------------------|
| **`/list-your-land`** | **Public listing submission form** — no login required. Shareable URL for landowners/farmers. 2-step form: contact + location → land details + docs. Submissions go to **Admin → Leads** tab. Nav "List your land" points here (not to registration). Migration: `phase16_listing_submissions.sql`. |
| **`/` while signed in** | Redirect to **`/dashboard`**, **`/seller`**, or **`/admin`** per `homePathForRole` (see **`src/app/page.jsx`**). To see the **full marketing homepage** including stats strip anchors: **`/?stay=1`** or **`?browse=1`**. Navbar / SiteHeader logo points at the hub when a session exists. |
| **`/services`** | **Buyer** (not seller / admin / staff) → redirect **`/dashboard?services=1`** (embedded Phase II panel + scroll). Everyone else sees public **`/services`**. (**`src/app/services/page.jsx`**) |
| **Home KPI strip** | **`HomeStatsBar.jsx`** uses a **deep paddy + turmeric** treatment (consistent with homepage / listings), not a neutral gray slab; optional enquiry line stays secondary but readable. |
| **Listing cards & PDP CTAs** | **Book visit**, **shortlist** labels, **Enquire** (WhatsApp): **copy-led buttons** — no sparkle/heart glyphs in chrome ( **`PropertiesClient.jsx`**, **`PropertyDetailClient.jsx`** ). |
| **Admin → Leads tab** | New 7th tab in `/admin`. Shows all `listing_submissions` rows. Status: new → contacted → converted → rejected. Orange badge for unread. Inline notes. |

**Supabase:** sellers reading appointments on owned listings requires **`phase15_seller_select_listing_appointments.sql`** (`supabase/migrations/`).

**Phase 16 migration required** before merging `feat/public-listing-form`: run `supabase/migrations/phase16_listing_submissions.sql` in Supabase SQL editor. Creates `listing_submissions` table with anon-insert RLS + admin/staff read-update policy.

---

## Pending checklist — stakeholder phase 1 (close the loop)

Use this block to ship what we already built; merge PRs **after** confirming CI is green.

| # | Item | What’s needed to finish |
|---|------|--------------------------|
| 1 | **`feature/web-flow-stakeholder-phase1` merged to `main`** | Open/update PR → review → squash/merge per team rule → deploy from `main`. |
| 2 | **Supabase migration `phase14_public_marketing_stats`** | In Supabase SQL editor or CLI: run [`supabase/migrations/phase14_public_marketing_stats.sql`](../supabase/migrations/phase14_public_marketing_stats.sql) on **Stage** → verify `select * from public.public_marketing_stats();` → repeat on **Prod** after smoke test. |
| 3 | **Verify homepage KPI strip in prod** | After (2): hit `/api/platform-stats` (or load home) and confirm sold / enquiry numbers look right vs admin reality. If wrong, check RLS and that RPC exists. |
| 4 | **Stakeholder Word doc in repo (optional)** | If everyone should share one file version: `git add SDV_Farms_Web_Flow_Document.docx` → commit on a small PR (watch binary size / LFS). If not: keep local only and update this doc’s link when the file moves. |
| 5 | **Post-merge smoke test** | **Anonymous:** home KPI strip → `/properties` → PDP (**Book visit** / shortlist / **Enquire**). **Buyer signed in:** `/` redirects to **`/dashboard`** (use **`/?stay=1`** to re-check brochure home); **`/services`** redirects to **`/dashboard?services=1`**; Dashboard → Land shortlist. **Admin:** listing edit → Documents / verification flags. |

---

## Pending checklist — polish (same release or fast follow)

| # | Item | What’s needed to finish |
|---|------|--------------------------|
| 6 | **Buyer dashboard language parity** | Today shortlist/strings on `/dashboard` use `content.en` only (see [`src/app/dashboard/DashboardClient.jsx`](../src/app/dashboard/DashboardClient.jsx)). To finish: add `LanguageProvider` for dashboard (and/or persist `lang` e.g. `localStorage`), then replace `content.en` with `content[lang]`. |
| 7 | **Align static exports** | If you regenerate `public/business-user-flows.html` from `/business/flows`, do it after UX copy settles so HTML and JSX stay in sync. |

---

## Backlog — not in stakeholder phase 1 branch (product roadmap)

Stakeholder `.docx` themes that need **design + contracts + often paid vendors** — break into tickets before implementation.

| Area | Pending | What’s needed to finish |
|------|---------|-------------------------|
| Monetisation | Token / booking fee / subscription models | Decide pricing rules → payment provider (e.g. Razorpay already partially wired); legal copy; refunds; admin reporting. |
| Identity | SMS / OTP login | Provider (Twilio / MSG91 / etc.) → Supabase hooks or custom edge functions → rate limits → cost monitoring. |
| Dashboards | Single “unified” buyer + seller hub | IA workshop → navigation model → avoid duplicate state; likely large refactor. |
| Catalog | Listing IDs (e.g. `SDV-…-AGG(…)`) | Schema + migration + admin assignment rules + backward compatibility for existing `property_id`. |
| Trust | Richer sample PDFs, bulk verification import | Content pack + storage; optional admin CSV/Excel import tool + validation + audit log. |

---

## Quick reference — key files

| Topic | Location |
|-------|----------|
| Public listing form | [`src/app/list-your-land/page.jsx`](../src/app/list-your-land/page.jsx), [`src/components/listing/ListingSubmissionForm.jsx`](../src/components/listing/ListingSubmissionForm.jsx) |
| Listing submission API | [`src/app/api/listing-submissions/route.js`](../src/app/api/listing-submissions/route.js) |
| Listing submission upload | [`src/app/api/listing-submissions/upload/route.js`](../src/app/api/listing-submissions/upload/route.js) |
| Admin leads PATCH API | [`src/app/api/admin/listing-submissions/[id]/route.js`](../src/app/api/admin/listing-submissions/%5Bid%5D/route.js) |
| DB migration (phase 16) | [`supabase/migrations/phase16_listing_submissions.sql`](../supabase/migrations/phase16_listing_submissions.sql) |
| Public marketing stats API | [`src/app/api/platform-stats/route.js`](../src/app/api/platform-stats/route.js), [`src/lib/marketing-stats.js`](../src/lib/marketing-stats.js) |
| Home stats UI | [`src/components/HomeStatsBar.jsx`](../src/components/HomeStatsBar.jsx) |
| PDP verification | [`src/lib/propertyVerification.js`](../src/lib/propertyVerification.js), [`src/app/properties/[id]/PropertyDetailClient.jsx`](../src/app/properties/[id]/PropertyDetailClient.jsx) |
| Admin verification fields | [`src/components/admin/AdminPropertyForm.jsx`](../src/components/admin/AdminPropertyForm.jsx), [`src/app/seller/property/propertyFormConstants.js`](../src/app/seller/property/propertyFormConstants.js) |
| Land shortlist (wishlist) | [`src/lib/interestShortlist.js`](../src/lib/interestShortlist.js), [`src/app/dashboard/DashboardClient.jsx`](../src/app/dashboard/DashboardClient.jsx), [`src/app/dashboard/page.jsx`](../src/app/dashboard/page.jsx) |
