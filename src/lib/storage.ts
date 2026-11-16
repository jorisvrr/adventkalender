/**
 * Voortgangsopslag in localStorage. Vriendin- en testvoortgang staan onder
 * aparte sleutels en raken elkaar nooit.
 */
export type ProgressSpace = 'vriendin' | 'test'

export interface DayProgress {
  completed?: boolean
  completedAt?: string
  /** Spelspecifieke staat (gevonden woorden, tegelposities, …). */
  state?: unknown
}

export type Progress = Record<string, DayProgress>

const PREFIX = 'adventskalender:v1'
export const progressKey = (space: ProgressSpace) => `${PREFIX}:voortgang:${space}`

function safeStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadProgress(space: ProgressSpace): Progress {
  try {
    const raw = safeStorage()?.getItem(progressKey(space))
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function saveProgress(space: ProgressSpace, progress: Progress): void {
  try {
    safeStorage()?.setItem(progressKey(space), JSON.stringify(progress))
  } catch {
    // Opslag vol of geblokkeerd: de app blijft werken, alleen zonder bewaren.
  }
}

export function clearProgress(space: ProgressSpace): void {
  try {
    safeStorage()?.removeItem(progressKey(space))
  } catch {
    /* negeren */
  }
}

/** Ontwikkelaarsinstellingen (voorbeeld-datum, preview-schakelaar). */
export interface DevSettings {
  previewDate: string
  previewAsFriend: boolean
}

const devKey = `${PREFIX}:ontwikkelaar`

export function loadDevSettings(fallbackDate: string): DevSettings {
  try {
    const raw = safeStorage()?.getItem(devKey)
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      previewDate: typeof parsed.previewDate === 'string' ? parsed.previewDate : fallbackDate,
      previewAsFriend: parsed.previewAsFriend === true,
    }
  } catch {
    return { previewDate: fallbackDate, previewAsFriend: false }
  }
}

export function saveDevSettings(value: DevSettings): void {
  try {
    safeStorage()?.setItem(devKey, JSON.stringify(value))
  } catch {
    /* negeren */
  }
}
