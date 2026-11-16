import { useCallback, useEffect, useState } from 'react'
import { clearProgress, loadProgress, saveProgress, type DayProgress, type Progress, type ProgressSpace } from './storage'

export interface ProgressApi {
  progress: Progress
  get: (day: number) => DayProgress
  setState: (day: number, state: unknown) => void
  complete: (day: number) => void
  resetDay: (day: number) => void
  resetAll: () => void
}

export function useProgress(space: ProgressSpace): ProgressApi {
  const [progress, setProgress] = useState<Progress>(() => loadProgress(space))

  useEffect(() => setProgress(loadProgress(space)), [space])

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
    setState: (day, state) => commit((p) => ({ ...p, [day]: { ...p[day], state } })),
    complete: (day) =>
      commit((p) =>
        p[day]?.completed ? p : { ...p, [day]: { ...p[day], completed: true, completedAt: new Date().toISOString() } },
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
