import React from 'react'

const SkeletonCard = () => {
  return (
    <div className="overflow-hidden rounded-xl bg-zinc-800">
      <div className="aspect-[2/3] w-full animate-pulse bg-zinc-700" />
      <div className="p-3">
        <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-700" />
        <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-zinc-700" />
      </div>
    </div>
  )
}

export default SkeletonCard
