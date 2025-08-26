const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/admin/problems
// @desc    Get all problems (admin only)
// @access  Private
router.get('/problems', [auth, adminAuth], async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/admin/problems
// @desc    Create a new problem (admin only)
// @access  Private
router.post('/problems', [auth, adminAuth], async (req, res) => {
  try {
    const { title, difficulty, category, points, problemLink } = req.body;
    const problem = new Problem({
      title,
      difficulty,
      category,
      points,
      problemLink,
      examples: [],
      testCases: []
    });

    await problem.save();
    res.json(problem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/problems/:id
// @desc    Update a problem (admin only)
// @access  Private
router.put('/problems/:id', [auth, adminAuth], async (req, res) => {
  try {
  const { title, difficulty, category, points, problemLink } = req.body;

    let problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { title, difficulty, category, points, problemLink },
      { new: true }
    );

    res.json(problem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/problems/:id
// @desc    Delete a problem (admin only)
// @access  Private
router.delete('/problems/:id', [auth, adminAuth], async (req, res) => {
  try {
    let problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    // First, remove this problem from all users' solved problems and update their scores
    const User = require('../models/User');
    const users = await User.find({
      'solvedProblems.problemId': req.params.id
    });

    for (let user of users) {
      // Find the solved problem to get its points
      const solvedProblem = user.solvedProblems.find(
        sp => sp.problemId.toString() === req.params.id
      );
      
      if (solvedProblem) {
        // Remove the problem from solved problems
        user.solvedProblems = user.solvedProblems.filter(
          sp => sp.problemId.toString() !== req.params.id
        );
        
        // Subtract the points from user's total score
        user.totalScore -= problem.points;
        
        // Ensure score doesn't go negative
        if (user.totalScore < 0) user.totalScore = 0;
        
        await user.save();
      }
    }

    // Remove the problem from the solvedBy array (clean up the problem collection)
    await Problem.findByIdAndDelete(req.params.id);

    res.json({ 
      msg: 'Problem removed and cleaned up from all user records',
      usersAffected: users.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/users/:id/cohort
// @desc    Update user cohort (admin only)
// @access  Private
router.put('/users/:id/cohort', [auth, adminAuth], async (req, res) => {
  try {
    const { cohort } = req.body;
    
    // Validate cohort value
    const validCohorts = ['Basic', 'Intermediate', 'Advanced', 'Placement'];
    if (!validCohorts.includes(cohort)) {
      return res.status(400).json({ msg: 'Invalid cohort value' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.cohort = cohort;
    await user.save();

    res.json({
      msg: 'User cohort updated successfully',
      user: {
        id: user._id,
        username: user.username,
        cohort: user.cohort
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;