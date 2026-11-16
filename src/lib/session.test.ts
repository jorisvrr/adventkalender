import { describe, expect, it } from 'vitest'
import { modeForCode } from './session'

describe('toegangscodes', () => {
  it('koppelt codes aan modi', () => {
    expect(modeForCode('3012')).toBe('vriendin')
    expect(modeForCode('1502')).toBe('ontwikkelaar')
    expect(modeForCode('1234')).toBeNull()
    expect(modeForCode('')).toBeNull()
  })
})
