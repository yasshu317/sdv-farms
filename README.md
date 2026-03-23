# 🌾 SDV Farms — Phase 1

A bilingual (English + Telugu) agricultural land investment marketing website with buyer registration, admin panel, and AI chatbot.

**Live:** [sdv-farms.vercel.app](https://sdv-farms.vercel.app)

---

## Features

| Feature | Details |
|---|---|
| Bilingual UI | English + Telugu toggle throughout |
| Hero section | Animated paddy, mangoes, coconut trees, bullock cart |
| Enquiry form | Saves to Supabase + email via Resend |
| **Mobile & PWA** | Responsive layout; installable app; offline-friendly shell |
| AI Chatbot | Google Gemini 2.0 Flash — answers SDV Farms questions |
| WhatsApp button | Click-to-chat with pre-filled message |
| Google Maps | Embedded location |
| Buyer registration | Email/password auth via Supabase |
| Buyer dashboard | Enquiry status, plot interests, journey tracker |
| Admin panel | Manage leads, buyers, plot inventory |
| Route protection | Middleware guards `/dashboard` and `/admin` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Database + Auth | Supabase (free tier) |
| AI Chatbot | Vercel AI SDK + Google Gemini 2.0 Flash |
| Email notifications | Resend (free tier) |
| Hosting | Vercel (free tier) |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/sdv-farms.git
cd sdv-farms
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```env
# Google Gemini — https://aistudio.google.com/apikey
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Resend — https://resend.com (enquiry emails from API route)
RESEND_API_KEY=re_...

# Supabase — https://supabase.com → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Set up Supabase

Create a free project at [supabase.com](https://supabase.com) and run this SQL:

```sql
-- Tables
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
create table plot_interests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  plot_id uuid references plots,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Row Level Security
alter table enquiries enable row level security;
alter table profiles enable row level security;
alter table plot_interests enable row level security;
alter table plots enable row level security;

create policy "Anyone can submit enquiry" on enquiries for insert with check (true);
create policy "Users see own enquiries" on enquiries for select using (auth.uid() = user_id);
create policy "Users see own interests" on plot_interests for all using (auth.uid() = user_id);
create policy "Anyone can read plots" on plots for select using (true);
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
```

### 4. Add sample plots (optional)

```sql
insert into plots (plot_number, area_sqyds, price_per_sqyd, status) values
(1, 150, 4500, 'available'),
(2, 200, 4500, 'available'),
(3, 150, 4500, 'reserved'),
(4, 250, 4200, 'available'),
(5, 180, 4500, 'sold');
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Mobile & PWA

The site is **mobile-first responsive** (Tailwind breakpoints). There is no separate native app repo — the **same Next.js app** is the mobile experience in the browser.

### Install on phone (Add to Home Screen)

| Platform | Steps |
|----------|--------|
| **Android (Chrome)** | Open the live site → menu (⋮) → **Install app** or **Add to Home screen** |
| **iPhone (Safari)** | Open the live site → Share → **Add to Home Screen** |

After install, it opens in **standalone** mode (full screen, like an app). Shortcuts in the web manifest include *Book a Visit* and *My Dashboard*.

### What powers “mobile app” behaviour

| Piece | Location / note |
|-------|------------------|
| Web App Manifest | `src/app/manifest.js` — name, colours, icons, `display: standalone` |
| Service worker | `public/sw.js` — caches key pages for basic offline shell |
| Registration | `src/components/PWARegister.jsx` in root layout |
| Icons (PNG) | Generated at runtime: `/api/icon?size=192` and `?size=512` |
| Apple icon | `src/app/apple-icon.jsx` → `/apple-icon` |

### Test on a real device

1. Deploy to Vercel (or use your machine with a tunnel like `ngrok` for HTTPS).
2. Open the **HTTPS** URL on the phone — PWA install requires a secure context.

---

## Logo & brand assets (download)

Static files live in **`public/brand/`** in this repo:

- **`sdv-farms-mark.svg`** — square mark (good for app icon–style use)
- **`sdv-farms-wordmark.svg`** — horizontal logo + tagline
- **`public/brand/README.md`** — full asset table and colour reference

**Download from GitHub:** [public/brand](https://github.com/yasshu317/sdv-farms/tree/main/public/brand) → open a file → **Raw** → save.

**PNG icons from production** (right-click → save image):

- `https://sdv-farms.vercel.app/api/icon?size=512`
- `https://sdv-farms.vercel.app/api/icon?size=192`

---

## Admin Setup

1. Register at `/auth/register` with your email
2. Confirm your email (check inbox)
3. Run in Supabase SQL Editor:

```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
where email = 'your@email.com';
```

4. Sign out and sign back in → redirects to `/admin`

---

## Supabase Auth URL Configuration

In Supabase → Authentication → URL Configuration:

- **Site URL:** `https://sdv-farms.vercel.app`
- **Redirect URLs:**
  ```
  https://sdv-farms.vercel.app/**
  https://*.vercel.app/**
  http://localhost:3000/**
  ```

---

## Deployment (Vercel)

1. Push to GitHub (`main` branch)
2. Connect repo to [vercel.com](https://vercel.com)
3. Set **Framework Preset** → Next.js
4. Add all environment variables in Vercel → Settings → Environment Variables
5. Deploy

---

## Project Structure

```
public/
├── brand/                    # Downloadable logos (SVG) + brand README
├── sw.js                     # PWA service worker
└── favicon.svg
src/
├── app/
│   ├── page.jsx              # Home page
│   ├── layout.jsx            # Root layout + metadata
│   ├── globals.css           # Global styles + animations
│   ├── api/chat/route.js     # AI chatbot API route
│   ├── auth/
│   │   ├── login/page.jsx    # Login page
│   │   ├── register/page.jsx # Register page
│   │   └── callback/route.js # Supabase OAuth callback
│   ├── dashboard/
│   │   ├── page.jsx          # Buyer dashboard (server)
│   │   └── DashboardClient.jsx
│   └── admin/
│       ├── page.jsx          # Admin panel (server)
│       └── AdminClient.jsx
├── components/
│   ├── ClientApp.jsx         # Root client wrapper
│   ├── Navbar.jsx            # Bilingual navbar + auth menu
│   ├── Hero.jsx              # Hero + floating agri decorations
│   ├── EnquiryForm.jsx       # Contact form → Supabase + Resend API
│   ├── ChatBot.jsx           # AI chatbot widget
│   └── ...                   # About, Gallery, Location, etc.
├── context/
│   └── LanguageContext.jsx   # EN/TE language toggle
├── data/
│   └── content.js            # All bilingual text content
├── lib/
│   ├── supabase.js           # Browser Supabase client
│   └── supabase-server.js    # Server Supabase client
└── middleware.js             # Route protection
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Gemini AI key from aistudio.google.com |
| `RESEND_API_KEY` | Yes | Resend API key (server-only; enquiry emails) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |

---

*Built with Next.js · Supabase · Vercel AI SDK · Tailwind CSS*
