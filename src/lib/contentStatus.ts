import { days, VOORBEELDAFBEELDING } from '../content/days'
import { settings } from '../content/settings'
import { hasContent } from './access'

/** Alleen voor de ontwikkelaarsmodus: welke inhoud ontbreekt nog. */
export function missingDays(): number[] {
  return Array.from({ length: settings.totalDays }, (_, i) => i + 1).filter((d) => !hasContent(d))
}

/** Alle afbeeldingen waar de inhoud naar verwijst, met hun dag. */
export function contentImages(): { day: number; src: string }[] {
  return days.flatMap((d) => (d.type === 'fotopuzzel' ? [{ day: d.day, src: d.image }] : []))
}

export function contentWarnings(): { day: number; text: string }[] {
  return contentImages()
    .filter((img) => img.src === VOORBEELDAFBEELDING)
    .map((img) => ({ day: img.day, text: 'gebruikt nog de voorbeeldafbeelding' }))
}

/** [4, 5, 6, 8] → '4–6, 8' */
export function formatRanges(nums: number[]): string {
  const parts: string[] = []
  let start = nums[0]
  for (let i = 1; i <= nums.length; i++) {
    if (nums[i] !== nums[i - 1] + 1) {
      const end = nums[i - 1]
      parts.push(start === end ? `${start}` : `${start}–${end}`)
      start = nums[i]
    }
  }
  return nums.length ? parts.join(', ') : ''
}
