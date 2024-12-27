export default defineNuxtRouteMiddleware(async (to) => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  // If not authenticated, redirect to signin
  if (!user.value) {
    return navigateTo('/auth/signin')
  }

  try {
    // For member portal routes
    if (to.path.startsWith('/member-portal')) {
      // Skip member check for setup page
      if (to.path === '/member-portal/setup') {
        return
      }

      // Verify user has a member record
      const { data: memberData, error: memberError } = await client
        .from('members')
        .select('id')
        .eq('auth_user_id', user.value.id)
        .single()

      if (memberError || !memberData) {
        return navigateTo('/member-portal/setup')
      }
    }

    // For staff/admin routes
    if (to.path.startsWith('/dashboard')) {
      // Check if user is an employee
      const { data: isEmployee } = await client.rpc('is_employee')
      
      if (!isEmployee) {
        return navigateTo('/member-portal')
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return navigateTo('/auth/signin')
  }
})