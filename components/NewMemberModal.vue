# components/NewMemberModal.vue
<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click="handleBackdropClick">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium">Add New Member</h3>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Primary Member Information -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input
                v-model="formData.name"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="formData.email"
                type="email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Phone</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Membership Type</label>
              <select
                v-model="formData.pass_type_id"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select a membership type</option>
                <option v-for="type in passTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                Expiration Date
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <input
                  v-model="formData.expiration_date"
                  type="date"
                  class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-400">📅</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Family Members Section -->
          <div class="mt-6">
            <h4 class="text-lg font-medium text-gray-900">Family Members</h4>
            
            <div class="mt-4">
              <div class="flex space-x-2">
                <input
                  v-model="newFamilyMember.name"
                  type="text"
                  placeholder="Family member name"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  @keyup.enter.prevent="addFamilyMember"
                >
                <button
                  type="button"
                  @click="addFamilyMember"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add
                </button>
              </div>

              <div v-if="formData.family_members.length > 0" class="mt-4 space-y-2">
                <div 
                  v-for="(fm, index) in formData.family_members" 
                  :key="index"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span class="text-sm text-gray-900">{{ fm.name }}</span>
                  <button
                    type="button"
                    @click="removeFamilyMember(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ isLoading ? 'Creating...' : 'Create Member' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  passTypes: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  name: '',
  email: '',
  phone: '',
  pass_type_id: '',
  expiration_date: '',
  family_members: []
})

const newFamilyMember = ref({
  name: ''
})

function generateBarcode() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

function addFamilyMember() {
  if (newFamilyMember.value.name.trim()) {
    formData.value.family_members.push({
      name: newFamilyMember.value.name,
      barcode: generateBarcode()
    })
    newFamilyMember.value.name = ''
  }
}

function removeFamilyMember(index) {
  formData.value.family_members.splice(index, 1)
}

function handleSubmit() {
  const memberData = {
    ...formData.value,
    barcode: generateBarcode()
  }
  emit('save', memberData)
}

function handleBackdropClick(event) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

// Reset form when modal is opened
watch(() => props.show, (isShown) => {
  if (isShown) {
    formData.value = {
      name: '',
      email: '',
      phone: '',
      pass_type_id: '',
      expiration_date: '',
      family_members: []
    }
    newFamilyMember.value.name = ''
  }
})
</script>