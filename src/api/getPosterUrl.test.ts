import { describe, it, expect } from 'vitest'
import getPosterUrl from './getPosterUrl'

describe('getPosterUrl', () => {
  it('returns full TMDB image URL for a valid path', () => {
    expect(getPosterUrl('/abc123.jpg')).toBe('https://image.tmdb.org/t/p/w500/abc123.jpg')
  })

  it('concatenates path directly onto base URL', () => {
    const result = getPosterUrl('/some/path.jpg')
    expect(result).toMatch(/^https:\/\/image\.tmdb\.org\/t\/p\/w500\//)
  })
})
