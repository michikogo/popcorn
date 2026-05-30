import React from 'react'

const SkeletonCard = () => {
  return (
    <div className="overflow-hidden rounded-xl bg-zinc-800">
      <div className="aspect-[2/3] w-full animate-shimmer" />
      <div className="p-3">
        <div className="h-3 w-3/4 animate-shimmer rounded" />
        <div className="mt-2 h-3 w-1/4 animate-shimmer rounded" />
      </div>
    </div>
  )
}

export default SkeletonCard
