const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

const getPosterUrl = (posterPath: string): string => {
  return `${IMAGE_BASE_URL}${posterPath}`
}

export default getPosterUrl
