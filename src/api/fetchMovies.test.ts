import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fetchMovies from './fetchMovies'

const mockResponse = {
  page: 1,
  results: [],
  total_pages: 5,
  total_results: 100,
}

const mockFetch = (ok = true, data = mockResponse) =>
  vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(data),
  })

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchMovies', () => {
  it('builds URL with default params', async () => {
    await fetchMovies()
    const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string)
    expect(url.searchParams.get('sort_by')).toBe('popularity.desc')
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('api_key')).toBe('test-key')
  })

  it('includes sort_by param when provided', async () => {
    await fetchMovies({ sortBy: 'vote_average.desc' })
    const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string)
    expect(url.searchParams.get('sort_by')).toBe('vote_average.desc')
  })

  it('appends with_genres only when genreId is provided', async () => {
    await fetchMovies({ genreId: 28 })
    const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string)
    expect(url.searchParams.get('with_genres')).toBe('28')
  })

  it('does not append with_genres when genreId is null', async () => {
    await fetchMovies({ genreId: null })
    const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string)
    expect(url.searchParams.get('with_genres')).toBeNull()
  })

  it('appends primary_release_date.gte when yearFrom is provided', async () => {
    await fetchMovies({ yearFrom: 2022 })
    const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string)
    expect(url.searchParams.get('primary_release_date.gte')).toBe('2022-01-01')
  })

  it('appends primary_release_date.lte when yearTo is provided', async () => {
    await fetchMovies({ yearTo: 2024 })
    const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string)
    expect(url.searchParams.get('primary_release_date.lte')).toBe('2024-12-31')
  })

  it('passes the correct page number', async () => {
    await fetchMovies({ page: 3 })
    const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string)
    expect(url.searchParams.get('page')).toBe('3')
  })

  it('passes AbortSignal to fetch', async () => {
    const controller = new AbortController()
    await fetchMovies({}, controller.signal)
    expect(vi.mocked(fetch).mock.calls[0][1]).toEqual({ signal: controller.signal })
  })

  it('throws an error on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch(false))
    await expect(fetchMovies()).rejects.toThrow('Failed to fetch movies: 500')
  })

  it('returns parsed JSON on success', async () => {
    const result = await fetchMovies()
    expect(result).toEqual(mockResponse)
  })
})
