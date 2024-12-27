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

              <button
                v-if="!memberData.digital_cards?.length"
                @click="generateDigitalCard(memberData.id)"
                class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add to Digital Wallet
              </button>
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
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium">{{ familyMember.name }}</h4>
                    <p class="text-sm text-gray-500">{{ familyMember.relationship }}</p>
                  </div>
                  <button
                    v-if="!familyMember.digital_cards?.length"
                    @click="generateDigitalCard(memberData.id, familyMember.id)"
                    class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add to Digital Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['member-access']
})

const client = useSupabaseClient()
const memberData = ref(null)
const loading = ref(true)
const error = ref(null)

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

async function generateDigitalCard(memberId, familyMemberId = null) {
  try {
    const { error: cardError } = await client
      .from('digital_cards')
      .insert({
        member_id: familyMemberId ? null : memberId,
        family_member_id: familyMemberId,
        apple_pass_id: 'placeholder',
        google_pass_id: 'placeholder'
      })

    if (cardError) throw cardError
    await fetchMemberData() // Refresh data
  } catch (err) {
    error.value = err.message
  }
}

// Fetch data on mount
onMounted(fetchMemberData)
</script>