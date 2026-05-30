import noPoster from '../assets/no-poster.png'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

const getPosterUrl = (posterPath: string | null): string => {
  if (!posterPath) return noPoster
  return `${IMAGE_BASE_URL}${posterPath}`
}

export default getPosterUrl
