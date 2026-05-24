# Web flow — stakeholder document

**Source file (repo root):** [`../SDV_Farms_Web_Flow_Document.docx`](../SDV_Farms_Web_Flow_Document.docx)

Word doc = business feedback on nav, homepage stats, PDP, land request, dashboards, monetisation ideas, etc.

**Live product docs (derived, not a 1:1 of the Word file):**

- `/business/flows` · `/business/design` · `public/business-user-flows.html`

Track the `.docx` in git if stakeholders should always get the same version as the repo (`git add SDV_Farms_Web_Flow_Document.docx`).

## Deploy checklist — homepage KPI strip

Sold listings and enquiry totals need the SECURITY DEFINER function `public.public_marketing_stats()` from [`supabase/migrations/phase14_public_marketing_stats.sql`](../supabase/migrations/phase14_public_marketing_stats.sql). Apply it on Supabase. Until then, `/api/platform-stats` uses anon-safe fallback counts (sold may stay 0 without service role fallback).

Staff can flag **documents verified** and **physical / site verification** from **Admin → Properties → All details** or when editing **`/admin/property/[id]/edit`** (Documents step). Home “Clear” uses `seller_properties.doc_verified`; PDP physical badge reads `metadata.verification.physical`.
