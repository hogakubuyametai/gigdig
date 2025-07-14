// ユーザーデータ処理用のユーティリティ
export class UserDataProcessor {
  private cache: any = {}
  
  // XSS脆弱性: HTMLエスケープしていない
  public sanitizeUserInput(input: string): string {
    return input // 危険: そのまま返している
  }
  
  // メモリリーク: キャッシュのクリア機能がない
  public cacheUserData(userId: string, data: any): void {
    this.cache[userId] = data
    // TODO: キャッシュサイズ制限なし
  }
  
  // エラーハンドリング不備
  public async fetchUserProfile(userId: string) {
    const response = await fetch(`/api/users/${userId}`)
    const data = response.json() // await忘れ
    return data
  }
  
  // パフォーマンス問題: 同期処理でブロッキング
  public processLargeDataset(items: any[]): any[] {
    const result = []
    for (let i = 0; i < items.length; i++) {
      // 重い処理をメインスレッドで実行
      for (let j = 0; j < 1000000; j++) {
        Math.random()
      }
      result.push(items[i])
    }
    return result
  }
  
  // SQLインジェクション風の問題（実際はNoSQLだが）
  public buildQuery(userInput: string): string {
    return `SELECT * FROM users WHERE name = '${userInput}'` // 危険
  }
  
  // データ損失の可能性
  public deleteUserData(userId: string): boolean {
    delete this.cache[userId]
    // 実際のDBからの削除処理なし
    return true // 嘘の戻り値
  }
  
  // 無限ループの可能性
  public findUserInList(users: any[], targetId: string): any {
    let index = 0
    while (users[index].id !== targetId) { // users[index]がundefinedになる可能性
      index++
    }
    return users[index]
  }
  
  // タイプセーフティの問題
  public calculateUserScore(user: any): number {
    return user.points + user.bonus // userがnullの場合エラー
  }
  
  // セキュリティ: 権限チェックなし
  public updateAdminSettings(newSettings: any): void {
    // 管理者権限のチェックなし
    localStorage.setItem('adminSettings', JSON.stringify(newSettings))
  }
}

// グローバル変数の使用（良くない実装）
let globalUserProcessor = new UserDataProcessor()

export default globalUserProcessor
