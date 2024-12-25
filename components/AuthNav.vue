// components/AuthNav.vue
<template>
  <nav class="flex justify-center space-x-4">
    <NuxtLink 
      to="/auth/signin"
      class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
    >
      Sign In
    </NuxtLink>
    <NuxtLink 
      to="/auth/signup"
      class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
    >
      Sign Up
    </NuxtLink>
    <NuxtLink 
      to="/auth/reset"
      class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
    >
      Reset Password
    </NuxtLink>
  </nav>
</template>