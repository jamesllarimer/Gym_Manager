<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Join our gym community today
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <AuthNav class="mb-8" />
        
        <p v-if="toast" class="mb-4 text-red-600">{{ toast }}</p>
        
        <form @submit.prevent="handleSignup" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input 
              v-model="email" 
              type="email" 
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input 
              v-model="password" 
              type="password"
              required
              minlength="8"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
            <p class="mt-1 text-sm text-gray-500">
              Password must be at least 8 characters long
            </p>
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ loading ? 'Creating account...' : 'Sign Up' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const client = useSupabaseClient()
const email = ref('')
const password = ref('')
const toast = ref(null)
const loading = ref(false)

async function handleSignup() {
  if (loading.value) return
  loading.value = true
  toast.value = null

  try {
    const { data: { user }, error: signUpError } = await client.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (signUpError) throw signUpError

    // Redirect to member setup
    navigateTo('/member-portal/setup')
  } catch (error) {
    toast.value = error.message
  } finally {
    loading.value = false
  }
}
</script>