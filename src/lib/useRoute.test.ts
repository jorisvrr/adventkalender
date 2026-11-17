import { describe, expect, it } from 'vitest'
import { parseRoute } from './useRoute'

describe('routes', () => {
  it('publieke routes zijn nooit ontwikkelaarsroutes', () => {
    for (const h of ['', '#', '#/', '#/kalender', '#/dag/1', '#/dag/24', '#/onbekend', '#/dag/99', '#/devx']) {
      expect(parseRoute(h).dev).toBe(false)
    }
    expect(parseRoute('').view).toBe('start')
    expect(parseRoute('#/kalender').view).toBe('kalender')
    expect(parseRoute('#/dag/3')).toEqual({ dev: false, view: 'dag', day: 3 })
    expect(parseRoute('#/dag/0').view).toBe('kalender')
  })

  it('ontwikkelaarsroutes', () => {
    expect(parseRoute('#/dev')).toEqual({ dev: true, view: 'kalender', day: 0 })
    expect(parseRoute('#/dev/')).toEqual({ dev: true, view: 'kalender', day: 0 })
    expect(parseRoute('#/dev/dag/12')).toEqual({ dev: true, view: 'dag', day: 12 })
  })
})
