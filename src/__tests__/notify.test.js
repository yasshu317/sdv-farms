// notify.js uses fetch — mock it so tests run without a network
global.fetch = jest.fn(() => Promise.resolve({ ok: true }))

// sendNotification calls fetch('/api/notify', ...) — we test the module logic
// by checking the fetch payload for each template type

describe('notify.js — sendNotification', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('sends appointment_confirmed email with correct fields', async () => {
    fetch.mockResolvedValueOnce({ ok: true })
    const { sendNotification } = await import('../lib/notify.js')
    await sendNotification({
      to: 'buyer@example.com',
      type: 'appointment_confirmed',
      data: { date: '2025-06-01', slot: '10AM-11AM', propertyId: 'SDV-2025-001', type: 'buyer' },
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.to).toBe('buyer@example.com')
    expect(body.subject).toContain('Appointment Confirmed')
    expect(body.html).toContain('2025-06-01')
    expect(body.html).toContain('10AM-11AM')
  })

  it('sends property_approved email with property ID', async () => {
    fetch.mockResolvedValueOnce({ ok: true })
    const { sendNotification } = await import('../lib/notify.js')
    await sendNotification({
      to: 'seller@example.com',
      type: 'property_approved',
      data: { propertyId: 'SDV-2025-002', state: 'Telangana', district: 'Rangareddy' },
    })
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.subject).toContain('SDV-2025-002')
    expect(body.html).toContain('SDV-2025-002')
  })

  it('does not call fetch for unknown template type', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { sendNotification } = await import('../lib/notify.js')
    await sendNotification({ to: 'x@x.com', type: 'nonexistent_type', data: {} })
    expect(fetch).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
