<script setup>
const user = useSupabaseUser();
const client = useSupabaseClient();

onMounted(async () => {
  // 認証完了を少し待つ
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (user.value) {
    try {
      // ユーザー情報をチェック
      const { data: userData, error } = await client
        .from('users')
        .select('username')
        .eq('user_id', user.value.id)
        .single();

      if (error || !userData?.username) {
        // ユーザー名未設定の場合
        await navigateTo('/register-username');
      } else {
        // ユーザー名設定済みの場合
        await navigateTo('/');
      }
    } catch (error) {
      console.error('Error checking user data:', error);
      await navigateTo('/register-username');
    }
  } else {
    // まだログインしていない場合は少し待ってからリトライ
    setTimeout(async () => {
      if (user.value) {
        // 再度チェック
        location.reload();
      } else {
        await navigateTo('/login');
      }
    }, 1000);
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-50">
    <div class="bg-white p-8 rounded-lg shadow-md">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-700">Authenticating...</h2>
        <p class="text-gray-500 mt-2">Plese wait a moment</p>
      </div>
    </div>
  </div>
</template>