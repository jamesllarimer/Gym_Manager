<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <AuthNav class="mb-8" />
        
        <p v-if="toast" class="mb-4 text-red-600">{{ toast }}</p>
        
        <form @submit.prevent="handleAuth(signUp)" class="space-y-6">
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
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
          </div>

          <button 
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const { auth } = useSupabaseClient()
const email = ref('')
const password = ref('')
const toast = ref(null)

async function handleAuth(action) {
  try {
    const { error } = await action()
    if (error) throw error
    navigateTo('/dashboard')
  } catch (error) {
    toast.value = error.message
  }
}

async function signUp() {
  return auth.signUp({
    email: email.value,
    password: password.value
  })
}
</script>