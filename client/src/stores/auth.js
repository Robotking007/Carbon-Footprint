import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name || '',
    userCity: (state) => state.user?.city || '',
    ecoScore: (state) => state.user?.ecoScore || 0,
  },

  actions: {
    async login(email, password) {
      const { data } = await api.post('/auth/login', { email, password })
      this.user = data.data
      this.token = data.data.token
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data))
      return data
    },

    async register(userData) {
      const { data } = await api.post('/auth/register', userData)
      this.user = data.data
      this.token = data.data.token
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data))
      return data
    },

    async fetchProfile() {
      const { data } = await api.get('/auth/profile')
      this.user = { ...this.user, ...data.data }
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    async updateProfile(updates) {
      const { data } = await api.put('/auth/profile', updates)
      this.user = { ...this.user, ...data.data }
      localStorage.setItem('user', JSON.stringify(this.user))
      return data
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})
