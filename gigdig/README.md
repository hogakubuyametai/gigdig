# 🎵 GigDig

**GigDig**は、音楽イベントやライブのスケジュール管理を簡単に、より楽しくするWebアプリケーションです。Spotify APIと連携し、スケジュールとアーティスト情報を紐づけます。

✨ **実際のアプリを体験**: [https://gigdig.vercel.app/](https://gigdig.vercel.app/)

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4124035/0f45f4a1-d087-4a45-a306-22013df8fd47.png)

## ✨ 主な機能

- 🎤 **ギグ管理**: ライブの追加・編集・削除
- 📅 **カレンダー表示**: カレンダー形式でスケジュール確認
- 🎵 **Spotify連携**: アーティスト情報の自動取得
- 👤 **ユーザー認証**: SupabaseによるGoogle認証または匿名認証
- 📱 **レスポンシブデザイン**: PC・スマートフォン対応

## 🛠️ 技術スタック

- **フロントエンド**: Vue.js 3.5.14 / Nuxt 3.17.4
- **言語**: JavaScript / TypeScript
- **スタイリング**: Tailwind CSS 3.4.17
- **認証**: Supabase (Google認証・匿名認証)
- **データベース**: Supabase
- **API**: Spotify Web API
- **デプロイ**: Vercel

## 📊 データベース設計（Supabase）

### テーブル構成

**usersテーブル**
| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | INT8 | 主キー |
| created_at | TIMESTAMPTZ | 作成日時 |
| user_id | UUID | ユーザーID（authから取得） |
| username | VARCHAR | ユーザー名 |

**gigsテーブル**
| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | 主キー |
| created_at | TIMESTAMPTZ | 作成日時 |
| user_id | UUID | ユーザーID（外部キー） |
| gig_date | DATE | ギグの日程 |
| artist_name | TEXT | アーティスト名 |
| artist_id | TEXT | SpotifyのアーティストID |

## 📁 プロジェクト構成

```
gigdig/
├── components/          # Vueコンポーネント
│   ├── Calendar.vue     # カレンダー表示
│   ├── AddGigModal.vue  # ギグ追加モーダル
│   ├── GigDetailModal.vue # ギグ詳細モーダル
│   ├── ArtistNameInput.vue # アーティスト名入力 / アーティスト選択
│   └── ContextMenu.vue  # コンテキストメニュー（Deleteボタン）
├── composables/         # 再利用可能なロジック
│   ├── useGigData.ts    # ギグデータ管理
│   ├── useSpotifyData.ts # Spotify API連携
│   └── useArtistCache.ts # アーティストデータのキャッシュ
├── middleware/          # ミドルウェア
│   └── auth.global.ts   # 認証チェック
├── pages/              # ページコンポーネント
│   ├── index.vue       # トップページ
│   ├── login.vue       # ログインページ
│   ├── confirm.vue     # 認証確認
│   └── register-username.vue # ユーザー名登録ページ
├── server/api/         # サーバーAPI
│   └── auth/spotify.js # Spotify Web APIのアクセストークン取得
├── tests/              # テストファイル
│   ├── setup.ts        # テストセットアップ
│   ├── components/     # コンポーネントテスト
│   │   ├── AddGigModal.test.ts # ギグ追加モーダルテスト
│   │   └── Calendar.test.ts    # カレンダーテスト
│   └── composables/    # Composablesテスト
│       ├── useArtistCache.test.ts # アーティストキャッシュテスト
│       ├── useGigData.test.ts     # ギグデータテスト
│       └── useSpotifyData.test.ts # Spotify APIテスト
├── __mocks__/          # モックファイル
│   ├── spotify.ts      # Spotify APIモック
│   └── supabase.ts     # Supabaseモック
├── utils/              # ユーティリティ
│   └── spotify.js      # Spotify API関連関数
└── docs/               # ドキュメント
    ├── DESIGN_RULE.md  # デザインルール
    └── TEST_IMPLEMENTATION_PLAN.md # テスト実装計画
```

## 🎯 使用方法

1. **ログイン**: Googleアカウントまたは匿名でログイン
2. **ユーザー名登録**: 初回ログイン時にユーザー名を設定
3. **ギグ追加**: カレンダーの日付をクリックして新しいギグを追加
4. **アーティスト検索**: Spotify APIからアーティスト情報を自動取得
5. **トップトラックの表示**: 既存のギグをクリックしてアーティストのトップトラックを表示
6. **ギグ管理**: 既存のギグの日付編集・既存のギグの削除（PC: 右クリック, SP: 長押し）

## 💡 技術的な特徴

### 外部API連携
- **Spotify Web API**: アーティスト情報（アーティスト名、画像、トップトラック等）の取得

### 認証・セキュリティ
- **マルチ認証対応**: Google認証と匿名認証の両方に対応
- **ミドルウェア実装**: 認証状態の自動チェックとルート保護

### パフォーマンス最適化
- **アーティストキャッシュ**: アーティスト画像やトップトラックのキャッシュによる最適化
- **レスポンシブデザイン**: PC・スマートフォン両対応のUI設計

## 🔧 主要なコンポーネント

### Calendar.vue
- 月間カレンダー表示
- ギグの視覚的表示
- 日付クリックでギグ追加

### AddGigModal.vue
- 新規ギグ作成フォーム
- アーティスト検索機能
- バリデーション機能

### GigDetailModal.vue
- ギグ詳細表示
- ギグ日付編集機能
- トップトラック、関連アーティストの表示

### ArtistNameInput.vue
- アーティスト名入力コンポーネント
- Spotify API連携による自動補完
- リアルタイム検索機能

## 🚧 今後の予定機能

- [ ] ギグの共有機能
- [ ] 会場の登録
- [ ] PWA化
- [x] 関連アーティストの表示

---

**GigDig** - Gigを通じてDigをもっと楽しく！
