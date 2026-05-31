import React, { useEffect } from 'react'
import type { Movie, Genre } from '../types/tmdb'
import getPosterUrl from '../api/getPosterUrl'
import NoPoster from './NoPoster'

interface Props {
  movie: Movie
  genres: Genre[]
  onClose: () => void
}

const MovieModal = ({ movie, genres, onClose }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const movieGenres = genres.filter((g) => movie.genre_ids.includes(g.id))
  const year = movie.release_date?.slice(0, 4)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-lg flex-col gap-6 rounded-2xl bg-zinc-900 p-6 shadow-2xl sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="w-full shrink-0 overflow-hidden rounded-xl sm:w-36">
          {movie.poster_path ? (
            <img
              src={getPosterUrl(movie.poster_path)}
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
          <h2 className="text-xl font-bold text-white leading-tight">{movie.title}</h2>

          <div className="flex items-center gap-2">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-zinc-300">{movie.vote_average.toFixed(1)}</span>
            {year && <span className="text-sm text-zinc-500">· {year}</span>}
          </div>

          {movieGenres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movieGenres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full bg-zinc-700 px-3 py-1 text-xs text-zinc-300"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieModal
