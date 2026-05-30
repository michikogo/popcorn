import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fetchGenres from './fetchGenres'

const mockResponse = {
  genres: [
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
  ],
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchGenres', () => {
  it('builds URL with api_key param', async () => {
    await fetchGenres()
    const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string)
    expect(url.searchParams.get('api_key')).toBe('test-key')
    expect(url.pathname).toBe('/3/genre/movie/list')
  })

  it('throws an error on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: () => Promise.resolve({}) }),
    )
    await expect(fetchGenres()).rejects.toThrow('Failed to fetch genres: 401')
  })

  it('returns parsed genre list on success', async () => {
    const result = await fetchGenres()
    expect(result).toEqual(mockResponse)
  })
})
