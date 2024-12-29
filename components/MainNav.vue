<template>
    <nav class="bg-white shadow">
      <!-- Rest of the template stays the same until navigationLinks section -->
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
  
          <!-- Rest of your existing template code stays exactly the same -->
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
  const isEmployee = ref(false)
  const employeeRole = ref(null)
  
  // Check employee status
  async function checkEmployeeStatus() {
    try {
      const { data: empCheck } = await client
        .rpc('is_employee')
      
      isEmployee.value = empCheck || false
  
      if (isEmployee.value) {
        const { data: roleCheck } = await client
          .rpc('get_employee_role')
        
        employeeRole.value = roleCheck
      }
    } catch (error) {
      console.error('Error checking employee status:', error)
      isEmployee.value = false
      employeeRole.value = null
    }
  }
  
  // Navigation links with proper employee check
  const navigationLinks = computed(() => {
    if (!user.value) return []
    
    if (isEmployee.value) {
      const links = [{ to: '/dashboard', text: 'Dashboard' }]
      
      // Add admin link only for admin/manager roles
      if (employeeRole.value === 'admin' || employeeRole.value === 'manager') {
        links.push({ to: '/admin', text: 'Admin' })
      }
      
      return links
    }
    
    return [{ to: '/member-portal', text: 'Home' }]
  })
  
  // Profile menu items - could also be role-based if needed
  const profileMenuItems = [
    { to: '/profile', text: 'Your Profile' },
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
  
  // Check employee status on mount and user changes
  onMounted(() => {
    if (user.value) {
      checkEmployeeStatus()
    }
    
    // Handle clicking outside for dropdown
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
  
  // Watch for user changes
  watch(user, (newUser) => {
    if (newUser) {
      checkEmployeeStatus()
    } else {
      isEmployee.value = false
      employeeRole.value = null
    }
  })
  </script>
  