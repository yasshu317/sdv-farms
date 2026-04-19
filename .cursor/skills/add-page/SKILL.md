# Skill: Add a New Page to SDV Farms

Use this skill whenever you need to add a new route/page to the project.

## Pattern: Server Wrapper + Client Component

Every page in SDV Farms follows this two-file pattern:

### 1. Server wrapper — `src/app/<route>/page.jsx`
```jsx
import SomeClient from './SomeClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Page Title — SDV Farms' }

export default async function SomePage() {
  // Optional: fetch data from Supabase here
  // const supabase = await createClient()
  // const { data } = await supabase.from('table').select('*')
  return <SomeClient />
  // or: return <SomeClient data={data ?? []} />
}
```

### 2. Client component — `src/app/<route>/SomeClient.jsx`
```jsx
'use client'
import { useLang } from '../../context/LanguageContext'
import { content } from '../../data/content'

export default function SomeClient({ data }) {
  const { lang } = useLang()
  const t = content[lang].someSection  // must exist in content.js
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)' }}>
      {/* ... */}
    </div>
  )
}
```

## Checklist
- [ ] Add `en` AND `te` keys to `src/data/content.js` for all text
- [ ] Add page link to `src/components/Navbar.jsx` if it's a top-level route
- [ ] Add auth protection to `src/proxy.js` `matcher` if the page needs login
- [ ] Write a Jest test in `src/__tests__/` and an E2E spec in `e2e/`
- [ ] Run `npm test` and `npm run test:e2e` before pushing
