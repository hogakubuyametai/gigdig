// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss', // Tailwindモジュールを追加
    '@nuxtjs/supabase',
    '@nuxt/image',
  ],
  experimental: {
    asyncContext: true,
  },
  nitro: {
    routeRules: {
      '/': { ssr: true }
    },
  },
  supabase: {
    key: process.env.SUPABASE_ANON_KEY,
  },
  runtimeConfig: {
    public: {
      redirectHost: process.env.REDIRECT_HOST
    },
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  }
});