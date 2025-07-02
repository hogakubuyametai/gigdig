import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useSpotifyData } from '@/composables/useSpotifyData'
import { mockSearchResults, resetSpotifyMocks } from '@/__mocks__/spotify'

// Spotify関数のモック
vi.mock('@/utils/spotify', () => ({
  searchArtists: vi.fn(),
  getArtistDetails: vi.fn(),
  getArtistTopTracks: vi.fn(),
  getRelatedArtists: vi.fn()
}))

// モック関数のインポート
import { searchArtists } from '@/utils/spotify'
const mockSearchArtists = vi.mocked(searchArtists)

describe('useSpotifyData', () => {
  beforeEach(() => {
    resetSpotifyMocks()
    mockSearchArtists.mockClear()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('初期状態', () => {
    it('初期値が正しく設定される', () => {
      // Arrange & Act
      const { searchResults, isSearching } = useSpotifyData()

      // Assert
      expect(searchResults.value).toEqual([])
      expect(isSearching.value).toBe(false)
    })
  })

  describe('searchArtists', () => {
    it('正常な検索が実行される', async () => {
      // Arrange
      mockSearchArtists.mockResolvedValue(mockSearchResults)
      const { searchArtists, searchResults, isSearching } = useSpotifyData()

      // Act
      await searchArtists('Radiohead')
      expect(isSearching.value).toBe(true)
      
      // デバウンス後の処理を実行
      vi.advanceTimersByTime(300)
      await vi.runAllTimersAsync()

      // Assert
      expect(mockSearchArtists).toHaveBeenCalledWith('Radiohead')
      expect(searchResults.value).toEqual(mockSearchResults)
      expect(isSearching.value).toBe(false)
    })

    it('空文字列の場合は検索をスキップする', async () => {
      // Arrange
      const { searchArtists, searchResults } = useSpotifyData()

      // Act
      await searchArtists('')
      vi.advanceTimersByTime(300)
      await vi.runAllTimersAsync()

      // Assert
      expect(mockSearchArtists).not.toHaveBeenCalled()
      expect(searchResults.value).toEqual([])
    })

    it('空白のみの文字列の場合は検索をスキップする', async () => {
      // Arrange
      const { searchArtists, searchResults } = useSpotifyData()

      // Act
      await searchArtists('   ')
      vi.advanceTimersByTime(300)
      await vi.runAllTimersAsync()

      // Assert
      expect(mockSearchArtists).not.toHaveBeenCalled()
      expect(searchResults.value).toEqual([])
    })

    it('エラー時に適切にハンドリングされる', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSearchArtists.mockRejectedValue(new Error('API Error'))
      const { searchArtists, isSearching } = useSpotifyData()

      // Act
      await searchArtists('test')
      vi.advanceTimersByTime(300)
      await vi.runAllTimersAsync()

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Error searching artists:', expect.any(Error))
      expect(isSearching.value).toBe(false)
      
      consoleSpy.mockRestore()
    })
  })

  describe('デバウンス機能', () => {
    it('連続した検索要求を適切にデバウンスする', async () => {
      // Arrange
      mockSearchArtists.mockResolvedValue(mockSearchResults)
      const { searchArtists } = useSpotifyData()

      // Act
      await searchArtists('R')
      await searchArtists('Ra')
      await searchArtists('Rad')
      await searchArtists('Radio')
      await searchArtists('Radiohead')

      // 最初の4回の検索はキャンセルされ、最後の検索のみ実行される
      vi.advanceTimersByTime(300)
      await vi.runAllTimersAsync()

      // Assert
      expect(mockSearchArtists).toHaveBeenCalledTimes(1)
      expect(mockSearchArtists).toHaveBeenCalledWith('Radiohead')
    })

    it('デバウンス期間中は検索が実行されない', async () => {
      // Arrange
      mockSearchArtists.mockResolvedValue(mockSearchResults)
      const { searchArtists } = useSpotifyData()

      // Act
      await searchArtists('test')
      
      // 300ms未満の時間経過
      vi.advanceTimersByTime(200)
      
      // Assert
      expect(mockSearchArtists).not.toHaveBeenCalled()
    })

    it('デバウンス期間経過後に検索が実行される', async () => {
      // Arrange
      mockSearchArtists.mockResolvedValue(mockSearchResults)
      const { searchArtists } = useSpotifyData()

      // Act
      await searchArtists('test')
      
      // 300ms経過
      vi.advanceTimersByTime(300)
      await vi.runAllTimersAsync()
      
      // Assert
      expect(mockSearchArtists).toHaveBeenCalledWith('test')
    })
  })

  describe('ローディング状態', () => {
    it('検索開始時にisSearchingがtrueになる', async () => {
      // Arrange
      mockSearchArtists.mockResolvedValue(mockSearchResults)
      const { searchArtists, isSearching } = useSpotifyData()

      // Act
      await searchArtists('test')

      // Assert
      expect(isSearching.value).toBe(true)
    })

    it('検索完了時にisSearchingがfalseになる', async () => {
      // Arrange
      mockSearchArtists.mockResolvedValue(mockSearchResults)
      const { searchArtists, isSearching } = useSpotifyData()

      // Act
      await searchArtists('test')
      vi.advanceTimersByTime(300)
      await vi.runAllTimersAsync()

      // Assert
      expect(isSearching.value).toBe(false)
    })

    it('エラー時もisSearchingがfalseになる', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSearchArtists.mockRejectedValue(new Error('API Error'))
      const { searchArtists, isSearching } = useSpotifyData()

      // Act
      await searchArtists('test')
      vi.advanceTimersByTime(300)
      await vi.runAllTimersAsync()

      // Assert
      expect(isSearching.value).toBe(false)
      
      consoleSpy.mockRestore()
    })
  })
})
