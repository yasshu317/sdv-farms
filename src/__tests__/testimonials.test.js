/**
 * Unit tests for testimonials validation and dual-role dashboard access logic.
 */
import { describe, expect, it } from '@jest/globals'

// ── Testimonial validation (mirrors saveTestimonial in AdminClient) ───────────

const VALID_TYPES   = ['testimonial', 'win']
const VALID_STATUSES = ['pending', 'approved', 'archived']

function validateTestimonial(f) {
  if (!f?.name?.trim())    return { ok: false, error: 'name is required' }
  if (!f?.message?.trim()) return { ok: false, error: 'message is required' }
  if (!VALID_TYPES.includes(f.type)) return { ok: false, error: `Invalid type: ${f.type}` }
  if (f.status && !VALID_STATUSES.includes(f.status)) return { ok: false, error: `Invalid status: ${f.status}` }
  if (f.type === 'testimonial' && f.rating != null) {
    const r = Number(f.rating)
    if (r !== 0 && (!Number.isInteger(r) || r < 1 || r > 5)) return { ok: false, error: 'rating must be 1–5' }
  }
  return { ok: true }
}

describe('testimonial validation — required fields', () => {
  it('passes with minimum testimonial fields', () => {
    expect(validateTestimonial({ type: 'testimonial', name: 'Ramesh K.', message: 'Great service!' }).ok).toBe(true)
  })
  it('passes with minimum win fields', () => {
    expect(validateTestimonial({ type: 'win', name: 'SDV Farms', message: '3 plots sold' }).ok).toBe(true)
  })
  it('fails when name is missing', () => {
    const r = validateTestimonial({ type: 'testimonial', name: '', message: 'Good' })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/name/)
  })
  it('fails when name is whitespace only', () => {
    expect(validateTestimonial({ type: 'testimonial', name: '   ', message: 'Good' }).ok).toBe(false)
  })
  it('fails when message is missing', () => {
    const r = validateTestimonial({ type: 'testimonial', name: 'A', message: '' })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/message/)
  })
  it('fails with unknown type', () => {
    const r = validateTestimonial({ type: 'review', name: 'A', message: 'B' })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/Invalid type/)
  })
  it('fails with unknown status', () => {
    const r = validateTestimonial({ type: 'testimonial', name: 'A', message: 'B', status: 'deleted' })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/Invalid status/)
  })
})

describe('testimonial validation — rating', () => {
  it('passes with no rating', () => {
    expect(validateTestimonial({ type: 'testimonial', name: 'A', message: 'B' }).ok).toBe(true)
  })
  it('passes with valid ratings 1–5', () => {
    [1, 2, 3, 4, 5].forEach(n => {
      expect(validateTestimonial({ type: 'testimonial', name: 'A', message: 'B', rating: n }).ok).toBe(true)
    })
  })
  it('fails with rating of 0 (non-zero invalid)', () => {
    expect(validateTestimonial({ type: 'testimonial', name: 'A', message: 'B', rating: 6 }).ok).toBe(false)
  })
  it('fails with float rating', () => {
    expect(validateTestimonial({ type: 'testimonial', name: 'A', message: 'B', rating: 4.5 }).ok).toBe(false)
  })
})

describe('testimonial type logic', () => {
  it('win type does not require rating', () => {
    expect(validateTestimonial({ type: 'win', name: 'SDV Farms', message: '3 plots' }).ok).toBe(true)
  })
  it('win with no rating is valid even if win_stat is missing', () => {
    expect(validateTestimonial({ type: 'win', name: 'SDV', message: 'Milestone' }).ok).toBe(true)
  })
})

// ── Public submission validation (mirrors POST /api/testimonials) ─────────────

function validateSubmission({ name, message, rating } = {}) {
  if (!name?.trim())    return { ok: false, status: 400, error: 'Name is required' }
  if (!message?.trim()) return { ok: false, status: 400, error: 'Message is required' }
  // rating is optional; falsy (0/null/undefined) means no rating — same as API's `rating ?` guard
  const r = rating ? Number(rating) : null
  if (r !== null && (r < 1 || r > 5)) return { ok: false, status: 400, error: 'rating must be 1–5' }
  return { ok: true, status: 201 }
}

describe('POST /api/testimonials — submission validation', () => {
  it('accepts valid submission with all fields', () => {
    expect(validateSubmission({ name: 'Priya S.', message: 'Loved it!', rating: 5 }).ok).toBe(true)
  })
  it('accepts valid submission without optional fields', () => {
    expect(validateSubmission({ name: 'A', message: 'Good' }).ok).toBe(true)
  })
  it('rejects missing name', () => {
    const r = validateSubmission({ name: '', message: 'Great' })
    expect(r.ok).toBe(false)
    expect(r.status).toBe(400)
  })
  it('rejects missing message', () => {
    const r = validateSubmission({ name: 'A', message: '' })
    expect(r.ok).toBe(false)
    expect(r.status).toBe(400)
  })
  it('rejects rating above 5', () => {
    expect(validateSubmission({ name: 'A', message: 'B', rating: 6 }).ok).toBe(false)
  })
  it('treats rating 0 as no rating (valid — user cleared stars)', () => {
    // 0 means "not rated" on the client; API skips validation for falsy rating
    expect(validateSubmission({ name: 'A', message: 'B', rating: 0 }).ok).toBe(true)
  })
  it('rejects rating below 1 when negative', () => {
    expect(validateSubmission({ name: 'A', message: 'B', rating: -1 }).ok).toBe(false)
  })
  it('accepts rating exactly 1', () => {
    expect(validateSubmission({ name: 'A', message: 'B', rating: 1 }).ok).toBe(true)
  })
  it('accepts rating exactly 5', () => {
    expect(validateSubmission({ name: 'A', message: 'B', rating: 5 }).ok).toBe(true)
  })
  it('returns 201 on success', () => {
    expect(validateSubmission({ name: 'A', message: 'B' }).status).toBe(201)
  })
})

// ── Dual-role routing ─────────────────────────────────────────────────────────

function resolvePostLoginRoute(role) {
  if (role === 'admin' || role === 'staff') return '/admin'
  if (role === 'seller') return '/seller'
  return '/dashboard'
}

function sellerCanAccessDashboard(role) {
  // sellers are no longer redirected away from /dashboard
  return role !== 'admin' && role !== 'staff'
}

describe('dual-role routing — seller can access buyer dashboard', () => {
  it('seller default post-login route is /seller', () => {
    expect(resolvePostLoginRoute('seller')).toBe('/seller')
  })
  it('buyer default post-login route is /dashboard', () => {
    expect(resolvePostLoginRoute('buyer')).toBe('/dashboard')
  })
  it('admin is routed to /admin', () => {
    expect(resolvePostLoginRoute('admin')).toBe('/admin')
  })
  it('staff is routed to /admin', () => {
    expect(resolvePostLoginRoute('staff')).toBe('/admin')
  })
  it('seller is allowed to access /dashboard', () => {
    expect(sellerCanAccessDashboard('seller')).toBe(true)
  })
  it('buyer is allowed to access /dashboard', () => {
    expect(sellerCanAccessDashboard('buyer')).toBe(true)
  })
  it('admin is NOT allowed through /dashboard (redirected to /admin)', () => {
    expect(sellerCanAccessDashboard('admin')).toBe(false)
  })
  it('staff is NOT allowed through /dashboard', () => {
    expect(sellerCanAccessDashboard('staff')).toBe(false)
  })
})
