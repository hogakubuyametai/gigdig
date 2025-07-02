# テスト実装計画書

## 概要
GigDigアプリケーションの品質向上を目的とした、包括的なテストコードの実装計画です。

## 実装対象

### 1. 単体テスト (Composables) ✅ 完了
- [x] `composables/useGigData.ts` - 9テスト (100%カバレッジ)
- [x] `composables/useSpotifyData.ts` - 11テスト (100%カバレッジ)  
- [x] `composables/useArtistCache.ts` - 5テスト (78.43%カバレッジ)

**Composables総合カバレッジ: 93.45%** 🎯

### 2. コンポーネントテスト
- [ ] `components/Calendar.vue`
- [ ] `components/AddGigModal.vue`
- [ ] `components/GigDetailModal.vue`

### 3. E2Eテスト
- [ ] ログイン → ギグ追加 → 削除の基本フロー
- [ ] カレンダーナビゲーション
- [ ] レスポンシブ対応の確認

## 技術スタック

### テストフレームワーク
- **Vitest**: メインテストランナー
- **@vue/test-utils**: Vueコンポーネントテスト
- **jsdom**: DOM環境のシミュレーション
- **Playwright**: E2Eテスト（オプション）

### 必要な依存関係
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^23.0.0",
    "playwright": "^1.40.0"
  }
}
```

## ディレクトリ構造

```
gigdig/
├── tests/
│   ├── composables/
│   │   ├── useGigData.test.ts
│   │   ├── useSpotifyData.test.ts
│   │   └── useArtistCache.test.ts
│   ├── components/
│   │   ├── Calendar.test.vue
│   │   ├── AddGigModal.test.vue
│   │   └── GigDetailModal.test.vue
│   └── e2e/
│       └── basic-flow.spec.ts
├── vitest.config.ts
└── __mocks__/
    ├── supabase.ts
    └── spotify.ts
```

## 実装手順

### Phase 1: 環境セットアップ (Day 1 - 30分)
1. 必要な依存関係のインストール
2. `vitest.config.ts` の作成
3. `package.json` にテストスクリプトの追加

### Phase 2: Composablesテスト (Day 1 - 3時間)
1. **useGigData.ts テスト**
   - CRUD操作の成功・失敗ケース
   - エラーハンドリングテスト
   - Supabaseクライアントのモック

2. **useArtistCache.ts テスト**
   - キャッシュヒット・ミステスト
   - sessionStorage連携テスト
   - Spotify API連携のモック

### Phase 3: コンポーネントテスト (Day 2 - 4時間)
1. **Calendar.vue テスト**
   - カレンダー表示テスト
   - ギグ表示テスト
   - 日付クリックイベントテスト

2. **AddGigModal.vue テスト**
   - フォーム送信テスト
   - バリデーションテスト
   - アーティスト検索機能テスト

### Phase 4: E2Eテスト (オプション)
1. 基本的なユーザーフロー
2. レスポンシブ対応確認

## テスト設計方針

### 単体テスト
- **AAA パターン**: Arrange, Act, Assert
- **モック活用**: 外部依存の分離
- **エラーケース**: 正常系・異常系の両方をカバー

### コンポーネントテスト
- **ユーザー中心**: ユーザーが実際に行う操作をテスト
- **Props/Emits**: コンポーネントの入出力をテスト
- **DOM操作**: 実際のDOM要素との相互作用をテスト

## 完了条件
- [ ] テストカバレッジ50%以上
- [ ] すべてのテストがローカルで実行可能
- [ ] README.mdにテスト実行方法を記載

## 見積もり工数
**合計**: 1-2日

- Day 1: 環境構築 + Composablesテスト
- Day 2: コンポーネントテスト

## 注意事項
- Supabaseクライアントは必ずモックを使用
- Spotify APIのレスポンスは固定データでテスト
- テスト実行時は実際のAPIを呼び出さない
