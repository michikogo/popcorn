import React, { useState } from 'react'
import useMovies from './hooks/useMovies'
import useGenres from './hooks/useGenres'
import FilterBar from './components/FilterBar'
import MovieGrid from './components/MovieGrid'

const App = () => {
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [genreId, setGenreId] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)

  const { genres } = useGenres()
  const { movies, loading, error } = useMovies({ sortBy, genreId, year })

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="mx-auto max-w-screen-xl">
        <h1 className="mb-6 text-3xl font-bold text-white">Popcorn</h1>
        <div className="mb-6">
          <FilterBar
            genres={genres}
            sortBy={sortBy}
            genreId={genreId}
            year={year}
            onSortChange={setSortBy}
            onGenreChange={setGenreId}
            onYearChange={setYear}
          />
        </div>
        <MovieGrid movies={movies} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default App
