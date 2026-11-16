import { describe, expect, it } from 'vitest'
import { formatDayMonth, isUnlocked, localDateKey, opensOn } from './time'

describe('datumvergrendeling', () => {
  it('rekent in Amsterdamse tijd', () => {
    // 30 nov 23:30 UTC = 1 dec 00:30 in Amsterdam
    expect(localDateKey(new Date('2026-11-30T23:30:00Z'))).toBe('2026-12-01')
    expect(localDateKey(new Date('2026-11-30T22:59:00Z'))).toBe('2026-11-30')
  })

  it('opent dag N op N december 2026 en laat eerdere dagen open', () => {
    expect(opensOn(1)).toBe('2026-12-01')
    expect(opensOn(24)).toBe('2026-12-24')
    expect(isUnlocked(1, '2026-11-30')).toBe(false)
    expect(isUnlocked(1, '2026-12-01')).toBe(true)
    expect(isUnlocked(3, '2026-12-02')).toBe(false)
    expect(isUnlocked(2, '2026-12-03')).toBe(true)
    expect(isUnlocked(24, '2027-01-02')).toBe(true)
  })

  it('formatteert in het Nederlands', () => {
    expect(formatDayMonth('2026-12-04')).toBe('4 december')
  })
})
