# components/PrintCardsModal.vue
<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click="handleBackdropClick">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium">Print Membership Cards</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <div class="space-y-4">
            <!-- Card Selection -->
            <div class="mb-6 space-y-2">
              <h4 class="font-medium text-gray-900">Select cards to print:</h4>
              
              <!-- Primary member checkbox -->
              <div class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  :id="member.id"
                  v-model="selectedCards"
                  :value="{ type: 'primary', id: member.id }"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                >
                <label :for="member.id" class="text-sm text-gray-700">
                  {{ member.name }} (Primary Member)
                </label>
              </div>
              
              <!-- Family members checkboxes -->
              <div v-for="familyMember in member.family_members" 
                   :key="familyMember.id"
                   class="flex items-center space-x-2 ml-6">
                <input
                  type="checkbox"
                  :id="familyMember.id"
                  v-model="selectedCards"
                  :value="{ type: 'family', id: familyMember.id }"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                >
                <label :for="familyMember.id" class="text-sm text-gray-700">
                  {{ familyMember.name }} (Family Member)
                </label>
              </div>
            </div>

            <!-- Card Preview -->
            <div class="border rounded-lg p-4 bg-gray-50">
              <h4 class="font-medium text-gray-900 mb-4">Preview:</h4>
              <!-- Primary Member Card -->
              <div v-if="isPrintingPrimaryMember" class="membership-card mb-4">
                <div class="card-content">
                  <div class="gym-info">
                    <h2 class="gym-name">Gym Name</h2>
                    <p class="membership-type">{{ member.plan }}</p>
                  </div>
                  
                  <div class="member-info">
                    <h3 class="member-name">{{ member.name }}</h3>
                    <p class="member-type">Primary Member</p>
                    <p class="expiry">Expires: {{ formatDate(member.expiration_date) }}</p>
                  </div>
                  
                  <div class="barcode-section">
                    <svg ref="primaryBarcode"></svg>
                  </div>
                </div>
              </div>

              <!-- Family Member Cards -->
              <template v-for="familyMember in selectedFamilyMembers" :key="familyMember.id">
                <div class="membership-card">
                  <div class="card-content">
                    <div class="gym-info">
                      <h2 class="gym-name">Gym Name</h2>
                      <p class="membership-type">Family Membership</p>
                    </div>
                    
                    <div class="member-info">
                      <h3 class="member-name">{{ familyMember.name }}</h3>
                      <p class="member-type">Family Member</p>
                      <p class="primary-member">Primary: {{ member.name }}</p>
                      <p class="expiry">Expires: {{ formatDate(member.expiration_date) }}</p>
                    </div>
                    
                    <div class="barcode-section">
                      <svg :ref="el => setFamilyBarcodeRef(el, familyMember.id)"></svg>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="printCards"
              :disabled="!selectedCards.length"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Print Selected Cards
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import JsBarcode from 'jsbarcode'
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  show: Boolean,
  member: Object
})

const emit = defineEmits(['close'])
const primaryBarcode = ref(null)
const familyBarcodeRefs = ref({})
const selectedCards = ref([])

const isPrintingPrimaryMember = computed(() => 
  selectedCards.value.some(card => card.type === 'primary')
)

const selectedFamilyMembers = computed(() => 
  props.member?.family_members?.filter(fm =>
    selectedCards.value.some(card => 
      card.type === 'family' && card.id === fm.id
    )
  ) || []
)

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function setFamilyBarcodeRef(el, id) {
  if (el) {
    familyBarcodeRefs.value[id] = el
  }
}

function handleBackdropClick(event) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

async function generateBarcodes() {
  await nextTick()
  
  if (isPrintingPrimaryMember.value && primaryBarcode.value) {
    JsBarcode(primaryBarcode.value, props.member.barcode, {
      format: "CODE128",
      width: 2,
      height: 50,
      displayValue: true
    })
  }

  selectedFamilyMembers.value.forEach(familyMember => {
    const barcodeElement = familyBarcodeRefs.value[familyMember.id]
    if (barcodeElement) {
      JsBarcode(barcodeElement, familyMember.barcode, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true
      })
    }
  })
}

async function printCards() {
  if (selectedCards.value.length === 0) {
    alert('Please select at least one card to print')
    return
  }

  await generateBarcodes()
  
  const printContent = document.createElement('div')
  printContent.innerHTML = `
    <style>
      @page {
        size: A4;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 20px;
        font-family: Arial, sans-serif;
      }
      .membership-card {
        width: 3.375in;
        height: 2.125in;
        border: 1px solid #ccc;
        margin: 0.125in;
        page-break-inside: avoid;
        display: inline-block;
      }
      .card-content {
        padding: 15px;
      }
      .gym-info {
        margin-bottom: 10px;
      }
      .gym-name {
        font-size: 18px;
        font-weight: bold;
        margin: 0;
      }
      .membership-type {
        font-size: 14px;
        color: #666;
        margin: 5px 0;
      }
      .member-info {
        margin-bottom: 10px;
      }
      .member-name {
        font-size: 16px;
        font-weight: bold;
        margin: 0;
      }
      .member-type,
      .primary-member,
      .expiry {
        font-size: 12px;
        margin: 2px 0;
      }
      .barcode-section {
        text-align: center;
      }
      .barcode-section svg {
        max-width: 100%;
      }
      @media print {
        .membership-card {
          break-inside: avoid;
        }
      }
    </style>
  `

  if (isPrintingPrimaryMember.value) {
    const primaryCard = document.querySelector('.membership-card').cloneNode(true)
    printContent.appendChild(primaryCard)
  }

  selectedFamilyMembers.value.forEach(familyMember => {
    const familyCard = document.querySelector(`[data-family-id="${familyMember.id}"]`).cloneNode(true)
    printContent.appendChild(familyCard)
  })

  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Membership Cards</title>
      </head>
      <body>${printContent.innerHTML}</body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.focus()
  
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}

// Reset selected cards when modal is opened
watch(() => props.show, (isShown) => {
  if (isShown) {
    selectedCards.value = []
  }
})
</script>

<style scoped>
.membership-card {
  @apply border border-gray-200 rounded-lg shadow-sm p-4 mb-4;
  width: 3.375in;
  height: 2.125in;
}

.gym-name {
  @apply text-xl font-bold text-gray-900;
}

.membership-type {
  @apply text-sm text-gray-600;
}

.member-name {
  @apply text-lg font-semibold text-gray-800;
}

.member-type,
.primary-member,
.expiry {
  @apply text-sm text-gray-600;
}

.barcode-section {
  @apply mt-2 text-center;
}
</style>