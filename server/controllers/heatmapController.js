const CarbonRecord = require('../models/CarbonRecord');
const User = require('../models/User');

// @desc    Get city-level carbon heatmap data
// @route   GET /api/heatmap/cities
exports.getCityHeatmap = async (req, res) => {
  try {
    // Aggregate emissions by city
    const cityData = await User.aggregate([
      {
        $lookup: {
          from: 'carbonrecords',
          localField: '_id',
          foreignField: 'user',
          as: 'records',
        },
      },
      {
        $project: {
          city: 1,
          totalEmission: {
            $reduce: {
              input: '$records',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.totalEmission'] },
            },
          },
          recordCount: { $size: '$records' },
        },
      },
      {
        $group: {
          _id: '$city',
          avgEmission: { $avg: '$totalEmission' },
          totalEmission: { $sum: '$totalEmission' },
          userCount: { $sum: 1 },
          totalRecords: { $sum: '$recordCount' },
        },
      },
      { $sort: { avgEmission: 1 } },
    ]);

    // Assign heatmap intensity levels
    const maxEmission = Math.max(...cityData.map(c => c.avgEmission), 1);
    const heatmapData = cityData.map((city, index) => ({
      city: city._id,
      avgEmission: Math.round(city.avgEmission * 100) / 100,
      totalEmission: Math.round(city.totalEmission * 100) / 100,
      users: city.userCount,
      records: city.totalRecords,
      intensity: Math.round((city.avgEmission / maxEmission) * 100),
      rank: index + 1,
      level: city.avgEmission > maxEmission * 0.7
        ? 'high'
        : city.avgEmission > maxEmission * 0.4
          ? 'medium'
          : 'low',
    }));

    res.json({ success: true, data: heatmapData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category heatmap for a user (behavioral analytics)
// @route   GET /api/heatmap/user
exports.getUserHeatmap = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Daily × Category emission matrix
    const heatmapData = await CarbonRecord.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            category: '$category',
          },
          total: { $sum: '$totalEmission' },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Day-of-week analysis
    const dayOfWeekData = await CarbonRecord.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: '$date' },
            category: '$category',
          },
          avg: { $avg: '$totalEmission' },
          total: { $sum: '$totalEmission' },
        },
      },
      { $sort: { '_id.dayOfWeek': 1 } },
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    res.json({
      success: true,
      data: {
        dailyCategoryMatrix: heatmapData.map(d => ({
          date: d._id.date,
          category: d._id.category,
          emission: Math.round(d.total * 100) / 100,
        })),
        dayOfWeekPatterns: dayOfWeekData.map(d => ({
          day: dayNames[d._id.dayOfWeek - 1],
          category: d._id.category,
          avgEmission: Math.round(d.avg * 100) / 100,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
