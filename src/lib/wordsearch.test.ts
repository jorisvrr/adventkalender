import { describe, expect, it } from 'vitest'
import { getDay, type WordSearchDay } from '../content/days'
import { cellsBetween, findOccurrences, matchSelection, normalizeAnswer, validateGrid } from './wordsearch'

const day2 = getDay(2) as WordSearchDay

describe('woordzoeker dag 2', () => {
  it('heeft een geldig rooster met elk woord precies één keer', () => {
    expect(day2.type).toBe('woordzoeker')
    expect(validateGrid(day2.grid, day2.words)).toEqual([])
  })

  it('heeft de woorden in de vaste volgorde en de eerste letters vormen de oplossing', () => {
    expect(day2.words).toEqual(['CHOCOLA', 'AVOND', 'DROOM', 'ETEN', 'ARM', 'UITJE'])
    expect(day2.words.map((w) => w[0]).join('')).toBe(day2.solution)
    expect(day2.solution).toBe('CADEAU')
  })

  it('herkent een selectie in beide sleeprichtingen', () => {
    const [occ] = findOccurrences(day2.grid, 'AVOND')
    const start = occ[0]
    const end = occ[occ.length - 1]
    expect(matchSelection(day2.grid, day2.words, cellsBetween(start, end)!, [])).toBe('AVOND')
    expect(matchSelection(day2.grid, day2.words, cellsBetween(end, start)!, [])).toBe('AVOND')
    expect(matchSelection(day2.grid, day2.words, cellsBetween(start, end)!, ['AVOND'])).toBeNull()
  })

  it('weigert schuine of te korte selecties', () => {
    expect(cellsBetween({ r: 0, c: 0 }, { r: 2, c: 1 })).toBeNull()
    expect(matchSelection(day2.grid, day2.words, [{ r: 1, c: 1 }], [])).toBeNull()
  })

  it('negeert hoofdletters en spaties aan begin en eind', () => {
    expect(normalizeAnswer('  cadeau ')).toBe('CADEAU')
    expect(normalizeAnswer('CaDeAu')).toBe('CADEAU')
  })
})
