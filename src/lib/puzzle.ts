/** order[plek] = tegelnummer. Opgelost als elke tegel op zijn eigen plek staat. */
export function isSolved(order: number[]): boolean {
  return order.every((tile, slot) => tile === slot)
}

export function isValidOrder(order: unknown, count: number): order is number[] {
  return (
    Array.isArray(order) &&
    order.length === count &&
    [...order].sort((a, b) => a - b).every((v, i) => v === i)
  )
}

/** Geschudde volgorde waarin minstens de helft van de tegels verkeerd staat. */
export function shuffledOrder(count: number, random: () => number = Math.random): number[] {
  const minWrong = Math.ceil(count / 2)
  for (;;) {
    const order = Array.from({ length: count }, (_, i) => i)
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    const wrong = order.filter((t, s) => t !== s).length
    if (wrong >= minWrong) return order
  }
}

export function swap(order: number[], a: number, b: number): number[] {
  const next = [...order]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}
