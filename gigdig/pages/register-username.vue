<script setup>
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

// 匿名ユーザーの場合は既存データの取得をスキップ
// ユーザーネームの変更機能の追加を想定して、既存のユーザーネームを取得する処理を記述している
const { data: existingUserName, error } = await useAsyncData('user-name', async () => {
  if (!user.value) return null;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('user_id', user.value.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      // PGRST116は「行が見つからない」エラーなので、匿名ユーザーの場合は正常
      console.error('Error fetching user name:', error);
    }
    
    return data?.username || null;
  } catch (err) {
    console.error('Error fetching user name:', err);
    return null;
  }
});

const username = ref(existingUserName.value || '');
const isLoading = ref(false);
const errorMessage = ref('');

const saveUsername = async () => {
  if (!username.value.trim()) {
    errorMessage.value = 'Please enter a username';
    return;
  }

  if (!user.value) {
    errorMessage.value = 'User information not found';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        user_id: user.value.id,
        username: username.value.trim(),
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving username:', error);
      errorMessage.value = 'Failed to save username';
    } else {
      await router.push('/');
    }
  } catch (err) {
    console.error('Error saving username:', err);
    errorMessage.value = 'An error occurred';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-100 via-blue-50 to-purple-100 relative overflow-hidden">
    <!-- 動的な背景エフェクト -->
    <div class="absolute inset-0 bg-gradient-to-tl from-blue-200/30 via-transparent to-emerald-200/30"></div>
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
    <div class="absolute top-3/4 left-1/3 w-64 h-64 bg-purple-300/15 rounded-full blur-2xl"></div>
    
    <div class="flex flex-col items-center justify-center min-h-screen px-4 relative z-10">
      <div class="backdrop-blur-lg bg-white/30 p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md relative overflow-hidden">
        <!-- グラスモーフィズム効果のための追加レイヤー -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-tl from-emerald-100/20 via-transparent to-blue-100/20 rounded-3xl"></div>
        
        <div class="relative z-10">
          <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Set Your Username</h1>
          </div>
          
          <form @submit.prevent="saveUsername" class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-800 mb-2">
                Username
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                required
                class="w-full backdrop-blur-md bg-white/40 px-4 py-3 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300/50 transition-all duration-300 text-gray-800 placeholder-gray-500"
                placeholder="Enter your username"
                :disabled="isLoading"
              />
            </div>

            <div v-if="errorMessage" class="backdrop-blur-sm bg-red-100/40 border border-red-200/30 text-red-700 text-sm px-3 py-2 rounded-xl">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              :disabled="isLoading || !username.trim()"
              class="w-full backdrop-blur-md bg-gradient-to-r from-emerald-500/60 to-blue-500/60 hover:from-emerald-600/70 hover:to-blue-600/70 disabled:from-gray-400/40 disabled:to-gray-500/40 text-white px-4 py-3 rounded-2xl duration-300 font-medium cursor-pointer transform hover:scale-[1.02] transition-all hover:shadow-xl shadow-lg border border-white/20 hover:border-white/30 relative overflow-hidden group disabled:cursor-not-allowed disabled:transform-none"
            >
              <!-- ボタン内のグラデーション効果 -->
              <div class="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative z-10">
                <span v-if="isLoading">Saving...</span>
                <span v-else>Save</span>
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
