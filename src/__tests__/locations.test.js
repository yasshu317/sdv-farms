import locations from '../data/locations.json'

describe('locations.json — structure', () => {
  it('has at least one state', () => {
    expect(Object.keys(locations).length).toBeGreaterThan(0)
  })

  it('includes Telangana, Andhra Pradesh, and Karnataka', () => {
    expect(locations).toHaveProperty('Telangana')
    expect(locations).toHaveProperty('Andhra Pradesh')
    expect(locations).toHaveProperty('Karnataka')
  })

  it('every state has at least one district', () => {
    Object.entries(locations).forEach(([state, districts]) => {
      expect(Object.keys(districts).length).toBeGreaterThan(0)
    })
  })

  it('every district has at least one mandal', () => {
    Object.entries(locations).forEach(([state, districts]) => {
      Object.entries(districts).forEach(([district, mandals]) => {
        expect(Array.isArray(mandals)).toBe(true)
        expect(mandals.length).toBeGreaterThan(0)
      })
    })
  })

  it('no state, district or mandal name is empty', () => {
    Object.entries(locations).forEach(([state, districts]) => {
      expect(state.trim()).not.toBe('')
      Object.entries(districts).forEach(([district, mandals]) => {
        expect(district.trim()).not.toBe('')
        mandals.forEach(m => expect(m.trim()).not.toBe(''))
      })
    })
  })
})
