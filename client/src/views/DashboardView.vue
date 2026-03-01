<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-gray-500">Welcome back, {{ authStore.userName }}! Here's your carbon overview.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <div v-else-if="dashboard">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Monthly Emissions</p>
              <p class="text-2xl font-bold text-gray-800">{{ dashboard.monthlyTotal?.toFixed(1) || 0 }} <span class="text-sm font-normal text-gray-500">kg CO₂</span></p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <span class="text-xl">🏭</span>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-1 text-sm">
            <span :class="comparison >= 0 ? 'text-red-500' : 'text-green-500'">
              {{ comparison >= 0 ? '↑' : '↓' }} {{ Math.abs(comparison).toFixed(1) }}%
            </span>
            <span class="text-gray-400">vs last month</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Monthly Budget</p>
              <p class="text-2xl font-bold" :class="budgetUsed > 100 ? 'text-red-600' : 'text-gray-800'">
                {{ budgetUsed.toFixed(0) }}%
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span class="text-xl">🎯</span>
            </div>
          </div>
          <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div class="h-2 rounded-full transition-all"
              :class="budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'"
              :style="{ width: Math.min(budgetUsed, 100) + '%' }"></div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Eco Score</p>
              <p class="text-2xl font-bold text-primary-600">{{ dashboard.user?.ecoScore || 0 }}</p>
            </div>
            <div class="eco-score-ring w-12 h-12">
              <svg viewBox="0 0 36 36" class="w-full h-full">
                <path class="text-gray-200" stroke="currentColor" stroke-width="3" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="text-primary-500" stroke="currentColor" stroke-width="3" fill="none"
                  :stroke-dasharray="(dashboard.user?.ecoScore || 0) + ', 100'"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
            </div>
          </div>
          <p class="mt-2 text-sm text-gray-400">Level {{ dashboard.user?.level || 1 }} · {{ dashboard.user?.points || 0 }} pts</p>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Highest Category</p>
              <p class="text-2xl font-bold text-gray-800 capitalize">{{ dashboard.highestCategory || 'N/A' }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span class="text-xl">{{ categoryIcons[dashboard.highestCategory] || '📊' }}</span>
            </div>
          </div>
          <p class="mt-2 text-sm text-gray-400">Focus area for reduction</p>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">7-Day Emission Trend</h3>
          <div class="h-64">
            <Line v-if="trendData" :data="trendData" :options="lineOptions" />
            <p v-else class="text-gray-400 text-center mt-20">No data available</p>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h3>
          <div class="h-64 flex items-center justify-center">
            <Doughnut v-if="breakdownData" :data="breakdownData" :options="doughnutOptions" />
            <p v-else class="text-gray-400 text-center">No data available</p>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Recent Activities</h3>
          <router-link to="/log" class="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Log New</router-link>
        </div>
        <div v-if="dashboard.recentActivities?.length" class="space-y-3">
          <div v-for="activity in dashboard.recentActivities" :key="activity._id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="categoryColors[activity.category]">
                <span>{{ categoryIcons[activity.category] }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800 capitalize">{{ activity.category }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(activity.date) }}</p>
              </div>
            </div>
            <span class="text-sm font-semibold" :class="activity.totalEmission > 5 ? 'text-red-500' : 'text-green-600'">
              {{ activity.totalEmission?.toFixed(2) }} kg CO₂
            </span>
          </div>
        </div>
        <p v-else class="text-gray-400 text-center py-8">No activities logged yet. Start tracking!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCarbonStore } from '../stores/carbon'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const authStore = useAuthStore()
const carbonStore = useCarbonStore()
const loading = ref(true)
const dashboard = ref(null)

const categoryIcons = { travel: '🚗', electricity: '⚡', food: '🍽️', streaming: '📺', waste: '🗑️', shopping: '🛒' }
const categoryColors = {
  travel: 'bg-blue-100', electricity: 'bg-yellow-100', food: 'bg-green-100',
  streaming: 'bg-purple-100', waste: 'bg-gray-100', shopping: 'bg-pink-100'
}

const comparison = computed(() => dashboard.value?.comparison || 0)
const budgetUsed = computed(() => {
  if (!dashboard.value) return 0
  const budget = dashboard.value.user?.monthlyBudget || 200
  return (dashboard.value.monthlyTotal / budget) * 100
})

const trendData = computed(() => {
  const daily = dashboard.value?.dailyTrend
  if (!daily?.length) return null
  return {
    labels: daily.map(d => new Date(d.date).toLocaleDateString('en', { weekday: 'short' })),
    datasets: [{
      label: 'CO₂ (kg)',
      data: daily.map(d => d.total),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#22c55e',
    }]
  }
})

const breakdownData = computed(() => {
  const bd = dashboard.value?.breakdown
  if (!bd || Object.keys(bd).length === 0) return null
  const colors = ['#3b82f6', '#eab308', '#22c55e', '#a855f7', '#6b7280', '#ec4899']
  const labels = Object.keys(bd)
  return {
    labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
    datasets: [{
      data: Object.values(bd),
      backgroundColor: colors.slice(0, labels.length),
      borderWidth: 0,
    }]
  }
})

const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }

const formatDate = (d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })

onMounted(async () => {
  try {
    await carbonStore.fetchDashboard()
    dashboard.value = carbonStore.dashboard
  } catch (err) {
    console.error('Dashboard load error:', err)
  } finally {
    loading.value = false
  }
})
</script>
