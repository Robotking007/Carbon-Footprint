<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">AI Recommendations</h1>
      <p class="text-gray-500">Personalized tips to reduce your carbon footprint</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <div v-else-if="recommendations">
      <!-- SHAP Feature Importance -->
      <div class="card mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">🔍 Feature Contribution Analysis (SHAP-like)</h3>
        <p class="text-sm text-gray-500 mb-4">How each category contributes to your total emissions</p>
        <div class="space-y-3">
          <div v-for="feat in recommendations.featureContributions" :key="feat.category" class="flex items-center gap-3">
            <span class="w-24 text-sm font-medium text-gray-600 capitalize">{{ feat.category }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                :class="feat.percentage > 30 ? 'bg-red-500' : feat.percentage > 15 ? 'bg-yellow-500' : 'bg-green-500'"
                :style="{ width: feat.percentage + '%' }"></div>
            </div>
            <span class="text-sm font-semibold text-gray-700 w-16 text-right">{{ feat.percentage?.toFixed(1) }}%</span>
          </div>
        </div>
      </div>

      <!-- Recommendations List -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="(rec, i) in recommendations.suggestions" :key="i"
          class="card hover:shadow-md transition-shadow">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
              :class="priorityColors[rec.priority]">
              {{ rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢' }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="badge-pill capitalize" :class="rec.priority === 'high' ? 'bg-red-100 text-red-700' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'">
                  {{ rec.priority }}
                </span>
                <span class="badge-pill bg-gray-100 text-gray-600 capitalize">{{ rec.category }}</span>
              </div>
              <p class="text-sm text-gray-800 font-medium">{{ rec.suggestion }}</p>
              <p v-if="rec.potentialSaving" class="text-xs text-primary-600 mt-1 font-medium">
                💰 Save up to {{ rec.potentialSaving }} kg CO₂/month
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!recommendations.suggestions?.length" class="card text-center py-12">
        <span class="text-4xl mb-3 block">🎉</span>
        <p class="text-lg font-semibold text-gray-800">Great job!</p>
        <p class="text-gray-500">You're already doing well. Keep it up!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCarbonStore } from '../stores/carbon'

const carbonStore = useCarbonStore()
const loading = ref(true)
const recommendations = ref(null)

const priorityColors = {
  high: 'bg-red-50', medium: 'bg-yellow-50', low: 'bg-green-50'
}

onMounted(async () => {
  try {
    const data = await carbonStore.fetchRecommendations()
    recommendations.value = data.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
