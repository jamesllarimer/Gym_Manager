# /pages/member-portal/index.vue
<template>
  <div class="min-h-screen bg-gray-100 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex items-center justify-center min-h-screen">
        <div class="text-lg">Loading...</div>
      </div>

      <div v-else-if="error" class="flex items-center justify-center min-h-screen">
        <div class="text-red-600">{{ error }}</div>
      </div>

      <div v-else class="space-y-8">
        <!-- Toast notification -->
        <div 
          v-if="toast" 
          class="fixed top-4 right-4 px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity duration-300"
          :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
        >
          {{ toast.message }}
        </div>

        <!-- Membership Info -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900">Membership Details</h3>
            <div class="mt-5 space-y-4">
              <div>
                <h4 class="text-lg font-medium">Welcome, {{ memberData.name }}</h4>
                <p class="text-gray-500">{{ memberData.email }}</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Membership Type</p>
                  <p>{{ memberData.pass_type?.name }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Expiration Date</p>
                  <p>{{ formatDate(memberData.expiration_date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Primary Member Barcode -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <BarcodeDisplay
              :barcode-data="memberData.barcode"
              :name="memberData.name"
              :show-apple-wallet="!hasApplePass"
              :show-google-wallet="!hasGooglePass"
              @add-to-wallet="(type) => handleAddToWallet(type)"
            />
          </div>
        </div>

        <!-- Family Members -->
        <div v-if="memberData.family_members?.length" class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900">Family Members</h3>
            <div class="mt-5 space-y-6">
              <div 
                v-for="familyMember in memberData.family_members" 
                :key="familyMember.id"
                class="border-b pb-4 last:border-0"
              >
                <BarcodeDisplay
                  :barcode-data="familyMember.barcode"
                  :name="familyMember.name"
                  :show-apple-wallet="!hasFamilyMemberWallet(familyMember, 'apple')"
                  :show-google-wallet="!hasFamilyMemberWallet(familyMember, 'google')"
                  @add-to-wallet="(type) => handleAddToWallet(type, familyMember)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Check-ins -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900">Recent Check-ins</h3>
            <div class="mt-5 space-y-4">
              <div 
                v-for="checkIn in sortedCheckIns" 
                :key="checkIn.id" 
                class="text-sm"
              >
                {{ formatDateTime(checkIn.timestamp) }}
              </div>
              <p v-if="!sortedCheckIns.length" class="text-sm text-gray-500">
                No recent check-ins
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const client = useSupabaseClient()
const memberData = ref(null)
const loading = ref(true)
const error = ref(null)
const toast = ref(null)

const hasApplePass = computed(() => 
  memberData.value?.digital_cards?.some(card => 
    card.apple_pass_id && !card.family_member_id
  )
)

const hasGooglePass = computed(() => 
  memberData.value?.digital_cards?.some(card => 
    card.google_pass_id && !card.family_member_id
  )
)

function hasFamilyMemberWallet(familyMember, type) {
  return memberData.value?.digital_cards?.some(card => 
    card[`${type}_pass_id`] && card.family_member_id === familyMember.id
  )
}

const sortedCheckIns = computed(() => {
  if (!memberData.value?.check_ins) return []
  return [...memberData.value.check_ins]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)
})

function formatDate(isoDate) {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleDateString()
}

function formatDateTime(isoDate) {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleString()
}

function showToastMessage(message, type = 'success') {
  toast.value = { message, type }
  setTimeout(() => {
    toast.value = null
  }, 3000)
}

async function handleAddToWallet(type, familyMember = null) {
  try {
    // Generate a unique pass ID (in production, this would come from Apple/Google Wallet APIs)
    const passId = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    const { error: cardError } = await client
      .from('digital_cards')
      .insert({
        member_id: familyMember ? null : memberData.value.id,
        family_member_id: familyMember?.id,
        [`${type}_pass_id`]: passId
      })

    if (cardError) throw cardError
    
    showToastMessage(`Successfully added to ${type} wallet`)
    await fetchMemberData() // Refresh the data
  } catch (err) {
    showToastMessage(`Failed to add to ${type} wallet: ${err.message}`, 'error')
    console.error('Wallet error:', err)
  }
}

async function fetchMemberData() {
  try {
    const { data: { user } } = await client.auth.getUser()
    
    const { data, error: memberError } = await client
      .from('members')
      .select(`
        *,
        pass_type:pass_types(name, description),
        family_members(
          id,
          name,
          email,
          relationship,
          barcode,
          digital_cards(*)
        ),
        digital_cards(*),
        check_ins(id, timestamp)
      `)
      .eq('auth_user_id', user.id)
      .single()

    if (memberError) throw memberError
    memberData.value = data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Fetch data on mount
onMounted(() => {
  fetchMemberData()
})
</script>