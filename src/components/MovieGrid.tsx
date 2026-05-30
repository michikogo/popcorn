import React from 'react'
import type { Movie } from '../types/tmdb'
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'

interface Props {
  movies: Movie[]
  loading: boolean
  error: string | null
  layout: 'grid' | 'list'
}

const SKELETON_COUNT = 10

const MovieGrid = ({ movies, loading, error, layout }: Props) => {
  if (error) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-400">
        <p>{error}</p>
      </div>
    )
  }

  if (!loading && movies.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-400">
        <p>No movies found. Try adjusting your filters.</p>
      </div>
    )
  }

  const containerClass =
    layout === 'list'
      ? 'flex flex-col gap-3'
      : 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'

  return (
    <div className={containerClass}>
      {loading
        ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)
        : movies.map((movie) => <MovieCard key={movie.id} movie={movie} layout={layout} />)}
    </div>
  )
}

export default MovieGrid
