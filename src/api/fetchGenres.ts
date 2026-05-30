import type { GenreResponse } from '../types/tmdb'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string
const BASE_URL = 'https://api.themoviedb.org/3'

const fetchGenres = async (): Promise<GenreResponse> => {
  const params = new URLSearchParams({ api_key: API_KEY })
  const res = await fetch(`${BASE_URL}/genre/movie/list?${params}`)
  if (!res.ok) throw new Error(`Failed to fetch genres: ${res.status}`)
  return res.json()
}

export default fetchGenres
