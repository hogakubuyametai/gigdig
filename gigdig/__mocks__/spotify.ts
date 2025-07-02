import { vi } from 'vitest'

// モックデータ
export const mockArtistData = {
  id: 'test-artist-id',
  name: 'Test Artist',
  images: [{ url: 'https://example.com/artist-image.jpg' }],
  genres: ['rock', 'alternative'],
  popularity: 75
}

export const mockTopTracks = [
  {
    id: 'track-1',
    name: 'Test Track 1',
    preview_url: 'https://example.com/preview1.mp3'
  },
  {
    id: 'track-2',
    name: 'Test Track 2',
    preview_url: 'https://example.com/preview2.mp3'
  }
]

export const mockSearchResults = [
  {
    id: 'artist-1',
    name: 'Search Artist 1',
    images: [{ url: 'https://example.com/search1.jpg' }]
  },
  {
    id: 'artist-2',
    name: 'Search Artist 2',
    images: [{ url: 'https://example.com/search2.jpg' }]
  }
]

// Spotify API関数のモック
export const mockSpotifyFunctions = {
  searchArtists: vi.fn().mockResolvedValue(mockSearchResults),
  getArtistDetails: vi.fn().mockResolvedValue(mockArtistData),
  getArtistTopTracks: vi.fn().mockResolvedValue(mockTopTracks),
  getRelatedArtists: vi.fn().mockResolvedValue(mockSearchResults)
}

// モック関数をリセットするヘルパー
export const resetSpotifyMocks = () => {
  Object.values(mockSpotifyFunctions).forEach(mock => {
    mock.mockClear()
  })
}
