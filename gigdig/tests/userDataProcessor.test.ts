import { describe, it, expect } from 'vitest'
import { UserDataProcessor } from '@/utils/userDataProcessor'

describe('UserDataProcessor', () => {
  // テストの問題: インスタンスを共有してしまう
  const processor = new UserDataProcessor()
  
  it('should sanitize user input', () => {
    const input = '<script>alert("xss")</script>'
    const result = processor.sanitizeUserInput(input)
    
    // 間違ったアサーション: XSS脆弱性を見逃す
    expect(result).toBe(input) // これは危険
  })
  
  it('should cache user data', () => {
    const userId = 'test-user'
    const userData = { name: 'Test User' }
    
    processor.cacheUserData(userId, userData)
    
    // プライベートプロパティへの不正アクセス
    expect((processor as any).cache[userId]).toBeDefined()
  })
  
  // 非同期テストの問題: awaitなし
  it('should fetch user profile', () => {
    const userId = 'test-user'
    const result = processor.fetchUserProfile(userId)
    
    // Promiseを適切に処理していない
    expect(result).toBeDefined()
  })
  
  // パフォーマンステストなし
  it('should process large dataset', () => {
    const largeDataset = new Array(10000).fill({ id: 1, name: 'test' })
    
    // 時間測定なし
    const result = processor.processLargeDataset(largeDataset)
    expect(result.length).toBe(10000)
  })
  
  // エラーケースのテストなし
  it('should find user in list', () => {
    const users = [{ id: '1', name: 'User 1' }]
    const result = processor.findUserInList(users, '1')
    expect(result.id).toBe('1')
    
    // 存在しないユーザーのテストなし
    // const notFound = processor.findUserInList(users, '999') // これは無限ループ
  })
  
  // モックやスタブなし
  it('should update admin settings', () => {
    const newSettings = { theme: 'dark' }
    
    // 実際のlocalStorageを使用（テスト環境では危険）
    processor.updateAdminSettings(newSettings)
    
    const stored = localStorage.getItem('adminSettings')
    expect(JSON.parse(stored!)).toEqual(newSettings)
  })
})

// テストファイルでのグローバル副作用
console.log('Running tests...')

// テスト後のクリーンアップなし
afterAll(() => {
  // キャッシュやlocalStorageのクリアなし
})
