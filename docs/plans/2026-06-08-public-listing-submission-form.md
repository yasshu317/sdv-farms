# SDV Farms — Public Listing Submission Form
**Date:** 8 Jun 2026  
**Repo:** v0.9.1 · `main` @ f7e67e5  
**Parent handoff:** `docs/HANDOFF_2026-06-08.md`

---

## Overview

Any landowner or farmer should be able to submit their property details via a **shareable public link** — no account required. The form collects contact info + land details + document uploads. Submissions land in the admin panel as **"Listing Leads"** for SDV staff to review and convert into approved listings.

This resolves stakeholder feedback (25-May-2026 Web Test):
> *"List your Land - Asked me login and then I couldn't find any Icon to list my land details"*  
> *"List your Property Form Details: First and last Name, Mobile, Email, Document Upload, State, District, Mandal, Village, Location (Optional), Farmer Name as per Document, Farmer Phone number"*

---

## Desired End State

| What | Where |
|------|-------|
| Public form URL | `/list-your-land` |
| Shareable link | `https://sdv-farms.vercel.app/list-your-land` |
| Nav entry | "List Your Land" link in `Navbar` + `SiteHeader` (for anon + buyer users) |
| Admin view | New **"Listing Leads"** tab in `/admin` |
| Seller auto-invite | Optional: email landowner a registration invite after submission |

---

## What We Are NOT Doing

- No login/OTP required to submit (this is the whole point — public form)
- No auto-approval — admin manually reviews every lead before it becomes a live listing
- No payment to list (Phase 1)
- No OTP phone verification on the public form (deferred to Phase 3 per existing plan)
- Not replacing the existing `/seller/property/new` form — sellers with accounts still use that

---

## Current State

- `/seller/property/new` → `SellerPropertyForm.jsx` handles 3-step creation (Location → Land Details → Docs)
- Requires Supabase auth session — not accessible to unauthenticated users
- `propertyFormConstants.js` has all dropdown constants (states, soil types, land types, etc.) — reuse these
- `src/data/locations.json` has State → District → Mandal cascading data — reuse this
- `FileUpload` component (`src/components/ui/FileUpload.jsx`) handles Supabase Storage — reuse this

---

## Phase 1 — Database: `listing_submissions` Table

### Overview
New Supabase table to store public submissions, separate from `listings` (which are approved seller records).

### Migration: `supabase/migrations/phase16_listing_submissions.sql`

```sql
create table public.listing_submissions (
  id            uuid primary key default gen_random_uuid(),
  -- Contact info (the person submitting, may differ from farmer)
  submitter_first_name  text not null,
  submitter_last_name   text not null,
  submitter_mobile      text not null,
  submitter_email       text,
  -- Land & farmer details
  state         text not null,
  district      text not null,
  mandal        text not null,
  village       text not null,
  location_notes text,           -- optional (map link, landmark)
  farmer_name   text not null,   -- name as per land document
  farmer_phone  text,
  -- Land details
  land_used_type  text,
  land_soil_type  text,
  area_acres      numeric,
  expected_price  numeric,
  seller_interest text,
  road_access     boolean default false,
  -- Uploads (Supabase Storage public URLs)
  doc_urls      text[] default '{}',
  photo_urls    text[] default '{}',
  -- Admin workflow
  status        text not null default 'new',
  -- 'new' | 'contacted' | 'converted' | 'rejected'
  admin_notes   text,
  converted_listing_id uuid references public.listings(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- RLS: anon can INSERT, only authenticated admin/staff can SELECT/UPDATE
alter table public.listing_submissions enable row level security;

create policy "anon_submit"
  on public.listing_submissions for insert
  to anon, authenticated
  with check (true);

create policy "admin_manage"
  on public.listing_submissions for all
  to authenticated
  using (
    (auth.jwt() ->> 'role') in ('admin', 'staff')
  );

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger listing_submissions_updated_at
  before update on public.listing_submissions
  for each row execute procedure public.set_updated_at();
```

### Success Criteria

#### Automated Verification:
- [ ] Migration applies clean in Supabase: run `supabase/migrations/phase16_listing_submissions.sql` in SQL editor
- [ ] Anon insert succeeds (test in SQL editor with `set role anon`)
- [ ] Anon select returns 0 rows (RLS blocks reads)

---

## Phase 2 — Public Form Page `/list-your-land`

### Overview
A standalone, unauthenticated, bilingual-ready page. Uses existing form constants and location data. Simplified to 2 steps: **Contact + Location → Land Details + Docs**.

### Files to Create / Modify

#### 2.1 New page — `src/app/list-your-land/page.jsx`
Server component with SEO metadata.

```jsx
import { Metadata } from 'next'
import ListingSubmissionForm from '../../components/listing/ListingSubmissionForm'

export const metadata = {
  title: 'List Your Land — SDV Farms',
  description: 'Submit your agricultural land for listing on SDV Farms. No account needed.',
}

export default function ListYourLandPage() {
  return <ListingSubmissionForm />
}
```

#### 2.2 New client component — `src/components/listing/ListingSubmissionForm.jsx`

**Step 1 — Contact & Location:**
| Field | Required | Notes |
|-------|----------|-------|
| First Name | ✅ | submitter_first_name |
| Last Name | ✅ | submitter_last_name |
| Your Mobile | ✅ | submitter_mobile |
| Your Email | optional | submitter_email |
| State | ✅ | drives district/mandal cascade |
| District | ✅ | from locations.json |
| Mandal | ✅ | from locations.json |
| Village | ✅ | free text |
| Location Notes | optional | Google Maps link, landmark, survey no. |

**Step 2 — Land Details & Documents:**
| Field | Required | Notes |
|-------|----------|-------|
| Farmer Name (as per doc) | ✅ | farmer_name |
| Farmer Phone | optional | farmer_phone |
| Land Type | ✅ | reuse LAND_USED_TYPES |
| Soil Type | ✅ | reuse LAND_SOIL_TYPES |
| Area (acres) | ✅ | |
| Expected Price (₹/acre) | optional | |
| Road Access | optional | checkbox |
| Documents upload | optional | land docs, pahani etc. |
| Photos upload | optional | site photos |

**Submit:** `POST` to `/api/listing-submissions` (new API route).

**Success state:** Full-page thank-you with:
- "Your submission has been received. SDV team will call you within 2 working days."
- WhatsApp CTA: "Have questions? Chat with us"
- "Browse Properties" link back to `/properties`

#### 2.3 New API route — `src/app/api/listing-submissions/route.js`

```js
// POST /api/listing-submissions
// Body: form fields + doc_urls + photo_urls (already uploaded by FileUpload)
// Auth: none required
// Returns: { id: uuid }

import { createServerSupabaseClient } from '../../../lib/supabase-server'

export async function POST(req) {
  const body = await req.json()
  // basic validation
  // insert into listing_submissions
  // return 201 with { id }
}
```

#### 2.4 Nav links — `src/components/Navbar.jsx` + `src/components/SiteHeader.jsx`

Add **"List Your Land"** link:
- `Navbar`: show for anon + buyer users (hide for seller, admin who have their own workspace)
- `SiteHeader`: same logic
- Route: `/list-your-land`
- Style: same as existing nav text links; on mobile drawer, add before the divider

### Success Criteria

#### Automated Verification:
- [x] `npm run build` passes with no errors
- [ ] `/list-your-land` returns 200 for unauthenticated requests
- [ ] `POST /api/listing-submissions` with valid body returns 201 and inserts a row
- [ ] `POST /api/listing-submissions` with missing required fields returns 400

#### Manual Verification:
- [ ] Form is accessible at `https://sdv-farms.vercel.app/list-your-land` without login
- [ ] State → District → Mandal cascade works correctly
- [ ] File upload works (documents + photos saved to Supabase Storage)
- [ ] Submission stored in `listing_submissions` table (visible in Supabase dashboard)
- [ ] Thank-you screen shown after submit
- [ ] "List Your Land" nav link visible to logged-out visitors and buyers
- [ ] Nav link hidden for sellers and admins
- [ ] Form is mobile-responsive
- [ ] Bilingual text keys added to `src/data/content.js` (EN filled, TE can be `TODO`)

---

## Phase 3 — Admin: Listing Leads Tab

### Overview
New **"Leads"** tab in `/admin` where staff can see all submissions, update status, add notes, and convert a lead into a proper listing.

### Changes

#### 3.1 Admin page — `src/app/admin/AdminClient.jsx`

Add a **"Leads"** tab (badge count of `new` submissions):

**Table columns:** Submitted, Name, Mobile, State/District, Area, Status, Actions

**Row actions:**
- Mark as `contacted`
- Mark as `rejected`
- "Convert to Listing" → pre-fills `/seller/property/new` form with lead data (or creates listing directly in admin)

#### 3.2 Server fetch — `src/app/admin/page.jsx`

Add fetch for `listing_submissions` ordered by `created_at desc`.

#### 3.3 API route — `src/app/api/admin/listing-submissions/[id]/route.js`

```
PATCH /api/admin/listing-submissions/:id
Body: { status, admin_notes, converted_listing_id }
Auth: admin/staff only
```

### Success Criteria

#### Automated Verification:
- [x] PATCH endpoint returns 403 for non-admin callers (coded, verify after DB migration)
- [x] PATCH endpoint updates `status` and `admin_notes` correctly (coded, verify after DB migration)

#### Manual Verification:
- [ ] Admin sees "Leads" tab with count badge
- [ ] All submissions visible in table with correct data
- [ ] Status can be updated (new → contacted → converted/rejected)
- [ ] Notes field editable inline
- [ ] Converted submissions show linked listing

---

## Implementation Order

| Phase | Effort | Prerequisite | Priority |
|-------|--------|-------------|----------|
| 1 — DB migration | 30 min | — | **Do first** |
| 2 — Public form + API | 1 day | Phase 1 | **Do second** |
| 3 — Admin leads tab | 0.5 day | Phase 1 | After Phase 2 |

---

## How This Fits the Existing Plan

The [Buyer Journey & Nav Restore plan](./2026-05-03-buyer-journey-and-nav-restore.md) covers:
- Phase 1: Navbar restore ✅ (shipped)
- Phase 2: Buy Guide page (pending)
- Phase 3: Deal Pipeline (pending)

**This plan is a parallel workstream** — it does not block or depend on those phases. It can be implemented independently.

Nav work in this plan (adding "List Your Land" link) should be coordinated with the navbar work to avoid conflicts in `Navbar.jsx` and `SiteHeader.jsx`.

---

## Shareable URL

Once deployed:

```
https://sdv-farms.vercel.app/list-your-land
```

This URL can be:
- Sent over WhatsApp to landowners
- Added to SDV's printed flyers or business cards
- Posted on social media
- Used in outreach campaigns

---

## References

- Stakeholder test notes: 25-May-2026 (see images in handoff)
- Existing seller form: `src/components/seller/SellerPropertyForm.jsx`
- Form constants to reuse: `src/app/seller/property/propertyFormConstants.js`
- Locations data: `src/data/locations.json`
- FileUpload component: `src/components/ui/FileUpload.jsx`
- Admin panel: `src/app/admin/AdminClient.jsx`
- Handoff: `docs/HANDOFF_2026-06-08.md`
