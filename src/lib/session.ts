import { settings } from '../content/settings'

/**
 * Alleen de ontwikkelaarsmodus heeft een sessie. Publieke routes lezen deze nooit,
 * zodat een eerdere ontwikkelaarssessie de publieke kalender niet kan beïnvloeden.
 */
const DEV_KEY = 'adventskalender:v2:ontwikkelaar'
/** Sessiesleutels van eerdere versies (codeveld op de landing). */
const LEGACY_KEYS = ['adventskalender:v1:modus']

export function isDevCode(input: string): boolean {
  return input.trim() === settings.devCode
}

export function loadDevUnlocked(): boolean {
  try {
    return window.sessionStorage.getItem(DEV_KEY) === '1'
  } catch {
    return false
  }
}

export function saveDevUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) window.sessionStorage.setItem(DEV_KEY, '1')
    else window.sessionStorage.removeItem(DEV_KEY)
  } catch {
    /* negeren */
  }
}

export function clearLegacySession(): void {
  try {
    LEGACY_KEYS.forEach((k) => window.sessionStorage.removeItem(k))
  } catch {
    /* negeren */
  }
}
