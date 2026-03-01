const express = require('express');
const router = express.Router();
const { getCityHeatmap, getUserHeatmap } = require('../controllers/heatmapController');
const { protect } = require('../middleware/auth');

router.get('/cities', protect, getCityHeatmap);
router.get('/user', protect, getUserHeatmap);

module.exports = router;
