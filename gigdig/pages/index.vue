<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-4xl font-bold mb-6">GIGDIG</h1>
    <p class="text-lg mb-4">あなたの好きなアーティストのライブ情報を管理しよう！</p>
    <div class="w-full max-w-md">
      <NuxtLink to="/my-calendar" class="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200">
        マイカレンダー
      </NuxtLink>
      <NuxtLink to="/search" class="block w-full text-center bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-200 mt-4">
        アーティスト検索
      </NuxtLink>
    </div>
    <div class="mt-6">
      <p class="text-sm text-gray-600">アカウントをお持ちでないですか？</p>
      <NuxtLink to="/signup" class="text-blue-500 hover:underline">サインアップ</NuxtLink>
    </div>
    <div class="mt-4">
      <p class="text-sm text-gray-600">すでにアカウントをお持ちですか？</p>
      <NuxtLink to="/login" class="text-blue-500 hover:underline">ログイン</NuxtLink>
    </div>
  </div>
</template>