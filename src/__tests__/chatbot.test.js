/**
 * Unit tests for ChatBot FAQ matching (bilingual) and link-parsing helpers.
 */
import { describe, expect, it } from '@jest/globals'
import { matchFAQ } from '../lib/chatbotFaq.js'

describe('matchFAQ — English queries', () => {
  it('matches property / browse queries', () => {
    const r = matchFAQ('how many properties are listed?', 'en', 12)
    expect(r).toBeTruthy()
    expect(r).toContain('12')
    expect(r).toContain('/properties')
  })

  it('matches sell flow', () => {
    const r = matchFAQ('how to sell my land', 'en', 0)
    expect(r).toMatch(/Seller|register/i)
    expect(r).toContain('/auth/register')
  })

  it('matches buy / invest', () => {
    const r = matchFAQ('I want to buy land', 'en', 0)
    expect(r).toMatch(/Browse|properties/i)
  })

  it('matches contact', () => {
    const r = matchFAQ('whatsapp number', 'en', 0)
    expect(r).toContain('7780312525')
  })

  it('matches help / hi', () => {
    expect(matchFAQ('help', 'en', 0)).toMatch(/Browse|Call/i)
    expect(matchFAQ('hi', 'en', 0)).toBeTruthy()
  })

  it('returns Telugu copy when lang is te', () => {
    const r = matchFAQ('how to sell my land', 'te', 0)
    expect(r).toMatch(/విక్రేత|నమోదు|జాబితా/)
  })
})

describe('matchFAQ — Telugu script queries', () => {
  it('matches sell-related Telugu', () => {
    const r = matchFAQ('నా భూమి ఎలా అమ్మాలి', 'te', 0)
    expect(r).toBeTruthy()
    expect(r).toMatch(/విక్రేత|జాబితా/)
  })

  it('matches services Telugu', () => {
    const r = matchFAQ('డ్రిప్ ఇరిగేషన్ కావాలి', 'te', 0)
    expect(r).toMatch(/డ్రిప్|సేవ/)
  })
})

describe('matchFAQ — more English intents', () => {
  it('matches price', () => {
    expect(matchFAQ('cost per acre', 'en', 0)).toMatch(/Pricing|₹|properties/i)
  })
  it('matches location', () => {
    expect(matchFAQ('land in telangana', 'en', 0)).toMatch(/Telangana|districts/i)
  })
  it('matches legal / government', () => {
    expect(matchFAQ('is pahani verified', 'en', 0)).toMatch(/government|approved|title/i)
  })
  it('matches site visit / book', () => {
    expect(matchFAQ('book a site visit', 'en', 0)).toMatch(/Booking|properties|7780312525/)
  })
})

describe('matchFAQ — no match', () => {
  it('returns null for unrelated text', () => {
    expect(matchFAQ('weather cricket score', 'en', 0)).toBeNull()
  })
})

function extractLinks(line) {
  const re = /\[(.+?)\]\((.+?)\)/g
  const links = []
  let match
  while ((match = re.exec(line)) !== null) {
    links.push({ label: match[1], href: match[2] })
  }
  return links
}

describe('extractLinks — closure safety', () => {
  it('extracts multiple links', () => {
    const result = extractLinks('[Browse](/properties) or [Register](/auth/register)')
    expect(result).toHaveLength(2)
    expect(result[1].href).toBe('/auth/register')
  })
})
