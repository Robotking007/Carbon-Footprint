<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-green-100 px-4">
    <div class="text-center max-w-2xl">
      <div class="w-20 h-20 bg-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <span class="text-white font-bold text-3xl">CO₂</span>
      </div>
      <h1 class="text-5xl font-bold text-gray-800 mb-4">Carbon Footprint<br/>
        <span class="text-primary-600">Tracking System</span>
      </h1>
      <p class="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
        Track, analyze, and reduce your carbon emissions with AI-powered recommendations, 
        gamification, and real-time insights.
      </p>
      <div class="flex gap-4 justify-center">
        <router-link to="/register" class="btn-primary text-lg px-8 py-3">Get Started</router-link>
        <router-link to="/login" class="px-8 py-3 rounded-xl border-2 border-primary-500 text-primary-600 font-semibold hover:bg-primary-50 transition-colors">
          Sign In
        </router-link>
      </div>
      <div class="mt-12 grid grid-cols-3 gap-6 text-left">
        <div class="bg-white p-5 rounded-xl shadow-sm">
          <div class="text-2xl mb-2">📊</div>
          <h3 class="font-semibold text-gray-800 mb-1">Track Emissions</h3>
          <p class="text-sm text-gray-500">Log travel, food, electricity & more</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm">
          <div class="text-2xl mb-2">🤖</div>
          <h3 class="font-semibold text-gray-800 mb-1">AI Insights</h3>
          <p class="text-sm text-gray-500">Get personalized reduction tips</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm">
          <div class="text-2xl mb-2">🏆</div>
          <h3 class="font-semibold text-gray-800 mb-1">Gamification</h3>
          <p class="text-sm text-gray-500">Compete, earn badges & credits</p>
        </div>
      </div>
    </div>
  </div>
</template>
