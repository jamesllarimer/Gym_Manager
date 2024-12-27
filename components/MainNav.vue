# components/MainNav.vue
<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left side - Logo and main nav -->
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <NuxtLink to="/" class="text-xl font-bold text-indigo-600">
              GymManager
            </NuxtLink>
          </div>

          <!-- Main navigation links -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <NuxtLink 
              v-for="link in navigationLinks"
              :key="link.to"
              :to="link.to"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-indigo-600"
              active-class="border-b-2 border-indigo-500"
            >
              {{ link.text }}
            </NuxtLink>
          </div>
        </div>

        <!-- Right side - Profile dropdown -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <!-- Profile dropdown -->
          <div class="ml-3 relative">
            <div>
              <button
                @click="isOpen = !isOpen"
                class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  {{ userInitials }}
                </div>
              </button>
            </div>

            <!-- Dropdown menu -->
            <div
              v-if="isOpen"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
              tabindex="-1"
            >
              <NuxtLink
                v-for="item in profileMenuItems"
                :key="item.to"
                :to="item.to"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                @click="isOpen = false"
              >
                {{ item.text }}
              </NuxtLink>
              <button
                @click="handleSignOut"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center sm:hidden">
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span class="sr-only">Open main menu</span>
            <!-- Icon when menu is closed -->
            <svg
              v-if="!isMobileMenuOpen"
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <!-- Icon when menu is open -->
            <svg
              v-else
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      v-if="isMobileMenuOpen"
      class="sm:hidden"
    >
      <div class="pt-2 pb-3 space-y-1">
        <NuxtLink
          v-for="link in navigationLinks"
          :key="link.to"
          :to="link.to"
          class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          active-class="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700"
          @click="isMobileMenuOpen = false"
        >
          {{ link.text }}
        </NuxtLink>
      </div>
      <!-- Mobile profile section -->
      <div class="pt-4 pb-3 border-t border-gray-200">
        <div class="space-y-1">
          <NuxtLink
            v-for="item in profileMenuItems"
            :key="item.to"
            :to="item.to"
            class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            @click="isMobileMenuOpen = false"
          >
            {{ item.text }}
          </NuxtLink>
          <button
            @click="handleSignOut"
            class="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const client = useSupabaseClient()
const user = useSupabaseUser()

// State for dropdowns
const isOpen = ref(false)
const isMobileMenuOpen = ref(false)

// Navigation links
const navigationLinks = computed(() => {
  // Check if user is employee (you can add more sophisticated role checking)
  const isEmployee = false // Replace with actual role check if needed
  
  return isEmployee ? [
    { to: '/dashboard', text: 'Dashboard' },
    { to: '/dashboard/members', text: 'Members' },
    { to: '/dashboard/check-ins', text: 'Check-ins' },
  ] : [
    { to: '/member-portal', text: 'Home' },
    { to: '/member-portal/check-ins', text: 'Check-ins' },
    { to: '/member-portal/family', text: 'Family' },
  ]
})

// Profile menu items
const profileMenuItems = [
  { to: '/profile', text: 'Your Profile' },
  { to: '/profile/settings', text: 'Settings' },
]

// Get user initials for avatar
const userInitials = computed(() => {
  if (!user.value?.email) return '?'
  return user.value.email
    .split('@')[0]
    .split(/[-._]/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Handle sign out
async function handleSignOut() {
  try {
    const { error } = await client.auth.signOut()
    if (error) throw error
    
    // Close menus
    isOpen.value = false
    isMobileMenuOpen.value = false
    
    // Redirect to signin
    navigateTo('/auth/signin')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event) => {
    if (isOpen.value && !event.target.closest('#user-menu-button')) {
      isOpen.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>