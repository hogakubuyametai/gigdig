// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/eslint',
    'nuxt-primevue',
    '@nuxt/ui',
    '@nuxtjs/supabase',
  ],
  experimental: {
    asyncContext: true,
    asyncDataCache: true,
    payloadExtraction: false,
    renderJsonPayloads: false,
    // inlineSSRStyles: false // 追加: インラインスタイルの自動挿入を無効化
  },
  nitro: {
    routeRules: {
      '/': { ssr: true },
      '/login': { ssr: false }, // loginページをCSRに変更
      '/confirm': { ssr: false }, // confirmページをCSRに変更
      '/register-username': { ssr: false }, // register-usernameページをCSRに変更
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  ui: {
    colorMode: false,
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
