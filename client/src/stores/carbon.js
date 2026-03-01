import { defineStore } from 'pinia'
import api from '../services/api'

export const useCarbonStore = defineStore('carbon', {
  state: () => ({
    dashboard: null,
    records: [],
    monthlySummary: null,
    breakdown: [],
    recommendations: null,
    predictions: null,
    leaderboard: null,
    heatmap: [],
    credits: null,
    challenges: [],
    badges: [],
    stats: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true
      try {
        const { data } = await api.get('/dashboard')
        this.dashboard = data.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load dashboard'
      } finally {
        this.loading = false
      }
    },

    async logActivity(category, activityData) {
      const { data } = await api.post('/carbon/log', { category, data: activityData })
      return data
    },

    async fetchRecords(params = {}) {
      const { data } = await api.get('/carbon/records', { params })
      this.records = data.data
      return data
    },

    async fetchMonthlySummary(month, year) {
      const { data } = await api.get('/carbon/summary/monthly', { params: { month, year } })
      this.monthlySummary = data.data
      return data
    },

    async fetchBreakdown(period = 30) {
      const { data } = await api.get('/carbon/breakdown', { params: { period } })
      this.breakdown = data.data
      return data
    },

    async fetchRecommendations() {
      const { data } = await api.get('/recommendations')
      this.recommendations = data.data
      return data
    },

    async fetchPredictions() {
      const { data } = await api.get('/predictions/forecast')
      this.predictions = data.data
      return data
    },

    async runWhatIf(changes) {
      const { data } = await api.post('/predictions/what-if', { changes })
      return data
    },

    async fetchLeaderboard(type = 'global', city = '') {
      const { data } = await api.get('/gamification/leaderboard', { params: { type, city } })
      this.leaderboard = data.data
      return data
    },

    async fetchChallenges() {
      const { data } = await api.get('/gamification/challenges')
      this.challenges = data.data
      return data
    },

    async joinChallenge(id) {
      const { data } = await api.post(`/gamification/challenges/${id}/join`)
      return data
    },

    async fetchBadges() {
      const { data } = await api.get('/gamification/badges')
      this.badges = data.data
      return data
    },

    async fetchStats() {
      const { data } = await api.get('/gamification/stats')
      this.stats = data.data
      return data
    },

    async fetchHeatmap() {
      const { data } = await api.get('/heatmap/cities')
      this.heatmap = data.data
      return data
    },

    async fetchUserHeatmap() {
      const { data } = await api.get('/heatmap/user')
      return data.data
    },

    async fetchCredits() {
      const { data } = await api.get('/credits')
      this.credits = data.data
      return data
    },

    async calculateCredits() {
      const { data } = await api.post('/credits/calculate')
      return data
    },

    async redeemCredits(option, amount) {
      const { data } = await api.post('/credits/redeem', { option, amount })
      return data
    },
  },
})
