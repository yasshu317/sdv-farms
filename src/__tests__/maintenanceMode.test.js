/**
 * Unit tests for maintenance mode feature flag logic.
 * Tests the flag-reading and role-based access rules used by MaintenanceGuard.
 */
import { describe, expect, it } from '@jest/globals'
import { featureFlagsToMap, isFlagEnabled } from '../lib/featureFlags.js'

function resolveMaintenanceState(flagsMap, userRole) {
  const on = isFlagEnabled(flagsMap, 'maintenance_mode')
  if (!on) return 'live'
  const isPrivileged = userRole === 'admin' || userRole === 'staff'
  return isPrivileged ? 'admin-banner' : 'maintenance'
}

describe('maintenance mode — flag off', () => {
  const flags = featureFlagsToMap([
    { key: 'maintenance_mode', enabled: false, payload: {} },
  ])

  it('shows live site to regular visitors', () => {
    expect(resolveMaintenanceState(flags, null)).toBe('live')
  })

  it('shows live site to buyers', () => {
    expect(resolveMaintenanceState(flags, 'buyer')).toBe('live')
  })

  it('shows live site to admins when flag is off', () => {
    expect(resolveMaintenanceState(flags, 'admin')).toBe('live')
  })
})

describe('maintenance mode — flag on', () => {
  const flags = featureFlagsToMap([
    { key: 'maintenance_mode', enabled: true, payload: {} },
  ])

  it('shows maintenance screen to unauthenticated visitors', () => {
    expect(resolveMaintenanceState(flags, null)).toBe('maintenance')
  })

  it('shows maintenance screen to buyers', () => {
    expect(resolveMaintenanceState(flags, 'buyer')).toBe('maintenance')
  })

  it('shows maintenance screen to sellers', () => {
    expect(resolveMaintenanceState(flags, 'seller')).toBe('maintenance')
  })

  it('shows admin banner to admins', () => {
    expect(resolveMaintenanceState(flags, 'admin')).toBe('admin-banner')
  })

  it('shows admin banner to staff', () => {
    expect(resolveMaintenanceState(flags, 'staff')).toBe('admin-banner')
  })
})

describe('maintenance mode — flag missing from DB', () => {
  const flags = featureFlagsToMap([])

  it('defaults to live when flag row does not exist', () => {
    expect(resolveMaintenanceState(flags, null)).toBe('live')
    expect(resolveMaintenanceState(flags, 'buyer')).toBe('live')
  })
})
