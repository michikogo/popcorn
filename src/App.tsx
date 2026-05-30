import React from 'react'
import useMovies from './hooks/useMovies'
import MovieGrid from './components/MovieGrid'

const App = () => {
  const { movies, loading, error } = useMovies()

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <MovieGrid movies={movies} loading={loading} error={error} />
    </div>
  )
}

export default App
