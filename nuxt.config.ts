export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
   runtimeConfig: {
    public: {
      NUXT_PUBLIC_SUPABASE_ANON_URL: '',
      NUXT_PUBLIC_SUPABASE_ANON_KEY: ''
    }
  },
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],
  supabase: {
    redirectOptions: {
      login: '/auth/signin',
      callback: '/confirm',
      exclude: ['/*']
    }
  }
})