import { describe, expect, it } from '@jest/globals'
import { isValidStoragePrefix } from '../lib/storageUploadPolicy.js'

describe('isValidStoragePrefix', () => {
  it('allows admin folder for both buckets', () => {
    expect(isValidStoragePrefix('property-docs', 'admin')).toBe(true)
    expect(isValidStoragePrefix('property-photos', 'admin')).toBe(true)
  })

  it('allows timestamped seller paths', () => {
    expect(isValidStoragePrefix('property-docs', 'docs/1776690311952')).toBe(true)
    expect(isValidStoragePrefix('property-photos', 'photos/1776690311952')).toBe(true)
  })

  it('rejects traversal and bad buckets', () => {
    expect(isValidStoragePrefix('property-docs', 'docs/../x')).toBe(false)
    expect(isValidStoragePrefix('property-docs', '/docs/1')).toBe(false)
    expect(isValidStoragePrefix('property-docs', 'other/1')).toBe(false)
    expect(isValidStoragePrefix('unknown', 'docs/1')).toBe(false)
  })
})
