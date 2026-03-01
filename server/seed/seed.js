require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CarbonRecord = require('../models/CarbonRecord');
const Challenge = require('../models/Challenge');
const connectDB = require('../config/db');

const seedData = async () => {
  await connectDB();
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await User.deleteMany({});
  await CarbonRecord.deleteMany({});
  await Challenge.deleteMany({});

  // ─── Create Demo Users ───
  const users = await User.create([
    { name: 'Siddhant Udavant', email: 'siddhant@demo.com', password: 'password123', city: 'Pune', country: 'india', dietType: 'mixed', transportMode: 'motorcycle', ecoScore: 72, points: 1250, level: 3 },
    { name: 'Shruti Sonawane', email: 'shruti@demo.com', password: 'password123', city: 'Pune', country: 'india', dietType: 'vegetarian', transportMode: 'bus', ecoScore: 85, points: 2100, level: 5 },
    { name: 'Trupti Shinde', email: 'trupti@demo.com', password: 'password123', city: 'Pune', country: 'india', dietType: 'vegetarian', transportMode: 'metro', ecoScore: 88, points: 1800, level: 4 },
    { name: 'Kanika Shinde', email: 'kanika@demo.com', password: 'password123', city: 'Mumbai', country: 'india', dietType: 'mixed', transportMode: 'train_electric', ecoScore: 78, points: 900, level: 2 },
    { name: 'Ayush Shewale', email: 'ayush@demo.com', password: 'password123', city: 'Mumbai', country: 'india', dietType: 'non_vegetarian', transportMode: 'car_petrol', ecoScore: 60, points: 600, level: 2 },
    { name: 'Demo User', email: 'demo@carbon.app', password: 'demo123', city: 'Pune', country: 'india', dietType: 'mixed', transportMode: 'bus', ecoScore: 65, points: 500, level: 1 },
    { name: 'Rahul Deshmukh', email: 'rahul@demo.com', password: 'password123', city: 'Bangalore', country: 'india', dietType: 'vegetarian', transportMode: 'metro', ecoScore: 90, points: 3000, level: 7 },
    { name: 'Priya Patil', email: 'priya@demo.com', password: 'password123', city: 'Delhi', country: 'india', dietType: 'mixed', transportMode: 'car_diesel', ecoScore: 55, points: 400, level: 1 },
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ─── Generate Emission Records (6 months of data) ───
  const categories = ['travel', 'electricity', 'food', 'streaming', 'waste', 'shopping'];
  const records = [];

  for (const user of users) {
    for (let month = 5; month >= 0; month--) {
      const daysInMonth = 28 + Math.floor(Math.random() * 3);
      for (let day = 1; day <= daysInMonth; day += Math.floor(Math.random() * 3) + 1) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        date.setDate(day);

        // Random category selection weighted by likelihood
        const categoryWeights = [0.3, 0.15, 0.3, 0.1, 0.05, 0.1];
        const rand = Math.random();
        let cumulative = 0;
        let catIndex = 0;
        for (let i = 0; i < categoryWeights.length; i++) {
          cumulative += categoryWeights[i];
          if (rand < cumulative) { catIndex = i; break; }
        }

        const category = categories[catIndex];
        let totalEmission = 0;
        const record = {
          user: user._id,
          date,
          category,
        };

        switch (category) {
          case 'travel':
            const modes = ['car_petrol', 'bus', 'motorcycle', 'train_electric', 'metro', 'auto_rickshaw'];
            const mode = modes[Math.floor(Math.random() * modes.length)];
            const distance = Math.round((5 + Math.random() * 50) * 10) / 10;
            const travelFactors = { car_petrol: 0.192, bus: 0.089, motorcycle: 0.103, train_electric: 0.041, metro: 0.033, auto_rickshaw: 0.075 };
            totalEmission = distance * (travelFactors[mode] || 0.1);
            record.travel = { mode, distance, emission: totalEmission };
            break;

          case 'electricity':
            const usage = Math.round((2 + Math.random() * 15) * 10) / 10;
            totalEmission = usage * 0.82;
            record.electricity = { usage, country: 'india', emission: totalEmission };
            break;

          case 'food':
            const mealTypes = ['vegetarian', 'vegan', 'non_vegetarian_chicken', 'average_indian'];
            const mealType = user.dietType === 'vegetarian'
              ? mealTypes[Math.floor(Math.random() * 2)]
              : mealTypes[Math.floor(Math.random() * mealTypes.length)];
            const mealFactors = { vegetarian: 1.14, vegan: 0.7, non_vegetarian_chicken: 2.5, average_indian: 1.3 };
            totalEmission = mealFactors[mealType] || 1.3;
            record.food = { mealType, items: [], totalEmission };
            break;

          case 'streaming':
            const hours = Math.round((0.5 + Math.random() * 4) * 10) / 10;
            totalEmission = hours * 0.036;
            record.streaming = { type: 'video_hd', hours, emission: totalEmission };
            break;

          case 'waste':
            const weight = Math.round((0.2 + Math.random() * 2) * 10) / 10;
            totalEmission = weight * 0.58;
            record.waste = { items: [{ type: 'general_waste', weight, emission: totalEmission }], totalEmission };
            break;

          case 'shopping':
            totalEmission = 10 + Math.random() * 20;
            record.shopping = { items: [{ category: 'clothing_item', quantity: 1, emission: totalEmission }], totalEmission };
            break;
        }

        record.totalEmission = Math.round(totalEmission * 1000) / 1000;
        records.push(record);
      }
    }
  }

  await CarbonRecord.insertMany(records);
  console.log(`✅ Created ${records.length} carbon records`);

  // ─── Create Challenges ───
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const challenges = await Challenge.create([
    {
      title: '7-Day Low Carbon Challenge',
      description: 'Reduce your daily carbon footprint by using public transport and eating plant-based meals for 7 days.',
      type: 'individual',
      category: 'overall',
      targetReduction: 20,
      points: 200,
      badge: { name: 'Low Carbon Hero', icon: '🌿' },
      endDate: nextMonth,
      participants: [{ user: users[0]._id, progress: 45 }, { user: users[1]._id, progress: 78 }],
    },
    {
      title: 'No Private Vehicle Week',
      description: 'Avoid using personal vehicles for an entire week. Use public transport, cycle, or walk.',
      type: 'weekly',
      category: 'travel',
      targetReduction: 50,
      points: 300,
      badge: { name: 'Green Commuter', icon: '🚲' },
      endDate: nextMonth,
      participants: [{ user: users[2]._id, progress: 60 }],
    },
    {
      title: 'Vegetarian Week Challenge',
      description: 'Switch to fully vegetarian meals for one week to reduce your food carbon footprint.',
      type: 'weekly',
      category: 'food',
      targetReduction: 30,
      points: 150,
      badge: { name: 'Plant Power', icon: '🥬' },
      endDate: nextMonth,
    },
    {
      title: 'Pune vs Mumbai: City Showdown',
      description: 'Which city can achieve the lowest average carbon footprint this month?',
      type: 'city',
      category: 'overall',
      targetReduction: 15,
      points: 500,
      badge: { name: 'City Champion', icon: '🏆' },
      endDate: nextMonth,
    },
    {
      title: 'Monthly Green Challenge',
      description: 'Keep your monthly emissions under your budget for the entire month.',
      type: 'monthly',
      category: 'overall',
      targetReduction: 10,
      points: 400,
      badge: { name: 'Budget Master', icon: '💰' },
      endDate: nextMonth,
    },
  ]);

  console.log(`✅ Created ${challenges.length} challenges`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Demo login credentials:');
  console.log('   Email: demo@carbon.app');
  console.log('   Password: demo123\n');

  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
