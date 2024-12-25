<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Toast notification -->
    <div 
      v-if="toast" 
      class="fixed top-4 right-4 px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity duration-300"
      :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
    >
      {{ toast.message }}
    </div>
 
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Membership Manager</h1>
          <button
            @click="showNewMemberModal = true"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add New Member
          </button>
        </div>
      </div>
 
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
 
        <!-- Barcode scanner -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700">Member Check-in</label>
          <div class="mt-1">
            <input 
              v-model="barcode"
              @keyup.enter="handleScan"
              type="text"
              placeholder="Scan member barcode"
              class="block w-full h-12 rounded-md border-gray-300 pl-4 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              ref="barcodeInput"
            >
          </div>
        </div>
         <!-- Search section -->
         <div class="mt-8">
          <label class="block text-sm font-medium text-gray-700">Search for member</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <input 
              v-model="search"
              type="text"
              placeholder="Search by name, email, or phone..."
              class="block w-full h-12 rounded-md border-gray-300 pl-4 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
          </div>
        </div>
 
        <!-- Member list -->
        <div class="mt-8 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <div v-if="members.length" class="bg-white">
                  <div v-for="member in members" 
                       :key="member.id"
                       class="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div class="flex justify-between items-start">
                      <div class="flex-grow">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                          {{ member.name }}
                        </h3>
                        <div class="mt-2 max-w-xl text-sm text-gray-500">
                          <p>Email: {{ member.email }}</p>
                          <p>Phone: {{ member.phone }}</p>
                          <p>Membership: {{ member.plan }}</p>
                          <p>Expires: {{ formatDate(member.expiration_date) }}</p>
                          
                          <!-- Check-in history -->
                          <div class="mt-3 space-y-1">
                            <p class="font-medium text-gray-700">Recent Check-ins:</p>
                            <div v-if="member.check_ins?.length" class="space-y-1">
                              <p v-for="checkIn in member.check_ins" :key="checkIn.id" class="text-xs">
                                {{ formatCheckInDate(checkIn.timestamp) }}
                              </p>
                            </div>
                            <p v-else class="text-xs italic">No recent check-ins</p>
                          </div>
 
                          <!-- Family Members Section -->
                          <div class="mt-4">
                            <p class="font-medium text-gray-700">Family Members:</p>
                            <div v-if="member.family_members?.length" class="mt-2 space-y-3">
                              <div v-for="familyMember in member.family_members" 
                                   :key="familyMember.id" 
                                   class="pl-4 border-l-2 border-gray-200">
                                <div class="flex justify-between items-center">
                                  <div>
                                    <p class="text-sm font-medium text-gray-900">{{ familyMember.name }}</p>
                                    <p class="text-xs text-gray-500">Barcode: {{ familyMember.barcode }}</p>
                                    <!-- Family Member Check-ins -->
                                    <div class="mt-1" v-if="familyMember.check_ins?.length">
                                      <p class="text-xs text-gray-500">
                                        Last check-in: {{ formatCheckInDate(familyMember.check_ins[0].timestamp) }}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    @click="manualCheckIn(member, familyMember)"
                                    :disabled="!isActive(member)"
                                    class="px-3 py-1 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Check In
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p v-else class="text-xs italic text-gray-500">No family members</p>
                          </div>
                        </div>
                      </div>
                      <div class="ml-4 flex flex-col items-end space-y-2">
                        <span 
                          :class="[
                            'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                            isActive(member) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          ]"
                        >
                          {{ isActive(member) ? 'Active' : 'Expired' }}
                        </span>
                        
                        <!-- Action buttons -->
                        <div class="flex space-x-2">
                          <button
                            @click="editMember(member)"
                            class="px-3 py-1 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            @click="printMembershipCards(member)"
                            class="px-3 py-1 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            Print Cards
                          </button>
                          <button
                            @click="manualCheckIn(member)"
                            :disabled="!isActive(member)"
                            class="px-3 py-1 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Check In
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else-if="search" class="text-center py-12 bg-white">
                  <p class="text-sm text-gray-500">No members found matching your search.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
 
    <!-- Modals -->
    <EditMemberModal
      :show="showEditModal"
      :member="selectedMember"
      :pass-types="passTypes"
      :is-loading="isUpdating"
      @close="closeEditModal"
      @save="updateMember"
    />
 
    <NewMemberModal
      :show="showNewMemberModal"
      :pass-types="passTypes"
      :is-loading="isCreating"
      @close="showNewMemberModal = false"
      @save="createMember"
    />
 
    <PrintCardsModal
      :show="showPrintModal"
      :member="selectedMember"
      @close="showPrintModal = false"
    />
  </div>
 </template>

<script setup>
import { useSupabaseClient } from '#imports'
import EditMemberModal from '~/components/EditMemberModal.vue'
import NewMemberModal from '~/components/NewMemberModal.vue'
import PrintCardsModal from '~/components/PrintCardsModal.vue'

definePageMeta({
 middleware: 'auth'
})

const client = useSupabaseClient()
const search = ref('')
const barcode = ref('')
const members = ref([])
const toast = ref(null)
const barcodeInput = ref(null)

// Modal states
const showEditModal = ref(false)
const showNewMemberModal = ref(false)
const showPrintModal = ref(false)
const selectedMember = ref(null)
const isUpdating = ref(false)
const isCreating = ref(false)

// Pass types for membership selection
const passTypes = ref([])

// Audio feedback setup
const audioContext = ref(null)

onMounted(async () => {
 const setupAudio = () => {
   if (!audioContext.value) {
     audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
   }
   document.removeEventListener('click', setupAudio)
   document.removeEventListener('keydown', setupAudio)
 }
 
 document.addEventListener('click', setupAudio)
 document.addEventListener('keydown', setupAudio)

 const { data: passTypeData } = await client
   .from('pass_types')
   .select('*')
   .order('name')
 
 passTypes.value = passTypeData || []
})

function playSuccessSound() {
 if (!audioContext.value) return
 
 const oscillator = audioContext.value.createOscillator()
 const gainNode = audioContext.value.createGain()
 
 oscillator.type = 'sine'
 oscillator.frequency.setValueAtTime(1046.50, audioContext.value.currentTime)
 gainNode.gain.setValueAtTime(0.1, audioContext.value.currentTime)
 gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.2)
 
 oscillator.connect(gainNode)
 gainNode.connect(audioContext.value.destination)
 
 oscillator.start()
 oscillator.stop(audioContext.value.currentTime + 0.2)
}

function formatDate(isoDateStr) {
 if (!isoDateStr) return 'No date'
 try {
   const date = new Date(isoDateStr)
   return date.toLocaleDateString('en-US', {
     year: 'numeric',
     month: 'long',
     day: 'numeric'
   })
 } catch (error) {
   console.error('Error formatting date:', error)
   return 'Invalid Date'
 }
}

function formatCheckInDate(isoDateStr) {
 if (!isoDateStr) return 'No date'
 try {
   const date = new Date(isoDateStr)
   return date.toLocaleDateString('en-US', {
     month: 'short',
     day: 'numeric',
     hour: 'numeric',
     minute: '2-digit'
   })
 } catch (error) {
   console.error('Error formatting check-in date:', error)
   return 'Invalid Date'
 }
}

function isActive(member) {
 try {
   if (!member?.expiration_date) return false
   const expiryDate = new Date(member.expiration_date)
   const now = new Date()
   return expiryDate > now
 } catch (error) {
   console.error('Error checking expiry:', error)
   return false
 }
}

function showToast(message, type = 'success') {
 toast.value = { message, type }
 setTimeout(() => {
   toast.value = null
 }, 3000)
}

watch(search, async (query) => {
 try {
   if (query) {
     const { data, error } = await client
       .from('members')
       .select(`
         *,
         pass_type:pass_types(name),
         check_ins(id, timestamp),
         family_members(
           id,
           name,
           barcode,
           check_ins(id, timestamp)
         )
       `)
       .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
       .order('name')

     if (error) {
       console.error('Search error:', error)
       showToast('Error performing search', 'error')
       return
     }
     
     members.value = data?.map(member => ({
       ...member,
       plan: member.pass_type?.name,
       check_ins: member.check_ins?.sort((a, b) => 
         new Date(b.timestamp) - new Date(a.timestamp)
       ).slice(0, 5),
       family_members: member.family_members?.map(fm => ({
         ...fm,
         check_ins: fm.check_ins?.sort((a, b) =>
           new Date(b.timestamp) - new Date(a.timestamp)
         ).slice(0, 1)
       }))
     })) || []
   } else {
     members.value = []
   }
 } catch (error) {
   console.error('Search error:', error)
   showToast('Error performing search', 'error')
 }
})

function editMember(member) {
 selectedMember.value = member
 showEditModal.value = true
}

function closeEditModal() {
 showEditModal.value = false
 selectedMember.value = null
}

async function updateMember(updatedData) {
 isUpdating.value = true
 try {
   const { error: memberError } = await client
     .from('members')
     .update({
       name: updatedData.name,
       email: updatedData.email,
       phone: updatedData.phone,
       pass_type_id: updatedData.pass_type_id,
       expiration_date: updatedData.expiration_date
     })
     .eq('id', selectedMember.value.id)

   if (memberError) throw memberError

   if (updatedData.family_members?.length > 0) {
     const { data: existingFamilyMembers } = await client
       .from('family_members')
       .select('id, name')
       .eq('primary_member_id', selectedMember.value.id)

     const newFamilyMembers = updatedData.family_members.filter(fm => !fm.id)
     if (newFamilyMembers.length > 0) {
       const newFamilyMembersData = newFamilyMembers.map(fm => ({
         name: fm.name,
         barcode: Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15),
         primary_member_id: selectedMember.value.id,
         status: 'active'
       }))

       const { error: createError } = await client
         .from('family_members')
         .insert(newFamilyMembersData)

       if (createError) throw createError
     }

     const existingUpdates = updatedData.family_members
       .filter(fm => fm.id)
       .map(fm => ({
         id: fm.id,
         name: fm.name
       }))

     if (existingUpdates.length > 0) {
       const { error: updateError } = await client
         .from('family_members')
         .upsert(existingUpdates)

       if (updateError) throw updateError
     }

     const keepIds = updatedData.family_members
       .filter(fm => fm.id)
       .map(fm => fm.id)
     const removeIds = existingFamilyMembers
       .filter(fm => !keepIds.includes(fm.id))
       .map(fm => fm.id)

     if (removeIds.length > 0) {
       const { error: deleteError } = await client
         .from('family_members')
         .delete()
         .in('id', removeIds)

       if (deleteError) throw deleteError
     }
   }

   showToast('Member updated successfully')
   closeEditModal()

   if (search.value) {
     const currentSearch = search.value
     search.value = ''
     setTimeout(() => search.value = currentSearch, 100)
   }
 } catch (error) {
   console.error('Update error:', error)
   showToast('Error updating member', 'error')
 } finally {
   isUpdating.value = false
 }
}

async function createMember(memberData) {
 isCreating.value = true
 try {
   const membershipNumber = `MEM${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`

   const { data: newMember, error: memberError } = await client
     .from('members')
     .insert({
       name: memberData.name,
       email: memberData.email,
       phone: memberData.phone,
       pass_type_id: memberData.pass_type_id,
       expiration_date: memberData.expiration_date,
       barcode: memberData.barcode,
       membership_number: membershipNumber,
       status: 'active'
     })
     .select()
     .single()

   if (memberError) throw memberError

   if (memberData.family_members?.length > 0) {
     const familyMembersData = memberData.family_members.map(fm => ({
       name: fm.name,
       barcode: fm.barcode,
       primary_member_id: newMember.id,
       status: 'active'
     }))

     const { error: familyError } = await client
       .from('family_members')
       .insert(familyMembersData)

     if (familyError) throw familyError
   }

   showToast('Member created successfully')
   showNewMemberModal.value = false

   if (search.value) {
     const currentSearch = search.value
     search.value = ''
     setTimeout(() => search.value = currentSearch, 100)
   }
 } catch (error) {
   console.error('Creation error:', error)
   showToast('Error creating member', 'error')
 } finally {
   isCreating.value = false
 }
}

async function manualCheckIn(member, familyMember = null) {
 if (!isActive(member)) return

 try {
   if (familyMember) {
     await client.from('check_ins').insert({
       family_member_id: familyMember.id,
       timestamp: new Date().toISOString()
     })
     showToast(`${familyMember.name} checked in successfully`)
     playSuccessSound()
   } else {
     await client.from('check_ins').insert({
       member_id: member.id,
       timestamp: new Date().toISOString()
     })
     showToast(`${member.name} checked in successfully`)
     playSuccessSound()
   }
   
   if (search.value) {
     const currentSearch = search.value
     search.value = ''
     setTimeout(() => search.value = currentSearch, 100)
   }
 } catch (error) {
   showToast('Failed to check in member', 'error')
   console.error('Check-in error:', error)
 }
}

async function handleScan() {
 if (!barcode.value) return

 try {
   const { data: memberData } = await client
     .from('members')
     .select('*, pass_type:pass_types(name)')
     .eq('barcode', barcode.value)
     .single()
   
   if (memberData) {
     if (!isActive(memberData)) {
       showToast(`${memberData.name}'s membership has expired`, 'error')
     } else {
       await client.from('check_ins').insert({
         member_id: memberData.id,
         timestamp: new Date().toISOString()
       })
       showToast(`${memberData.name} checked in successfully`)
       playSuccessSound()
     }
   } else {
     const { data: familyMemberData } = await client
       .from('family_members')
       .select('*, primary_member:members(expiration_date)')
       .eq('barcode', barcode.value)
       .single()
     
     if (familyMemberData) {
       if (!isActive(familyMemberData.primary_member)) {
         showToast(`${familyMemberData.name}'s membership has expired`, 'error')
       } else {
         await client.from('check_ins').insert({
           family_member_id: familyMemberData.id,
           timestamp: new Date().toISOString()
         })
         showToast(`${familyMemberData.name} checked in successfully`)
         playSuccessSound()
       }
     } else {
       showToast('Member not found', 'error')
     }
   }
 } catch (error) {
   showToast('Error processing check-in', 'error')
   console.error('Scan error:', error)
 }
 
 barcode.value = ''
 barcodeInput.value?.focus()
}

function printMembershipCards(member) {
 selectedMember.value = member
 showPrintModal.value = true
}
</script>