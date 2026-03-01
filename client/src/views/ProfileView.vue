<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Profile</h1>
      <p class="text-gray-500">Manage your account and preferences</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <div class="card text-center">
        <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl font-bold text-primary-700">{{ initials }}</span>
        </div>
        <h2 class="text-xl font-bold text-gray-800">{{ user?.name }}</h2>
        <p class="text-sm text-gray-500">{{ user?.email }}</p>
        <p class="text-sm text-gray-500 mt-1">📍 {{ user?.city }}, {{ user?.country }}</p>

        <div class="mt-4 grid grid-cols-3 gap-2">
          <div class="bg-primary-50 rounded-lg p-3">
            <p class="text-2xl font-bold text-primary-600">{{ user?.ecoScore || 0 }}</p>
            <p class="text-xs text-gray-500">Eco Score</p>
          </div>
          <div class="bg-yellow-50 rounded-lg p-3">
            <p class="text-2xl font-bold text-yellow-600">{{ user?.level || 1 }}</p>
            <p class="text-xs text-gray-500">Level</p>
          </div>
          <div class="bg-blue-50 rounded-lg p-3">
            <p class="text-2xl font-bold text-blue-600">{{ user?.points || 0 }}</p>
            <p class="text-xs text-gray-500">Points</p>
          </div>
        </div>

        <div v-if="user?.badges?.length" class="mt-4 flex flex-wrap gap-2 justify-center">
          <span v-for="badge in user.badges" :key="badge" class="badge-pill bg-yellow-100 text-yellow-700">
            🏅 {{ badge }}
          </span>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="lg:col-span-2 card">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h3>

        <form @submit.prevent="handleUpdate" class="space-y-4">
          <div v-if="success" class="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
            ✅ Profile updated successfully!
          </div>
          <div v-if="error" class="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{{ error }}</div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input v-model="form.name" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input v-model="form.city" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select v-model="form.country" class="input-field">
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Germany">Germany</option>
                <option value="Japan">Japan</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Diet Type</label>
              <select v-model="form.dietType" class="input-field">
                <option value="mixed">Mixed / Omnivore</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="non_vegetarian">Non-Vegetarian</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Primary Transport</label>
              <select v-model="form.transportMode" class="input-field">
                <option value="car_petrol">Car (Petrol)</option>
                <option value="car_diesel">Car (Diesel)</option>
                <option value="car_electric">Car (Electric)</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="bus">Bus</option>
                <option value="train_electric">Train</option>
                <option value="metro">Metro</option>
                <option value="bicycle">Bicycle</option>
                <option value="walking">Walking</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (kg CO₂)</label>
              <input v-model.number="form.monthlyBudget" type="number" min="50" max="1000" class="input-field" />
            </div>
          </div>

          <button type="submit" :disabled="saving" class="btn-primary flex items-center gap-2">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const saving = ref(false)
const success = ref(false)
const error = ref('')

const initials = computed(() => {
  const name = user.value?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const form = reactive({
  name: '', city: '', country: 'India',
  dietType: 'omnivore', transportMode: 'car', monthlyBudget: 200,
})

const handleUpdate = async () => {
  saving.value = true
  success.value = false
  error.value = ''
  try {
    await authStore.updateProfile({ ...form })
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await authStore.fetchProfile()
  const u = authStore.user
  if (u) {
    form.name = u.name || ''
    form.city = u.city || ''
    form.country = u.country || 'India'
    form.dietType = u.dietType || 'mixed'
    form.transportMode = u.transportMode || 'bus'
    form.monthlyBudget = u.monthlyBudget || 200
  }
})
</script>
