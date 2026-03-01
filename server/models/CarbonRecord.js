const mongoose = require('mongoose');

const carbonRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // ─── Travel Emissions ───
  travel: {
    mode: {
      type: String,
      enum: ['car_petrol', 'car_diesel', 'car_cng', 'car_electric', 'motorcycle', 'bus', 'train_electric', 'train_diesel', 'auto_rickshaw', 'bicycle', 'walking', 'flight_domestic', 'flight_international', 'metro'],
    },
    distance: { type: Number, default: 0 }, // km
    emission: { type: Number, default: 0 }, // kg CO2
  },
  // ─── Electricity ───
  electricity: {
    usage: { type: Number, default: 0 }, // kWh
    country: { type: String, default: 'india' },
    emission: { type: Number, default: 0 },
  },
  // ─── Food ───
  food: {
    mealType: {
      type: String,
      enum: ['vegetarian', 'vegan', 'non_vegetarian_chicken', 'non_vegetarian_mutton', 'non_vegetarian_fish', 'average_indian'],
    },
    items: [{
      name: String,
      quantity: Number, // kg
      emission: Number,
    }],
    totalEmission: { type: Number, default: 0 },
  },
  // ─── Streaming ───
  streaming: {
    type: {
      type: String,
      enum: ['video_hd', 'video_sd', 'video_4k', 'audio', 'gaming'],
    },
    hours: { type: Number, default: 0 },
    emission: { type: Number, default: 0 },
  },
  // ─── Waste ───
  waste: {
    items: [{
      type: { type: String },
      weight: Number, // kg
      emission: Number,
    }],
    totalEmission: { type: Number, default: 0 },
  },
  // ─── Shopping ───
  shopping: {
    items: [{
      category: String,
      quantity: Number,
      emission: Number,
    }],
    totalEmission: { type: Number, default: 0 },
  },
  // ─── Totals ───
  totalEmission: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    enum: ['travel', 'electricity', 'food', 'streaming', 'waste', 'shopping'],
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
carbonRecordSchema.index({ user: 1, date: -1 });
carbonRecordSchema.index({ user: 1, category: 1, date: -1 });

module.exports = mongoose.model('CarbonRecord', carbonRecordSchema);
