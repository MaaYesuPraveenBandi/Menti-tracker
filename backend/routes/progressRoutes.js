const express = require('express');
const User = require('../models/User');
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST api/progress/solve
// @desc    Mark a problem as solved
// @access  Private
router.post('/solve', auth, async (req, res) => {
  const { problemId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    // Check if problem already solved
    const alreadySolved = user.solvedProblems.find(
      p => p.problemId.toString() === problemId
    );

    if (alreadySolved) {
      return res.status(400).json({ msg: 'Problem already solved' });
    }

    // Add to user's solved problems
    user.solvedProblems.push({ problemId });
    user.totalScore += problem.points;

    // Add user to problem's solvedBy array
    problem.solvedBy.push(user._id);

    await user.save();
    await problem.save();

    res.json({ msg: 'Problem marked as solved', totalScore: user.totalScore });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/progress/unsolve
// @desc    Mark a problem as unsolved
// @access  Private
router.post('/unsolve', auth, async (req, res) => {
  const { problemId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    // Find the solved problem entry
    const solvedProblemIndex = user.solvedProblems.findIndex(
      p => p.problemId.toString() === problemId
    );

    if (solvedProblemIndex === -1) {
      return res.status(400).json({ msg: 'Problem not solved yet' });
    }

    // Remove from user's solved problems
    user.solvedProblems.splice(solvedProblemIndex, 1);
    user.totalScore -= problem.points;

    // Ensure score doesn't go below 0
    if (user.totalScore < 0) {
      user.totalScore = 0;
    }

    // Remove user from problem's solvedBy array
    problem.solvedBy = problem.solvedBy.filter(
      userId => userId.toString() !== user._id.toString()
    );

    await user.save();
    await problem.save();

    res.json({ msg: 'Problem marked as unsolved', totalScore: user.totalScore });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET api/progress/user
// @desc    Get user's progress
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get all existing problem IDs to validate solved problems
    const existingProblems = await Problem.find({}, '_id');
    const existingProblemIds = new Set(existingProblems.map(p => p._id.toString()));
    
    // Filter out solved problems where the problem no longer exists
    const validSolvedProblems = user.solvedProblems.filter(solved => 
      existingProblemIds.has(solved.problemId.toString())
    );
    
    // If there are invalid references, clean them up
    let needsUpdate = false;
    if (validSolvedProblems.length !== user.solvedProblems.length) {
      user.solvedProblems = validSolvedProblems;
      needsUpdate = true;
    }
    
    // Populate the valid solved problems with their details
    await user.populate('solvedProblems.problemId', 'title difficulty points category');
    
    // Recalculate total score based on valid problems only
    const calculatedScore = user.solvedProblems.reduce((total, solved) => {
      return total + (solved.problemId ? solved.problemId.points : 0);
    }, 0);
    
    // Update score if it's different
    if (user.totalScore !== calculatedScore) {
      user.totalScore = calculatedScore;
      needsUpdate = true;
    }
    
    // Save if any updates were made
    if (needsUpdate) {
      await user.save();
    }
    
    const totalProblems = await Problem.countDocuments();
    const solvedCount = user.solvedProblems.length;
    const progressPercentage = totalProblems > 0 ? (solvedCount / totalProblems) * 100 : 0;

    res.json({
      user: {
        username: user.username,
        totalScore: user.totalScore,
        solvedProblems: user.solvedProblems,
        solvedCount,
        totalProblems,
        progressPercentage: Math.round(progressPercentage * 100) / 100
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/progress/stats
// @desc    Get user's statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('solvedProblems.problemId', 'difficulty');

    const stats = {
      easy: 0,
      medium: 0,
      hard: 0
    };

    user.solvedProblems.forEach(solved => {
      const difficulty = solved.problemId.difficulty.toLowerCase();
      if (stats.hasOwnProperty(difficulty)) {
        stats[difficulty]++;
      }
    });

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
