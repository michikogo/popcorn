import { useState, useEffect } from 'react'
import fetchMovie, { type MovieDetail } from '../api/fetchMovie'

const useMovie = (id: number) => {
  const [prevId, setPrevId] = useState(id)
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  if (prevId !== id) {
    setPrevId(id)
    setMovie(null)
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchMovie(id, controller.signal)
      .then((data) => setMovie(data))
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [id])

  return { movie, loading, error }
}

export default useMovie
