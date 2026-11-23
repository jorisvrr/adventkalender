import { describe, expect, it } from 'vitest'
import { visibleRect } from './crop'

describe('uitsneden', () => {
  it('zoom 1 toont de hele foto', () => {
    expect(visibleRect(10, 90, 1)).toEqual({ left: 0, top: 0, width: 100, height: 100 })
  })

  it('centreert het focuspunt waar dat kan', () => {
    const r = visibleRect(50, 50, 4)
    expect(r.left + r.width / 2).toBeCloseTo(50)
    expect(r.top + r.height / 2).toBeCloseTo(50)
  })

  it('maakt nooit lege randen, ook bij een focuspunt aan de rand', () => {
    for (const [x, y] of [[0, 0], [100, 100], [3, 97], [98, 2]]) {
      for (const z of [1.2, 2, 5, 8]) {
        const r = visibleRect(x, y, z)
        expect(r.left).toBeGreaterThanOrEqual(-1e-9)
        expect(r.top).toBeGreaterThanOrEqual(-1e-9)
        expect(r.left + r.width).toBeLessThanOrEqual(100 + 1e-9)
        expect(r.top + r.height).toBeLessThanOrEqual(100 + 1e-9)
      }
    }
  })
})
