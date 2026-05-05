import { describe, expect, it } from '@jest/globals'
import { featureFlagsToMap } from '../lib/featureFlags.js'

describe('featureFlagsToMap', () => {
  it('maps rows to key → { enabled, payload }', () => {
    const m = featureFlagsToMap([
      { key: 'foo', enabled: true, payload: { a: 1 } },
      { key: 'bar', enabled: false, payload: null },
    ])
    expect(m.foo.enabled).toBe(true)
    expect(m.foo.payload).toEqual({ a: 1 })
    expect(m.bar.enabled).toBe(false)
    expect(m.bar.payload).toEqual({})
  })
})
