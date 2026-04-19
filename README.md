# 🌾 SDV Farms — Phase 1 + Phase 2 Marketplace

A bilingual (English + Telugu) agricultural land investment platform with a two-sided marketplace — sellers can list verified land, buyers can browse, wishlist, and book site visits.

**Live:** [sdv-farms.vercel.app](https://sdv-farms.vercel.app)

---

## Features

### Phase 1 — Marketing & Leads
| Feature | Details |
|---|---|
| Bilingual UI | English ↔ Telugu toggle throughout |
| Hero section | Animated paddy, mangoes, coconut trees, bullock cart |
| Enquiry form | Saves to Supabase + email via Resend |
| AI Chatbot | Google Gemini 2.0 Flash — answers SDV Farms questions |
| WhatsApp button | Click-to-chat with pre-filled message |
| Google Maps | Embedded location |
| Mobile & PWA | Responsive layout; installable app; offline shell |

### Phase 2 — Marketplace
| Feature | Details |
|---|---|
| Seller registration | Role choice (Buyer / Seller), land eligibility check, Farmer / Agent sub-type |
| Property listing | 3-step form — Location → Land Details → Documents & Photos |
| Document upload | Supabase Storage (`property-docs`, `property-photos`) |
| Browse properties | Public listing page with filter sidebar (state, soil, area, price) |
| Property detail | Full page with photo gallery, pricing, wishlist toggle (max 2) |
| Appointment booking | Date + 1-hr slot picker, 2-hr delay rule, email confirmation |
| Buyer land request | Anonymous or logged-in request form matched by admin |
| Seller dashboard | Listings, view counts, appointment tracking |
| Admin panel | Properties (approve / assign IDs), Appointments, Buyer Requests tabs |
| Services page | Phase II services catalog + Phase III coming-soon teaser |
| Route protection | `/seller`, `/admin`, `/dashboard` protected by `src/proxy.js` |
| Notifications | Centralised `src/lib/notify.js` — email today, SMS/WhatsApp-ready tomorrow |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS (custom `paddy-*`, `turmeric-*`, `marigold-*` palette) |
| Database + Auth | Supabase (free tier) — PostgreSQL + Row Level Security |
| Storage | Supabase Storage (`property-docs`, `property-photos`) |
| AI Chatbot | Vercel AI SDK + Google Gemini 2.0 Flash (free tier) |
| Email | Resend (free tier) |
| Hosting | Vercel (free tier) |
| Testing | Jest + React Testing Library (unit) · Playwright (E2E) |
| CI/CD | GitHub Actions — test → e2e → build → auto-tag → release |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/yasshu317/sdv-farms.git
cd sdv-farms
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
# Supabase — https://supabase.com → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Google Gemini — https://aistudio.google.com/apikey
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Resend — https://resend.com
RESEND_API_KEY=re_...
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Supabase Setup

### Phase 1 tables

```sql
create table profiles (
  id uuid references auth.users primary key,
  full_name text, email text, phone text,
  created_at timestamptz default now()
);
create table enquiries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  name text, email text, phone text, message text,
  status text default 'pending',
  created_at timestamptz default now()
);
create table plots (
  id uuid default gen_random_uuid() primary key,
  plot_number int, area_sqyds numeric, price_per_sqyd numeric,
  status text default 'available',
  created_at timestamptz default now()
);

alter table enquiries enable row level security;
alter table profiles enable row level security;
alter table plots enable row level security;

create policy "Anyone can submit enquiry" on enquiries for insert with check (true);
create policy "Users see own enquiries" on enquiries for select using (auth.uid() = user_id);
create policy "Anyone can read plots" on plots for select using (true);
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
```

### Phase 2 tables

Run the full migration file:

```
supabase/migrations/phase2_marketplace.sql
```

This creates: `seller_properties`, `appointments`, `buyer_wishlist`, `buyer_requests` — all with RLS, indexes, `updated_at` triggers, and `jsonb metadata` columns for future extensibility.

### Storage buckets

In Supabase → Storage, create two **public** buckets:

| Bucket | Purpose |
|---|---|
| `property-docs` | Pahani, Adangal, RTC land documents |
| `property-photos` | Property photos |

### Auth URL configuration

In Supabase → Authentication → URL Configuration:

- **Site URL:** `https://sdv-farms.vercel.app`
- **Redirect URLs:**
  ```
  https://sdv-farms.vercel.app/**
  https://*.vercel.app/**
  http://localhost:3000/**
  ```

---

## Admin Setup

1. Register at `/auth/register` with your email
2. Confirm email
3. Run in Supabase SQL Editor:

```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
where email = 'your@email.com';
```

4. Sign out and back in → redirects to `/admin`

---

## Testing

### Unit tests (Jest + React Testing Library)

```bash
npm test                  # run once
npm run test:watch        # watch mode
npm run test:coverage     # with coverage report
```

| Test file | What it covers |
|---|---|
| `content.test.js` | EN/TE key completeness, no empty translations |
| `supabase.test.js` | Throws if env vars are missing |
| `locations.test.js` | locations.json structure validity |
| `notify.test.js` | Email template rendering, unknown type handled |
| `StatusBadge.test.jsx` | All 9 status labels + className prop |
| `appointmentSlots.test.js` | 2-hr delay rule, PM slot logic, date range |
| `eligibility.test.js` | All 7 blocked land types, Agriculture allowed |

### E2E tests (Playwright)

```bash
npm run test:e2e          # run headless
npm run test:e2e:ui       # open Playwright UI
npm run test:e2e:report   # view last HTML report
```

| Spec file | What it covers |
|---|---|
| `home.spec.js` | Navbar links, language toggle, CTA |
| `register.spec.js` | 3-step flow, eligibility block, password validation |
| `properties.spec.js` | Browse page, filter panel, empty state |
| `services.spec.js` | Phase II grid, Phase III teaser, notify form |
| `buyer-request.spec.js` | Form fields, location cascades, submit |
| `seller-property.spec.js` | Auth guards on `/seller`, `/admin` |

---

## CI/CD Pipeline

Every push / PR to `main` runs:

```
Jest (45 tests) ─┐
                  ├─ both pass ──► Build ──► Auto-tag + Release
Playwright (47) ─┘
```

- **`feat:` commits** → minor version bump (e.g. `v0.1.0 → v0.2.0`)
- **`BREAKING CHANGE` / `major:`** → major bump
- **everything else** → patch bump
- Playwright failures upload HTML report + screenshots + video to GitHub Actions artifacts (14-day retention)

---

## Mobile & PWA

| Piece | Location |
|---|---|
| Web App Manifest | `src/app/manifest.js` |
| Service worker | `public/sw.js` |
| Registration | `src/components/PWARegister.jsx` |
| Dynamic PNG icons | `/api/icon?size=192`, `/api/icon?size=512` |

**Install on phone:**
- Android: Chrome menu → **Install app**
- iPhone: Safari Share → **Add to Home Screen**

---

## Logo & Brand Assets

Static files in `public/brand/`:

| File | Use |
|---|---|
| `sdv-farms-mark.svg` | Square logo mark |
| `sdv-farms-wordmark.svg` | Horizontal logo + tagline |

**Download from GitHub:** [public/brand](https://github.com/yasshu317/sdv-farms/tree/main/public/brand) → open file → **Raw** → save.

**PNG icons:** `https://sdv-farms.vercel.app/api/icon?size=512`

---

## Project Structure

```
e2e/                          # Playwright E2E specs
supabase/
└── migrations/
    └── phase2_marketplace.sql  # Phase 2 DB migration
public/
├── brand/                    # SVG logos + brand README
├── sw.js                     # PWA service worker
└── favicon.svg
src/
├── app/
│   ├── page.jsx              # Home page
│   ├── layout.jsx            # Root layout
│   ├── api/
│   │   ├── chat/route.js     # AI chatbot
│   │   ├── notify/route.js   # Email notification endpoint
│   │   ├── send-enquiry/     # Enquiry form email
│   │   └── icon/route.js     # Dynamic PNG icon generator
│   ├── auth/
│   │   ├── login/page.jsx
│   │   └── register/page.jsx # 3-step role + eligibility flow
│   ├── properties/
│   │   ├── page.jsx          # Browse listings (server)
│   │   ├── PropertiesClient.jsx  # Filter sidebar + cards
│   │   └── [id]/             # Property detail + wishlist + booking
│   ├── seller/
│   │   ├── page.jsx          # Seller dashboard (server)
│   │   ├── SellerClient.jsx
│   │   └── property/new/     # 3-step listing form
│   ├── buyer-request/page.jsx # Land requirement form
│   ├── services/
│   │   ├── page.jsx          # Server wrapper
│   │   └── ServicesClient.jsx  # Phase II + III page
│   ├── dashboard/            # Buyer dashboard
│   └── admin/                # Admin panel (6 tabs)
├── components/
│   ├── AppointmentPicker.jsx # Date + slot picker
│   ├── Navbar.jsx            # Bilingual + role-aware
│   ├── ChatBot.jsx           # AI widget
│   ├── PWARegister.jsx
│   └── ui/
│       ├── StatusBadge.jsx   # Color-coded status pill
│       ├── StepForm.jsx      # Multi-step form shell
│       ├── FileUpload.jsx    # Supabase Storage upload
│       └── FilterPanel.jsx   # Composable filter sidebar
├── context/
│   └── LanguageContext.jsx   # EN/TE toggle
├── data/
│   ├── content.js            # All bilingual strings (EN + TE)
│   └── locations.json        # State → District → Mandal (AP, TS, KA)
├── lib/
│   ├── supabase.js           # Browser client
│   ├── supabase-server.js    # Server client
│   └── notify.js             # Notification abstraction (email → SMS-ready)
└── proxy.js                  # Route protection (middleware)
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Gemini key from aistudio.google.com |
| `RESEND_API_KEY` | Yes | Resend key — server-only, never expose to client |

---

*Built with Next.js · Supabase · Tailwind CSS · Vercel AI SDK · Playwright*
