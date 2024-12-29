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
            <div class="mt-4 space-y-4">
              <div v-for="pass in passTypes" :key="pass.id" 
                   class="relative bg-white border rounded-lg p-4 cursor-pointer"
                   :class="selectedPassType === pass.id ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-300'"
                   @click="selectedPassType = pass.id">
                <div class="flex justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">{{ pass.name }}</h3>
                    <p class="mt-1 text-sm text-gray-500">{{ pass.description }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-semibold text-gray-900">${{ pass.price }}/month</p>
                    <p class="text-sm text-gray-500">{{ pass.duration_months }} month commitment</p>
                  </div>
                </div>
                <div v-if="pass.max_family_members > 0" class="mt-2 text-sm text-gray-500">
                  Up to {{ pass.max_family_members }} family members included
                </div>
              </div>
            </div>
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
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
          </div>

          <!-- Payment Information -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <div class="mt-1">
              <!-- Stripe Card Element -->
              <div 
                id="card-element"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></div>
              <!-- Card Errors -->
              <div 
                id="card-errors" 
                role="alert"
                class="mt-2 text-sm text-red-600"
              ></div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !selectedPassType"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              v-if="loading" 
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
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

const config = useRuntimeConfig()
const client = useSupabaseClient()
const user = useSupabaseUser()

const passTypes = ref([])
const selectedPassType = ref('')
const name = ref('')
const phone = ref('')
const loading = ref(false)
const error = ref(null)

const stripe = ref(null)
const elements = ref(null)
const card = ref(null)

// Initialize Stripe
onMounted(async () => {
  // Load Stripe.js
  const stripeJs = await loadScript('https://js.stripe.com/v3/')
  
  // Initialize Stripe
  stripe.value = Stripe(config.public.stripePublishableKey)
  elements.value = stripe.value.elements()
  
  // Create and mount the card element
  card.value = elements.value.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#dc2626',
        iconColor: '#dc2626'
      }
    }
  })
  
  card.value.mount('#card-element')
  
  // Handle real-time validation errors
  card.value.addEventListener('change', (event) => {
    const displayError = document.getElementById('card-errors')
    if (event.error) {
      displayError.textContent = event.error.message
    } else {
      displayError.textContent = ''
    }
  })
})

// Cleanup on unmount
onUnmounted(() => {
  if (card.value) {
    card.value.unmount()
  }
})

// Load Stripe.js script
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })
}

// Fetch available pass types
async function fetchPassTypes() {
  try {
    const { data, error: passError } = await client
      .from('pass_types')
      .select('*')
      .not('stripe_price_id', 'is', null)
      .order('price')

    if (passError) throw passError
    passTypes.value = data
  } catch (err) {
    error.value = 'Failed to load membership plans'
    console.error('Error fetching pass types:', err)
  }
}

// Handle form submission with Stripe payment
async function handleSubmit() {
  if (!selectedPassType.value) {
    error.value = 'Please select a membership plan'
    return
  }

  loading.value = true
  error.value = null

  try {
    // Create payment method
    const { paymentMethod, error: stripeError } = await stripe.value.createPaymentMethod({
      type: 'card',
      card: card.value,
      billing_details: {
        name: name.value,
        email: user.value.email,
        phone: phone.value
      }
    })

    if (stripeError) throw stripeError

    // Create membership with payment method
    const response = await $fetch('/api/create-membership', {
      method: 'POST',
      body: {
        passTypeId: selectedPassType.value,
        name: name.value,
        email: user.value.email,
        phone: phone.value,
        paymentMethodId: paymentMethod.id
      }
    })

    // Redirect to member portal on success
    navigateTo('/member-portal')
  } catch (err) {
    error.value = err.message || 'An error occurred during setup. Please try again.'
    console.error('Setup error:', err)
  } finally {
    loading.value = false
  }
}

// Fetch pass types on mount
onMounted(fetchPassTypes)
</script>