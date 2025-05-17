<script setup>
const client = useSupabaseClient();
const user = useSupabaseUser();

// サーバーサイドでユーザー情報を取得
const { data: userData, pending } = await useAsyncData('userData', async () => {
  if (!user.value) return null;

  const { data, error } = await client
    .from('users')
    .select('username')
    .eq('user_id', user.value.id)
    .single();

  if (error) {
    console.error('Error fetching user name:', error);
    return null;
  }

  return {
    userId: user.value.id,
    userName: data?.username || '',
  };
}, {
  server: true,
  lazy: false,
  immediate: true,
});

const userId = computed(() => userData.value?.userId || '');
const userName = computed(() => userData.value?.userName || '');

const success = ref(false);
const loading = ref(false);
</script>


<template>
  <div v-if="pending" class="flex items-center justify-center h-screen">
    <div class="loader"></div>
    <p class="text-gray-500">Loading...</p>
  </div>
  <div v-else-if="userId" class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl font-bold mb-4">ユーザー名を登録</h1>
    <p class="mb-4">ユーザー名を入力してください</p>
    <input v-model="userName" type="text" placeholder="ユーザー名" class="border border-gray-300 rounded p-2 mb-4 w-64" />
    <button @click="registerUserName" class="bg-blue-500 text-white rounded p-2 w-64">
      登録
    </button>
    <p v-if="success" class="text-green-500 mt-4">
      ユーザー名が登録されました<br />
      <a href="/" class="text-blue-500">トップページに戻る</a>
    </p>
    <p v-if="loading" class="text-gray-500 mt-4">登録中...</p>
  </div>
  <div v-else class="flex items-center justify-center h-screen">
    <p>Loading...</p>
  </div>
</template>
