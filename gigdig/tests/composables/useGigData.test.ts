import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGigData } from '@/composables/useGigData'
import { createMockSupabaseClient, createMockSupabaseError, createMockSupabaseSuccess } from '@/__mocks__/supabase'

describe('useGigData', () => {
  let mockClient: any
  let gigData: any

  beforeEach(() => {
    mockClient = createMockSupabaseClient()
    gigData = {
      userId: 'test-user-id',
      date: '2024-01-15',
      artistId: 'test-artist-id',
      artistName: 'Test Artist'
    }
  })

  describe('saveGigData', () => {
    it('ギグデータの保存が成功する', async () => {
      // Arrange
      const mockData = { id: 'new-gig-id', ...gigData }
      mockClient._mocks.single.mockResolvedValue(createMockSupabaseSuccess(mockData))
      
      const { saveGigData } = useGigData()

      // Act
      const result = await saveGigData(gigData, mockClient)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(mockClient.from).toHaveBeenCalledWith('gigs')
    })

    it('データベースエラー時に適切なエラーメッセージを返す', async () => {
      // Arrange
      const mockError = createMockSupabaseError('23505', 'duplicate key value')
      mockClient._mocks.single.mockResolvedValue({ data: null, error: mockError })
      
      const { saveGigData } = useGigData()

      // Act
      const result = await saveGigData(gigData, mockClient)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('同じ日付のGigが既に登録されています。')
    })

    it('未知のエラー時にデフォルトメッセージを返す', async () => {
      // Arrange
      const mockError = createMockSupabaseError('99999', 'unknown error')
      mockClient._mocks.single.mockResolvedValue({ data: null, error: mockError })
      
      const { saveGigData } = useGigData()

      // Act
      const result = await saveGigData(gigData, mockClient)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('データの保存に失敗しました。時間をおいて再度お試しください。')
    })
  })

  describe('getGigList', () => {
    it('ギグ一覧の取得が成功する', async () => {
      // Arrange
      const mockGigs = [
        { id: 'gig-1', gig_date: '2024-01-15', artist_id: 'artist-1', artist_name: 'Artist 1' },
        { id: 'gig-2', gig_date: '2024-01-16', artist_id: 'artist-2', artist_name: 'Artist 2' }
      ]
      mockClient._mocks.eq.mockResolvedValue(createMockSupabaseSuccess(mockGigs))
      
      const { getGigList } = useGigData()

      // Act
      const result = await getGigList('test-user-id', mockClient)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGigs)
      expect(mockClient.from).toHaveBeenCalledWith('gigs')
    })

    it('取得エラー時に適切なレスポンスを返す', async () => {
      // Arrange
      const mockError = createMockSupabaseError('42501', 'permission denied')
      mockClient._mocks.eq.mockResolvedValue({ data: null, error: mockError })
      
      const { getGigList } = useGigData()

      // Act
      const result = await getGigList('test-user-id', mockClient)

      // Assert
      expect(result.success).toBe(false)
      expect(result.data).toEqual([])
      expect(result.error).toEqual(mockError)
    })
  })

  describe('deleteGigData', () => {
    it('ギグの削除が成功する', async () => {
      // Arrange
      mockClient._mocks.eq.mockResolvedValue(createMockSupabaseSuccess(null))
      
      const { deleteGigData } = useGigData()

      // Act
      const result = await deleteGigData('test-gig-id', mockClient)

      // Assert
      expect(result.success).toBe(true)
      expect(mockClient.from).toHaveBeenCalledWith('gigs')
    })

    it('削除エラー時に適切なレスポンスを返す', async () => {
      // Arrange
      const mockError = createMockSupabaseError('23503', 'foreign key violation')
      mockClient._mocks.eq.mockRejectedValue(mockError)
      
      const { deleteGigData } = useGigData()

      // Act
      const result = await deleteGigData('test-gig-id', mockClient)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toEqual(mockError)
    })
  })

  describe('updateGigData', () => {
    it('ギグの更新が成功する', async () => {
      // Arrange
      const updatedData = { ...gigData, date: '2024-01-20' }
      mockClient._mocks.single.mockResolvedValue(createMockSupabaseSuccess(updatedData))
      
      const { updateGigData } = useGigData()

      // Act
      const result = await updateGigData('test-gig-id', updatedData, mockClient)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedData)
      expect(mockClient.from).toHaveBeenCalledWith('gigs')
    })

    it('更新エラー時に適切なレスポンスを返す', async () => {
      // Arrange
      const mockError = createMockSupabaseError('23503', 'foreign key violation')
      mockClient._mocks.single.mockRejectedValue(mockError)
      
      const { updateGigData } = useGigData()

      // Act
      const result = await updateGigData('test-gig-id', gigData, mockClient)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toEqual(mockError)
    })
  })
})
