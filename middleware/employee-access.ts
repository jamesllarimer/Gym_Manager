export default defineNuxtRouteMiddleware(async () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/auth/signin')
  }

  try {
    // Check if user is an employee
    const { data: employee, error } = await client
      .from('employees')
      .select('role, active')
      .eq('auth_user_id', user.value.id)
      .single()

    if (error || !employee || !employee.active) {
      throw new Error('Unauthorized')
    }

    // Store employee role in session storage for easy access
    sessionStorage.setItem('employeeRole', employee.role)
    
    // Continue to requested page
    return
  } catch (error) {
    // Redirect unauthorized users to home page
    return navigateTo('/')
  }
})