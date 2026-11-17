import { describe, expect, it } from 'vitest'
import { days } from '../content/days'
import { settings } from '../content/settings'
import { contentImages, formatRanges, missingDays } from './contentStatus'

// Alle bestanden in public/, zoals de site ze serveert ('/images/x.jpg').
const publicFiles = Object.keys(import.meta.glob('/public/**/*')).map((p) => p.replace(/^\/public/, ''))

describe('inhoud', () => {
  it('elke afbeelding waar de inhoud naar verwijst bestaat in public/', () => {
    for (const { day, src } of contentImages()) {
      expect(publicFiles, `dag ${day}: ${src} ontbreekt in public/`).toContain(src)
    }
  })

  it('dagnummers zijn uniek en liggen tussen 1 en 24', () => {
    const nums = days.map((d) => d.day)
    expect(new Set(nums).size).toBe(nums.length)
    expect(nums.every((n) => n >= 1 && n <= settings.totalDays)).toBe(true)
  })

  it('ontbrekende dagen zijn de dagen zonder inhoud', () => {
    const filled = new Set(days.map((d) => d.day))
    expect(missingDays()).toEqual(Array.from({ length: 24 }, (_, i) => i + 1).filter((d) => !filled.has(d)))
  })

  it('vat reeksen samen', () => {
    expect(formatRanges([4, 5, 6, 8, 10, 11])).toBe('4–6, 8, 10–11')
    expect(formatRanges([24])).toBe('24')
    expect(formatRanges([])).toBe('')
  })
})
