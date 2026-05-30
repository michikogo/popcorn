import React from 'react'
import type { Genre } from '../types/tmdb'

const SORT_OPTIONS = [
  { label: 'Popularity', value: 'popularity.desc' },
  { label: 'Rating', value: 'vote_average.desc' },
  { label: 'Release Date', value: 'release_date.desc' },
]

const YEARS = Array.from({ length: 6 }, (_, i) => 2025 - i)

interface Props {
  genres: Genre[]
  sortBy: string
  genreId: number | null
  year: number | null
  layout: 'grid' | 'list'
  onSortChange: (value: string) => void
  onGenreChange: (value: number | null) => void
  onYearChange: (value: number | null) => void
  onLayoutChange: (value: 'grid' | 'list') => void
}

const FilterBar = ({
  genres,
  sortBy,
  genreId,
  year,
  layout,
  onSortChange,
  onGenreChange,
  onYearChange,
  onLayoutChange,
}: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={genreId ?? ''}
        onChange={(e) => onGenreChange(e.target.value ? Number(e.target.value) : null)}
        className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
      >
        <option value="">All Genres</option>
        {genres.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      <select
        value={year ?? ''}
        onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : null)}
        className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
      >
        <option value="">All Years</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <div className="ml-auto flex rounded-lg bg-zinc-800 p-1">
        <button
          onClick={() => onLayoutChange('grid')}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${layout === 'grid' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
          aria-label="Grid view"
        >
          ⊞
        </button>
        <button
          onClick={() => onLayoutChange('list')}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${layout === 'list' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-white'}`}
          aria-label="List view"
        >
          ☰
        </button>
      </div>
    </div>
  )
}

export default FilterBar
