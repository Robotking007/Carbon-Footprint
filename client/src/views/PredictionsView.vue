<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Emission Predictions</h1>
      <p class="text-gray-500">AI-powered forecast of your future carbon emissions</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <div v-else-if="predictions">
      <!-- Model Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="stat-card">
          <p class="text-sm text-gray-500">Trend</p>
          <p class="text-xl font-bold capitalize" :class="predictions.trend === 'decreasing' ? 'text-green-600' : predictions.trend === 'increasing' ? 'text-red-600' : 'text-gray-800'">
            {{ predictions.trend === 'decreasing' ? '📉' : predictions.trend === 'increasing' ? '📈' : '📊' }}
            {{ predictions.trend }}
          </p>
        </div>
        <div class="stat-card">
          <p class="text-sm text-gray-500">Risk Level</p>
          <p class="text-xl font-bold capitalize" :class="predictions.riskAssessment === 'low' ? 'text-green-600' : predictions.riskAssessment === 'high' ? 'text-red-600' : 'text-yellow-600'">
            {{ predictions.riskAssessment }}
          </p>
        </div>
        <div class="stat-card">
          <p class="text-sm text-gray-500">Model Accuracy (R²)</p>
          <p class="text-xl font-bold text-primary-600">{{ (predictions.modelStats?.rSquared * 100)?.toFixed(1) || 'N/A' }}%</p>
        </div>
      </div>

      <!-- Forecast Chart -->
      <div class="card mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">30-Day Forecast</h3>
        <div class="h-72">
          <Line v-if="forecastData" :data="forecastData" :options="chartOptions" />
        </div>
      </div>

      <!-- What-If Analysis -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">🧪 What-If Analysis</h3>
        <p class="text-sm text-gray-500 mb-4">See how lifestyle changes affect your emissions</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div v-for="change in whatIfChanges" :key="change.category">
            <label class="block text-sm font-medium text-gray-700 mb-1 capitalize">{{ change.category }}</label>
            <div class="flex items-center gap-2">
              <input type="range" v-model.number="change.percentChange" min="-100" max="100" step="5"
                class="flex-1 accent-primary-500" />
              <span class="text-sm font-mono w-12 text-right" :class="change.percentChange < 0 ? 'text-green-600' : change.percentChange > 0 ? 'text-red-600' : 'text-gray-500'">
                {{ change.percentChange > 0 ? '+' : '' }}{{ change.percentChange }}%
              </span>
            </div>
          </div>
        </div>

        <button @click="runWhatIf" :disabled="whatIfLoading" class="btn-primary">
          {{ whatIfLoading ? 'Analyzing...' : 'Run Analysis' }}
        </button>

        <div v-if="whatIfResult" class="mt-4 p-4 bg-primary-50 rounded-xl">
          <p class="text-sm text-gray-700">
            <strong>Current:</strong> {{ whatIfResult.currentMonthly?.toFixed(1) }} kg CO₂/month →
            <strong>Projected:</strong> {{ whatIfResult.projectedMonthly?.toFixed(1) }} kg CO₂/month
          </p>
          <p class="text-sm font-semibold mt-1" :class="whatIfResult.savingsPercent > 0 ? 'text-green-600' : 'text-red-600'">
            {{ whatIfResult.savingsPercent > 0 ? '↓' : '↑' }} {{ Math.abs(whatIfResult.savingsPercent)?.toFixed(1) }}% change
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useCarbonStore } from '../stores/carbon'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const carbonStore = useCarbonStore()
const loading = ref(true)
const predictions = ref(null)
const whatIfLoading = ref(false)
const whatIfResult = ref(null)

const whatIfChanges = reactive([
  { category: 'travel', percentChange: 0 },
  { category: 'electricity', percentChange: 0 },
  { category: 'food', percentChange: 0 },
  { category: 'streaming', percentChange: 0 },
  { category: 'waste', percentChange: 0 },
  { category: 'shopping', percentChange: 0 },
])

const forecastData = computed(() => {
  if (!predictions.value?.forecast?.length) return null
  return {
    labels: predictions.value.forecast.map((_, i) => `Day ${i + 1}`),
    datasets: [{
      label: 'Predicted CO₂ (kg)',
      data: predictions.value.forecast.map(f => f.predicted),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  }
})

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, title: { display: true, text: 'kg CO₂' } } }
}

const runWhatIf = async () => {
  whatIfLoading.value = true
  try {
    const changes = {}
    whatIfChanges.forEach(c => { changes[c.category] = c.percentChange })
    const data = await carbonStore.runWhatIf(changes)
    whatIfResult.value = data.data
  } catch (err) {
    console.error(err)
  } finally {
    whatIfLoading.value = false
  }
}

onMounted(async () => {
  try {
    const data = await carbonStore.fetchPredictions()
    predictions.value = data.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
