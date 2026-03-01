const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  city: {
    type: String,
    default: 'Pune',
  },
  country: {
    type: String,
    default: 'india',
    lowercase: true,
  },
  dietType: {
    type: String,
    enum: ['vegetarian', 'vegan', 'non_vegetarian', 'mixed'],
    default: 'mixed',
  },
  transportMode: {
    type: String,
    enum: ['car_petrol', 'car_diesel', 'car_electric', 'motorcycle', 'bus', 'train_electric', 'metro', 'bicycle', 'walking'],
    default: 'bus',
  },
  monthlyBudget: {
    type: Number,
    default: 200, // kg CO2 per month (Paris-aligned target)
  },
  ecoScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  totalCredits: {
    type: Number,
    default: 0,
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now },
  }],
  streaks: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
  },
  level: {
    type: Number,
    default: 1,
  },
  points: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
