const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * CSS-transform voor een uitsnede: zet het focuspunt (procenten) zo veel mogelijk in het
 * midden bij de gegeven zoom, maar schuift terug zodat er nooit lege randen ontstaan.
 * Werkt met transform-origin: 0 0 op een afbeelding die het kader precies vult.
 */
export function cropTransform(x: number, y: number, zoom: number): string {
  const z = Math.max(1, zoom)
  const tx = clamp(50 - x * z, 100 - 100 * z, 0)
  const ty = clamp(50 - y * z, 100 - 100 * z, 0)
  return `translate(${tx}%, ${ty}%) scale(${z})`
}

/** Zichtbaar deel van de foto (procenten) bij deze uitsnede; handig voor tests. */
export function visibleRect(x: number, y: number, zoom: number) {
  const z = Math.max(1, zoom)
  const tx = clamp(50 - x * z, 100 - 100 * z, 0)
  const ty = clamp(50 - y * z, 100 - 100 * z, 0)
  return { left: -tx / z + 0, top: -ty / z + 0, width: 100 / z, height: 100 / z } // + 0: geen -0
}
