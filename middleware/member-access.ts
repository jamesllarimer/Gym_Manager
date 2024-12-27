export default defineNuxtRouteMiddleware(async (to) => {
    const client = useSupabaseClient();
    const user = useSupabaseUser();
  
    // If not authenticated, redirect to signin
    if (!user.value) {
      return navigateTo('/auth/signin');
    }
  
    try {
      // Check if user is an employee
      const { data: isEmployeeData } = await client.rpc('is_employee');
      
      // Staff routes
      if (to.path.startsWith('/dashboard')) {
        if (!isEmployeeData) {
          return navigateTo('/member-portal');
        }
      }
      
      // Member routes
      if (to.path.startsWith('/member-portal')) {
        if (isEmployeeData) {
          return navigateTo('/dashboard');
        }
        
        // Verify user has an associated member record
        const { data: memberData } = await client
          .from('members')
          .select('id')
          .eq('auth_user_id', user.value.id)
          .single();
          
        if (!memberData) {
          return navigateTo('/member-portal/setup');
        }
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return navigateTo('/auth/signin');
    }
  });