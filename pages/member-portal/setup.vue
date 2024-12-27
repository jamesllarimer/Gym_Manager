# /pages/member-portal/setup.vue
<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Complete Your Membership
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Choose your membership plan and complete your profile
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Pass Type Selection -->
          <div v-if="passTypes.length">
            <label class="block text-sm font-medium text-gray-700">
              Membership Plan
            </label>
            <select
              v-model="selectedPassType"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a plan</option>
              <option
                v-for="pass in passTypes"
                :key="pass.id"
                :value="pass.id"
              >
                {{ pass.name }} - ${{ pass.price }}/{{ pass.duration_months }} months
              </option>
            </select>
          </div>

          <!-- Personal Information -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              v-model="name"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              v-model="phone"
              type="tel"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
          </div>

          <!-- Error Message -->
          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ loading ? 'Processing...' : 'Complete Setup' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth']
})

const client = useSupabaseClient()
const user = useSupabaseUser()

const passTypes = ref([])
const selectedPassType = ref('')
const name = ref('')
const phone = ref('')
const loading = ref(false)
const error = ref(null)

// Generate a unique membership number
function generateMembershipNumber() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `MEM${timestamp}${random}`
}

// Generate a unique barcode
function generateBarcode() {
  return `GYM${Date.now().toString(36).toUpperCase()}`
}

// Fetch available pass types
async function fetchPassTypes() {
  try {
    const { data, error: passError } = await client
      .from('pass_types')
      .select('*')
      .order('price')

    if (passError) throw passError
    passTypes.value = data
  } catch (err) {
    error.value = 'Failed to load membership plans'
  }
}

// Handle form submission
async function handleSubmit() {
  if (!selectedPassType.value) {
    error.value = 'Please select a membership plan'
    return
  }

  loading.value = true
  error.value = null

  try {
    // Get the selected pass type details
    const passType = passTypes.value.find(p => p.id === selectedPassType.value)
    if (!passType) throw new Error('Invalid pass type selected')

    // Calculate expiration date
    const expirationDate = new Date()
    expirationDate.setMonth(expirationDate.getMonth() + passType.duration_months)

    // Create member record
    const { error: memberError } = await client
      .from('members')
      .insert({
        auth_user_id: user.value.id,
        pass_type_id: selectedPassType.value,
        membership_number: generateMembershipNumber(),
        name: name.value,
        email: user.value.email,
        phone: phone.value,
        barcode: generateBarcode(),
        expiration_date: expirationDate.toISOString(),
        status: 'active'
      })

    if (memberError) throw memberError

    // Redirect to member portal
    navigateTo('/member-portal')
  } catch (err) {
    error.value = err.message
    console.log(err)
  } finally {
    loading.value = false
  }
}

// Fetch pass types on mount
onMounted(fetchPassTypes)
</script>