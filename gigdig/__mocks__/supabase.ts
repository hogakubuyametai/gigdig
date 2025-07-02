import { vi } from 'vitest'

// Supabaseクライアントのモック
export const createMockSupabaseClient = () => {
  const mockInsert = vi.fn()
  const mockSelect = vi.fn()
  const mockDelete = vi.fn()
  const mockUpdate = vi.fn()
  const mockEq = vi.fn()
  const mockSingle = vi.fn()

  const mockFrom = vi.fn((table: string) => ({
    insert: mockInsert.mockReturnValue({
      single: mockSingle
    }),
    select: mockSelect.mockReturnValue({
      eq: mockEq
    }),
    delete: mockDelete.mockReturnValue({
      eq: mockEq
    }),
    update: mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: mockSingle
      })
    })
  }))

  return {
    from: mockFrom,
    _mocks: {
      insert: mockInsert,
      select: mockSelect,
      delete: mockDelete,
      update: mockUpdate,
      eq: mockEq,
      single: mockSingle
    }
  }
}

// テスト用のエラーレスポンス
export const createMockSupabaseError = (code: string, message: string) => ({
  code,
  message,
  details: null,
  hint: null
})

// テスト用の成功レスポンス
export const createMockSupabaseSuccess = (data: any) => ({
  data,
  error: null
})
