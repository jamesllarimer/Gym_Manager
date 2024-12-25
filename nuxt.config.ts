export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],
  supabase: {
    redirectOptions: {
      login: '/auth/signin',
      callback: '/confirm',
      exclude: ['/*']
    }
  }
})