<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">City Emission Heatmap</h1>
      <p class="text-gray-500">Compare carbon emissions across Indian cities</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <div v-else>
      <!-- City Grid Heatmap -->
      <div class="card mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">🗺️ City Emissions Overview</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="city in cityHeatmap" :key="city.city"
            class="p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md"
            :class="intensityClasses[city.intensity]"
            @click="selectedCity = city">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-semibold text-gray-800">{{ city.city }}</h4>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="city.intensity === 'high' ? 'bg-red-100 text-red-700' : city.intensity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'">
                {{ city.intensity }}
              </span>
            </div>
            <p class="text-2xl font-bold" :class="city.intensity === 'high' ? 'text-red-600' : city.intensity === 'medium' ? 'text-yellow-600' : 'text-green-600'">
              {{ city.avgEmission?.toFixed(1) }}
            </p>
            <p class="text-xs text-gray-500">kg CO₂/day avg · {{ city.userCount }} users</p>
          </div>
        </div>

        <div v-if="!cityHeatmap.length" class="text-center py-12 text-gray-400">
          No city data available yet
        </div>
      </div>

      <!-- City Detail -->
      <div v-if="selectedCity" class="card mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">📊 {{ selectedCity.city }} Breakdown</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div v-for="(val, cat) in selectedCity.categoryBreakdown" :key="cat" class="p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-500 capitalize">{{ cat }}</p>
            <p class="text-lg font-bold text-gray-800">{{ val?.toFixed(1) }} kg</p>
          </div>
        </div>
      </div>

      <!-- Personal Heatmap -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">📅 Your Personal Emission Heatmap</h3>
        <p class="text-sm text-gray-500 mb-4">Daily emission intensity over the past 30 days</p>

        <div v-if="userHeatmap?.matrix?.length" class="overflow-x-auto">
          <div class="inline-grid gap-1" :style="{ gridTemplateColumns: `80px repeat(${userHeatmap.matrix[0]?.days?.length || 7}, 32px)` }">
            <!-- Header row -->
            <div></div>
            <div v-for="(day, i) in (userHeatmap.matrix[0]?.days || [])" :key="'h'+i"
              class="text-xs text-gray-500 text-center">
              {{ day.day }}
            </div>
            <!-- Category rows -->
            <template v-for="row in userHeatmap.matrix" :key="row.category">
              <div class="text-xs font-medium text-gray-600 capitalize flex items-center">{{ row.category }}</div>
              <div v-for="(day, i) in row.days" :key="row.category+i"
                class="w-8 h-8 rounded flex items-center justify-center text-xs font-mono cursor-pointer"
                :class="getHeatColor(day.emission)"
                :title="`${row.category} - Day ${day.day}: ${day.emission?.toFixed(1)} kg`">
                {{ day.emission > 0 ? day.emission?.toFixed(0) : '' }}
              </div>
            </template>
          </div>

          <div class="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <span>Less</span>
            <div class="w-4 h-4 rounded bg-green-100"></div>
            <div class="w-4 h-4 rounded bg-green-300"></div>
            <div class="w-4 h-4 rounded bg-yellow-300"></div>
            <div class="w-4 h-4 rounded bg-orange-400"></div>
            <div class="w-4 h-4 rounded bg-red-500"></div>
            <span>More</span>
          </div>
        </div>

        <p v-else class="text-gray-400 text-center py-8">Not enough data for the personal heatmap</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCarbonStore } from '../stores/carbon'

const carbonStore = useCarbonStore()
const loading = ref(true)
const cityHeatmap = ref([])
const userHeatmap = ref(null)
const selectedCity = ref(null)

const intensityClasses = {
  low: 'border-green-200 bg-green-50',
  medium: 'border-yellow-200 bg-yellow-50',
  high: 'border-red-200 bg-red-50',
}

const getHeatColor = (val) => {
  if (!val || val === 0) return 'bg-gray-50 text-gray-300'
  if (val < 2) return 'bg-green-100 text-green-800'
  if (val < 5) return 'bg-green-300 text-green-900'
  if (val < 10) return 'bg-yellow-300 text-yellow-900'
  if (val < 20) return 'bg-orange-400 text-orange-900'
  return 'bg-red-500 text-white'
}

onMounted(async () => {
  try {
    const [cities, user] = await Promise.all([
      carbonStore.fetchHeatmap(),
      carbonStore.fetchUserHeatmap(),
    ])
    cityHeatmap.value = cities.data || []
    userHeatmap.value = user || null
    if (cityHeatmap.value.length) selectedCity.value = cityHeatmap.value[0]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
