/**
 * Unit tests for Gemini chat API validation logic and chatbot Gemini fallback behaviour.
 * These mirror the validation in /api/chat/route.js and the ChatBot fallback flow.
 */
import { describe, expect, it } from '@jest/globals'
import { matchFAQ } from '../lib/chatbotFaq.js'

// ── Validation logic (mirrors route.js) ──────────────────────────────────────

function validateChatRequest(body) {
  if (!body?.message?.trim()) {
    return { ok: false, status: 400, error: 'Message is required' }
  }
  if (!body._apiKey) {
    return { ok: false, status: 503, error: 'AI service not configured' }
  }
  return { ok: true }
}

describe('/api/chat — request validation', () => {
  it('rejects empty message', () => {
    const r = validateChatRequest({ message: '', _apiKey: 'key' })
    expect(r.ok).toBe(false)
    expect(r.status).toBe(400)
    expect(r.error).toMatch(/required/i)
  })

  it('rejects whitespace-only message', () => {
    const r = validateChatRequest({ message: '   ', _apiKey: 'key' })
    expect(r.ok).toBe(false)
    expect(r.status).toBe(400)
  })

  it('rejects when API key is missing', () => {
    const r = validateChatRequest({ message: 'hello', _apiKey: null })
    expect(r.ok).toBe(false)
    expect(r.status).toBe(503)
    expect(r.error).toMatch(/not configured/i)
  })

  it('passes with valid message and key', () => {
    const r = validateChatRequest({ message: 'what crops grow in black soil?', _apiKey: 'AIza...' })
    expect(r.ok).toBe(true)
  })
})

// ── Gemini fallback routing ───────────────────────────────────────────────────
// FAQ questions should hit matchFAQ and return a result (no Gemini needed).
// Unknown questions should return null from matchFAQ (triggering Gemini).

describe('ChatBot — FAQ vs Gemini routing', () => {
  it('known FAQ question returns a local answer (no Gemini needed)', () => {
    expect(matchFAQ('how many properties are available', 'en', 5)).toBeTruthy()
    expect(matchFAQ('how to sell my land', 'en', 0)).toBeTruthy()
    expect(matchFAQ('contact number', 'en', 0)).toBeTruthy()
    expect(matchFAQ('book a site visit', 'en', 0)).toBeTruthy()
  })

  it('unknown question returns null → should route to Gemini', () => {
    expect(matchFAQ('what crops grow well in black soil', 'en', 0)).toBeNull()
    expect(matchFAQ('tell me about water table depth', 'en', 0)).toBeNull()
    expect(matchFAQ('cricket score today', 'en', 0)).toBeNull()
  })

  it('Telugu unknown question also returns null → routes to Gemini', () => {
    expect(matchFAQ('నల్ల నేలలో ఏ చెట్లు నాటాలి', 'te', 0)).toBeNull()
  })
})

// ── Gemini history format ─────────────────────────────────────────────────────

function toGeminiHistory(messages) {
  return messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
}

describe('toGeminiHistory — role mapping', () => {
  it('maps assistant → model', () => {
    const history = toGeminiHistory([
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'hi there' },
    ])
    expect(history[0].role).toBe('user')
    expect(history[1].role).toBe('model')
  })

  it('returns empty array for empty history', () => {
    expect(toGeminiHistory([])).toEqual([])
  })

  it('wraps content in parts array', () => {
    const history = toGeminiHistory([{ role: 'user', content: 'test' }])
    expect(history[0].parts).toEqual([{ text: 'test' }])
  })
})
