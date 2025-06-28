# GigDig Design Rules

GigDigプロジェクト全体のデザインルールとガイドラインを定義するドキュメントです。

## 目次
- [色彩システム](#色彩システム)
- [タイポグラフィ](#タイポグラフィ)
- [コンポーネント](#コンポーネント)
- [レイアウト](#レイアウト)
- [アニメーション・エフェクト](#アニメーションエフェクト)
- [レスポンシブデザイン](#レスポンシブデザイン)
- [命名規則](#命名規則)

## 色彩システム

### メインカラーパレット
GigDigでは以下の色彩体系を使用します：

#### プライマリカラー
- **Emerald**: `emerald-500` (#10b981) - メインアクション、成功状態
- **Blue**: `blue-500` (#3b82f6) - 情報、リンク、セカンダリアクション

#### アクセントカラー
- **Red**: `red-500` (#ef4444) - エラー、削除、日曜日
- **Purple**: `purple-100` (#f3e8ff) - 装飾的な背景
- **Orange**: `orange-100` (#fed7aa) - 警告、特別な強調

#### グレースケール
- **テキスト**: `gray-900` (主要テキスト), `gray-600` (セカンダリテキスト), `gray-400` (無効状態)
- **背景**: `gray-50` (ライト背景), `gray-100` (カード背景)

### グラデーション
```css
/* メインブランドグラデーション */
bg-gradient-to-r from-emerald-500 to-blue-500

/* 背景グラデーション */
bg-gradient-to-br from-emerald-100 via-blue-50 to-purple-100

/* ボタンホバー */
from-emerald-600 to-blue-600
```

## タイポグラフィ

### フォントサイズ階層
```css
/* 見出し */
text-4xl sm:text-5xl lg:text-6xl  /* メインタイトル */
text-2xl                          /* セクションタイトル */
text-xl                           /* サブタイトル */

/* 本文 */
text-base                         /* 通常テキスト */
text-sm                           /* 小さいテキスト */
text-xs                           /* 最小テキスト */
```

### フォントウェイト
- `font-bold`: 見出し、重要な情報
- `font-semibold`: ラベル、ボタン
- `font-medium`: 一般的な強調

## コンポーネント

### ボタン

#### プライマリボタン
```vue
<button class="backdrop-blur-lg bg-gradient-to-r from-emerald-500/80 to-blue-500/80 hover:from-emerald-600/90 hover:to-blue-600/90 text-white border border-white/30 px-3 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl transition-all duration-300 font-semibold cursor-pointer hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden">
  <!-- ボタン内のグラデーション効果 -->
  <div class="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <span class="relative z-10">Button Text</span>
</button>
```

#### セカンダリボタン
```vue
<button class="backdrop-blur-lg bg-white/50 hover:bg-white/70 text-gray-700 border border-white/40 px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-xl transform hover:scale-110">
  Button Text
</button>
```

### カード・モーダル

#### グラスモーフィズムカード
```vue
<div class="backdrop-blur-xl bg-white/60 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-white/30 relative overflow-hidden">
  <!-- 動的背景効果 -->
  <div class="absolute inset-0 bg-gradient-to-r from-emerald-50/30 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
  
  <div class="relative z-10">
    <!-- コンテンツ -->
  </div>
</div>
```

#### モーダル
```vue
<div class="backdrop-blur-lg bg-white/30 p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md relative overflow-hidden">
  <!-- グラスモーフィズム効果のための追加レイヤー -->
  <div class="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-3xl"></div>
  <div class="absolute inset-0 bg-gradient-to-tl from-emerald-100/20 via-transparent to-blue-100/20 rounded-3xl"></div>
  
  <div class="relative z-10">
    <!-- モーダルコンテンツ -->
  </div>
</div>
```

### フォーム要素

#### インプットフィールド
```vue
<input class="w-full backdrop-blur-md bg-white/40 px-4 py-3 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300/50 transition-all duration-300 text-gray-800 placeholder-gray-500" />
```

#### ラベル
```vue
<label class="block text-sm font-medium text-gray-800 mb-2">Label Text</label>
```

### 状態表示

#### 今日の表示
```css
.today {
  @apply bg-emerald-50/80 border-emerald-200/60 shadow-md;
}

.today .date-number {
  @apply text-emerald-700 font-bold;
}

/* 今日マーカー */
.today::after {
  content: '';
  position: absolute;
  top: 2px;
  right: 3px;
  width: 3px;
  height: 3px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(16, 185, 129, 0.3);
}
```

#### 無効状態
```css
.disabled {
  @apply bg-white/20 text-gray-400 opacity-60 hover:bg-white/20 hover:scale-100 hover:shadow-none;
}
```

## レイアウト

### コンテナ
```css
/* メインコンテナ */
.container {
  @apply px-2 md:px-4 max-w-6xl mx-auto space-y-4 md:space-y-8;
}
```

### グリッドシステム
```css
/* 7列グリッド（カレンダー用） */
.calendar-grid {
  @apply grid grid-cols-7 gap-1 md:gap-4;
}

/* 2列グリッド（デスクトップ） */
.two-column {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}
```

### 間隔システム
```css
/* 小さい間隔 */
gap-1 md:gap-4

/* 中間の間隔 */
space-y-4 md:space-y-8

/* 大きい間隔 */
mb-8 lg:mb-12
```

## アニメーション・エフェクト

### トランジション
```css
/* 標準トランジション */
transition-all duration-300

/* 長めのトランジション */
transition-all duration-500
transition-opacity duration-700

/* 短いトランジション */
transition-transform duration-200
```

### ホバーエフェクト
```css
/* スケール */
transform hover:scale-105        /* 軽いスケール */
transform hover:scale-110        /* より大きなスケール */
transform hover:scale-[1.02]     /* 微細なスケール */

/* シャドウ */
hover:shadow-xl
hover:shadow-2xl

/* 移動 */
transform hover:-translate-x-0.5
transform hover:translate-x-0.5
```

### 特殊エフェクト

#### スライドエフェクト（カレンダーセル）
```css
.calendar-cell::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.8s;
}

.calendar-cell:hover::before {
  left: 100%;
}
```

#### グラデーションオーバーレイ
```css
.gradient-overlay {
  @apply absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300;
}
```

## レスポンシブデザイン

### ブレークポイント
- `sm:` - 640px以上（スマートフォン横向き）
- `md:` - 768px以上（タブレット）
- `lg:` - 1024px以上（デスクトップ）

### レスポンシブパターン

#### テキストサイズ
```css
text-xl md:text-3xl lg:text-4xl    /* 見出し */
text-xs md:text-sm                 /* 小さいテキスト */
px-3 py-2 md:px-6 md:py-3         /* パディング */
```

#### グリッド
```css
grid grid-cols-1 md:grid-cols-2    /* 1列→2列 */
flex flex-col lg:flex-row          /* 縦→横 */
```

#### サイズ調整
```css
w-8 h-8 md:w-12 md:h-12           /* ボタンサイズ */
gap-2 md:gap-6                     /* 間隔 */
rounded-xl md:rounded-2xl          /* 角丸 */
```

### モバイル対応

#### タッチ操作
```javascript
// 長押し対応
gigLabel.addEventListener('touchstart', (event) => {
  longPressTimer = setTimeout(() => {
    isLongPress = true;
    showContextMenu(event.touches[0], gig);
  }, 500);
});
```

#### ホバー無効化
```css
@media (hover: none) {
  .hover-effects:hover {
    @apply scale-100 shadow-lg;
  }
}
```

## 命名規則

### クラス名
- **コンポーネント**: `calendar-cell`, `gig-label`, `date-number`
- **状態**: `today`, `disabled`, `loading`
- **レイアウト**: `gig-container`, `calendar-grid`

### Vue コンポーネント
- **ファイル名**: PascalCase (`Calendar.vue`, `AddGigModal.vue`)
- **props**: camelCase (`showModal`, `gigData`)
- **emits**: kebab-case (`show-gig-detail`, `close-modal`)

### カスタムCSS
```css
/* カスタム高さクラス */
.h-22 {
  height: 6rem;
}

/* Tailwindレイヤー内での定義 */
@layer utilities {
  .custom-class {
    @apply /* Tailwindクラス */;
  }
}
```

## 実装例

### 新しいコンポーネント作成時のチェックリスト
1. ✅ メインカラー（emerald/blue）を使用
2. ✅ グラスモーフィズム効果を適用
3. ✅ レスポンシブ対応（sm:, md:, lg:）
4. ✅ ホバーエフェクト（scale, shadow）
5. ✅ 適切なトランジション（duration-300が基本）
6. ✅ disabled状態の考慮
7. ✅ モバイルタッチ対応

### コードサンプル - 新しいボタンコンポーネント
```vue
<template>
  <button 
    :disabled="disabled"
    :class="buttonClasses"
    @click="$emit('click')"
  >
    <div class="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <span class="relative z-10">
      <slot />
    </span>
  </button>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);

const buttonClasses = computed(() => [
  'relative overflow-hidden group cursor-pointer transition-all duration-300 font-semibold transform',
  'px-4 py-3 rounded-xl md:rounded-2xl',
  {
    // Primary variant
    'backdrop-blur-lg bg-gradient-to-r from-emerald-500/80 to-blue-500/80 hover:from-emerald-600/90 hover:to-blue-600/90 text-white border border-white/30 hover:shadow-2xl hover:scale-105': props.variant === 'primary',
    
    // Secondary variant
    'backdrop-blur-lg bg-white/50 hover:bg-white/70 text-gray-700 border border-white/40 hover:shadow-xl hover:scale-110': props.variant === 'secondary',
    
    // Disabled state
    'opacity-50 cursor-not-allowed transform-none': props.disabled
  }
]);
</script>
```

---

このデザインルールに従うことで、GigDigプロジェクト全体で一貫したユーザーエクスペリエンスを提供できます。新しいコンポーネントを作成する際は、このドキュメントを参照して統一感のあるデザインを心がけてください。
