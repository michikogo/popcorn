import React, { useState } from 'react'
import useMovies from './hooks/useMovies'
import useGenres from './hooks/useGenres'
import FilterBar from './components/FilterBar'
import MovieGallery from './components/MovieGallery'

const App = () => {
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [genreId, setGenreId] = useState<number | null>(null)
  const [yearFrom, setYearFrom] = useState<number | null>(null)
  const [yearTo, setYearTo] = useState<number | null>(null)
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  const { genres } = useGenres()
  const { movies, loading, error } = useMovies({ sortBy, genreId, yearFrom, yearTo })

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="mx-auto max-w-screen-xl">
        <h1 className="mb-6 text-3xl font-bold text-white">Popcorn</h1>
        <div className="mb-6">
          <FilterBar
            genres={genres}
            sortBy={sortBy}
            genreId={genreId}
            yearFrom={yearFrom}
            yearTo={yearTo}
            layout={layout}
            onSortChange={setSortBy}
            onGenreChange={setGenreId}
            onYearFromChange={setYearFrom}
            onYearToChange={setYearTo}
            onLayoutChange={setLayout}
          />
        </div>
        <MovieGallery movies={movies} loading={loading} error={error} layout={layout} />
      </div>
    </div>
  )
}

export default App
