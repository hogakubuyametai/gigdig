<script setup>
const supabase = useSupabaseClient();
const runtimeConfig = useRuntimeConfig();
const user = useSupabaseUser();

// 既にログインしている場合のリダイレクト
watch(user, async (newUser) => {
  if (newUser) {
    await navigateTo('/');
  }
}, { immediate: true });

const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${runtimeConfig.public.redirectHost}/confirm`,
    },
  });

  if (error) {
    console.error("Error logging in with Google:", error);
  }
};

const loginAnonymously = async () => {
  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error("Error logging in anonymously:", error);
  } else {
    // ミドルウェアに処理を任せる
    await navigateTo("/");
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-50">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-2">Welcome to GigDig</h1>
      <p class="text-gray-600 text-center mb-8">Please log in to continue</p>
      
      <div class="space-y-4">
        <button
          @click="loginWithGoogle"
          class="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-3 shadow-sm cursor-pointer"
        >
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" style="display: block;">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Continue with Google
        </button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          @click="loginAnonymously"
          class="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium cursor-pointer"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  </div>
</template>
