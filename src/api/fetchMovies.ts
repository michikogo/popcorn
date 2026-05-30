import type { DiscoverResponse } from '../types/tmdb'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string
const BASE_URL = 'https://api.themoviedb.org/3'

export interface FetchMoviesParams {
  sortBy?: string
  genreId?: number | null
  year?: number | null
}

const fetchMovies = async ({
  sortBy = 'popularity.desc',
  genreId = null,
  year = null,
}: FetchMoviesParams = {}): Promise<DiscoverResponse> => {
  const params = new URLSearchParams({
    api_key: API_KEY,
    sort_by: sortBy,
    page: '1',
  })

  if (genreId) params.append('with_genres', String(genreId))
  if (year) params.append('primary_release_year', String(year))

  const res = await fetch(`${BASE_URL}/discover/movie?${params}`)
  if (!res.ok) throw new Error(`Failed to fetch movies: ${res.status}`)
  return res.json()
}

export default fetchMovies
