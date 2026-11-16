import { useCallback, useEffect, useState } from 'react'
import {
  clearProgress,
  loadProgress,
  sanitizeProgress,
  saveProgress,
  type ContentKeyFor,
  type DayProgress,
  type Progress,
  type ProgressSpace,
} from './storage'

export interface ProgressApi {
  progress: Progress
  get: (day: number) => DayProgress
  setState: (day: number, state: unknown) => void
  complete: (day: number) => void
  resetDay: (day: number) => void
  resetAll: () => void
}

/** Laadt voortgang en ruimt meteen op wat bij oude inhoud hoort, zodat het ook opgeslagen weg is. */
function loadClean(space: ProgressSpace, keyFor: ContentKeyFor): Progress {
  const raw = loadProgress(space)
  const clean = sanitizeProgress(raw, keyFor)
  if (Object.keys(clean).length !== Object.keys(raw).length) saveProgress(space, clean)
  return clean
}

export function useProgress(space: ProgressSpace, keyFor: ContentKeyFor): ProgressApi {
  const [progress, setProgress] = useState<Progress>(() => loadClean(space, keyFor))

  // keyFor hoort stabiel te zijn (module-functie); alleen de ruimte wisselt.
  useEffect(() => setProgress(loadClean(space, keyFor)), [space])

  const commit = useCallback(
    (update: (p: Progress) => Progress) => {
      setProgress((prev) => {
        const next = update(prev)
        saveProgress(space, next)
        return next
      })
    },
    [space],
  )

  return {
    progress,
    get: (day) => progress[day] ?? {},
    setState: (day, state) => commit((p) => ({ ...p, [day]: { ...p[day], state, contentKey: keyFor(day) } })),
    complete: (day) =>
      commit((p) =>
        p[day]?.completed
          ? p
          : {
              ...p,
              [day]: { ...p[day], completed: true, completedAt: new Date().toISOString(), contentKey: keyFor(day) },
            },
      ),
    resetDay: (day) =>
      commit((p) => {
        const next = { ...p }
        delete next[day]
        return next
      }),
    resetAll: () => {
      clearProgress(space)
      setProgress({})
    },
  }
}
