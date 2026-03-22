import { content } from '../data/content'

describe('content.js — bilingual completeness', () => {
  const enKeys = (obj, prefix = '') =>
    Object.entries(obj).flatMap(([k, v]) =>
      typeof v === 'object' && v !== null
        ? enKeys(v, `${prefix}${k}.`)
        : [`${prefix}${k}`]
    )

  it('has both en and te top-level keys', () => {
    expect(content).toHaveProperty('en')
    expect(content).toHaveProperty('te')
  })

  it('en and te have the same sections', () => {
    const enSections = Object.keys(content.en).sort()
    const teSections = Object.keys(content.te).sort()
    expect(teSections).toEqual(enSections)
  })

  it('every en leaf key exists in te', () => {
    const enLeaves = enKeys(content.en)
    const teLeaves = enKeys(content.te)
    const missing = enLeaves.filter(k => !teLeaves.includes(k))
    expect(missing).toEqual([])
  })

  it('no en or te value is empty', () => {
    const checkEmpty = (obj, lang) => {
      enKeys(obj).forEach(key => {
        const parts = key.split('.')
        const val = parts.reduce((o, k) => o?.[k], obj)
        expect(val).toBeTruthy()
      })
    }
    checkEmpty(content.en, 'en')
    checkEmpty(content.te, 'te')
  })
})
