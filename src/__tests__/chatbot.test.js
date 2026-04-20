/**
 * Unit tests for ChatBot FAQ matching and link-parsing logic.
 * These run without a browser — pure JS logic extracted from ChatBot.jsx.
 */

// ── Reproduce the matchFAQ logic ─────────────────────────────────────────────
const FAQ_RULES = [
  { match: /\b(how many|propert|listings?|available land|browse)\b/i,       tag: 'properties' },
  { match: /\b(sell|list my land|seller|post land|add property|how to list)\b/i, tag: 'sell' },
  { match: /\b(buy|purchase|buyer|looking for land|find land|invest)\b/i, tag: 'buy' },
  { match: /\b(service|fencing|borewell|drip|irrigation|farming plan|plant|crop|farmhouse)\b/i, tag: 'service' },
  { match: /\b(contact|phone|call|whatsapp|email|reach|number|address|office)\b/i, tag: 'contact' },
  { match: /\b(price|cost|rate|per acre|how much|charge|fee|rupee|lakh|crore)\b/i, tag: 'price' },
  { match: /\b(location|where|address|near|hyderabad|telangana|andhra|karnataka|state|districts?|mandal)\b/i, tag: 'location' },
  { match: /\b(government|approved|legal|title|document|pahani|ror|adangal|rtc|verified)\b/i, tag: 'legal' },
  { match: /^(\?+|help|hi|hello|hey|namaste|నమస్కారం|హలో|ఏమి చేయగలరు)$/i, tag: 'help' },
  { match: /\b(appointment|site visit|visit|book|slot|schedule)\b/i, tag: 'appointment' },
]

function matchFAQTag(text) {
  for (const rule of FAQ_RULES) {
    if (rule.match.test(text)) return rule.tag
  }
  return null
}

// ── Reproduce the link-extraction logic (the bug fix) ────────────────────────
function extractLinks(line) {
  const re = /\[(.+?)\]\((.+?)\)/g
  const links = []
  let match
  while ((match = re.exec(line)) !== null) {
    const label = match[1]   // captured before loop moves on
    const href  = match[2]
    links.push({ label, href })
  }
  return links
}

function extractBolds(line) {
  const re = /\*\*(.+?)\*\*/g
  const bolds = []
  let match
  while ((match = re.exec(line)) !== null) {
    bolds.push(match[1])
  }
  return bolds
}

// ── FAQ matching tests ────────────────────────────────────────────────────────
describe('matchFAQ — property queries', () => {
  it('matches "how many properties"', () => expect(matchFAQTag('how many properties are there?')).toBe('properties'))
  it('matches "browse" keyword', () => expect(matchFAQTag('I want to browse')).toBe('properties'))
  it('matches "listing" keyword', () => expect(matchFAQTag('show me listings')).toBe('properties'))
  it('matches "available land"', () => expect(matchFAQTag('any available land?')).toBe('properties'))
})

describe('matchFAQ — sell queries', () => {
  it('matches "sell"', () => expect(matchFAQTag('how to sell my land')).toBe('sell'))
  it('matches "list my land"', () => expect(matchFAQTag('how do I list my land?')).toBe('sell'))
  it('matches "seller"', () => expect(matchFAQTag('I want to become a seller')).toBe('sell'))
  it('matches "add property"', () => expect(matchFAQTag('I want to add property')).toBe('sell'))
})

describe('matchFAQ — buy queries', () => {
  it('matches "buy"', () => expect(matchFAQTag('I want to buy land')).toBe('buy'))
  it('matches "purchase"', () => expect(matchFAQTag('looking to purchase')).toBe('buy'))
  it('matches "invest"', () => expect(matchFAQTag('want to invest in land')).toBe('buy'))
  it('matches "find land"', () => expect(matchFAQTag('help me find land')).toBe('buy'))
})

describe('matchFAQ — service queries', () => {
  it('matches "fencing"', () => expect(matchFAQTag('compound fencing details')).toBe('service'))
  it('matches "borewell"', () => expect(matchFAQTag('borewell installation')).toBe('service'))
  it('matches "drip"', () => expect(matchFAQTag('drip irrigation setup')).toBe('service'))
  it('matches "farming plan"', () => expect(matchFAQTag('give me a farming plan')).toBe('service'))
})

describe('matchFAQ — contact queries', () => {
  it('matches "call"', () => expect(matchFAQTag('how to call you')).toBe('contact'))
  it('matches "whatsapp"', () => expect(matchFAQTag('whatsapp number?')).toBe('contact'))
  it('matches "email"', () => expect(matchFAQTag('send me an email')).toBe('contact'))
  it('matches "phone"', () => expect(matchFAQTag('phone number please')).toBe('contact'))
})

describe('matchFAQ — price queries', () => {
  it('matches "price"', () => expect(matchFAQTag('what is the price?')).toBe('price'))
  it('matches "per acre"', () => expect(matchFAQTag('cost per acre')).toBe('price'))
  it('matches "how much"', () => expect(matchFAQTag('how much does it cost?')).toBe('price'))
  it('matches "lakh"', () => expect(matchFAQTag('is it 20 lakh per acre?')).toBe('price'))
})

describe('matchFAQ — location queries', () => {
  it('matches "where"', () => expect(matchFAQTag('where are properties located?')).toBe('location'))
  it('matches "telangana"', () => expect(matchFAQTag('do you have land in telangana?')).toBe('location'))
  it('matches "district"', () => expect(matchFAQTag('which districts?')).toBe('location'))
})

describe('matchFAQ — legal queries', () => {
  it('matches "government"', () => expect(matchFAQTag('is it government approved?')).toBe('legal'))
  it('matches "title"', () => expect(matchFAQTag('clear title?')).toBe('legal'))
  it('matches "pahani"', () => expect(matchFAQTag('do you check pahani?')).toBe('legal'))
  it('matches "verified"', () => expect(matchFAQTag('is it verified?')).toBe('legal'))
})

describe('matchFAQ — help / greeting queries', () => {
  it('matches "help"', () => expect(matchFAQTag('help')).toBe('help'))
  it('matches "?"', () => expect(matchFAQTag('?')).toBe('help'))
  it('matches "hi"', () => expect(matchFAQTag('hi')).toBe('help'))
  it('matches "hello"', () => expect(matchFAQTag('hello')).toBe('help'))
  it('matches "hey"', () => expect(matchFAQTag('hey')).toBe('help'))
  it('does NOT match "hello there" (has extra words)', () => expect(matchFAQTag('hello there')).toBeNull())
})

describe('matchFAQ — appointment queries', () => {
  it('matches "book"', () => expect(matchFAQTag('I want to book a visit')).toBe('appointment'))
  it('matches "site visit"', () => expect(matchFAQTag('how to do site visit?')).toBe('appointment'))
  it('matches "slot"', () => expect(matchFAQTag('available slot?')).toBe('appointment'))
  it('matches "schedule"', () => expect(matchFAQTag('can I schedule a tour?')).toBe('appointment'))
  it('matches "appointment"', () => expect(matchFAQTag('book an appointment')).toBe('appointment'))
})

describe('matchFAQ — no match', () => {
  it('returns null for empty string', () => expect(matchFAQTag('')).toBeNull())
  it('returns null for random words', () => expect(matchFAQTag('weather today')).toBeNull())
  it('returns null for unrelated sentence', () => expect(matchFAQTag('I like cricket')).toBeNull())
})

// ── Link-extraction (the fixed bug) ──────────────────────────────────────────
describe('extractLinks — closure safety (the null-match bug)', () => {
  it('extracts a single link', () => {
    const result = extractLinks('Go to [Properties](/properties) now')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ label: 'Properties', href: '/properties' })
  })

  it('extracts multiple links from one line', () => {
    const result = extractLinks('[Browse](/properties) or [Register](/auth/register)')
    expect(result).toHaveLength(2)
    expect(result[0].href).toBe('/properties')
    expect(result[1].href).toBe('/auth/register')
    // Ensure second link href is correct (the bug would make this /auth/register get lost)
    expect(result[1].label).toBe('Register')
  })

  it('each link captures independent href — clicking second link goes to second URL', () => {
    const result = extractLinks('[A](/first) and [B](/second) and [C](/third)')
    expect(result[0].href).toBe('/first')
    expect(result[1].href).toBe('/second')
    expect(result[2].href).toBe('/third')
    // After extracting all 3, re.exec returns null — but our captured hrefs are still correct
    expect(result.every(l => l.href !== null)).toBe(true)
  })

  it('returns empty array when no links', () => {
    expect(extractLinks('No links here at all')).toHaveLength(0)
  })

  it('ignores incomplete markdown link syntax', () => {
    expect(extractLinks('[missing url part')).toHaveLength(0)
  })
})

describe('extractBolds', () => {
  it('extracts a single bold', () => {
    expect(extractBolds('This is **important** text')).toEqual(['important'])
  })

  it('extracts multiple bolds', () => {
    expect(extractBolds('**Phase I** and **Phase II** are ready')).toEqual(['Phase I', 'Phase II'])
  })

  it('returns empty when no bold text', () => {
    expect(extractBolds('plain text')).toHaveLength(0)
  })
})
