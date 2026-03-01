<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-green-100 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-2xl">CO₂</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-800">Welcome Back</h1>
        <p class="text-gray-500 mt-2">Sign in to track your carbon footprint</p>
      </div>

      <div class="card">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div v-if="error" class="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{{ error }}</div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" required class="input-field" placeholder="you@example.com" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" required class="input-field" placeholder="••••••••" />
          </div>

          <button type="submit" :disabled="loading" class="btn-primary w-full flex items-center justify-center gap-2">
            <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            Don't have an account?
            <router-link to="/register" class="text-primary-600 font-medium hover:text-primary-700">Sign up</router-link>
          </p>
        </div>

        <div class="mt-4 p-3 bg-gray-50 rounded-lg">
          <p class="text-xs text-gray-500 font-medium mb-1">Demo Account</p>
          <p class="text-xs text-gray-600">Email: demo@carbon.app | Password: demo123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const form = reactive({ email: '', password: '' })

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.email, form.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
