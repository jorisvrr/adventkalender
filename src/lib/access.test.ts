import { describe, expect, it } from 'vitest'
import { dayAccess } from './access'

describe('toegang per dag', () => {
  it('publiek: dicht vóór de datum, ook als er inhoud is', () => {
    expect(dayAccess(1, '2026-11-30').openable).toBe(false)
    expect(dayAccess(3, '2026-12-02').openable).toBe(false)
  })

  it('publiek: open vanaf de datum als er inhoud is, eerdere dagen blijven open', () => {
    expect(dayAccess(1, '2026-12-01').openable).toBe(true)
    expect(dayAccess(1, '2026-12-20').openable).toBe(true)
  })

  it('publiek: een dag zonder inhoud blijft dicht, ook na zijn datum', () => {
    const a = dayAccess(7, '2026-12-10')
    expect(a).toEqual({ dateReached: true, hasContent: false, openable: false })
  })

  it('ontwikkelaar: alles open', () => {
    expect(dayAccess(24, '2026-11-17', true).openable).toBe(true)
  })
})
