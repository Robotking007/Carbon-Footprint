<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Log Activity</h1>
      <p class="text-gray-500">Record your daily carbon-emitting activities</p>
    </div>

    <!-- Category Selector -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <button v-for="cat in categories" :key="cat.value" @click="selectedCategory = cat.value"
        class="p-4 rounded-xl border-2 transition-all text-center"
        :class="selectedCategory === cat.value
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300'">
        <span class="text-2xl block mb-1">{{ cat.icon }}</span>
        <span class="text-sm font-medium" :class="selectedCategory === cat.value ? 'text-primary-700' : 'text-gray-600'">
          {{ cat.label }}
        </span>
      </button>
    </div>

    <!-- Form -->
    <div class="card max-w-2xl">
      <h2 class="text-lg font-semibold text-gray-800 mb-4 capitalize">{{ selectedCategory }} Details</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Travel -->
        <template v-if="selectedCategory === 'travel'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mode of Transport</label>
            <select v-model="formData.mode" class="input-field">
              <option value="car_petrol">Car (Petrol)</option>
              <option value="car_diesel">Car (Diesel)</option>
              <option value="car_electric">Car (Electric)</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="metro">Metro</option>
              <option value="auto_rickshaw">Auto Rickshaw</option>
              <option value="bicycle">Bicycle</option>
              <option value="walking">Walking</option>
              <option value="domestic_flight">Domestic Flight</option>
              <option value="international_flight">International Flight</option>
              <option value="carpool_2">Carpool (2 people)</option>
              <option value="carpool_4">Carpool (4 people)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
            <input v-model.number="formData.distance" type="number" min="0" step="0.1" required class="input-field" placeholder="e.g. 15" />
          </div>
        </template>

        <!-- Electricity -->
        <template v-if="selectedCategory === 'electricity'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Energy Usage (kWh)</label>
            <input v-model.number="formData.usage" type="number" min="0" step="0.1" required class="input-field" placeholder="e.g. 10" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select v-model="formData.country" class="input-field">
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Germany">Germany</option>
              <option value="Japan">Japan</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </template>

        <!-- Food -->
        <template v-if="selectedCategory === 'food'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
            <select v-model="formData.mealType" class="input-field">
              <option value="home_cooked_veg">Home Cooked (Veg)</option>
              <option value="home_cooked_nonveg">Home Cooked (Non-Veg)</option>
              <option value="restaurant_veg">Restaurant (Veg)</option>
              <option value="restaurant_nonveg">Restaurant (Non-Veg)</option>
              <option value="fast_food">Fast Food</option>
              <option value="vegan">Vegan Meal</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Food Items (optional)</label>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="item in foodItems" :key="item" class="flex items-center gap-2 text-sm">
                <input type="checkbox" :value="item" v-model="formData.items" class="rounded text-primary-500" />
                <span class="capitalize">{{ item.replace('_', ' ') }}</span>
              </label>
            </div>
          </div>
        </template>

        <!-- Streaming -->
        <template v-if="selectedCategory === 'streaming'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Streaming Type</label>
            <select v-model="formData.type" class="input-field">
              <option value="video_hd">Video (HD)</option>
              <option value="video_sd">Video (SD)</option>
              <option value="video_4k">Video (4K)</option>
              <option value="music">Music</option>
              <option value="gaming">Gaming</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hours</label>
            <input v-model.number="formData.hours" type="number" min="0" step="0.5" required class="input-field" placeholder="e.g. 2" />
          </div>
        </template>

        <!-- Waste -->
        <template v-if="selectedCategory === 'waste'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Waste Type</label>
            <div class="space-y-2">
              <label v-for="w in wasteTypes" :key="w" class="flex items-center gap-2 text-sm">
                <input type="checkbox" :value="w" v-model="formData.items" class="rounded text-primary-500" />
                <span class="capitalize">{{ w.replace('_', ' ') }}</span>
              </label>
            </div>
          </div>
        </template>

        <!-- Shopping -->
        <template v-if="selectedCategory === 'shopping'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Items Purchased</label>
            <div class="space-y-2">
              <label v-for="s in shoppingTypes" :key="s" class="flex items-center gap-2 text-sm">
                <input type="checkbox" :value="s" v-model="formData.items" class="rounded text-primary-500" />
                <span class="capitalize">{{ s.replace('_', ' ') }}</span>
              </label>
            </div>
          </div>
        </template>

        <!-- Success Message -->
        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>✅</span>
          <div>
            <p class="font-medium">Activity logged!</p>
            <p class="text-sm">Emission: {{ lastEmission?.toFixed(2) }} kg CO₂</p>
          </div>
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{{ error }}</div>

        <button type="submit" :disabled="submitting" class="btn-primary w-full flex items-center justify-center gap-2">
          <svg v-if="submitting" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ submitting ? 'Logging...' : 'Log Activity' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useCarbonStore } from '../stores/carbon'

const carbonStore = useCarbonStore()
const selectedCategory = ref('travel')
const submitting = ref(false)
const success = ref(false)
const error = ref('')
const lastEmission = ref(null)

const categories = [
  { value: 'travel', label: 'Travel', icon: '🚗' },
  { value: 'electricity', label: 'Electricity', icon: '⚡' },
  { value: 'food', label: 'Food', icon: '🍽️' },
  { value: 'streaming', label: 'Streaming', icon: '📺' },
  { value: 'waste', label: 'Waste', icon: '🗑️' },
  { value: 'shopping', label: 'Shopping', icon: '🛒' },
]

const foodItems = ['rice', 'bread', 'chicken', 'beef', 'fish', 'milk', 'cheese', 'eggs', 'vegetables', 'fruits', 'lentils', 'tofu']
const wasteTypes = ['general', 'plastic', 'paper', 'organic', 'electronic', 'glass', 'metal']
const shoppingTypes = ['clothing', 'electronics', 'furniture', 'groceries', 'miscellaneous']

const getDefaultForm = () => ({
  mode: 'car_petrol', distance: null,
  usage: null, country: 'India',
  mealType: 'home_cooked_veg', items: [],
  type: 'video_hd', hours: null,
})

const formData = reactive(getDefaultForm())

watch(selectedCategory, () => {
  Object.assign(formData, getDefaultForm())
  success.value = false
  error.value = ''
})

const handleSubmit = async () => {
  submitting.value = true
  success.value = false
  error.value = ''
  try {
    const result = await carbonStore.logActivity(selectedCategory.value, { ...formData })
    lastEmission.value = result.data?.totalEmission
    success.value = true
    Object.assign(formData, getDefaultForm())
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to log activity'
  } finally {
    submitting.value = false
  }
}
</script>
