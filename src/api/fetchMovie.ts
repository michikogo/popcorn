const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string
const BASE_URL = 'https://api.themoviedb.org/3'

export interface MovieDetail {
  id: number
  title: string
  tagline: string
  overview: string
  runtime: number | null
  release_date: string
  vote_average: number
  poster_path: string | null
  genres: { id: number; name: string }[]
}

const fetchMovie = async (id: number, signal?: AbortSignal): Promise<MovieDetail> => {
  const params = new URLSearchParams({ api_key: API_KEY })
  const res = await fetch(`${BASE_URL}/movie/${id}?${params}`, { signal })
  if (!res.ok) throw new Error(`Failed to fetch movie: ${res.status}`)
  return res.json()
}

export default fetchMovie
