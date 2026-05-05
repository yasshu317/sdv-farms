import { describe, expect, it } from '@jest/globals'
import { homePathForRole } from '../lib/authRedirects.js'

describe('homePathForRole', () => {
  it('routes admin, staff, seller, and buyer', () => {
    expect(homePathForRole('admin')).toBe('/admin')
    expect(homePathForRole('staff')).toBe('/admin')
    expect(homePathForRole('seller')).toBe('/seller')
    expect(homePathForRole('buyer')).toBe('/dashboard')
    expect(homePathForRole(undefined)).toBe('/dashboard')
    expect(homePathForRole(null)).toBe('/dashboard')
  })
})
