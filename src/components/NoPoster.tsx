import React from 'react'

const NoPoster = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-zinc-800 text-zinc-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="m2 7 4-4 4 4 4-4 4 4" />
        <circle cx="8" cy="14" r="2" />
        <path d="m14 12 4 6H6l4-5" />
      </svg>
      <span className="text-xs">No poster</span>
    </div>
  )
}

export default NoPoster
