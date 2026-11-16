import { describe, expect, it } from 'vitest'
import { isSolved, isValidOrder, shuffledOrder, swap } from './puzzle'

describe('fotopuzzel', () => {
  it('schudt altijd naar een niet-opgeloste, geldige indeling', () => {
    for (let i = 0; i < 200; i++) {
      const order = shuffledOrder(9)
      expect(isValidOrder(order, 9)).toBe(true)
      expect(isSolved(order)).toBe(false)
    }
  })

  it('wisselt twee tegels en herkent de oplossing', () => {
    const order = [1, 0, 2, 3, 4, 5, 6, 7, 8]
    expect(isSolved(order)).toBe(false)
    expect(isSolved(swap(order, 0, 1))).toBe(true)
  })

  it('weigert kapotte opgeslagen indelingen', () => {
    expect(isValidOrder([0, 0, 1], 3)).toBe(false)
    expect(isValidOrder('x', 9)).toBe(false)
  })
})
