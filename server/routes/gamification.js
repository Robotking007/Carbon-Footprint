const express = require('express');
const router = express.Router();
const {
  getLeaderboard,
  getChallenges,
  joinChallenge,
  getBadges,
  getStats,
} = require('../controllers/gamificationController');
const { protect } = require('../middleware/auth');

router.get('/leaderboard', protect, getLeaderboard);
router.get('/challenges', protect, getChallenges);
router.post('/challenges/:id/join', protect, joinChallenge);
router.get('/badges', protect, getBadges);
router.get('/stats', protect, getStats);

module.exports = router;
