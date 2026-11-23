import { describe, expect, it } from 'vitest'
import { isValidDeck } from '../games/MemoryGame'
import { contentImages } from '../lib/contentStatus'
import { getDay, type CloseUpDay, type GiftDay, type MemoryDay, type PhotoPuzzleDay } from './days'

const advent = Object.keys(import.meta.glob('/public/images/advent/*')).map((p) => p.replace(/^\/public/, ''))

describe("foto's", () => {
  it('alle 12 foto’s staan in public/images/advent en worden allemaal gebruikt', () => {
    expect(advent).toHaveLength(12)
    const used = new Set(contentImages().map((i) => i.src))
    for (const f of advent) expect(used, f).toContain(f)
  })

  it('dag 3 en 20 zijn 3×3-fotopuzzels met de juiste foto', () => {
    const d3 = getDay(3) as PhotoPuzzleDay
    const d20 = getDay(20) as PhotoPuzzleDay
    expect([d3.type, d3.size, d3.image]).toEqual(['fotopuzzel', 3, '/images/advent/dag-03-puzzel-selfie.jpeg'])
    expect([d20.type, d20.size, d20.image]).toEqual(['fotopuzzel', 3, '/images/advent/dag-20-puzzel-pasta.jpeg'])
  })

  it('dag 6: zes unieke paren uit de memory-foto’s', () => {
    const d6 = getDay(6) as MemoryDay
    expect(d6.type).toBe('memory')
    const images = d6.cards.map((c) => c.image)
    expect(new Set(images).size).toBe(6)
    expect(images.every((i) => /\/dag-06-memory-0[1-6]-/.test(i))).toBe(true)
  })

  it('dag 17: drie close-ups in de juiste volgorde, antwoord altijd een optie, eindigt op de hele foto', () => {
    const d17 = getDay(17) as CloseUpDay
    expect(d17.title).toBe('Wat zie je hier?')
    expect(d17.rounds.map((r) => [r.image.split('/').pop(), r.answer])).toEqual([
      ['dag-17-close-up-01-burrata.jpeg', 'Burrata'],
      ['dag-17-close-up-02-sushi.jpeg', 'Sushi'],
      ['dag-17-close-up-03-jij.jpeg', 'Jij'],
    ])
    expect(d17.rounds.map((r) => r.options)).toEqual([
      ['Burrata', 'Risotto', 'Vanille-ijs'],
      ['Sushi', 'Pokébowl', 'Noedels'],
      ['Jij', 'Joris', 'Een filmster'],
    ])
    for (const r of d17.rounds) {
      expect(r.options).toContain(r.answer)
      expect(r.zoomSteps.at(-1)).toBe(1)
      expect(r.zoomSteps.every((z, i) => i === 0 || z < r.zoomSteps[i - 1])).toBe(true)
    }
  })

  it('dag 24: de Eiffeltorenfoto met de afsluitende tekst, niet bij de close-ups', () => {
    const d24 = getDay(24) as GiftDay
    expect(d24.type).toBe('cadeau')
    expect(d24.image).toBe('/images/advent/dag-24-finale-eiffeltoren.jpeg')
    expect(d24.message).toBe('Fijne kerst, lieverd.')
    expect((getDay(17) as CloseUpDay).rounds.some((r) => r.image === d24.image)).toBe(false)
  })

  it('geen hartjes-emoji in de nieuwe dagen', () => {
    for (const d of [6, 17, 20, 24]) expect(JSON.stringify(getDay(d))).not.toMatch(/❤|♥|💕|💖|😍/u)
  })
})

describe('memory', () => {
  it('controleert opgeslagen kaartvolgordes', () => {
    expect(isValidDeck([0, 1, 2, 0, 1, 2], 3)).toBe(true)
    expect(isValidDeck([0, 0, 0, 1, 1, 2], 3)).toBe(false)
    expect(isValidDeck([0, 1, 2], 3)).toBe(false)
    expect(isValidDeck('x', 3)).toBe(false)
  })
})
