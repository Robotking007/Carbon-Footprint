const mongoose = require('mongoose');

const carbonCreditSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['earned', 'redeemed', 'bonus'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  // 1 ton CO2 saved = 1 virtual carbon credit
  co2Saved: {
    type: Number, // kg CO2
    default: 0,
  },
  redeemOption: {
    type: String,
    enum: ['badge', 'tree_plantation', 'city_boost', 'donation', null],
    default: null,
  },
}, {
  timestamps: true,
});

carbonCreditSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CarbonCredit', carbonCreditSchema);
