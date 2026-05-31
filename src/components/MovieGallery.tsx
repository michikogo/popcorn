import React, { useEffect, useRef } from 'react'
import type { Movie } from '../types/tmdb'
import MovieCard from './MovieCard'
import MovieListItem from './MovieListItem'
import SkeletonCard from './SkeletonCard'

interface Props {
  movies: Movie[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  layout: 'grid' | 'list'
  page: number
  totalPages: number
  onLoadMore: () => void
  onMovieClick: (movie: Movie) => void
}

const SKELETON_COUNT = 10

const MovieGallery = ({
  movies,
  loading,
  loadingMore,
  error,
  layout,
  page,
  totalPages,
  onLoadMore,
  onMovieClick,
}: Props) => {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore()
      },
      { rootMargin: '500px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [onLoadMore])

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
    <>
      <div className={containerClass}>
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)
          : layout === 'list'
            ? movies.map((movie) => (
                <MovieListItem key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
              ))
            : movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
              ))}
      </div>

      {!loading && page < totalPages && <div ref={sentinelRef} />}

      {loadingMore && (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
        </div>
      )}
    </>
  )
}

export default MovieGallery
