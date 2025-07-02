import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useArtistCache } from '@/composables/useArtistCache'
import { mockArtistData, mockTopTracks, resetSpotifyMocks } from '@/__mocks__/spotify'

// Spotify関数のモック
vi.mock('@/utils/spotify', () => ({
  getArtistDetails: vi.fn(),
  getArtistTopTracks: vi.fn(),
  searchArtists: vi.fn(),
  getRelatedArtists: vi.fn()
}))

// モック関数のインポート
import { getArtistDetails, getArtistTopTracks } from '@/utils/spotify'
const mockGetArtistDetails = vi.mocked(getArtistDetails)
const mockGetArtistTopTracks = vi.mocked(getArtistTopTracks)

describe('useArtistCache', () => {
  const testArtistId = 'test-artist-id'
  
  beforeEach(() => {
    // モック関数をクリア
    mockGetArtistDetails.mockClear()
    mockGetArtistTopTracks.mockClear()
    // sessionStorageをクリア
    vi.mocked(window.sessionStorage.clear).mockClear()
    vi.mocked(window.sessionStorage.getItem).mockClear()
    vi.mocked(window.sessionStorage.setItem).mockClear()
    // getItemはデフォルトでnullを返すように設定
    vi.mocked(window.sessionStorage.getItem).mockReturnValue(null)
  })

  describe('getArtistData', () => {
    it('キャッシュミス時にSpotify APIからデータを取得する', async () => {
      // Arrange
      const expectedData = {
        artistImageUrl: mockArtistData.images[0].url,
        topTrackIds: mockTopTracks.map(track => track.id)
      }
      
      mockGetArtistDetails.mockResolvedValue(mockArtistData)
      mockGetArtistTopTracks.mockResolvedValue(mockTopTracks)
      
      const { getArtistData } = useArtistCache()

      // Act
      const result = await getArtistData(testArtistId)

      // Assert
      expect(result).toEqual(expectedData)
      expect(mockGetArtistDetails).toHaveBeenCalledWith(testArtistId)
      expect(mockGetArtistTopTracks).toHaveBeenCalledWith(testArtistId)
      expect(window.sessionStorage.setItem).toHaveBeenCalled()
    })

    it('アーティスト画像が存在しない場合はエラーを投げる', async () => {
      // Arrange
      const artistDataWithoutImage = { ...mockArtistData, images: [] }
      mockGetArtistDetails.mockResolvedValue(artistDataWithoutImage)
      
      const { getArtistData } = useArtistCache()

      // Act & Assert
      await expect(getArtistData('new-artist-without-image')).rejects.toThrow('No artist image found')
    })

    it('トップトラック取得に失敗してもアーティストデータは返す', async () => {
      // Arrange
      const expectedData = {
        artistImageUrl: mockArtistData.images[0].url,
        topTrackIds: []
      }
      
      mockGetArtistDetails.mockResolvedValue(mockArtistData)
      mockGetArtistTopTracks.mockRejectedValue(new Error('API Error'))
      
      const { getArtistData } = useArtistCache()

      // Act
      const result = await getArtistData('new-artist-for-track-error')

      // Assert
      expect(result).toEqual(expectedData)
      expect(mockGetArtistDetails).toHaveBeenCalledWith('new-artist-for-track-error')
      expect(mockGetArtistTopTracks).toHaveBeenCalledWith('new-artist-for-track-error')
    })
  })

  describe('setArtistData', () => {
    it('アーティストデータをキャッシュに保存する', () => {
      // Arrange
      const testData = {
        artistImageUrl: 'https://example.com/image.jpg',
        topTrackIds: ['track1', 'track2']
      }
      
      const { setArtistData } = useArtistCache()

      // Act
      setArtistData(testArtistId, testData)

      // Assert
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        'artistCache',
        expect.stringContaining(testArtistId)
      )
    })
  })

  describe('sessionStorage連携', () => {
    it('データを保存する際にsessionStorageを使用する', () => {
      // Arrange
      const testData = {
        artistImageUrl: 'https://example.com/image.jpg',
        topTrackIds: ['track1', 'track2']
      }
      
      const { setArtistData } = useArtistCache()

      // Act
      setArtistData('cache-test-id', testData)

      // Assert
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        'artistCache',
        expect.stringContaining('cache-test-id')
      )
    })
  })
})
