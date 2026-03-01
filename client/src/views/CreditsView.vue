<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Carbon Credits</h1>
      <p class="text-gray-500">Earn and redeem virtual carbon credits for your eco-efforts</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <div v-else>
      <!-- Balance Card -->
      <div class="bg-gradient-to-r from-primary-500 to-green-600 rounded-2xl p-6 text-white mb-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm opacity-80">Credit Balance</p>
            <p class="text-4xl font-bold mt-1">{{ credits?.balance?.toFixed(1) || 0 }}</p>
            <p class="text-sm opacity-80 mt-1">virtual carbon credits</p>
          </div>
          <div class="text-6xl opacity-30">💳</div>
        </div>
        <div class="mt-4 flex gap-4">
          <button @click="calculateNew" :disabled="calculating" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
            {{ calculating ? 'Calculating...' : '🔄 Calculate New Credits' }}
          </button>
        </div>
      </div>

      <!-- Credit Calculation Result -->
      <div v-if="calcResult" class="card mb-6 border-2 border-primary-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">🎉 Credits Calculated!</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p class="text-sm text-gray-500">CO₂ Saved</p>
            <p class="text-lg font-bold text-green-600">{{ calcResult.co2Saved?.toFixed(1) }} kg</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Credits Earned</p>
            <p class="text-lg font-bold text-primary-600">{{ calcResult.creditsEarned?.toFixed(1) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Streak Bonus</p>
            <p class="text-lg font-bold text-yellow-600">{{ calcResult.streakBonus?.toFixed(1) || 0 }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">New Balance</p>
            <p class="text-lg font-bold text-gray-800">{{ calcResult.newBalance?.toFixed(1) }}</p>
          </div>
        </div>
      </div>

      <!-- Redeem Options -->
      <div class="card mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">🎁 Redeem Credits</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="option in redeemOptions" :key="option.value"
            class="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">{{ option.icon }}</span>
              <div>
                <h4 class="font-semibold text-gray-800">{{ option.label }}</h4>
                <p class="text-xs text-gray-500">Min: {{ option.cost }} credits</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-3">{{ option.description }}</p>
            <div class="flex items-center gap-2">
              <input v-model.number="option.amount" type="number" :min="option.cost" step="1"
                class="input-field w-24 text-sm" :placeholder="option.cost.toString()" />
              <button @click="redeem(option.value, option.amount || option.cost)"
                :disabled="(credits?.balance || 0) < option.cost"
                class="btn-primary text-sm py-2">
                Redeem
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">📜 Transaction History</h3>
        <div v-if="credits?.history?.length" class="space-y-2">
          <div v-for="tx in credits.history" :key="tx._id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <span :class="tx.type === 'earned' ? 'text-green-600' : tx.type === 'redeemed' ? 'text-red-600' : 'text-yellow-600'" class="text-lg">
                {{ tx.type === 'earned' ? '➕' : tx.type === 'redeemed' ? '➖' : '⭐' }}
              </span>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ tx.reason }}</p>
                <p class="text-xs text-gray-500">{{ new Date(tx.createdAt).toLocaleDateString() }}</p>
              </div>
            </div>
            <span class="text-sm font-bold" :class="tx.type === 'redeemed' ? 'text-red-600' : 'text-green-600'">
              {{ tx.type === 'redeemed' ? '-' : '+' }}{{ tx.credits?.toFixed(1) }}
            </span>
          </div>
        </div>
        <p v-else class="text-gray-400 text-center py-8">No transactions yet</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useCarbonStore } from '../stores/carbon'

const carbonStore = useCarbonStore()
const loading = ref(true)
const credits = ref(null)
const calculating = ref(false)
const calcResult = ref(null)

const redeemOptions = reactive([
  { value: 'badge', label: 'Eco Badge', icon: '🏅', cost: 5, description: 'Earn a special eco badge on your profile', amount: null },
  { value: 'tree_plantation', label: 'Plant a Tree', icon: '🌳', cost: 10, description: 'Contribute to virtual tree plantation drive', amount: null },
  { value: 'city_boost', label: 'City Boost', icon: '🏙️', cost: 15, description: 'Boost your city\'s eco ranking', amount: null },
  { value: 'donation', label: 'Eco Donation', icon: '💚', cost: 20, description: 'Donate to environmental causes', amount: null },
])

const calculateNew = async () => {
  calculating.value = true
  try {
    const data = await carbonStore.calculateCredits()
    calcResult.value = data.data
    await fetchCredits()
  } catch (err) {
    console.error(err)
  } finally {
    calculating.value = false
  }
}

const redeem = async (option, amount) => {
  try {
    await carbonStore.redeemCredits(option, amount)
    await fetchCredits()
  } catch (err) {
    alert(err.response?.data?.message || 'Redemption failed')
  }
}

const fetchCredits = async () => {
  const data = await carbonStore.fetchCredits()
  credits.value = data.data
}

onMounted(async () => {
  try {
    await fetchCredits()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
