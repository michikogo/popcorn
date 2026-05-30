import React from 'react'

const App = () => {
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="grid grid-cols-4 gap-4">
        {/* Placeholder MovieCard */}
        <div className="group relative cursor-pointer overflow-hidden rounded-xl bg-gray-800 transition duration-300 hover:scale-105 hover:shadow-2xl">
          {/* Poster */}
          <div className="aspect-[2/3] w-full bg-gray-700">
            <img
              src="https://placehold.co/300x450/1f2937/6b7280?text=Poster"
              alt="Movie poster"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Card info */}
          <div className="p-3">
            <h3 className="truncate text-sm font-semibold text-white">Movie Title</h3>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-xs text-gray-400">8.4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
