<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Challenges</h1>
      <p class="text-gray-500">Join eco-challenges and earn bonus points & badges</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="challenge in challenges" :key="challenge._id" class="card hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div>
              <span class="badge-pill text-xs capitalize"
                :class="typeColors[challenge.type]">
                {{ challenge.type?.replace('_', ' ') }}
              </span>
              <h3 class="text-lg font-semibold text-gray-800 mt-2">{{ challenge.title }}</h3>
            </div>
            <span class="text-2xl">{{ challenge.badge || '🏆' }}</span>
          </div>

          <p class="text-sm text-gray-600 mb-4">{{ challenge.description }}</p>

          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Target Reduction</span>
              <span class="font-medium text-gray-800">{{ challenge.targetReduction }}%</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Points</span>
              <span class="font-medium text-primary-600">+{{ challenge.points }} pts</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Participants</span>
              <span class="font-medium text-gray-800">{{ challenge.participants?.length || 0 }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Duration</span>
              <span class="font-medium text-gray-800">
                {{ formatDate(challenge.startDate) }} - {{ formatDate(challenge.endDate) }}
              </span>
            </div>
          </div>

          <!-- Progress if joined -->
          <div v-if="isJoined(challenge)" class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-500">Your Progress</span>
              <span class="font-medium text-primary-600">{{ getProgress(challenge)?.toFixed(0) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full bg-primary-500 transition-all"
                :style="{ width: Math.min(getProgress(challenge) || 0, 100) + '%' }"></div>
            </div>
          </div>

          <button v-if="!isJoined(challenge)" @click="joinChallenge(challenge._id)"
            class="btn-primary w-full text-sm">
            Join Challenge
          </button>
          <div v-else class="text-center text-sm text-primary-600 font-medium bg-primary-50 py-2 rounded-lg">
            ✅ Joined
          </div>
        </div>
      </div>

      <div v-if="!challenges.length" class="card text-center py-12">
        <span class="text-4xl block mb-3">🏆</span>
        <p class="text-lg font-semibold text-gray-800">No Active Challenges</p>
        <p class="text-gray-500">Check back soon for new eco-challenges!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCarbonStore } from '../stores/carbon'
import { useAuthStore } from '../stores/auth'

const carbonStore = useCarbonStore()
const authStore = useAuthStore()
const loading = ref(true)
const challenges = ref([])

const typeColors = {
  individual: 'bg-blue-100 text-blue-700',
  city: 'bg-purple-100 text-purple-700',
  college: 'bg-orange-100 text-orange-700',
  weekly: 'bg-green-100 text-green-700',
  monthly: 'bg-yellow-100 text-yellow-700',
}

const formatDate = (d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })

const isJoined = (challenge) => {
  return challenge.participants?.some(p => p.user === authStore.user?._id || p.user?._id === authStore.user?._id)
}

const getProgress = (challenge) => {
  const participant = challenge.participants?.find(p => p.user === authStore.user?._id || p.user?._id === authStore.user?._id)
  return participant?.progress || 0
}

const joinChallenge = async (id) => {
  try {
    await carbonStore.joinChallenge(id)
    await fetchChallenges()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to join')
  }
}

const fetchChallenges = async () => {
  const data = await carbonStore.fetchChallenges()
  challenges.value = data.data || []
}

onMounted(async () => {
  try {
    await fetchChallenges()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
