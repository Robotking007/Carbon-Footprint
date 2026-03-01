const CarbonRecord = require('../models/CarbonRecord');
const User = require('../models/User');
const ss = require('simple-statistics');

// ─── Prediction Engine ───
// Uses linear regression and trend analysis to forecast future emissions

// @desc    Predict next month's carbon footprint
// @route   GET /api/predictions/forecast
exports.getForecast = async (req, res) => {
  try {
    // Get 6 months of historical data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await CarbonRecord.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$totalEmission' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    if (monthlyData.length < 2) {
      return res.json({
        success: true,
        data: {
          prediction: null,
          message: 'Need at least 2 months of data for predictions',
          monthlyTrend: monthlyData,
        },
      });
    }

    // Prepare data for linear regression
    const xValues = monthlyData.map((_, i) => i);
    const yValues = monthlyData.map((d) => d.total);

    // Simple linear regression
    const regression = ss.linearRegression(
      xValues.map((x, i) => [x, yValues[i]])
    );
    const regressionLine = ss.linearRegressionLine(regression);

    // Predict next month
    const nextMonthIndex = xValues.length;
    const predictedEmission = Math.max(0, Math.round(regressionLine(nextMonthIndex) * 100) / 100);

    // Calculate trend percentage
    const currentMonth = yValues[yValues.length - 1];
    const trendPercent = currentMonth > 0
      ? Math.round(((predictedEmission - currentMonth) / currentMonth) * 100)
      : 0;

    // Category-wise prediction
    const categoryPredictions = await CarbonRecord.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            category: '$category',
            month: { $month: '$date' },
          },
          total: { $sum: '$totalEmission' },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          monthlyAvg: { $avg: '$total' },
          months: {
            $push: {
              month: '$_id.month',
              total: '$total',
            },
          },
        },
      },
    ]);

    // Risk assessment
    const user = await User.findById(req.user._id);
    const budget = user.monthlyBudget || 200;
    let riskLevel = 'low';
    let riskMessage = 'Your emissions are within healthy limits';

    if (predictedEmission > budget * 1.2) {
      riskLevel = 'high';
      riskMessage = `Your carbon footprint may increase by ${Math.abs(trendPercent)}% next month due to rising activity levels`;
    } else if (predictedEmission > budget) {
      riskLevel = 'medium';
      riskMessage = 'Your emissions are trending above budget. Consider reducing high-impact activities';
    }

    res.json({
      success: true,
      data: {
        prediction: {
          nextMonth: predictedEmission,
          trend: trendPercent > 0 ? 'increasing' : trendPercent < 0 ? 'decreasing' : 'stable',
          trendPercent,
          confidence: Math.min(95, monthlyData.length * 15), // Confidence increases with more data
        },
        risk: {
          level: riskLevel,
          message: riskMessage,
          budget,
          predictedOverBudget: predictedEmission > budget,
        },
        historical: monthlyData.map((d, i) => ({
          month: d._id.month,
          year: d._id.year,
          actual: Math.round(d.total * 100) / 100,
          predicted: Math.round(regressionLine(i) * 100) / 100,
        })),
        categoryPredictions: categoryPredictions.map(c => ({
          category: c._id,
          predictedMonthly: Math.round(c.monthlyAvg * 100) / 100,
        })),
        model: {
          slope: Math.round(regression.m * 1000) / 1000,
          intercept: Math.round(regression.b * 1000) / 1000,
          rSquared: Math.round(ss.rSquared(
            xValues.map((x, i) => [x, yValues[i]]),
            regressionLine
          ) * 1000) / 1000,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    What-if scenario simulation
// @route   POST /api/predictions/what-if
exports.whatIfScenario = async (req, res) => {
  try {
    const { changes } = req.body;
    // changes: [{ category: 'travel', percentChange: -20 }, ...]

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const currentData = await CarbonRecord.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$totalEmission' },
        },
      },
    ]);

    const currentTotal = currentData.reduce((sum, c) => sum + c.total, 0);
    let projectedTotal = currentTotal;
    const categoryResults = [];

    currentData.forEach(cat => {
      const change = changes?.find(c => c.category === cat._id);
      const percentChange = change ? change.percentChange : 0;
      const projected = cat.total * (1 + percentChange / 100);

      projectedTotal += (projected - cat.total);

      categoryResults.push({
        category: cat._id,
        current: Math.round(cat.total * 100) / 100,
        projected: Math.round(projected * 100) / 100,
        saving: Math.round((cat.total - projected) * 100) / 100,
      });
    });

    res.json({
      success: true,
      data: {
        currentTotal: Math.round(currentTotal * 100) / 100,
        projectedTotal: Math.round(projectedTotal * 100) / 100,
        totalSaving: Math.round((currentTotal - projectedTotal) * 100) / 100,
        categories: categoryResults,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
