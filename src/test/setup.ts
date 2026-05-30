import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.stubEnv('VITE_TMDB_API_KEY', 'test-key')

const mockObserver = { observe: vi.fn(), disconnect: vi.fn() }
vi.stubGlobal(
  'IntersectionObserver',
  vi.fn(() => mockObserver),
)
