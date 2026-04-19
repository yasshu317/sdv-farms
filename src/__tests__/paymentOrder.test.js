/**
 * Unit tests for Razorpay payment order logic.
 * Covers: amount calculation, signature verification logic, order validation.
 */

const crypto = require('crypto')

const TOKEN_AMOUNT_PAISE = 50000  // ₹500 in paise

function calculateTokenAmount() {
  return TOKEN_AMOUNT_PAISE
}

function getAmountInRupees(paise) {
  return paise / 100
}

function buildSignaturePayload(orderId, paymentId) {
  return `${orderId}|${paymentId}`
}

function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  const payload  = buildSignaturePayload(orderId, paymentId)
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return expected === signature
}

function validateCreateOrderBody(body) {
  if (!body.appointment_id) return 'appointment_id is required'
  if (typeof body.appointment_id !== 'string' || !body.appointment_id.trim()) {
    return 'appointment_id must be a non-empty string'
  }
  return null
}

describe('Token amount', () => {
  it('token amount is ₹500 (50000 paise)', () => {
    expect(calculateTokenAmount()).toBe(50000)
  })

  it('converts paise to rupees correctly', () => {
    expect(getAmountInRupees(50000)).toBe(500)
  })

  it('converts zero paise', () => {
    expect(getAmountInRupees(0)).toBe(0)
  })
})

describe('buildSignaturePayload', () => {
  it('joins orderId and paymentId with pipe', () => {
    expect(buildSignaturePayload('order_123', 'pay_456')).toBe('order_123|pay_456')
  })
})

describe('verifyRazorpaySignature', () => {
  const secret = 'test_secret_key_12345'

  it('returns true for valid signature', () => {
    const orderId    = 'order_abc123'
    const paymentId  = 'pay_xyz789'
    const payload    = `${orderId}|${paymentId}`
    const signature  = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    expect(verifyRazorpaySignature(orderId, paymentId, signature, secret)).toBe(true)
  })

  it('returns false for tampered signature', () => {
    expect(verifyRazorpaySignature('order_abc', 'pay_xyz', 'fakesignature', secret)).toBe(false)
  })

  it('returns false when orderId differs', () => {
    const payload   = 'order_REAL|pay_xyz'
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    expect(verifyRazorpaySignature('order_FAKE', 'pay_xyz', signature, secret)).toBe(false)
  })

  it('returns false when paymentId differs', () => {
    const payload   = 'order_abc|pay_REAL'
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    expect(verifyRazorpaySignature('order_abc', 'pay_FAKE', signature, secret)).toBe(false)
  })
})

describe('validateCreateOrderBody', () => {
  it('passes with valid appointment_id', () => {
    expect(validateCreateOrderBody({ appointment_id: 'uuid-1234' })).toBeNull()
  })

  it('fails when appointment_id is missing', () => {
    expect(validateCreateOrderBody({})).toMatch(/appointment_id/)
  })

  it('fails when appointment_id is null', () => {
    expect(validateCreateOrderBody({ appointment_id: null })).toMatch(/appointment_id/)
  })

  it('fails when appointment_id is empty string', () => {
    expect(validateCreateOrderBody({ appointment_id: '' })).toMatch(/appointment_id/)
  })

  it('fails when appointment_id is blank spaces', () => {
    expect(validateCreateOrderBody({ appointment_id: '   ' })).toMatch(/appointment_id/)
  })
})
