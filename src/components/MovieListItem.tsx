import React, { useState } from 'react'
import type { Movie } from '../types/tmdb'
import getPosterUrl from '../api/getPosterUrl'
import getRatingClasses from '../utils/getRatingClasses'
import NoPoster from './NoPoster'

interface Props {
  movie: Movie
}

const MovieListItem = ({ movie }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div
      className={`flex cursor-pointer items-center gap-4 rounded-xl bg-zinc-800 p-3 transition duration-300 hover:bg-zinc-700 ${getRatingClasses(movie.vote_average)}`}
    >
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg">
        {movie.vote_average >= 8 && (
          <span className="absolute left-0 top-1 z-10 rounded-r bg-yellow-400 px-1 py-0.5 text-[9px] font-bold leading-none text-zinc-900">
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
      <div className="min-w-0">
        <h3 className="truncate font-semibold text-white">{movie.title}</h3>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span className="text-sm text-zinc-400">{movie.vote_average.toFixed(1)}</span>
          <span className="text-sm text-zinc-400">·</span>
          <span className="text-sm text-zinc-400">{movie.release_date?.slice(0, 4)}</span>
        </div>
      </div>
    </div>
  )
}

export default MovieListItem
