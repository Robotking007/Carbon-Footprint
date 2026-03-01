const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['individual', 'city', 'college', 'weekly', 'monthly'],
    default: 'individual',
  },
  category: {
    type: String,
    enum: ['travel', 'electricity', 'food', 'waste', 'overall'],
    default: 'overall',
  },
  targetReduction: {
    type: Number, // percentage reduction target
    required: true,
  },
  points: {
    type: Number,
    default: 100,
  },
  badge: {
    name: String,
    icon: String,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Challenge', challengeSchema);
