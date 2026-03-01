require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─── Routes ───
app.use('/api/auth', require('./routes/auth'));
app.use('/api/carbon', require('./routes/carbon'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/heatmap', require('./routes/heatmap'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/dashboard', require('./routes/dashboard'));

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Carbon Footprint Tracker API is running' });
});

// ─── Error Handler ───
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌍  Carbon Footprint Tracker Server`);
  console.log(`    Running on port ${PORT}`);
  console.log(`    Environment: ${process.env.NODE_ENV}\n`);
});
