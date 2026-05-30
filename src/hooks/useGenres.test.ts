import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useGenres from './useGenres'

const mockGenres = {
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
      json: () => Promise.resolve(mockGenres),
    }),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useGenres', () => {
  it('starts with loading: true and empty genres', () => {
    const { result } = renderHook(() => useGenres())
    expect(result.current.loading).toBe(true)
    expect(result.current.genres).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('sets genres and loading: false after successful fetch', async () => {
    const { result } = renderHook(() => useGenres())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.genres).toEqual(mockGenres.genres)
    expect(result.current.error).toBeNull()
  })

  it('sets error and loading: false on failed fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    )
    const { result } = renderHook(() => useGenres())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Failed to fetch genres: 500')
    expect(result.current.genres).toEqual([])
  })

  it('fetches only once on mount', async () => {
    const { rerender } = renderHook(() => useGenres())
    rerender()
    rerender()
    await waitFor(() => expect(vi.mocked(fetch).mock.calls.length).toBe(1))
  })
})
