<script setup>
// Redirect to dashboard if authenticated, signin if not
const user = useSupabaseUser()
onMounted(() => {
 if (user.value) navigateTo('/dashboard')
 else navigateTo('/auth/signin')
})
</script>