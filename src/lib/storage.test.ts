import { describe, expect, it } from 'vitest'
import { getDay } from '../content/days'
import { contentKey } from '../games/registry'
import { sanitizeProgress, type Progress } from './storage'

const keyFor = (day: number) => contentKey(getDay(day))

describe('opgeslagen voortgang na een inhoudswijziging', () => {
  it('laat oude woordzoekervoortgang (zonder of met andere sleutel) vallen', () => {
    const old: Progress = {
      2: { completed: true, state: { found: ['CHOCOLA', 'AVOND'], solved: true } },
    }
    expect(sanitizeProgress(old, keyFor)).toEqual({})
    const otherGrid: Progress = { 2: { completed: true, contentKey: 'woordzoeker:ANDER', state: {} } }
    expect(sanitizeProgress(otherGrid, keyFor)).toEqual({})
  })

  it('houdt voortgang die bij het huidige rooster hoort', () => {
    const current: Progress = { 2: { state: { found: ['KIKKER'], solved: false }, contentKey: keyFor(2) } }
    expect(sanitizeProgress(current, keyFor)).toEqual(current)
  })

  it('houdt voortgang van dagen die niet van de inhoud afhangen (kraskaart, puzzel)', () => {
    const p: Progress = { 1: { completed: true }, 3: { completed: true, state: { order: [0, 1, 2, 3, 4, 5, 6, 7, 8], solved: true } } }
    expect(sanitizeProgress(p, keyFor)).toEqual(p)
  })
})
