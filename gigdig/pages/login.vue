<script setup>
const supabase = useSupabaseClient();
const runtimeConfig = useRuntimeConfig();

const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${runtimeConfig.public.redirectHost}/confirm`,
    },
  });

  if (error) {
    console.error('Error logging in with Google:', error);
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-4xl font-bold mb-4">Login</h1>
    <p class="mb-8">Please log in to continue</p>
    <button @click="loginWithGoogle" class="bg-blue-500 text-white px-4 py-2 rounded">
      Login with Google
    </button>
  </div>
</template>