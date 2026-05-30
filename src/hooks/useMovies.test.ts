import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import useMovies from './useMovies'

const makeMovie = (id: number) => ({
  id,
  title: `Movie ${id}`,
  poster_path: null,
  vote_average: 7,
  release_date: '2024-01-01',
  genre_ids: [],
})

const makePage = (page: number, totalPages = 3) => ({
  page,
  results: [makeMovie(page * 10), makeMovie(page * 10 + 1)],
  total_pages: totalPages,
  total_results: totalPages * 2,
})

const mockFetch = (data: object) =>
  vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  })

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch(makePage(1)))
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useMovies — initial load', () => {
  it('starts with loading: true and empty movies', () => {
    const { result } = renderHook(() => useMovies())
    expect(result.current.loading).toBe(true)
    expect(result.current.movies).toEqual([])
    expect(result.current.page).toBe(1)
  })

  it('sets movies and loading: false after successful fetch', async () => {
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.movies).toEqual(makePage(1).results)
    expect(result.current.error).toBeNull()
  })

  it('sets totalPages from response', async () => {
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.totalPages).toBe(3)
  })

  it('sets error and loading: false on failed fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    )
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Failed to fetch movies: 500')
    expect(result.current.movies).toEqual([])
  })
})

describe('useMovies — filter reset', () => {
  it('clears movies synchronously when filter changes', async () => {
    const { result, rerender } = renderHook(
      ({ sortBy }: { sortBy: string }) => useMovies({ sortBy }),
      { initialProps: { sortBy: 'popularity.desc' } },
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.movies.length).toBeGreaterThan(0)

    vi.stubGlobal('fetch', mockFetch(makePage(1)))
    rerender({ sortBy: 'vote_average.desc' })

    expect(result.current.movies).toEqual([])
  })

  it('sets loading: true when filter changes', async () => {
    const { result, rerender } = renderHook(
      ({ sortBy }: { sortBy: string }) => useMovies({ sortBy }),
      { initialProps: { sortBy: 'popularity.desc' } },
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    vi.stubGlobal('fetch', mockFetch(makePage(1)))
    rerender({ sortBy: 'vote_average.desc' })

    expect(result.current.loading).toBe(true)
  })

  it('resets page to 1 when filter changes', async () => {
    const { result, rerender } = renderHook(
      ({ sortBy }: { sortBy: string }) => useMovies({ sortBy }),
      { initialProps: { sortBy: 'popularity.desc' } },
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.page).toBe(2))

    vi.stubGlobal('fetch', mockFetch(makePage(1)))
    rerender({ sortBy: 'vote_average.desc' })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.page).toBe(1)
  })

  it('fetches new results after filter change', async () => {
    const page1Action = makePage(1)
    const { result, rerender } = renderHook(
      ({ sortBy }: { sortBy: string }) => useMovies({ sortBy }),
      { initialProps: { sortBy: 'popularity.desc' } },
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newResults = [makeMovie(99)]
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ...page1Action, results: newResults }),
      }),
    )
    rerender({ sortBy: 'vote_average.desc' })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.movies).toEqual(newResults)
  })
})

describe('useMovies — pagination', () => {
  it('appends results on loadMore', async () => {
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const firstPageMovies = result.current.movies

    vi.stubGlobal('fetch', mockFetch(makePage(2)))
    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.loadingMore).toBe(false))

    expect(result.current.movies).toEqual([...firstPageMovies, ...makePage(2).results])
    expect(result.current.page).toBe(2)
  })

  it('increments page on loadMore', async () => {
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    vi.stubGlobal('fetch', mockFetch(makePage(2)))
    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.loadingMore).toBe(false))

    expect(result.current.page).toBe(2)
  })

  it('loadMore is a no-op when page >= totalPages', async () => {
    vi.stubGlobal('fetch', mockFetch(makePage(1, 1)))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.page).toBe(1)
    expect(result.current.totalPages).toBe(1)

    act(() => result.current.loadMore())
    expect(result.current.page).toBe(1)
    expect(vi.mocked(fetch).mock.calls.length).toBe(1)
  })

  it('loadMore is a no-op while loadingMore is true', async () => {
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let resolveResponse!: (value: unknown) => void
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(new Promise((resolve) => (resolveResponse = resolve))),
    )

    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.loadingMore).toBe(true))

    act(() => result.current.loadMore())
    expect(result.current.page).toBe(2)

    resolveResponse({ ok: true, json: () => Promise.resolve(makePage(2)) })
    await waitFor(() => expect(result.current.loadingMore).toBe(false))
  })
})

describe('useMovies — AbortController', () => {
  it('ignores AbortError when filter changes mid-fetch', async () => {
    let rejectFetch!: (err: Error) => void
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise((_, reject) => {
          rejectFetch = reject
        }),
      ),
    )

    const { result, rerender } = renderHook(
      ({ sortBy }: { sortBy: string }) => useMovies({ sortBy }),
      { initialProps: { sortBy: 'popularity.desc' } },
    )

    vi.stubGlobal('fetch', mockFetch(makePage(1)))
    rerender({ sortBy: 'vote_average.desc' })

    const abortError = new Error('AbortError')
    abortError.name = 'AbortError'
    rejectFetch(abortError)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })
})
