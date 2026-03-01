import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/log',
    name: 'LogActivity',
    component: () => import('../views/LogActivityView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/recommendations',
    name: 'Recommendations',
    component: () => import('../views/RecommendationsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/predictions',
    name: 'Predictions',
    component: () => import('../views/PredictionsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('../views/LeaderboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/heatmap',
    name: 'Heatmap',
    component: () => import('../views/HeatmapView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/credits',
    name: 'Credits',
    component: () => import('../views/CreditsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/challenges',
    name: 'Challenges',
    component: () => import('../views/ChallengesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
