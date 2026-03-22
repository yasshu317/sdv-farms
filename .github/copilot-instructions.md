
# GitHub Copilot Instructions — SDV Farms

## Project
Bilingual (English + Telugu) agricultural land investment site. Next.js 15, App Router, Tailwind, Supabase, Vercel AI SDK.

## Language Rules
- JavaScript + JSX only — no TypeScript
- Add `'use client'` to components using hooks or browser APIs

## Bilingual Rule
All user-facing text goes in `src/data/content.js` under `en` and `te` keys.
Never hardcode English or Telugu strings in components.

```js
const t = content[lang].sectionName  // always pull from content.js
```

## Supabase Pattern
```js
// In client components
const supabase = createClient()  // from src/lib/supabase.js

// In server components / API routes  
const supabase = await createClient()  // from src/lib/supabase-server.js
```

## Tailwind Colors
Custom palette: `paddy-*`, `turmeric-*`, `marigold-*`, `terracotta-*`, `cream`.

## Hydration Safety
Pre-compute any random values at module level (outside component). Use `useState(false)` + `useEffect` for client-only rendering.

## API Routes Pattern
```js
export async function POST(req) {
  const { field } = await req.json()
  // ... logic
  return Response.json({ ... })
}
```

## Environment Variables
- `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini chatbot (server only)
- `RESEND_API_KEY` — email (server only)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase
