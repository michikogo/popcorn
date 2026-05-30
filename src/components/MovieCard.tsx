import React from 'react'
import type { Movie } from '../types/tmdb'
import getPosterUrl from '../api/getPosterUrl'
import NoPoster from './NoPoster'

interface Props {
  movie: Movie
}

const MovieCard = ({ movie }: Props) => {
  return (
    <div className="group cursor-pointer overflow-hidden rounded-xl bg-zinc-800 transition duration-300 hover:scale-105 hover:shadow-xl">
      <div className="aspect-[2/3] w-full">
        {movie.poster_path ? (
          <img
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <NoPoster />
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-white">{movie.title}</h3>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span className="text-xs text-zinc-400">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
