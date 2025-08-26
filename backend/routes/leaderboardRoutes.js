const express = require('express');
const User = require('../models/User');

const router = express.Router();

// @route   GET api/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('username totalScore solvedProblems cohort')
      .sort({ totalScore: -1 })
      .limit(100);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      totalScore: user.totalScore,
      problemsSolved: user.solvedProblems.length,
      cohort: user.cohort || 'Basic'
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leaderboard/top/:count
// @desc    Get top N users
// @access  Public
router.get('/top/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 10;
    const users = await User.find()
      .select('username totalScore solvedProblems cohort')
      .sort({ totalScore: -1 })
      .limit(count);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      totalScore: user.totalScore,
      problemsSolved: user.solvedProblems.length,
      cohort: user.cohort || 'Basic'
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leaderboard/user/:userId
// @desc    Get user's rank
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const rank = await User.countDocuments({ totalScore: { $gt: user.totalScore } }) + 1;
    
    res.json({
      username: user.username,
      totalScore: user.totalScore,
      problemsSolved: user.solvedProblems.length,
      rank
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
