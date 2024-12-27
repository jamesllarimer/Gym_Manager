# /components/BarcodeDisplay.vue
<template>
  <div class="flex flex-col items-center p-6 bg-white rounded-lg shadow">
    <h3 class="text-lg font-medium text-gray-900 mb-4">{{ name }}'s Membership Card</h3>
    
    <canvas 
      ref="barcodeCanvas"
      width="300"
      height="160"
      class="mb-4 border border-gray-200 rounded"
    />
    
    <div class="mt-2 text-center font-mono text-sm text-gray-600">
      {{ barcodeData }}
    </div>
    
    <div class="flex gap-4 mt-4">
      <button
        v-if="showAppleWallet"
        @click="$emit('add-to-wallet', 'apple')"
        class="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
      >
        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
        </svg>
        Add to Apple Wallet
      </button>
      
      <button
        v-if="showGoogleWallet"
        @click="$emit('add-to-wallet', 'google')"
        class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12H22V22H12V12Z M2 2H12V12H2V2Z M12 2H22V12H12V2Z M2 12H12V22H2V12Z"/>
        </svg>
        Add to Google Wallet
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  barcodeData: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  showAppleWallet: {
    type: Boolean,
    default: true
  },
  showGoogleWallet: {
    type: Boolean,
    default: true
  }
})

defineEmits(['add-to-wallet'])

const barcodeCanvas = ref(null)

// Draw the barcode
const drawBarcode = () => {
  if (!barcodeCanvas.value || !props.barcodeData) return
  
  const canvas = barcodeCanvas.value
  const ctx = canvas.getContext('2d')
  
  // Clear canvas
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Draw barcode (Code 128 style representation)
  ctx.fillStyle = 'black'
  const bars = props.barcodeData.split('').map(c => c.charCodeAt(0) % 3 + 1)
  let x = 20
  
  bars.forEach(width => {
    ctx.fillRect(x, 20, width * 2, 100)
    x += (width * 2) + 2
  })
}

onMounted(() => {
  drawBarcode()
})

watch(() => props.barcodeData, () => {
  drawBarcode()
})
</script>