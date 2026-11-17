import { useCallback, useEffect, useState } from 'react'
import { settings } from '../content/settings'

/**
 * Hash-routes (de terug-gebaar van de telefoon werkt gewoon):
 *   #/            publieke startpagina
 *   #/kalender    publieke kalender
 *   #/dag/N       publiek vakje
 *   #/dev         ontwikkelaarsmodus (code vereist)
 *   #/dev/dag/N   vakje in ontwikkelaarsmodus
 */
export interface Route {
  dev: boolean
  view: 'start' | 'kalender' | 'dag'
  day: number
}

const validDay = (n: number) => n >= 1 && n <= settings.totalDays

export function parseRoute(hash: string): Route {
  const h = hash.replace(/\/+$/, '')
  let m: RegExpMatchArray | null
  if (h === '#/dev') return { dev: true, view: 'kalender', day: 0 }
  if ((m = h.match(/^#\/dev\/dag\/(\d{1,2})$/)))
    return validDay(+m[1]) ? { dev: true, view: 'dag', day: +m[1] } : { dev: true, view: 'kalender', day: 0 }
  if (h === '#/kalender') return { dev: false, view: 'kalender', day: 0 }
  if ((m = h.match(/^#\/dag\/(\d{1,2})$/)))
    return validDay(+m[1]) ? { dev: false, view: 'dag', day: +m[1] } : { dev: false, view: 'kalender', day: 0 }
  return { dev: false, view: 'start', day: 0 }
}

export const calendarHash = (dev: boolean) => (dev ? '#/dev' : '#/kalender')
const dayHash = (dev: boolean, day: number) => (dev ? `#/dev/dag/${day}` : `#/dag/${day}`)

function go(hash: string, mode: 'push' | 'replace', state: unknown = null) {
  if (mode === 'push') window.history.pushState(state, '', hash)
  else window.history.replaceState(state, '', hash)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))

  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const openCalendar = useCallback(() => go(calendarHash(false), 'push'), [])
  const openDay = useCallback((dev: boolean, day: number) => go(dayHash(dev, day), 'push', { fromCalendar: true }), [])
  const toCalendar = useCallback((dev: boolean) => {
    if (window.history.state?.fromCalendar) window.history.back()
    else go(calendarHash(dev), 'replace')
  }, [])
  const toStart = useCallback(() => go('#/', 'replace'), [])

  return { route, openCalendar, openDay, toCalendar, toStart }
}
