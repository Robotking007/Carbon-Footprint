const CarbonRecord = require('../models/CarbonRecord');
const User = require('../models/User');

// ─── AI Recommendation Engine ───
// Analyzes user behavior and generates personalized suggestions

const recommendationRules = {
  travel: [
    { condition: (avg) => avg > 5, suggestion: 'Switch to public transport twice a week to save ~40 kg CO₂/month', impact: 40, priority: 'high' },
    { condition: (avg) => avg > 3, suggestion: 'Consider carpooling for your daily commute', impact: 20, priority: 'medium' },
    { condition: (avg) => avg > 1, suggestion: 'Try cycling or walking for short distances under 3 km', impact: 10, priority: 'low' },
    { condition: () => true, suggestion: 'Great travel habits! Keep using eco-friendly transport', impact: 0, priority: 'info' },
  ],
  electricity: [
    { condition: (avg) => avg > 8, suggestion: 'Switching to LED bulbs can reduce your electricity footprint by 12%', impact: 15, priority: 'high' },
    { condition: (avg) => avg > 5, suggestion: 'Unplug devices when not in use — phantom loads waste 5-10% energy', impact: 8, priority: 'medium' },
    { condition: (avg) => avg > 2, suggestion: 'Set AC to 24°C instead of 18°C to save up to 30% energy', impact: 12, priority: 'medium' },
    { condition: () => true, suggestion: 'Your electricity usage is efficient. Consider switching to renewable energy', impact: 5, priority: 'info' },
  ],
  food: [
    { condition: (avg) => avg > 4, suggestion: 'One plant-based meal per week can save 18 kg CO₂/month', impact: 18, priority: 'high' },
    { condition: (avg) => avg > 2, suggestion: 'Reduce red meat consumption — it has 27 kg CO₂/kg footprint', impact: 12, priority: 'medium' },
    { condition: (avg) => avg > 1, suggestion: 'Buy locally sourced seasonal produce to reduce transport emissions', impact: 5, priority: 'low' },
    { condition: () => true, suggestion: 'Excellent dietary choices! Your food footprint is well-managed', impact: 0, priority: 'info' },
  ],
  streaming: [
    { condition: (avg) => avg > 0.5, suggestion: 'Switch to SD quality when not needed — saves 50% streaming emissions', impact: 2, priority: 'low' },
    { condition: () => true, suggestion: 'Your digital footprint is minimal', impact: 0, priority: 'info' },
  ],
  waste: [
    { condition: (avg) => avg > 2, suggestion: 'Start composting organic waste to reduce landfill methane emissions', impact: 8, priority: 'medium' },
    { condition: (avg) => avg > 0, suggestion: 'Increase recycling — each kg of paper recycled saves 1 tonne CO₂', impact: 5, priority: 'low' },
    { condition: () => true, suggestion: 'Great waste management! Keep recycling and composting', impact: 0, priority: 'info' },
  ],
  shopping: [
    { condition: (avg) => avg > 20, suggestion: 'Consider second-hand purchases to cut clothing carbon footprint by 60%', impact: 15, priority: 'high' },
    { condition: (avg) => avg > 5, suggestion: 'Choose durable products over fast fashion to reduce long-term impact', impact: 8, priority: 'medium' },
    { condition: () => true, suggestion: 'Your shopping habits are sustainable', impact: 0, priority: 'info' },
  ],
};

// @desc    Get AI-based recommendations
// @route   GET /api/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get user's emission data by category
    const categoryData = await CarbonRecord.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$category',
          totalEmission: { $sum: '$totalEmission' },
          avgEmission: { $avg: '$totalEmission' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalEmission: -1 } },
    ]);

    const recommendations = [];
    const categoryMap = {};
    categoryData.forEach(c => { categoryMap[c._id] = c; });

    // Generate recommendations for each category
    Object.keys(recommendationRules).forEach(category => {
      const data = categoryMap[category];
      const avgEmission = data ? data.avgEmission : 0;
      const rules = recommendationRules[category];

      for (const rule of rules) {
        if (rule.condition(avgEmission)) {
          recommendations.push({
            category,
            suggestion: rule.suggestion,
            potentialSaving: rule.impact,
            priority: rule.priority,
            currentAvg: Math.round(avgEmission * 100) / 100,
          });
          break; // Only first matching rule per category
        }
      }
    });

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2, info: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Feature contribution analysis (SHAP-like)
    const totalEmission = categoryData.reduce((sum, c) => sum + c.totalEmission, 0);
    const featureContributions = categoryData.map(c => ({
      category: c._id,
      contribution: totalEmission > 0 ? Math.round((c.totalEmission / totalEmission) * 100) : 0,
      totalEmission: Math.round(c.totalEmission * 100) / 100,
    }));

    res.json({
      success: true,
      data: {
        recommendations,
        featureContributions,
        totalPotentialSaving: recommendations.reduce((sum, r) => sum + r.potentialSaving, 0),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
