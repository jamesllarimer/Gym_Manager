export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      SUPABASE_URL: '',
      SUPABASE_KEY: ''
    }
  },
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    runtime: true,
    redirectOptions: {
      login: '/auth/signin',
      callback: '/confirm',
      exclude: ['/*']
    }
  }
})