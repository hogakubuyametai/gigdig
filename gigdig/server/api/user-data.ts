// 問題のあるAPI実装例
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event)
  
  // セキュリティ問題: 入力検証なし
  const userId = query.userId as string
  const userInput = body.message as string
  
  // SQLインジェクション風（実際にはNoSQL）
  const searchQuery = `db.users.find({name: "${userInput}"})`
  
  // エラーハンドリングなし
  const userResult = await $fetch(`/external-api/users/${userId}`)
  
  // XSS脆弱性: サニタイズなし
  const responseHtml = `<div>ユーザー: ${userInput}</div>`
  
  // データ露出: 内部情報を返す
  return {
    user: userResult,
    internalData: {
      dbPassword: process.env.DB_PASSWORD, // 危険: パスワード露出
      adminToken: 'secret-admin-token-123'
    },
    rawHtml: responseHtml,
    debug: {
      query: searchQuery,
      environment: process.env // 環境変数全体を露出
    }
  }
})

// グローバルスコープでの危険な操作
console.log('Admin password:', process.env.ADMIN_PASSWORD)

// メモリリーク: グローバル変数への蓄積
const globalCache: any[] = []

function addToGlobalCache(data: any) {
  globalCache.push(data) // 無制限に蓄積
}

// 未使用の関数（デッドコード）
function unusedFunction() {
  return 'This function is never called'
}
