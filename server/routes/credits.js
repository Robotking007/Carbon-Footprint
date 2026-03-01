const express = require('express');
const router = express.Router();
const { getCredits, calculateCredits, redeemCredits } = require('../controllers/creditController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCredits);
router.post('/calculate', protect, calculateCredits);
router.post('/redeem', protect, redeemCredits);

module.exports = router;
