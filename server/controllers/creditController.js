const CarbonCredit = require('../models/CarbonCredit');
const User = require('../models/User');
const CarbonRecord = require('../models/CarbonRecord');

// ─── Carbon Credit Simulation System ───
// 1 ton (1000 kg) CO₂ saved = 1 virtual carbon credit

// @desc    Get user's carbon credits
// @route   GET /api/credits
exports.getCredits = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const credits = await CarbonCredit.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const totalEarned = credits
      .filter(c => c.type === 'earned' || c.type === 'bonus')
      .reduce((sum, c) => sum + c.credits, 0);
    const totalRedeemed = credits
      .filter(c => c.type === 'redeemed')
      .reduce((sum, c) => sum + c.credits, 0);

    res.json({
      success: true,
      data: {
        balance: user.totalCredits,
        totalEarned,
        totalRedeemed,
        history: credits,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate and credit earned credits (monthly)
// @route   POST /api/credits/calculate
exports.calculateCredits = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const budget = user.monthlyBudget || 200;

    // Get current month's emissions
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyRecords = await CarbonRecord.find({
      user: req.user._id,
      date: { $gte: monthStart },
    });

    const totalEmission = monthlyRecords.reduce((sum, r) => sum + r.totalEmission, 0);
    const saved = Math.max(0, budget - totalEmission);

    // 1 ton saved = 1 credit
    const creditsEarned = Math.floor(saved / 1000 * 10) / 10; // 0.1 credit precision

    if (creditsEarned > 0) {
      await CarbonCredit.create({
        user: req.user._id,
        credits: creditsEarned,
        type: 'earned',
        reason: `Monthly savings: ${Math.round(saved)} kg CO₂ under budget`,
        co2Saved: saved,
      });

      user.totalCredits += creditsEarned;
      await user.save();
    }

    // Bonus credits for streaks
    let bonusCredits = 0;
    if (user.streaks.current >= 30) bonusCredits = 0.5;
    else if (user.streaks.current >= 7) bonusCredits = 0.1;

    if (bonusCredits > 0) {
      await CarbonCredit.create({
        user: req.user._id,
        credits: bonusCredits,
        type: 'bonus',
        reason: `${user.streaks.current}-day streak bonus`,
        co2Saved: 0,
      });
      user.totalCredits += bonusCredits;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        monthlyEmission: Math.round(totalEmission * 100) / 100,
        budget,
        saved: Math.round(saved * 100) / 100,
        creditsEarned,
        bonusCredits,
        totalCredits: user.totalCredits,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Redeem carbon credits
// @route   POST /api/credits/redeem
exports.redeemCredits = async (req, res) => {
  try {
    const { option, amount } = req.body;
    const user = await User.findById(req.user._id);

    if (user.totalCredits < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits. You have ${user.totalCredits} credits.`,
      });
    }

    const redeemOptions = {
      badge: { cost: 1, description: 'Unlocked a special badge' },
      tree_plantation: { cost: 2, description: 'Donated to virtual tree plantation (10 trees)' },
      city_boost: { cost: 3, description: 'City ranking boost applied' },
      donation: { cost: 5, description: 'Donated to environmental NGO fund' },
    };

    const selectedOption = redeemOptions[option];
    if (!selectedOption) {
      return res.status(400).json({ success: false, message: 'Invalid redeem option' });
    }

    if (amount < selectedOption.cost) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${selectedOption.cost} credits needed for ${option}`,
      });
    }

    await CarbonCredit.create({
      user: req.user._id,
      credits: amount,
      type: 'redeemed',
      reason: selectedOption.description,
      redeemOption: option,
    });

    user.totalCredits -= amount;

    // Award badge if redeemed for badge
    if (option === 'badge') {
      user.badges.push({
        name: 'Credit Redeemer',
        description: 'Redeemed carbon credits',
        icon: '🎁',
      });
    }

    await user.save();

    res.json({
      success: true,
      data: {
        redeemed: amount,
        option,
        description: selectedOption.description,
        remainingCredits: user.totalCredits,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
