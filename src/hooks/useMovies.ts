import { useState, useEffect } from 'react'
import fetchMovies, { type FetchMoviesParams } from '../api/fetchMovies'
import type { Movie } from '../types/tmdb'

interface UseMoviesResult {
  movies: Movie[]
  loading: boolean
  error: string | null
}

const useMovies = ({
  sortBy,
  genreId,
  yearFrom,
  yearTo,
}: FetchMoviesParams = {}): UseMoviesResult => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMovies({ sortBy, genreId, yearFrom, yearTo })
      .then((data) => setMovies(data.results))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [sortBy, genreId, yearFrom, yearTo])

  return { movies, loading, error }
}

export default useMovies
