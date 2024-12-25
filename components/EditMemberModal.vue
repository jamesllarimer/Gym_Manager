# components/EditMemberModal.vue
<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click="handleBackdropClick">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium">Edit Member</h3>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
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
                <!-- You can use a custom icon or emoji here -->
                <span class="text-gray-400">📅</span>
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
              {{ isLoading ? 'Saving...' : 'Save Changes' }}
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
  member: {
    type: Object,
    default: () => ({})
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
  expiration_date: ''
})

// Watch for member changes and update form data
watch(() => props.member, (newMember) => {
  if (newMember) {
    formData.value = {
      name: newMember.name || '',
      email: newMember.email || '',
      phone: newMember.phone || '',
      pass_type_id: newMember.pass_type_id || '',
      expiration_date: newMember.expiration_date ? 
        new Date(newMember.expiration_date).toISOString().split('T')[0] : ''
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('save', formData.value)
}

const handleBackdropClick = (event) => {
  // Only close if clicking the backdrop
  if (event.target === event.currentTarget) {
    emit('close')
  }
}
</script>