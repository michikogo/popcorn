import { useState, useEffect } from 'react'
import fetchGenres from '../api/fetchGenres'
import type { Genre } from '../types/tmdb'

interface UseGenresResult {
  genres: Genre[]
  loading: boolean
  error: string | null
}

const useGenres = (): UseGenresResult => {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGenres()
      .then((data) => setGenres(data.genres))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { genres, loading, error }
}

export default useGenres
