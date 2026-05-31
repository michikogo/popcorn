import React, { useEffect } from 'react'
import type { Movie } from '../types/tmdb'
import useMovie from '../hooks/useMovie'
import getPosterUrl from '../api/getPosterUrl'
import NoPoster from './NoPoster'

interface Props {
  movie: Movie
  onClose: () => void
}

const MovieModal = ({ movie, onClose }: Props) => {
  const { movie: detail, loading, error } = useMovie(movie.id)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const poster = detail?.poster_path ?? movie.poster_path
  const year = (detail?.release_date ?? movie.release_date)?.slice(0, 4)
  const rating = detail?.vote_average ?? movie.vote_average

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-2xl flex-col gap-6 rounded-2xl bg-zinc-900 p-6 shadow-2xl sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="w-full shrink-0 overflow-hidden rounded-xl sm:w-40">
          {poster ? (
            <img
              src={getPosterUrl(poster)}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="aspect-[2/3]">
              <NoPoster />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <h2 className="text-xl font-bold leading-tight text-white">{movie.title}</h2>
            {detail?.tagline && (
              <p className="mt-1 text-sm italic text-zinc-400">{detail.tagline}</p>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-zinc-300">{rating.toFixed(1)}</span>
            </span>
            {year && <span>· {year}</span>}
            {detail?.runtime ? <span>· {detail.runtime} min</span> : null}
          </div>

          {detail?.genres && detail.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {detail.genres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full bg-zinc-700 px-3 py-1 text-xs text-zinc-300"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
              Loading details…
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          {detail?.overview && (
            <p className="text-sm leading-relaxed text-zinc-300">{detail.overview}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieModal
