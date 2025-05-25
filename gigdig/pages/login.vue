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
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
    <div class="container mx-auto px-4 py-8 lg:py-16">
      <div class="grid lg:grid-cols-5 gap-8 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
        
        <!-- Left Content - 60% on desktop -->
        <div class="lg:col-span-3 text-center lg:text-left">
          <!-- Logo -->
          <div class="flex justify-center lg:justify-start mb-8">
            <NuxtImg src="/logo_gigdig.svg" alt="GigDig" class="h-12 w-auto" />
          </div>

          <!-- Main Catchcopy -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Dig Deeper Into
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
              Every Gig
            </span>
          </h1>

          <!-- Subtitle -->
          <p class="text-lg sm:text-xl text-gray-600 mb-8 lg:mb-12 max-w-2xl mx-auto lg:mx-0">
            Track your upcoming concerts and discover artists like never before. 
            Powered by Spotify's top tracks and recommendations.
          </p>

          <!-- Features -->
          <div class="grid sm:grid-cols-2 gap-6 mb-8 lg:mb-12 max-w-2xl mx-auto lg:mx-0">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span class="text-xl">🎵</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Track Your Gigs</h3>
                <p class="text-sm text-gray-600">Keep all your upcoming concerts organized in one place</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span class="text-xl">🎧</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Discover Music</h3>
                <p class="text-sm text-gray-600">Explore top tracks and related artists via Spotify</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span class="text-xl">📅</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Calendar View</h3>
                <p class="text-sm text-gray-600">Visualize your concert schedule at a glance</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span class="text-xl">🔍</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Deep Dive</h3>
                <p class="text-sm text-gray-600">Get ready for shows with curated artist insights</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Content - 40% on desktop -->
        <div class="lg:col-span-2">
          <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
              <p class="text-gray-600">Start Your Music Journey, Track Every Beat</p>
            </div>
            
            <div class="space-y-4">
              <button
                @click="loginWithGoogle"
                class="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-3 rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-3 shadow-sm cursor-pointer hover:shadow-md transform hover:scale-[1.02]"
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
                  <span class="px-3 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                @click="loginAnonymously"
                class="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg duration-200 font-medium cursor-pointer transform hover:scale-[1.02] transition-all hover:shadow-md shadow-sm"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
