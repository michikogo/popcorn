export interface Movie {
  id: number
  title: string
  poster_path: string | null
  vote_average: number
  release_date: string
  genre_ids: number[]
}

export interface Genre {
  id: number
  name: string
}

export interface DiscoverResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface GenreResponse {
  genres: Genre[]
}
