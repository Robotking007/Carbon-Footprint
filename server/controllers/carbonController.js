const CarbonRecord = require('../models/CarbonRecord');
const User = require('../models/User');
const emissionFactors = require('../config/emissionFactors');

// ─── Calculate emission from activity data ───
const calculateEmission = (category, data) => {
  let emission = 0;

  switch (category) {
    case 'travel':
      emission = (data.distance || 0) * (emissionFactors.travel[data.mode] || 0);
      break;

    case 'electricity':
      const country = (data.country || 'default').toLowerCase();
      emission = (data.usage || 0) * (emissionFactors.electricity[country] || emissionFactors.electricity.default);
      break;

    case 'food':
      if (data.mealType) {
        emission = emissionFactors.meals[data.mealType] || 0;
      }
      if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
          item.emission = (item.quantity || 0) * (emissionFactors.food[item.name] || 0);
          emission += item.emission;
        });
      }
      break;

    case 'streaming':
      emission = (data.hours || 0) * (emissionFactors.streaming[data.type] || 0);
      break;

    case 'waste':
      if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
          item.emission = (item.weight || 0) * (emissionFactors.waste[item.type] || 0);
          emission += item.emission;
        });
      }
      break;

    case 'shopping':
      if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
          item.emission = (item.quantity || 1) * (emissionFactors.shopping[item.category] || 0);
          emission += item.emission;
        });
      }
      break;
  }

  return Math.round(emission * 1000) / 1000; // Round to 3 decimal places
};

// @desc    Log a carbon emission activity
// @route   POST /api/carbon/log
exports.logActivity = async (req, res) => {
  try {
    const { category, data, date } = req.body;

    if (!category || !data) {
      return res.status(400).json({ success: false, message: 'Category and data are required' });
    }

    const emission = calculateEmission(category, data);

    const recordData = {
      user: req.user._id,
      category,
      date: date || new Date(),
      totalEmission: emission,
    };

    // Set category-specific data
    switch (category) {
      case 'travel':
        recordData.travel = { mode: data.mode, distance: data.distance, emission };
        break;
      case 'electricity':
        recordData.electricity = { usage: data.usage, country: data.country || req.user.country, emission };
        break;
      case 'food':
        recordData.food = { mealType: data.mealType, items: data.items || [], totalEmission: emission };
        break;
      case 'streaming':
        recordData.streaming = { type: data.type, hours: data.hours, emission };
        break;
      case 'waste':
        recordData.waste = { items: data.items || [], totalEmission: emission };
        break;
      case 'shopping':
        recordData.shopping = { items: data.items || [], totalEmission: emission };
        break;
    }

    const record = await CarbonRecord.create(recordData);

    // Update user points & streaks
    const user = await User.findById(req.user._id);
    user.points += 10; // Points for logging activity
    user.streaks.lastActive = new Date();

    // Update eco score based on budget
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyRecords = await CarbonRecord.find({
      user: req.user._id,
      date: { $gte: monthStart },
    });

    const monthlyTotal = monthlyRecords.reduce((sum, r) => sum + r.totalEmission, 0);
    const budgetRatio = monthlyTotal / (user.monthlyBudget || 200);

    // EcoScore: 100 if well under budget, decreases as budget is exceeded
    user.ecoScore = Math.max(0, Math.min(100, Math.round(100 * (1 - budgetRatio + 0.5))));
    user.level = Math.floor(user.points / 500) + 1;

    await user.save();

    res.status(201).json({
      success: true,
      data: {
        record,
        emission,
        monthlyTotal: Math.round(monthlyTotal * 100) / 100,
        budget: user.monthlyBudget,
        budgetUsed: Math.round(budgetRatio * 100),
        ecoScore: user.ecoScore,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's carbon records
// @route   GET /api/carbon/records
exports.getRecords = async (req, res) => {
  try {
    const { startDate, endDate, category, limit = 50, page = 1 } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category) query.category = category;

    const records = await CarbonRecord.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await CarbonRecord.countDocuments(query);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly summary
// @route   GET /api/carbon/summary/monthly
exports.getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth();
    const targetYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const records = await CarbonRecord.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    // Category breakdown
    const breakdown = {
      travel: 0,
      electricity: 0,
      food: 0,
      streaming: 0,
      waste: 0,
      shopping: 0,
    };

    records.forEach(record => {
      breakdown[record.category] = (breakdown[record.category] || 0) + record.totalEmission;
    });

    const totalEmission = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    const user = await User.findById(req.user._id);
    const budget = user.monthlyBudget || 200;

    // Daily breakdown
    const dailyData = {};
    records.forEach(record => {
      const day = record.date.toISOString().split('T')[0];
      dailyData[day] = (dailyData[day] || 0) + record.totalEmission;
    });

    res.json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        totalEmission: Math.round(totalEmission * 100) / 100,
        budget,
        budgetUsed: Math.round((totalEmission / budget) * 100),
        remaining: Math.round((budget - totalEmission) * 100) / 100,
        breakdown: Object.fromEntries(
          Object.entries(breakdown).map(([k, v]) => [k, Math.round(v * 100) / 100])
        ),
        dailyData,
        recordCount: records.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category breakdown for charts
// @route   GET /api/carbon/breakdown
exports.getCategoryBreakdown = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const breakdown = await CarbonRecord.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$totalEmission' },
          count: { $sum: 1 },
          avg: { $avg: '$totalEmission' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, data: breakdown });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get emission factors reference data
// @route   GET /api/carbon/factors
exports.getEmissionFactors = async (req, res) => {
  res.json({ success: true, data: emissionFactors });
};
