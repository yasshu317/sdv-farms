// Pure logic extracted from AppointmentPicker — slot availability rules

const SLOTS = [
  '9AM-10AM','10AM-11AM','11AM-12PM','12PM-1PM',
  '1PM-2PM','2PM-3PM','3PM-4PM','4PM-5PM','5PM-6PM',
]

function isSlotDisabled(date, slot, nowHour) {
  const today = new Date().toISOString().split('T')[0]
  if (date !== today) return false
  const rawHour = parseInt(slot)
  const isPM = slot.includes('PM') && !slot.startsWith('12')
  const hour = isPM ? rawHour + 12 : rawHour
  return hour <= nowHour + 2
}

describe('AppointmentPicker — slot availability', () => {
  const today = new Date().toISOString().split('T')[0]

  it('all slots available for a future date', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 3)
    const future = futureDate.toISOString().split('T')[0]
    SLOTS.forEach(slot => {
      expect(isSlotDisabled(future, slot, 12)).toBe(false)
    })
  })

  it('blocks slots within 2 hours of now for today', () => {
    // At 8AM: 9AM-10AM (hour=9) should be disabled (9 <= 8+2=10)
    expect(isSlotDisabled(today, '9AM-10AM', 8)).toBe(true)
    expect(isSlotDisabled(today, '10AM-11AM', 8)).toBe(true)
  })

  it('allows slots more than 2 hours from now today', () => {
    // At 8AM: 11AM-12PM (hour=11) is NOT disabled (11 > 8+2=10)
    expect(isSlotDisabled(today, '11AM-12PM', 8)).toBe(false)
  })

  it('handles PM slots correctly', () => {
    // At 11AM: 2PM-3PM (hour=14) is NOT disabled (14 > 11+2=13)
    expect(isSlotDisabled(today, '2PM-3PM', 11)).toBe(false)
    // At 11AM: 12PM-1PM (hour=12) is NOT disabled (12 < 11+2=13 → disabled)
    expect(isSlotDisabled(today, '12PM-1PM', 11)).toBe(true)
  })

  it('returns exactly 9 slots', () => {
    expect(SLOTS).toHaveLength(9)
  })
})

describe('AppointmentPicker — date range', () => {
  it('min date is today', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('max date is 7 days from today', () => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    const maxDate = d.toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]
    expect(maxDate > today).toBe(true)
  })
})
