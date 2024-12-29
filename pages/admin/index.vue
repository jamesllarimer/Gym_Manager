# /pages/admin/index.vue
<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
        <!-- Toast notification -->
        <div 
          v-if="toast" 
          class="fixed top-4 right-4 px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity duration-300"
          :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
        >
          {{ toast.message }}
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              class="px-1 py-4 text-sm font-medium"
              :class="[
                currentTab === tab.id
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Membership Types Tab -->
        <div v-if="currentTab === 'memberships'" class="mt-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Membership Types</h2>
            <button
              @click="showNewMembershipForm"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Membership Type
            </button>
          </div>

          <!-- Membership Types List -->
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              <li v-for="type in passTypes" :key="type.id" class="px-4 py-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">{{ type.name }}</h3>
                    <p class="text-sm text-gray-500">{{ type.description }}</p>
                    <div class="mt-2 text-sm text-gray-500">
                      <span class="mr-4">Price: ${{ type.price }}</span>
                      <span>Duration: {{ type.duration_months }} months</span>
                      <span class="ml-4">Max Family Members: {{ type.max_family_members || 0 }}</span>
                    </div>
                  </div>
                  <div class="flex space-x-3">
                    <button
                      @click="editMembership(type)"
                      class="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      @click="deleteMembership(type.id)"
                      class="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Promotions Tab -->
        <div v-if="currentTab === 'promotions'" class="mt-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Promotions</h2>
            <button
              @click="showNewPromotionForm"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Promotion
            </button>
          </div>

          <!-- Promotions List -->
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              <li v-for="promo in promotions" :key="promo.id" class="px-4 py-4">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center">
                      <h3 class="text-lg font-medium text-gray-900">{{ promo.name }}</h3>
                      <span 
                        class="ml-2 px-2 py-1 text-xs rounded-full"
                        :class="isPromoActive(promo) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      >
                        {{ isPromoActive(promo) ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500">Code: {{ promo.code }}</p>
                    <p class="text-sm text-gray-500">
                      {{ formatDiscount(promo) }}
                    </p>
                    <div class="mt-2 text-sm text-gray-500">
                      <span class="mr-4">Valid: {{ formatDate(promo.start_date) }} - {{ formatDate(promo.end_date) }}</span>
                      <span>Uses: {{ promo.uses_count }} / {{ promo.max_uses || '∞' }}</span>
                    </div>
                  </div>
                  <div class="flex space-x-3">
                    <button
                      @click="editPromotion(promo)"
                      class="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      @click="deletePromotion(promo.id)"
                      class="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Membership Type Form Modal -->
        <div v-if="showMembershipForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div class="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 class="text-lg font-medium mb-4">
              {{ editingMembership ? 'Edit' : 'Add' }} Membership Type
            </h3>
            
            <form @submit.prevent="saveMembership" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input
                  v-model="membershipForm.name"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  v-model="membershipForm.description"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Price</label>
                <input
                  v-model="membershipForm.price"
                  type="number"
                  step="0.01"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Duration (months)</label>
                <input
                  v-model="membershipForm.duration_months"
                  type="number"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Max Family Members</label>
                <input
                  v-model="membershipForm.max_family_members"
                  type="number"
                  min="0"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>

              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="showMembershipForm = false"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Promotion Form Modal -->
        <div v-if="showPromotionForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div class="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 class="text-lg font-medium mb-4">
              {{ editingPromotion ? 'Edit' : 'Add' }} Promotion
            </h3>
            
            <form @submit.prevent="savePromotion" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input
                  v-model="promotionForm.name"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Code</label>
                <input
                  v-model="promotionForm.code"
                  type="text"
                  required
                  :disabled="editingPromotion"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  v-model="promotionForm.description"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Discount Type</label>
                <select
                  v-model="promotionForm.discount_type"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Discount Value ({{ promotionForm.discount_type === 'percentage' ? '%' : '$' }})
                </label>
                <input
                  v-model="promotionForm.discount_value"
                  type="number"
                  step="0.01"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  v-model="promotionForm.start_date"
                  type="datetime-local"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  v-model="promotionForm.end_date"
                  type="datetime-local"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Maximum Uses (optional)</label>
                <input
                  v-model="promotionForm.max_uses"
                  type="number"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    v-model="promotionForm.active"
                    type="checkbox"
                    class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                  <span class="ml-2 text-sm text-gray-600">Active</span>
                </label>
              </div>

              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="showPromotionForm = false"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth', 'employee-access']
})

const client = useSupabaseClient()
const user = useSupabaseUser()

// State
const currentTab = ref('memberships')
const passTypes = ref([])
const promotions = ref([])
const toast = ref(null)

// Form state
const showMembershipForm = ref(false)
const showPromotionForm = ref(false)
const editingMembership = ref(null)
const editingPromotion = ref(null)

const membershipForm = ref({
  name: '',
  description: '',
  price: '',
  duration_months: '',
  max_family_members: 0
})

const promotionForm = ref({
  name: '',
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  start_date: '',
  end_date: '',
  max_uses: null,
  active: true
})

// Tabs configuration
const tabs = [
  { id: 'memberships', name: 'Membership Types' },
  { id: 'promotions', name: 'Promotions' }
]

// Utility functions
function formatDate(isoDate) {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleDateString()
}

function formatDiscount(promo) {
  if (promo.discount_type === 'percentage') {
    return `${promo.discount_value}% off`
  }
  return `${promo.discount_value} off`
}

function isPromoActive(promo) {
  if (!promo.active) return false
  const now = new Date()
  const startDate = new Date(promo.start_date)
  const endDate = new Date(promo.end_date)
  
  return promo.active && now >= startDate && now <= endDate && 
         (!promo.max_uses || promo.uses_count < promo.max_uses)
}

function showToast(message, type = 'success') {
  toast.value = { message, type }
  setTimeout(() => {
    toast.value = null
  }, 3000)
}

// Form handling functions
function showNewMembershipForm() {
  editingMembership.value = null
  membershipForm.value = {
    name: '',
    description: '',
    price: '',
    duration_months: '',
    max_family_members: 0
  }
  showMembershipForm.value = true
}

function showNewPromotionForm() {
  editingPromotion.value = null
  promotionForm.value = {
    name: '',
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    max_uses: null,
    active: true
  }
  showPromotionForm.value = true
}

// Membership type functions
async function fetchPassTypes() {
  try {
    const { data, error } = await client
      .from('pass_types')
      .select('*')
      .order('price')

    if (error) throw error
    passTypes.value = data
  } catch (error) {
    showToast(error.message, 'error')
  }
}

function editMembership(membership) {
  editingMembership.value = membership.id
  membershipForm.value = { ...membership }
  showMembershipForm.value = true
}

async function deleteMembership(id) {
  if (!confirm('Are you sure you want to delete this membership type?')) return

  try {
    const { error } = await client
      .from('pass_types')
      .delete()
      .eq('id', id)

    if (error) throw error
    showToast('Membership type deleted successfully')
    await fetchPassTypes()
  } catch (error) {
    showToast(error.message, 'error')
  }
}

async function saveMembership() {
  try {
    if (editingMembership.value) {
      const { error } = await client
        .from('pass_types')
        .update(membershipForm.value)
        .eq('id', editingMembership.value)

      if (error) throw error
      showToast('Membership type updated successfully')
    } else {
      const { error } = await client
        .from('pass_types')
        .insert(membershipForm.value)

      if (error) throw error
      showToast('Membership type created successfully')
    }

    showMembershipForm.value = false
    editingMembership.value = null
    membershipForm.value = {
      name: '',
      description: '',
      price: '',
      duration_months: '',
      max_family_members: 0
    }
    await fetchPassTypes()
  } catch (error) {
    showToast(error.message, 'error')
  }
}

// Promotion functions
async function fetchPromotions() {
  try {
    const { data, error } = await client
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    promotions.value = data
  } catch (error) {
    showToast(error.message, 'error')
  }
}

function editPromotion(promotion) {
  editingPromotion.value = promotion.id
  promotionForm.value = {
    ...promotion,
    start_date: new Date(promotion.start_date).toISOString().slice(0, 16),
    end_date: new Date(promotion.end_date).toISOString().slice(0, 16)
  }
  showPromotionForm.value = true
}

async function deletePromotion(id) {
  if (!confirm('Are you sure you want to delete this promotion?')) return

  try {
    const { error } = await client
      .from('promotions')
      .delete()
      .eq('id', id)

    if (error) throw error
    showToast('Promotion deleted successfully')
    await fetchPromotions()
  } catch (error) {
    showToast(error.message, 'error')
  }
}

async function savePromotion() {
  try {
    const formData = {
      ...promotionForm.value,
      start_date: new Date(promotionForm.value.start_date).toISOString(),
      end_date: new Date(promotionForm.value.end_date).toISOString()
    }

    if (editingPromotion.value) {
      const { error } = await client
        .from('promotions')
        .update(formData)
        .eq('id', editingPromotion.value)

      if (error) throw error
      showToast('Promotion updated successfully')
    } else {
      const { error } = await client
        .from('promotions')
        .insert(formData)

      if (error) throw error
      showToast('Promotion created successfully')
    }

    showPromotionForm.value = false
    editingPromotion.value = null
    promotionForm.value = {
      name: '',
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      start_date: '',
      end_date: '',
      max_uses: null,
      active: true
    }
    await fetchPromotions()
  } catch (error) {
    showToast(error.message, 'error')
  }
}

// Fetch data on mount
onMounted(async () => {
  await fetchPassTypes()
  await fetchPromotions()
})
</script>