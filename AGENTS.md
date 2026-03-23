# SDV Farms — AI Agent Instructions

This file is read by Claude, OpenAI Codex, GitHub Copilot, Cursor, and all AI coding assistants.

## Project Overview

SDV Farms Phase 1 is a **bilingual (English + Telugu) agricultural land investment website** with buyer registration, admin panel, AI chatbot, and PWA support.

- **Live URL:** https://sdv-farms.vercel.app
- **Stack:** Next.js 15 (App Router) · Tailwind CSS · Supabase · Vercel AI SDK · Resend · Vercel

### Mobile & logos (for docs / marketing)

- **Mobile:** Same responsive site + PWA (`manifest.js`, `public/sw.js`, `PWARegister.jsx`). No separate mobile repo.
- **Downloadable logos:** `public/brand/` — `sdv-farms-mark.svg`, `sdv-farms-wordmark.svg`, plus `public/brand/README.md`.
- **PNG icons:** `/api/icon?size=192` and `?size=512` on the deployed domain; Apple: `/apple-icon`.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15, App Router | All pages in `src/app/` |
| Styling | Tailwind CSS | Config in `tailwind.config.js` |
| Database + Auth | Supabase (`@supabase/ssr`) | Browser client in `src/lib/supabase.js`, server in `src/lib/supabase-server.js` |
| AI Chatbot | Vercel AI SDK v6 + Google Gemini 2.0 Flash | API route at `src/app/api/chat/route.js` |
| Email | Resend | API route at `src/app/api/send-enquiry/route.js` |
| Language | JavaScript (JSX) — NOT TypeScript | |
| Hosting | Vercel (free tier) | |

---

## Project Structure

```
src/
├── app/
│   ├── page.jsx              # Home — renders ClientApp
│   ├── layout.jsx            # Root layout, PWA meta tags
│   ├── manifest.js           # PWA manifest
│   ├── icon.jsx              # Favicon (Next.js ImageResponse)
│   ├── apple-icon.jsx        # iOS icon
│   ├── globals.css           # Global styles + Tailwind + keyframes
│   ├── api/
│   │   ├── chat/route.js     # AI chatbot (Gemini)
│   │   ├── send-enquiry/route.js  # Resend email
│   │   └── icon/route.js     # Dynamic PWA icons
│   ├── auth/
│   │   ├── login/page.jsx
│   │   ├── register/page.jsx
│   │   └── callback/route.js
│   ├── dashboard/            # Buyer portal
│   └── admin/                # Admin panel
├── components/
│   ├── ClientApp.jsx         # Root client wrapper ('use client')
│   ├── Navbar.jsx            # Bilingual + auth-aware navbar
│   ├── Hero.jsx              # Hero with floating SVG agri decorations
│   ├── EnquiryForm.jsx       # Contact form → Supabase + Resend
│   ├── ChatBot.jsx           # AI chatbot widget
│   └── PWARegister.jsx       # Service worker registration
├── context/
│   └── LanguageContext.jsx   # EN/TE toggle via React Context
├── data/
│   └── content.js            # ALL bilingual text — EN and TE
├── lib/
│   ├── supabase.js           # createClient() for browser
│   └── supabase-server.js    # createClient() for server
└── middleware.js             # Route protection (dashboard, admin)
```

---

## Key Conventions

### Language
- All code is **JavaScript + JSX** — never use TypeScript
- Add `'use client'` to any component using hooks, browser APIs, or interactivity
- Server components (no directive) for data fetching pages (dashboard, admin)

### Bilingual Content
- ALL user-facing text lives in `src/data/content.js`
- Structure: `content.en.section.key` and `content.te.section.key`
- Telugu script is used for all Telugu text (not transliteration)
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

### Tailwind Custom Colors
```
paddy-*     → green tones (primary brand)
turmeric-*  → golden/yellow tones (accent)
marigold-*  → orange tones
terracotta-* → warm brown tones
cream       → background color
```

### Component Pattern
```jsx
'use client'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

export default function MyComponent() {
  const { lang } = useLang()
  const t = content[lang].sectionName
  // ...
}
```

### API Routes
- All API routes use Next.js App Router format: `export async function POST/GET(req)`
- AI chatbot uses `streamText` + `toUIMessageStreamResponse()` from `ai` v6
- Always handle errors gracefully with try/catch

### Hydration Safety
- Never use `Math.random()` or `Date.now()` in component render — pre-compute at module level
- Use `const [mounted, setMounted] = useState(false)` + `useEffect` for client-only decorations

---

## Environment Variables

| Variable | Used In |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | `src/app/api/chat/route.js` |
| `RESEND_API_KEY` | `src/app/api/send-enquiry/route.js` |
| `NEXT_PUBLIC_SUPABASE_URL` | `src/lib/supabase.js`, `src/lib/supabase-server.js` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `src/lib/supabase.js`, `src/lib/supabase-server.js` |

---

## Supabase Tables

| Table | Key Columns |
|---|---|
| `profiles` | `id`, `full_name`, `email`, `phone` |
| `enquiries` | `id`, `user_id`, `name`, `phone`, `email`, `message`, `status` |
| `plots` | `id`, `plot_number`, `area_sqyds`, `price_per_sqyd`, `status` |
| `plot_interests` | `id`, `user_id`, `plot_id`, `status` |

Enquiry statuses: `pending` → `contacted` → `visited` → `booked` → `closed`
Plot statuses: `available` · `reserved` · `sold`

---

## Auth & Roles

- Buyers register at `/auth/register`, land on `/dashboard`
- Admins have `user_metadata.role === 'admin'`, land on `/admin`
- Route protection is in `src/middleware.js`
- To make admin: `update auth.users set raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb where email = 'x@x.com'`

---

## Do's and Don'ts

✅ DO:
- Keep all text in `content.js` for bilingual support
- Use server components for pages that fetch from Supabase
- Use `export const dynamic = 'force-dynamic'` on pages with auth checks
- Keep API keys server-side only (no `NEXT_PUBLIC_` prefix for secrets)

❌ DON'T:
- Don't use TypeScript
- Don't add `Math.random()` or `Date.now()` in JSX render (hydration errors)
- Don't expose `RESEND_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY` to the client
- Don't hardcode Telugu or English text outside `content.js`
