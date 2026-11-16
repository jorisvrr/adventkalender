import { settings, type Mode } from '../content/settings'

const KEY = 'adventskalender:v1:modus'

/** Welke modus hoort bij deze code? null = onjuiste code. */
export function modeForCode(input: string): Mode | null {
  const code = input.trim()
  if (code === settings.codes.vriendin) return 'vriendin'
  if (code === settings.codes.ontwikkelaar) return 'ontwikkelaar'
  return null
}

export function loadMode(): Mode | null {
  try {
    const v = window.sessionStorage.getItem(KEY)
    return v === 'vriendin' || v === 'ontwikkelaar' ? v : null
  } catch {
    return null
  }
}

export function saveMode(mode: Mode | null): void {
  try {
    if (mode) window.sessionStorage.setItem(KEY, mode)
    else window.sessionStorage.removeItem(KEY)
  } catch {
    /* negeren */
  }
}
