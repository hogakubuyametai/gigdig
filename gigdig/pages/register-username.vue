<script setup>
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

// 匿名ユーザーの場合は既存データの取得をスキップ
const { data: existingUserName, error } = await useAsyncData('user-name', async () => {
  if (!user.value) return null;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('user_id', user.value.id)
      .single();
    
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
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 mx-4">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6">Set Your Username</h1>
      
      <form @submit.prevent="saveUsername" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your username"
            :disabled="isLoading"
          />
        </div>

        <div v-if="errorMessage" class="text-red-600 text-sm">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="isLoading || !username.trim()"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer"
        >
          <span v-if="isLoading">Saving...</span>
          <span v-else>Save</span>
        </button>
      </form>
    </div>
  </div>
</template>
