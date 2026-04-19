# Skill: Add Bilingual Content to SDV Farms

Use this skill whenever you add user-facing text to any page or component.

## Rule: NEVER hardcode strings in components

❌ Wrong:
```jsx
<h1>Browse Properties</h1>
<p>Filter by location and soil type</p>
```

✅ Correct:
```jsx
const { lang } = useLang()
const t = content[lang].properties

<h1>{t.heading}</h1>
<p>{t.subheading}</p>
```

## Adding keys to content.js

Always add BOTH `en` and `te` at the same time:

```js
// src/data/content.js
export const content = {
  en: {
    // existing sections...
    yourSection: {
      heading:    'Your Heading',
      subheading: 'Your subheading text here.',
      cta:        'Call to Action',
    },
  },
  te: {
    // existing sections...
    yourSection: {
      heading:    'మీ శీర్షిక',           // Telugu script — no transliteration
      subheading: 'మీ ఉపశీర్షిక వచనం.',
      cta:        'చర్య కోసం పిలుపు',
    },
  },
}
```

## Telugu text rendering

Apply the `telugu` CSS class on any element containing Telugu text:
```jsx
<p className={lang === 'te' ? 'telugu' : ''}>{t.subheading}</p>
```

## Verification

The `content.test.js` test suite automatically verifies:
- Both `en` and `te` have identical key structure
- No key is empty in either language

Run `npm test` — it will catch any missing or empty keys before CI does.
