/**
 * Unit tests for business feedback submission validation.
 * Mirrors the validation logic in /api/feedback/route.js
 */
import { describe, expect, it } from '@jest/globals'

const VALID_FEEDBACK_TYPES = ['general', 'suggestion', 'complaint', 'partnership', 'other']

function validateFeedback(body) {
  if (!body?.business_name?.trim()) {
    return { ok: false, status: 400, error: 'business_name is required' }
  }
  if (!body?.message?.trim()) {
    return { ok: false, status: 400, error: 'message is required' }
  }
  if (body.rating !== null && body.rating !== undefined) {
    const r = Number(body.rating)
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return { ok: false, status: 400, error: 'rating must be 1–5' }
    }
  }
  if (body.feedback_type && !VALID_FEEDBACK_TYPES.includes(body.feedback_type)) {
    return { ok: false, status: 400, error: `Invalid feedback_type: ${body.feedback_type}` }
  }
  return { ok: true }
}

describe('feedback validation — required fields', () => {
  it('passes with minimum required fields', () => {
    const r = validateFeedback({ business_name: 'Ravi Farms', message: 'Great service!' })
    expect(r.ok).toBe(true)
  })

  it('fails when business_name is missing', () => {
    const r = validateFeedback({ business_name: '', message: 'Great!' })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/business_name/)
  })

  it('fails when business_name is whitespace only', () => {
    const r = validateFeedback({ business_name: '   ', message: 'Great!' })
    expect(r.ok).toBe(false)
  })

  it('fails when message is missing', () => {
    const r = validateFeedback({ business_name: 'Ravi Farms', message: '' })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/message/)
  })
})

describe('feedback validation — rating', () => {
  it('passes with no rating (optional)', () => {
    const r = validateFeedback({ business_name: 'A', message: 'B', rating: null })
    expect(r.ok).toBe(true)
  })

  it('passes with valid ratings 1–5', () => {
    [1, 2, 3, 4, 5].forEach(n => {
      expect(validateFeedback({ business_name: 'A', message: 'B', rating: n }).ok).toBe(true)
    })
  })

  it('fails when rating is 0', () => {
    const r = validateFeedback({ business_name: 'A', message: 'B', rating: 0 })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/1–5/)
  })

  it('fails when rating is 6 or above', () => {
    const r = validateFeedback({ business_name: 'A', message: 'B', rating: 6 })
    expect(r.ok).toBe(false)
  })

  it('fails when rating is a float', () => {
    const r = validateFeedback({ business_name: 'A', message: 'B', rating: 3.5 })
    expect(r.ok).toBe(false)
  })
})

describe('feedback validation — feedback_type', () => {
  it('accepts all valid types', () => {
    VALID_FEEDBACK_TYPES.forEach(t => {
      expect(validateFeedback({ business_name: 'A', message: 'B', feedback_type: t }).ok).toBe(true)
    })
  })

  it('rejects unknown feedback_type', () => {
    const r = validateFeedback({ business_name: 'A', message: 'B', feedback_type: 'spam' })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/Invalid feedback_type/)
  })

  it('passes when feedback_type is omitted', () => {
    const r = validateFeedback({ business_name: 'A', message: 'B' })
    expect(r.ok).toBe(true)
  })
})
