import type { DiscoverResponse } from '../types/tmdb'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string
const BASE_URL = 'https://api.themoviedb.org/3'

export interface FetchMoviesParams {
  sortBy?: string
  genreId?: number | null
  yearFrom?: number | null
  yearTo?: number | null
  page?: number
}

const fetchMovies = async (
  {
    sortBy = 'popularity.desc',
    genreId = null,
    yearFrom = null,
    yearTo = null,
    page = 1,
  }: FetchMoviesParams = {},
  signal?: AbortSignal,
): Promise<DiscoverResponse> => {
  const params = new URLSearchParams({
    api_key: API_KEY,
    sort_by: sortBy,
    page: String(page),
  })

  if (genreId) params.append('with_genres', String(genreId))
  if (yearFrom) params.append('primary_release_date.gte', `${yearFrom}-01-01`)
  if (yearTo) params.append('primary_release_date.lte', `${yearTo}-12-31`)

  const res = await fetch(`${BASE_URL}/discover/movie?${params}`, { signal })
  if (!res.ok) throw new Error(`Failed to fetch movies: ${res.status}`)
  return res.json()
}

export default fetchMovies
