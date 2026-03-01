const CarbonRecord = require('../models/CarbonRecord');
const User = require('../models/User');

// @desc    Get complete dashboard data
// @route   GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    // Current month data
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyRecords = await CarbonRecord.find({
      user: req.user._id,
      date: { $gte: monthStart },
    });

    const monthlyTotal = monthlyRecords.reduce((sum, r) => sum + r.totalEmission, 0);

    // Category breakdown
    const breakdown = {};
    monthlyRecords.forEach(r => {
      breakdown[r.category] = (breakdown[r.category] || 0) + r.totalEmission;
    });

    // Last 7 days trend
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyRecords = await CarbonRecord.find({
      user: req.user._id,
      date: { $gte: weekAgo },
    });

    const dailyTrend = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dailyTrend[key] = 0;
    }
    weeklyRecords.forEach(r => {
      const key = r.date.toISOString().split('T')[0];
      if (dailyTrend[key] !== undefined) {
        dailyTrend[key] += r.totalEmission;
      }
    });

    // Recent activities
    const recentActivities = await CarbonRecord.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(10);

    // Highest emission category
    const sortedBreakdown = Object.entries(breakdown)
      .sort(([, a], [, b]) => b - a);
    const highestCategory = sortedBreakdown.length > 0 ? sortedBreakdown[0][0] : null;

    // Previous month comparison
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setDate(prevMonthEnd.getDate() - 1);

    const prevMonthRecords = await CarbonRecord.find({
      user: req.user._id,
      date: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });
    const prevMonthTotal = prevMonthRecords.reduce((sum, r) => sum + r.totalEmission, 0);

    const monthOverMonth = prevMonthTotal > 0
      ? Math.round(((monthlyTotal - prevMonthTotal) / prevMonthTotal) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          city: user.city,
          ecoScore: user.ecoScore,
          level: user.level,
          points: user.points,
          streak: user.streaks.current,
          badges: user.badges.length,
          credits: user.totalCredits,
        },
        monthly: {
          total: Math.round(monthlyTotal * 100) / 100,
          budget: user.monthlyBudget,
          budgetUsed: Math.round((monthlyTotal / (user.monthlyBudget || 200)) * 100),
          remaining: Math.round(((user.monthlyBudget || 200) - monthlyTotal) * 100) / 100,
          breakdown: Object.fromEntries(
            Object.entries(breakdown).map(([k, v]) => [k, Math.round(v * 100) / 100])
          ),
          highestCategory,
          monthOverMonth,
        },
        dailyTrend: Object.entries(dailyTrend)
          .map(([date, emission]) => ({ date, emission: Math.round(emission * 100) / 100 }))
          .reverse(),
        recentActivities: recentActivities.map(a => ({
          id: a._id,
          category: a.category,
          emission: Math.round(a.totalEmission * 100) / 100,
          date: a.date,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
