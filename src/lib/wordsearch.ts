export interface Cell {
  r: number
  c: number
}

export const cellId = ({ r, c }: Cell) => `${r}-${c}`

/** Alle plekken waar het woord vooruit staat, horizontaal of verticaal. */
export function findOccurrences(grid: string[], word: string): Cell[][] {
  const found: Cell[][] = []
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const dirs = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
  ]
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const { dr, dc } of dirs) {
        const cells: Cell[] = []
        for (let i = 0; i < word.length; i++) {
          const rr = r + dr * i
          const cc = c + dc * i
          if (rr >= rows || cc >= cols || grid[rr][cc] !== word[i]) break
          cells.push({ r: rr, c: cc })
        }
        if (cells.length === word.length) found.push(cells)
      }
    }
  }
  return found
}

/** Controleert het rooster: rechthoekig en elk woord precies één keer. Geeft fouten terug. */
export function validateGrid(grid: string[], words: string[]): string[] {
  const errors: string[] = []
  if (grid.some((row) => row.length !== grid[0].length)) errors.push('Rijen zijn niet even lang')
  for (const w of words) {
    const n = findOccurrences(grid, w).length
    if (n !== 1) errors.push(`${w} staat ${n} keer in het rooster`)
  }
  return errors
}

/** Cellen tussen begin en eind (inclusief), of null als ze niet op één rij/kolom liggen. */
export function cellsBetween(a: Cell, b: Cell): Cell[] | null {
  if (a.r !== b.r && a.c !== b.c) return null
  const len = Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c)) + 1
  const dr = Math.sign(b.r - a.r)
  const dc = Math.sign(b.c - a.c)
  return Array.from({ length: len }, (_, i) => ({ r: a.r + dr * i, c: a.c + dc * i }))
}

/** Welk (nog niet gevonden) woord ligt precies op deze selectie? Beide sleeprichtingen tellen. */
export function matchSelection(
  grid: string[],
  words: string[],
  selection: Cell[],
  alreadyFound: string[],
): string | null {
  if (selection.length < 2) return null
  const ids = selection.map(cellId)
  const forward = ids.join('|')
  const backward = [...ids].reverse().join('|')
  for (const w of words) {
    if (alreadyFound.includes(w)) continue
    for (const occ of findOccurrences(grid, w)) {
      const key = occ.map(cellId).join('|')
      if (key === forward || key === backward) return w
    }
  }
  return null
}

/** Hoofdletters/kleine letters en alle spaties tellen niet mee. */
export function normalizeAnswer(input: string): string {
  return input.replace(/\s+/g, '').toLocaleUpperCase('nl-NL')
}
