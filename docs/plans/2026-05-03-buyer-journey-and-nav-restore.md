# SDV Farms — Buyer Journey & Nav Restore Plan
**Date:** May 2026  
**Baseline tag:** `v0.2.8-pre-ux-merge`

---

## Overview

Three layered improvements:

1. **Restore homepage Navbar** to the richer v0.2.8 style (transparent→white scroll, all section anchors, language toggle, Book a Visit CTA)
2. **Buyer Pre-Purchase Guidance** — new `/buy-guide` page with area selection, rates, land types, cultivation info so a first-time buyer can self-educate before enquiring
3. **Deal Pipeline** — structured 3-party flow: Farmer states price → SDV adds margin → Buyer sees final price → Token fee → Full payment → Registration agreement

---

## What We Are NOT Doing

- Payment gateway (Razorpay etc.) — Phase 3 only; Phase 1-2 use WhatsApp/call CTA
- Litigation API integration — SDV team handles offline, system tracks status
- OTP / mobile verification — Phase 3 backlog
- Telugu translation of new pages — add keys to content.js but fill EN first

---

## Phase 1 — Restore Navbar (no backend, 1 day)

### What changes

**File:** `src/components/Navbar.jsx`

| Feature | Old (v0.2.8) | Current | Action |
|---|---|---|---|
| Scroll behaviour | Transparent → white | Always dark | Restore `scrolled` state + conditional classes |
| Section links | About, Why Invest, Benefits, Highlights, Gallery, Contact | ❌ Missing | Re-add `react-scroll` Links |
| Language toggle | ✅ Desktop + mobile | Mobile only | Restore desktop toggle |
| Book a Visit CTA | ✅ Gold button | ❌ Missing | Re-add `btn-gold` |
| "My Dashboard" pill | ❌ Missing | ✅ Present | Keep current improvement |

**Exact nav order to restore (desktop):**
```
Properties | Services | Land Request | List Your Land
  [divider]
About | Why Invest | Benefits | Highlights | Gallery | Contact
  [lang toggle] [Account/Sign in] [📅 Book a Visit]
```

**Mobile drawer order:**
```
Properties → Services → Land Request → List Your Land
[divider]
About → Why Invest → Benefits → Highlights → Gallery → Contact
[divider]
My Dashboard / Sign in | Sign out
[Book a Visit gold button]
```

### Success Criteria
- [ ] Nav is transparent over hero, turns solid white after scrolling 32px
- [ ] All 6 section anchors scroll smoothly on homepage
- [ ] Language toggle works on desktop
- [ ] "Book a Visit" button visible on desktop and mobile
- [ ] On inner pages (Properties, Seller, Dashboard) — SiteHeader remains dark as-is (no change)
- [ ] No regressions in Playwright E2E: `npm run test:e2e`

---

## Phase 2 — Buyer Pre-Purchase Guide (new page, mostly content, 2 days)

### New route: `/buy-guide`

A single, well-structured page that answers the questions a first-time buyer has *before* they look at listings. Replaces the need to call SDV for basic orientation.

### Page sections

#### 2.1 — Area Selector (Which area suits me?)
- Interactive state/district grid: user picks use case (farming, investment, weekend farm)
- Each use case maps to recommended regions with brief rationale
- Example: "Farming → West Godavari, Nalgonda | Investment → ORR corridor, Visakhapatnam hinterland"
- **Implementation:** Static content in `src/data/area-guide.js`, rendered as interactive cards
- CTA: "Browse properties in this area" → `/properties?state=XX`

#### 2.2 — Rate Reference (How do I know if the rate is correct?)
- Table: current indicative rates per acre by state + soil type
- Source: SDV admin updates this (a simple JSON file `src/data/rate-guide.js`)
- Disclaimer: "Rates are indicative. SDV verifies each listing price independently."
- Links to: "See live listings" → `/properties`

#### 2.3 — Land Types Explained
- Cards: Agriculture / Estate Agriculture / Industrial / Commercial / Residential
- Each: what it means, who can buy, typical use, typical price range
- Blocked types: Poramboke, Forest, Ceiling — why they can't be listed

#### 2.4 — Cultivation Guide (What can I grow?)
- By soil type: Black (cotton, soybean), Red (groundnut, millet), Sandy (vegetables, turmeric), Mixed
- By region: Andhra (rice, sugarcane), Telangana (cotton, maize), Karnataka (ragi, sunflower)
- Brief, visual card layout

#### 2.5 — The SDV Process (Step by step)
This is the full buying journey from enquiry to registration — makes the deal pipeline transparent:

```
Step 1: Browse listings → enquire or book site visit
Step 2: SDV verifies documents + title (legal check) — 3-5 working days
Step 3: If clean, SDV shares full report with buyer
Step 4: Rate negotiation — SDV coordinates between buyer and farmer
Step 5: Token amount paid → Agreement with possession drafted
Step 6: Registration at Sub-Registrar Office
```

Each step: status icon, who does what, timeline, what buyer needs to provide.

### Nav integration
- Add "Buy Guide" link to SiteHeader nav for non-logged-in / buyer users
- Add "How to Buy" quick action card in buyer dashboard Overview tab

### Files to create/modify
```
src/app/buy-guide/page.jsx          (new — server component, SEO metadata)
src/app/buy-guide/BuyGuideClient.jsx (new — interactive sections)
src/data/area-guide.js              (new — static content)
src/data/rate-guide.js              (new — editable rate table)
src/components/SiteHeader.jsx       (add Buy Guide link)
src/app/dashboard/DashboardClient.jsx (add "How to Buy" quick action)
src/data/content.js                 (add nav key + i18n stubs)
```

### Success Criteria
- [ ] `/buy-guide` loads with all 5 sections
- [ ] Area selector filters link correctly to `/properties?state=XX`
- [ ] Rate table shows at minimum AP, TS, KA × Black, Red, Sandy
- [ ] Page is mobile-responsive
- [ ] "How to Buy" quick action appears in buyer dashboard
- [ ] Build passes: `npm run build`

---

## Phase 3 — Deal Pipeline (backend + UI, 3-4 days)

### The 3-party model

```
Farmer (Seller) ──price ask──► SDV Admin ──adds margin──► Buyer sees final price
                                    │
                            Buyer pays token fee
                                    │
                            SDV coordinates legal check
                                    │
                            Full payment + Registration agreement
```

### 3.1 Admin — Price Negotiation Panel

New section in Admin panel: "Deals"

For each approved property, admin can set:
- `farmer_asking_price` (per acre, pulled from listing or manually entered)
- `sdv_margin_percent` or `sdv_margin_fixed`
- `buyer_price` (computed: farmer price + margin)
- `status`: `open | negotiating | token_received | agreement_signed | registered | closed`

**DB table: `deals`**
```sql
id, property_id, buyer_id, seller_id,
farmer_asking_price, sdv_margin, buyer_price,
token_amount, token_paid_at,
full_payment_amount, full_paid_at,
legal_status (clean|pending|litigation),
agreement_signed_at, registration_date,
notes, status, created_at, updated_at
```

### 3.2 Buyer — Deal Tracker in Dashboard

New tab in buyer dashboard: **"My Deals"** (🤝)

Shows for each deal:
- Property (linked)
- Price breakdown: Farmer price + SDV fee = Total (shown only after token paid)
- Current step with visual progress: `Enquired → Documents Verified → Price Agreed → Token Paid → Agreement → Registered`
- Documents checklist (what buyer needs to bring)
- Next action CTA (call SDV, pay token via WhatsApp, etc.)

### 3.3 Legal Verification Checklist

In the deal record (admin side):
- [ ] Pahani / ROR-1B received
- [ ] Title search done (N generations)
- [ ] Encumbrance certificate clear
- [ ] No litigation found
- [ ] Road access confirmed on ground

Buyer sees a summary: "✅ Documents verified" or "⏳ Verification in progress (3-5 days)"

### 3.4 Token Fee Flow (Phase 3A — no payment gateway)

- Buyer sees: "To proceed, pay a token amount of ₹X,XXX to secure this property"
- CTA: "Pay via WhatsApp" → opens WhatsApp with pre-filled message including deal ID
- Admin marks `token_paid_at` in admin panel
- Buyer dashboard updates to next step

### 3.5 Token Fee Flow (Phase 3B — payment gateway, future)
- Razorpay integration
- Auto-mark `token_paid_at` on webhook confirmation

### Files to create/modify
```
supabase/migrations/deals_table.sql   (new)
src/app/admin/AdminClient.jsx         (add Deals tab)
src/app/dashboard/DashboardClient.jsx (add My Deals tab)
src/app/dashboard/page.jsx            (fetch deals)
src/app/admin/page.jsx                (fetch deals)
```

### Success Criteria
- [ ] Admin can create a deal linked to a property + buyer
- [ ] Admin can set farmer price + margin + buyer price
- [ ] Admin can update deal status and legal checklist
- [ ] Buyer sees deal in dashboard with correct step indicator
- [ ] "Pay token" CTA opens WhatsApp with deal ID pre-filled
- [ ] Migration applies clean: check Supabase dashboard

---

## Implementation Order

| Phase | Effort | Blocks | Priority |
|---|---|---|---|
| 1 — Restore Navbar | 0.5 day | Nothing | **Do first** |
| 2 — Buy Guide page | 1.5 days | Nothing | **Do second** |
| 3A — Deal pipeline (no payment) | 2 days | Phase 2 done | After review |
| 3B — Payment gateway | 2 days | Phase 3A done | Later |

---

## Open Decisions (need confirmation before Phase 3)

1. **Token amount** — fixed (e.g. ₹5,000) or % of land price? Who decides?
2. **Legal check** — SDV does it internally or hires a lawyer per deal? Timeline?
3. **Agreement type** — Agreement for Sale with possession only, or also part payment receipts?
4. **Price visibility** — Does buyer see farmer's asking price + SDV margin as a breakdown, or just the final price?

---

## References
- Baseline: `git show v0.2.8-pre-ux-merge:src/components/Navbar.jsx`
- Current nav: `src/components/Navbar.jsx`
- Current SiteHeader: `src/components/SiteHeader.jsx`
- Buyer dashboard: `src/app/dashboard/DashboardClient.jsx`
- Admin panel: `src/app/admin/AdminClient.jsx`
