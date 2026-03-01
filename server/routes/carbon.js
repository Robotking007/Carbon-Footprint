const express = require('express');
const router = express.Router();
const {
  logActivity,
  getRecords,
  getMonthlySummary,
  getCategoryBreakdown,
  getEmissionFactors,
} = require('../controllers/carbonController');
const { protect } = require('../middleware/auth');

router.post('/log', protect, logActivity);
router.get('/records', protect, getRecords);
router.get('/summary/monthly', protect, getMonthlySummary);
router.get('/breakdown', protect, getCategoryBreakdown);
router.get('/factors', getEmissionFactors);

module.exports = router;
