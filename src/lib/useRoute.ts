import { useCallback, useEffect, useState } from 'react'

export type Route = { name: 'kalender' } | { name: 'dag'; day: number }

function parse(hash: string): Route {
  const m = hash.match(/^#\/dag\/(\d{1,2})$/)
  const day = m ? Number(m[1]) : 0
  return day >= 1 && day <= 24 ? { name: 'dag', day } : { name: 'kalender' }
}

/** Eenvoudige hash-routing, zodat de terug-gebaar van de telefoon ook werkt. */
export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))

  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const openDay = useCallback((day: number) => {
    window.history.pushState({ fromCalendar: true }, '', `#/dag/${day}`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }, [])

  const toCalendar = useCallback(() => {
    if (window.history.state?.fromCalendar) {
      window.history.back()
    } else {
      window.history.replaceState(null, '', '#/')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    }
  }, [])

  return { route, openDay, toCalendar }
}
