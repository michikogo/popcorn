import React, { useState } from 'react'
import type { Movie } from '../types/tmdb'
import getPosterUrl from '../api/getPosterUrl'
import getRatingClasses from '../utils/getRatingClasses'
import NoPoster from './NoPoster'

interface Props {
  movie: Movie
  onClick: () => void
}

const MovieCard = ({ movie, onClick }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div
      className={`group cursor-pointer overflow-hidden rounded-xl bg-zinc-800 transition duration-300 hover:scale-105 hover:shadow-xl ${getRatingClasses(movie.vote_average)}`}
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] w-full">
        {movie.vote_average >= 8 && (
          <span className="absolute left-0 top-3 z-10 rounded-r-md bg-yellow-400 px-2 py-0.5 text-xs font-bold text-zinc-900">
            Top Rated
          </span>
        )}
        {movie.poster_path ? (
          <>
            {!imageLoaded && <div className="absolute inset-0 animate-shimmer" />}
            <img
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              className={`h-full w-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <NoPoster />
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-white">{movie.title}</h3>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span className="text-xs text-zinc-400">{movie.vote_average.toFixed(1)}</span>
          <span className="text-xs text-zinc-400">·</span>
          <span className="text-xs text-zinc-400">{movie.release_date?.slice(0, 4)}</span>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
