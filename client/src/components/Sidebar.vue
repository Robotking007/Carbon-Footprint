<template>
  <!-- Overlay -->
  <div v-if="open" @click="$emit('close')" class="fixed inset-0 bg-black/30 z-30 md:hidden"></div>

  <!-- Sidebar -->
  <aside :class="[
    'fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg z-40 transition-transform duration-300',
    open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  ]">
    <div class="flex flex-col h-full p-4">
      <nav class="flex-1 space-y-1">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
          @click="$emit('close')"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.path) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <span v-html="item.icon" class="w-5 h-5 flex-shrink-0"></span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="border-t pt-4 mt-4">
        <div class="bg-primary-50 rounded-xl p-4">
          <p class="text-sm font-semibold text-primary-800 mb-1">💡 Eco Tip</p>
          <p class="text-xs text-primary-600">{{ tips[tipIndex] }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps({ open: Boolean })
defineEmits(['close'])

const route = useRoute()
const tipIndex = ref(Math.floor(Math.random() * 5))

const isActive = (path) => route.path === path

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>' },
  { path: '/log', label: 'Log Activity', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>' },
  { path: '/recommendations', label: 'Recommendations', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>' },
  { path: '/predictions', label: 'Predictions', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>' },
  { path: '/leaderboard', label: 'Leaderboard', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>' },
  { path: '/challenges', label: 'Challenges', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' },
  { path: '/heatmap', label: 'City Heatmap', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' },
  { path: '/credits', label: 'Carbon Credits', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },
  { path: '/profile', label: 'Profile', icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>' },
]

const tips = [
  'Walking or cycling for short trips can save up to 2 kg CO₂ per trip.',
  'Switching to LED bulbs reduces energy use by 75%.',
  'A plant-based meal produces 50% less emissions than a meat-based meal.',
  'Carpooling with 3 people cuts your travel emissions by 66%.',
  'Reducing streaming quality saves up to 36 kg CO₂ per year.',
]
</script>
