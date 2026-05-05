# SDV Farms — AI Agent Instructions

This file is read by Claude, OpenAI Codex, GitHub Copilot, Cursor, and all AI coding assistants.

## Project Overview

SDV Farms is a **bilingual (English + Telugu) agricultural land marketplace** with a two-sided model — sellers post verified land listings, buyers browse/filter/wishlist/book, and admins manage approvals.

- **Live URL:** https://sdv-farms.vercel.app
- **Stack:** Next.js 16 (App Router) · Tailwind CSS · Supabase · Resend · Playwright
- **Language:** JavaScript (JSX) only — never TypeScript

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16, App Router | All pages in `src/app/` |
| Styling | Tailwind CSS | Custom `paddy-*`, `turmeric-*`, `marigold-*`, `terracotta-*` palette |
| Database + Auth | Supabase (`@supabase/ssr`) | Browser: `src/lib/supabase.js`, Server: `src/lib/supabase-server.js` |
| Storage | Supabase Storage | Buckets: `property-docs`, `property-photos` (both public) |
| Chat widget | Static FAQ + quick replies (client-side, no external AI) | `src/components/ChatBot.jsx` |
| Email | Resend | `src/app/api/send-enquiry/route.js` + `src/app/api/notify/route.js` |
| Unit tests | Jest + React Testing Library | `src/__tests__/` |
| E2E tests | Playwright | `e2e/` · config in `playwright.config.js` |
| CI/CD | GitHub Actions | `.github/workflows/ci.yml` |
| Hosting | Vercel (free tier) | |

---

## Project Structure

```
e2e/                          # Playwright E2E specs
supabase/migrations/          # SQL migration files
src/
├── app/
│   ├── page.jsx              # Home page
│   ├── layout.jsx            # Root layout + PWA meta
│   ├── api/
│   │   ├── send-enquiry/route.js  # Enquiry email
│   │   ├── notify/route.js   # General notification email
│   │   └── icon/route.js     # Dynamic PWA PNG icons
│   ├── auth/
│   │   ├── login/page.jsx
│   │   ├── register/page.jsx # 3-step: role → eligibility → form
│   │   └── callback/route.js
│   ├── properties/
│   │   ├── page.jsx          # Server wrapper (force-dynamic)
│   │   ├── PropertiesClient.jsx  # Filter + cards
│   │   └── [id]/
│   │       ├── page.jsx
│   │       └── PropertyDetailClient.jsx  # Photos, wishlist, booking
│   ├── seller/
│   │   ├── page.jsx          # Server wrapper
│   │   ├── SellerClient.jsx  # Dashboard
│   │   └── property/new/page.jsx  # 3-step listing form
│   ├── buyer-request/page.jsx
│   ├── services/
│   │   ├── page.jsx          # Server wrapper
│   │   └── ServicesClient.jsx
│   ├── dashboard/            # Buyer portal
│   └── admin/                # Admin / ops hub (AdminClient; staff + admin)
├── components/
│   ├── AppointmentPicker.jsx # Date + 1-hr slot grid, 2-hr delay rule
│   ├── Navbar.jsx            # Bilingual + role-aware (buyer/seller/admin/staff)
│   ├── ChatBot.jsx
│   ├── PWARegister.jsx
│   └── ui/
│       ├── StatusBadge.jsx   # Color-coded status pill
│       ├── StepForm.jsx      # Reusable multi-step form shell
│       ├── FileUpload.jsx    # Supabase Storage file uploader
│       └── FilterPanel.jsx   # Composable filter sidebar
├── context/
│   └── LanguageContext.jsx   # EN/TE toggle — default: { lang: 'en', toggle: () => {} }
├── data/
│   ├── content.js            # ALL bilingual text — content.en.* and content.te.*
│   └── locations.json        # State → District → Mandal (AP, TS, KA)
├── lib/
│   ├── supabase.js           # createClient() for browser
│   ├── supabase-server.js    # createClient() for server
│   ├── supabase-admin.js     # Service role client — SERVER API ROUTES ONLY
│   ├── roles.js              # isAdminOrStaff, isAdminOnly
│   ├── authRedirects.js      # homePathForRole (admin + staff → /admin)
│   ├── plotDisplay.js        # Acres from sq.yd (÷ 4840)
│   └── notify.js             # Notification abstraction — sendNotification({ to, type, data })
└── proxy.js                  # Route protection (`export async function proxy` — Next middleware)
```

---

## Key Conventions

### Language
- All code is **JavaScript + JSX** — never TypeScript
- Add `'use client'` to any component using hooks, browser APIs, or interactivity
- Server components (no directive) for data-fetching pages; always add `export const dynamic = 'force-dynamic'`

### Page Pattern — Server Wrapper + Client Component
```
src/app/some-feature/page.jsx          → server wrapper (export const dynamic, metadata)
src/app/some-feature/SomeClient.jsx    → 'use client' component with hooks/interactivity
```

### Bilingual Content
- ALL user-facing text lives in `src/data/content.js`
- Structure: `content.en.section.key` and `content.te.section.key`
- Both `en` and `te` must have **identical keys** — the `content.test.js` will fail otherwise
- Telugu script only (no transliteration)
- Apply `className={lang === 'te' ? 'telugu' : ''}` on Telugu text elements

### Supabase Patterns
```js
// Browser (client components)
import { createClient } from '../lib/supabase'
const supabase = createClient()

// Server (server components / API routes)
import { createClient } from '../../lib/supabase-server'
const supabase = await createClient()
```

### Notification Pattern
```js
// Always use notify.js — never call Resend directly from components
import { sendNotification } from '../lib/notify'
await sendNotification({
  to: user.email,
  type: 'appointment_confirmed',   // see TEMPLATES in notify.js
  data: { date, slot, propertyId, type: 'buyer' }
})
```

### Tailwind Custom Colors
```
paddy-*      → green tones  (primary brand, CTAs)
turmeric-*   → golden/yellow (accent, highlights)
marigold-*   → orange tones
terracotta-* → warm brown
cream        → background
```

### File Upload Pattern
```jsx
<FileUpload
  bucket="property-docs"           // Supabase Storage bucket name
  folder={`docs/${userId}`}        // Storage path prefix
  accept="docs"                    // 'docs' | 'photos'
  maxFiles={3}
  onUpload={urls => setDocUrls(urls)}
/>
```

### API Routes
- App Router format only: `export async function POST(req) { ... }`
- Always handle errors: `return Response.json({ error: err.message }, { status: 500 })`

### Hydration Safety
- Never use `Math.random()` or `Date.now()` in JSX render
- Use `const [mounted, setMounted] = useState(false)` + `useEffect` for client-only decorations

---

## Supabase Tables

### Phase 1
| Table | Key Columns |
|---|---|
| `profiles` | `id`, `full_name`, `email`, `phone`, `occupation` (phase 8) |
| `enquiries` | `id`, `user_id`, `name`, `phone`, `email`, `message`, `status` |
| `plots` | `plot_number`, `area_sqyds`, `price_per_sqyd`, `status` + verification columns (phase 8) |

### Phase 2
| Table | Key Columns |
|---|---|
| `seller_properties` | `id`, `seller_id`, `property_id` (SDV-YYYY-NNN), `state/district/mandal/village`, `land_used_type`, `land_soil_type`, `area_acres`, `expected_price`, `doc_urls[]`, `photo_urls[]`, `status`, `views`, `metadata jsonb`, `seller_interest` (phase 8) |
| `appointments` | `user_id`, `property_id`, `appointment_date`, `time_slot`, `appointment_type`, `status`, … + `assigned_to`, `related_buyer_request_id`, `sla_target_at` (phase 8) |
| `buyer_wishlist` | `id`, `buyer_id`, `property_id` — max 2 per buyer |
| `buyer_requests` | Preferred search: `state/district/mandal`. Plus `buyer_residence_city/state/notes`, `ops_comment`, `sdvf_status`, `sdvf_reason` (phase 8). |

### Phase 8 (migration `phase8_admin_ops_hub.sql`)
| Table | Notes |
|---|---|
| `buyer_request_notes` | Internal thread per request; RLS admin + staff |
| Policies | Several tables widened from admin-only to **admin + staff**; plots get admin/staff manage policy |

Requires phase 3 tables (`service_bookings`, `payment_orders`) for the last policy swaps in that file.

### Phase 9 (`phase9_feature_flags.sql`) — Feature flags / remote config
| Table | Notes |
|---|---|
| `feature_flags` | Stable `key`, `enabled`, `payload` (JSON — **public** via `GET /api/feature-flags`, no secrets), `metadata` JSON for extra internal fields without new columns, `sort_order`. RLS: world-readable `SELECT`; admin + staff INSERT/UPDATE/DELETE. Manage in Admin → **Flags**. |

Bundled seeds include `home_stats_bar` (toggles navbar `HomeStatsBar` stats ribbon when enabled).

All Phase 2 tables have: RLS policies · `updated_at` trigger · `jsonb metadata` for future fields without migrations (where originally added).

---

## Auth & Roles

| Role | `user_metadata.role` | Default redirect |
|---|---|---|
| Buyer | `buyer` | `/dashboard` |
| Seller | `seller` | `/seller` |
| Operations | `staff` | `/admin` |
| Admin | `admin` | `/admin` |

Route protection is in `src/proxy.js` (`isAdminOrStaff` for `/admin`; **staff** cannot access `/seller`).

Elevated UI logic uses `src/lib/roles.js`: **staff** has no Users tab, no approve/reject, no `/admin/property/new`. **`/api/admin/users`** remains **admin-only** (listing + PATCH roles).

To promote a user:
```sql
update auth.users set raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb where email = 'x@x.com';
-- or "staff" for ops
```

---

## Environment Variables

| Variable | Side | Used In |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | `supabase.js`, `supabase-server.js` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | `supabase.js`, `supabase-server.js` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server **only** | `supabase-admin.js`, `/api/admin/users` listing, migrations tooling |
| `RESEND_API_KEY` | Server | `api/send-enquiry/route.js`, `api/notify/route.js` |

Never put `RESEND_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*` variables.

---

## Cursor (this repo)

- **Rules:** `.cursor/rules/` — `sdv-farms.mdc` (stack + patterns), `content.mdc`, `admin-auth-rls.mdc`, `secrets.mdc`
- **Skills:** `.cursor/skills/` — e.g. `add-supabase-table`, `sdv-farms-admin-ops`, `add-notification`, `add-page`, `add-bilingual-content`

---

## Testing

```bash
npm test                  # Jest unit tests (45 tests)
npm run test:e2e          # Playwright E2E (47 tests)
npm run test:coverage     # Jest with coverage
```

CI runs: **Jest → Playwright → Build → Auto-tag** in that order.

---

## Do's and Don'ts

✅ DO:
- Keep all text in `content.js` — add both `en` and `te` keys together
- Use `server wrapper + *Client.jsx` pattern for every new page
- Add `export const dynamic = 'force-dynamic'` on all server pages with auth/data
- Use `sendNotification()` from `notify.js` for all emails
- Add `metadata jsonb` and `updated_at` trigger to every new Supabase table
- Write tests alongside every new feature (`src/__tests__/` for unit, `e2e/` for E2E)

❌ DON'T:
- Don't use TypeScript
- Don't commit passwords, API tokens, or service_role keys — use `.env.local` / CI secrets (`secrets.mdc` rule)
- Don't add `Math.random()` or `Date.now()` in JSX render (hydration errors)
- Don't expose `RESEND_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the client
- Don't hardcode English/Telugu text outside `content.js`
- Don't call Resend directly from components — always go through `notify.js`
- Don't put `'use client'` in a page file that needs `export const dynamic`
