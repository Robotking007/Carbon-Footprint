<template>
  <nav class="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 h-16">
    <div class="flex items-center justify-between h-full px-4">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sidebar')" class="md:hidden p-2 rounded-lg hover:bg-gray-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <router-link to="/dashboard" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">CO₂</span>
          </div>
          <span class="text-lg font-bold text-gray-800 hidden sm:block">CarbonTrack</span>
        </router-link>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden sm:flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-full">
          <div class="w-2 h-2 rounded-full" :class="scoreColor"></div>
          <span class="text-sm font-medium text-primary-700">EcoScore: {{ authStore.ecoScore }}</span>
        </div>

        <div class="relative" ref="dropdownRef">
          <button @click="showDropdown = !showDropdown"
            class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-primary-700 font-semibold text-sm">{{ initials }}</span>
            </div>
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <transition name="fade">
            <div v-if="showDropdown"
              class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100">
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="font-semibold text-sm text-gray-800">{{ authStore.userName }}</p>
                <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
              </div>
              <router-link to="/profile" @click="showDropdown = false"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</router-link>
              <button @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const router = useRouter()
const showDropdown = ref(false)
const dropdownRef = ref(null)

const initials = computed(() => {
  const name = authStore.userName
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const scoreColor = computed(() => {
  const s = authStore.ecoScore
  if (s >= 70) return 'bg-green-500'
  if (s >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
})

const handleLogout = () => {
  authStore.logout()
  showDropdown.value = false
  router.push('/login')
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    showDropdown.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
