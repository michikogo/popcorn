import { describe, it, expect } from 'vitest'
import getRatingClasses from './getRatingClasses'

describe('getRatingClasses', () => {
  it('returns empty string for rating below 7', () => {
    expect(getRatingClasses(6.9)).toBe('')
    expect(getRatingClasses(0)).toBe('')
  })

  it('returns ring-1 classes for rating >= 7', () => {
    const result = getRatingClasses(7)
    expect(result).toContain('ring-1')
    expect(result).not.toContain('ring-2')
  })

  it('returns ring-2 classes for rating >= 8', () => {
    const result = getRatingClasses(8)
    expect(result).toContain('ring-2')
  })

  it('returns ring-2 classes for rating above 8', () => {
    const result = getRatingClasses(9.5)
    expect(result).toContain('ring-2')
  })

  it('returns ring-1 classes for rating between 7 and 8', () => {
    const result = getRatingClasses(7.9)
    expect(result).toContain('ring-1')
    expect(result).not.toContain('ring-2')
  })
})
