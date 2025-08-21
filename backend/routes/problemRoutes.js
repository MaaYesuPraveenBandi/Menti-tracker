const express = require('express');
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/problems
// @desc    Get all problems
// @access  Public
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/problems/:id
// @desc    Get problem by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    res.json(problem);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Problem not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/problems
// @desc    Create a problem
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const newProblem = new Problem(req.body);
    const problem = await newProblem.save();
    res.json(problem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/problems/category/:category
// @desc    Get problems by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const problems = await Problem.find({ category: req.params.category });
    res.json(problems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/problems/difficulty/:difficulty
// @desc    Get problems by difficulty
// @access  Public
router.get('/difficulty/:difficulty', async (req, res) => {
  try {
    const problems = await Problem.find({ difficulty: req.params.difficulty });
    res.json(problems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
