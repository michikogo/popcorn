import React from 'react'
import type { Movie } from '../types/tmdb'
import MovieCard from './MovieCard'
import MovieListItem from './MovieListItem'
import SkeletonCard from './SkeletonCard'

interface Props {
  movies: Movie[]
  loading: boolean
  error: string | null
  layout: 'grid' | 'list'
}

const SKELETON_COUNT = 10

const MovieGallery = ({ movies, loading, error, layout }: Props) => {
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
      ? 'flex flex-col gap-5'
      : 'grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'

  return (
    <div className={containerClass}>
      {loading
        ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)
        : layout === 'list'
          ? movies.map((movie) => <MovieListItem key={movie.id} movie={movie} />)
          : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
    </div>
  )
}

export default MovieGallery
