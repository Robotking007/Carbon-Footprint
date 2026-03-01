const User = require('../models/User');
const CarbonRecord = require('../models/CarbonRecord');
const Challenge = require('../models/Challenge');

// ─── Badge Definitions ───
const BADGES = {
  first_log: { name: 'First Step', description: 'Logged your first carbon activity', icon: '🌱' },
  week_streak: { name: 'Week Warrior', description: '7-day logging streak', icon: '🔥' },
  month_streak: { name: 'Green Guardian', description: '30-day logging streak', icon: '🛡️' },
  eco_warrior: { name: 'Eco Warrior', description: 'Completed a 30-day challenge', icon: '⚔️' },
  under_budget: { name: 'Budget Master', description: 'Stayed under budget for a full month', icon: '💰' },
  green_commuter: { name: 'Green Commuter', description: 'Used eco transport for 30 days', icon: '🚲' },
  plant_power: { name: 'Plant Power', description: '7 consecutive plant-based meals', icon: '🥬' },
  recycler: { name: 'Recycler Pro', description: 'Recycled 50kg of waste', icon: '♻️' },
  top10_city: { name: 'City Champion', description: 'Top 10 in your city leaderboard', icon: '🏆' },
  carbon_saver: { name: 'Carbon Saver', description: 'Saved 100kg CO₂ in a month', icon: '🌍' },
  level_5: { name: 'Rising Star', description: 'Reached Level 5', icon: '⭐' },
  level_10: { name: 'Sustainability Pro', description: 'Reached Level 10', icon: '🌟' },
};

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'global', city } = req.query;

    let query = {};
    if (type === 'city' && city) {
      query.city = new RegExp(city, 'i');
    }

    const users = await User.find(query)
      .select('name city ecoScore level points badges streaks')
      .sort({ ecoScore: -1, points: -1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      city: user.city,
      ecoScore: user.ecoScore,
      level: user.level,
      points: user.points,
      badgeCount: user.badges.length,
      streak: user.streaks.current,
    }));

    // City leaderboard - aggregate by city
    let cityLeaderboard = [];
    if (type === 'city_comparison') {
      cityLeaderboard = await User.aggregate([
        {
          $group: {
            _id: '$city',
            avgEcoScore: { $avg: '$ecoScore' },
            totalUsers: { $sum: 1 },
            avgPoints: { $avg: '$points' },
          },
        },
        { $sort: { avgEcoScore: -1 } },
        { $limit: 20 },
      ]);

      cityLeaderboard = cityLeaderboard.map((c, i) => ({
        rank: i + 1,
        city: c._id,
        avgEcoScore: Math.round(c.avgEcoScore),
        users: c.totalUsers,
        avgPoints: Math.round(c.avgPoints),
      }));
    }

    res.json({
      success: true,
      data: {
        leaderboard,
        cityLeaderboard,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available challenges
// @route   GET /api/gamification/challenges
exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ isActive: true })
      .populate('participants.user', 'name city');

    // Check user participation
    const userChallenges = challenges.map(ch => {
      const userPart = ch.participants.find(
        p => p.user._id.toString() === req.user._id.toString()
      );
      return {
        ...ch.toObject(),
        isParticipating: !!userPart,
        userProgress: userPart ? userPart.progress : 0,
        participantCount: ch.participants.length,
      };
    });

    res.json({ success: true, data: userChallenges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join a challenge
// @route   POST /api/gamification/challenges/:id/join
exports.joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const alreadyJoined = challenge.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: 'Already joined this challenge' });
    }

    challenge.participants.push({ user: req.user._id });
    await challenge.save();

    // Award points for joining
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 25 } });

    res.json({ success: true, message: 'Joined challenge successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user badges
// @route   GET /api/gamification/badges
exports.getBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const earnedBadges = user.badges || [];
    const allBadges = Object.entries(BADGES).map(([key, badge]) => ({
      id: key,
      ...badge,
      earned: earnedBadges.some(b => b.name === badge.name),
      earnedAt: earnedBadges.find(b => b.name === badge.name)?.earnedAt,
    }));

    res.json({ success: true, data: allBadges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user stats summary for gamification
// @route   GET /api/gamification/stats
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyRecords = await CarbonRecord.find({
      user: req.user._id,
      date: { $gte: thirtyDaysAgo },
    });

    const totalEmission = monthlyRecords.reduce((sum, r) => sum + r.totalEmission, 0);
    const activeDays = new Set(monthlyRecords.map(r => r.date.toISOString().split('T')[0])).size;

    // Peer comparison
    const allUsers = await User.find({ city: user.city }).select('ecoScore');
    const userRank = allUsers.filter(u => u.ecoScore > user.ecoScore).length + 1;
    const totalUsersInCity = allUsers.length;

    const percentile = Math.round((1 - userRank / totalUsersInCity) * 100);

    res.json({
      success: true,
      data: {
        ecoScore: user.ecoScore,
        level: user.level,
        points: user.points,
        nextLevelPoints: (user.level) * 500,
        levelProgress: Math.round((user.points % 500) / 5),
        streak: user.streaks,
        badgeCount: user.badges.length,
        totalCredits: user.totalCredits,
        monthlyEmission: Math.round(totalEmission * 100) / 100,
        activeDays,
        cityRank: userRank,
        cityTotal: totalUsersInCity,
        percentile,
        peerMessage: `You are in the top ${100 - percentile}% eco-friendly users in ${user.city}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
