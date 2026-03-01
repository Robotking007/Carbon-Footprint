<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Leaderboard</h1>
      <p class="text-gray-500">See how you rank against other eco-warriors</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value; fetchData()"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === tab.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <div v-else>
      <!-- Stats -->
      <div v-if="stats" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="stat-card">
          <p class="text-sm text-gray-500">Your Rank</p>
          <p class="text-2xl font-bold text-primary-600">#{{ stats.rank || '-' }}</p>
        </div>
        <div class="stat-card">
          <p class="text-sm text-gray-500">Percentile</p>
          <p class="text-2xl font-bold text-gray-800">Top {{ stats.percentile?.toFixed(0) || '-' }}%</p>
        </div>
        <div class="stat-card">
          <p class="text-sm text-gray-500">Badges Earned</p>
          <p class="text-2xl font-bold text-yellow-600">{{ badges.length }}</p>
        </div>
      </div>

      <!-- Leaderboard Table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eco Score</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Emission</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" v-if="activeTab !== 'global'">City</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(entry, i) in leaderboard" :key="entry._id || i"
                class="hover:bg-gray-50 transition-colors"
                :class="entry.isCurrentUser ? 'bg-primary-50' : ''">
                <td class="px-4 py-3">
                  <span class="text-lg" v-if="i < 3">{{ ['🥇', '🥈', '🥉'][i] }}</span>
                  <span v-else class="text-sm text-gray-600 font-medium">{{ i + 1 }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-xs font-semibold text-primary-700">{{ getInitials(entry.name) }}</span>
                    </div>
                    <span class="text-sm font-medium text-gray-800">{{ entry.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                      <div class="h-2 rounded-full bg-primary-500" :style="{ width: entry.ecoScore + '%' }"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-700">{{ entry.ecoScore }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ entry.level || 1 }}</td>
                <td class="px-4 py-3 text-sm font-medium" :class="entry.avgEmission < 5 ? 'text-green-600' : 'text-red-600'">
                  {{ entry.avgEmission?.toFixed(1) || 0 }} kg
                </td>
                <td class="px-4 py-3 text-sm text-gray-600" v-if="activeTab !== 'global'">{{ entry.city }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Badges -->
      <div v-if="badges.length" class="mt-6 card">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">🏅 Your Badges</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="badge in badges" :key="badge.id"
            class="p-3 rounded-xl text-center" :class="badge.earned ? 'bg-yellow-50' : 'bg-gray-50 opacity-50'">
            <span class="text-3xl block mb-1">{{ badge.icon }}</span>
            <p class="text-xs font-semibold text-gray-800">{{ badge.name }}</p>
            <p class="text-xs text-gray-500">{{ badge.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCarbonStore } from '../stores/carbon'

const carbonStore = useCarbonStore()
const loading = ref(true)
const activeTab = ref('global')
const leaderboard = ref([])
const stats = ref(null)
const badges = ref([])

const tabs = [
  { value: 'global', label: '🌍 Global' },
  { value: 'city', label: '🏙️ City' },
  { value: 'city_comparison', label: '📊 City Comparison' },
]

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

const fetchData = async () => {
  loading.value = true
  try {
    const [lb, st, bd] = await Promise.all([
      carbonStore.fetchLeaderboard(activeTab.value),
      carbonStore.fetchStats(),
      carbonStore.fetchBadges(),
    ])
    leaderboard.value = lb.data || []
    stats.value = st.data || null
    badges.value = bd.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
