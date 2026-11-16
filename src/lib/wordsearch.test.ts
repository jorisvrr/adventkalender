import { describe, expect, it } from 'vitest'
import { getDay, type WordSearchDay } from '../content/days'
import { cellsBetween, findOccurrences, matchSelection, normalizeAnswer, validateGrid } from './wordsearch'

const day2 = getDay(2) as WordSearchDay
const WORDS = ['KIKKER', 'PASTA', 'NOODLES', 'ROOKIE', 'SNOEP', 'MAAS']

describe('woordzoeker dag 2', () => {
  it('heeft een rechthoekig rooster met elk woord precies één keer', () => {
    expect(day2.type).toBe('woordzoeker')
    expect(day2.grid.every((row) => row.length === day2.grid[0].length)).toBe(true)
    expect(validateGrid(day2.grid, day2.words)).toEqual([])
  })

  it('heeft de woorden in de vaste volgorde en de beginletters vormen de oplossing', () => {
    expect(day2.words).toEqual(WORDS)
    expect(day2.words.map((w) => w[0]).join('')).toBe(day2.solution)
    expect(day2.solution).toBe('KPNRSM')
  })

  it('elk woord is te vinden door begin- en eindletter te selecteren, in beide richtingen', () => {
    const found: string[] = []
    for (const word of WORDS) {
      const [occ] = findOccurrences(day2.grid, word)
      const start = occ[0]
      const end = occ[occ.length - 1]
      expect(matchSelection(day2.grid, day2.words, cellsBetween(start, end)!, found)).toBe(word)
      expect(matchSelection(day2.grid, day2.words, cellsBetween(end, start)!, found)).toBe(word)
      found.push(word)
      // Een gevonden woord telt geen tweede keer.
      expect(matchSelection(day2.grid, day2.words, cellsBetween(start, end)!, found)).toBeNull()
    }
  })

  it('weigert schuine of te korte selecties', () => {
    expect(cellsBetween({ r: 0, c: 0 }, { r: 2, c: 1 })).toBeNull()
    expect(matchSelection(day2.grid, day2.words, [{ r: 1, c: 1 }], [])).toBeNull()
  })

  it('negeert hoofdletters/kleine letters en spaties', () => {
    for (const input of ['KPNRSM', 'kpnrsm', '  kPnRsM ', 'K P N R S M', ' kpn rsm\n']) {
      expect(normalizeAnswer(input)).toBe('KPNRSM')
    }
    expect(normalizeAnswer('KPNRS')).not.toBe('KPNRSM')
  })

  it('bevat geen oude inhoud meer', () => {
    const text = JSON.stringify(day2)
    for (const old of ['CADEAU', '€5', 'screenshot', 'tegoed']) expect(text).not.toContain(old)
  })
})
