<template>
  <div class="user-profile">
    <!-- XSS脆弱性: v-htmlを安全でない値で使用 -->
    <div v-html="userBio"></div>
    
    <!-- アクセシビリティ問題: altやaria-labelがない -->
    <img :src="userAvatar" />
    
    <button @click="loadUserData">ユーザーデータ読み込み</button>
    <button @click="deleteAccount">アカウント削除</button>
    
    <!-- 状態管理の問題: 直接DOMを操作 -->
    <div ref="statusMessage"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import globalUserProcessor from '@/utils/userDataProcessor'

// リアクティブ性の問題
let userBio = ref('')
let userAvatar = ref('')
let isLoading = false // refでないため反応しない

// エラーハンドリングなし
const loadUserData = async () => {
  isLoading = true
  const userData = await fetch('/api/user-profile')
  const result = await userData.json()
  
  // XSS脆弱性: サニタイズなしで直接設定
  userBio.value = result.bio
  userAvatar.value = result.avatar
  
  isLoading = false
}

// 危険な操作: 確認なしでアカウント削除
const deleteAccount = () => {
  globalUserProcessor.deleteUserData('current-user')
  // リダイレクト処理なし
}

// メモリリーク: cleanup処理なし
let intervalId: number

onMounted(() => {
  // 無限にAPIを叩く可能性
  intervalId = setInterval(() => {
    loadUserData()
  }, 1000)
  
  // DOM操作の問題
  const messageDiv = document.querySelector('.status-message')
  if (messageDiv) {
    messageDiv.innerHTML = 'ページが読み込まれました' // 直接DOM操作
  }
})

// onUnmountedでのクリーンアップなし
</script>

<style scoped>
/* パフォーマンス問題: 非効率的なセレクタ */
div div div div {
  color: red;
}

/* アクセシビリティ問題: コントラスト不足 */
.user-profile {
  color: #ccc;
  background-color: #ddd;
}
</style>
