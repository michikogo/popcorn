const getRatingClasses = (rating: number): string => {
  if (rating >= 8) return 'shadow-[0_0_12px_2px] shadow-yellow-400/50 ring-2 ring-yellow-400/70'
  if (rating >= 7) return 'shadow-[0_0_8px_1px] shadow-yellow-400/30 ring-1 ring-yellow-400/50'
  return ''
}

export default getRatingClasses
