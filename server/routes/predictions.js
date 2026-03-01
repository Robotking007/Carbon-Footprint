const express = require('express');
const router = express.Router();
const { getForecast, whatIfScenario } = require('../controllers/predictionController');
const { protect } = require('../middleware/auth');

router.get('/forecast', protect, getForecast);
router.post('/what-if', protect, whatIfScenario);

module.exports = router;
