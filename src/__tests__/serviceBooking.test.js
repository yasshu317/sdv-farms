/**
 * Unit tests for service booking validation logic.
 * These mirror the validation in /api/service-booking/route.js
 */

const REQUIRED_FIELDS = ['full_name', 'email', 'phone', 'service_type']
const VALID_SERVICE_TYPES = ['fencing', 'borewell', 'drip', 'farming_plan', 'plants']

function validateBooking(body) {
  const missing = REQUIRED_FIELDS.filter(f => !body[f]?.trim())
  if (missing.length > 0) {
    return { ok: false, error: `${missing.join(', ')} is required.` }
  }
  if (!VALID_SERVICE_TYPES.includes(body.service_type)) {
    return { ok: false, error: `Invalid service_type: ${body.service_type}` }
  }
  if (body.area_acres !== undefined && body.area_acres !== '' && Number(body.area_acres) <= 0) {
    return { ok: false, error: 'area_acres must be positive' }
  }
  return { ok: true }
}

describe('serviceBooking validation', () => {
  it('passes with all required fields', () => {
    const result = validateBooking({ full_name: 'Ravi', email: 'r@test.com', phone: '9999999999', service_type: 'fencing' })
    expect(result.ok).toBe(true)
  })

  it('fails when full_name is empty', () => {
    const result = validateBooking({ full_name: '', email: 'r@test.com', phone: '9999', service_type: 'borewell' })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/full_name/)
  })

  it('fails when email is missing', () => {
    const result = validateBooking({ full_name: 'Ravi', email: '', phone: '9999', service_type: 'drip' })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/email/)
  })

  it('fails when phone is missing', () => {
    const result = validateBooking({ full_name: 'Ravi', email: 'r@t.com', phone: '  ', service_type: 'drip' })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/phone/)
  })

  it('fails when service_type is missing', () => {
    const result = validateBooking({ full_name: 'Ravi', email: 'r@t.com', phone: '9999', service_type: '' })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/service_type/)
  })

  it('fails when service_type is invalid', () => {
    const result = validateBooking({ full_name: 'Ravi', email: 'r@t.com', phone: '9999', service_type: 'unknown' })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/Invalid service_type/)
  })

  it('accepts all valid service types', () => {
    VALID_SERVICE_TYPES.forEach(svc => {
      const result = validateBooking({ full_name: 'A', email: 'a@b.com', phone: '1234567890', service_type: svc })
      expect(result.ok).toBe(true)
    })
  })

  it('passes when optional area_acres is provided and positive', () => {
    const result = validateBooking({ full_name: 'A', email: 'a@b.com', phone: '1234567890', service_type: 'plants', area_acres: 2.5 })
    expect(result.ok).toBe(true)
  })

  it('fails when area_acres is zero or negative', () => {
    const result = validateBooking({ full_name: 'A', email: 'a@b.com', phone: '1234567890', service_type: 'plants', area_acres: -1 })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/area_acres/)
  })

  it('passes when area_acres is empty string (optional omitted)', () => {
    const result = validateBooking({ full_name: 'A', email: 'a@b.com', phone: '1234567890', service_type: 'fencing', area_acres: '' })
    expect(result.ok).toBe(true)
  })
})
