<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar v-if="isAuthenticated" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="flex" v-if="isAuthenticated">
      <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />
      <main class="flex-1 p-4 md:p-6 lg:p-8 md:ml-64 mt-16 transition-all duration-300">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <div v-else>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const sidebarOpen = ref(false)
</script>
