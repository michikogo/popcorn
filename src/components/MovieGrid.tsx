import React from 'react'
import type { Movie } from '../types/tmdb'
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'

interface Props {
  movies: Movie[]
  loading: boolean
  error: string | null
}

const SKELETON_COUNT = 20

const MovieGrid = ({ movies, loading, error }: Props) => {
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

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {loading
        ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)
        : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
    </div>
  )
}

export default MovieGrid
