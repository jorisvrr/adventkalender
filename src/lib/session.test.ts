import { describe, expect, it } from 'vitest'
import { isDevCode } from './session'

describe('ontwikkelaarscode', () => {
  it('accepteert alleen 1502', () => {
    expect(isDevCode('1502')).toBe(true)
    expect(isDevCode(' 1502 ')).toBe(true)
    expect(isDevCode('3012')).toBe(false)
    expect(isDevCode('')).toBe(false)
  })
})
