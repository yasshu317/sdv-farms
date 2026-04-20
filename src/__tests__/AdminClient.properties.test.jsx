/**
 * @jest-environment jsdom
 */
import React from 'react'
import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminClient from '../app/admin/AdminClient'

jest.mock('next/navigation')

jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href, ...rest }) {
    return <a href={href} {...rest}>{children}</a>
  },
}))

jest.mock('../lib/supabase', () => ({
  createClient: () => ({
    auth: { signOut: jest.fn().mockResolvedValue(undefined) },
    from: jest.fn(() => ({
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    })),
  }),
}))

const empty = {
  enquiries: [],
  profiles: [],
  plots: [],
  appointments: [],
  buyerRequests: [],
}

const sampleProperty = {
  id: 'prop-row-1',
  seller_id: 'seller-uuid',
  property_id: 'SDV-2026-001',
  state: 'Andhra Pradesh',
  district: 'Guntur',
  mandal: 'Guntur',
  village: 'Village1',
  zip_code: '522001',
  farmer_name: 'Test Farmer',
  land_doc_type: 'Patta',
  land_soil_type: 'Black',
  land_used_type: 'Estate Agriculture',
  area_acres: 1,
  expected_price: 1,
  road_access: true,
  views: 2,
  status: 'approved',
  doc_urls: ['https://example.com/storage/v1/object/public/bucket/scan.pdf'],
  photo_urls: [],
  created_at: '2026-04-01T10:00:00.000Z',
  updated_at: '2026-04-02T12:00:00.000Z',
}

describe('AdminClient — Seller Properties', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('expands and collapses full listing details', async () => {
    const user = userEvent.setup()
    render(
      <AdminClient
        {...empty}
        sellerProperties={[sampleProperty]}
      />
    )

    await user.click(screen.getByRole('button', { name: /properties/i }))
    expect(screen.getByRole('heading', { name: /seller properties/i })).toBeInTheDocument()

    expect(screen.queryByText('Full listing data')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'All details' }))
    expect(screen.getByText('Full listing data')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide details' })).toBeInTheDocument()
    expect(screen.getByText(/Row ID:/)).toBeInTheDocument()
    expect(screen.getByText('scan.pdf')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Hide details' }))
    expect(screen.queryByText('Full listing data')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All details' })).toBeInTheDocument()
  })

  it('shows Approve and Reject only for pending listings', async () => {
    const user = userEvent.setup()
    const pending = { ...sampleProperty, id: 'p2', status: 'pending', property_id: null }
    render(
      <AdminClient
        {...empty}
        sellerProperties={[pending]}
      />
    )

    await user.click(screen.getByRole('button', { name: /properties/i }))
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  })
})
