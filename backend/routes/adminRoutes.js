const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
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
    const {
      title,
      description,
      difficulty,
      category,
      points,
      problemLink,
      constraints,
      tags
    } = req.body;

    const problem = new Problem({
      title,
      description,
      difficulty,
      category,
      points,
      problemLink,
      constraints,
      tags,
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
    const {
      title,
      description,
      difficulty,
      category,
      points,
      problemLink,
      constraints,
      tags
    } = req.body;

    let problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    problem = await Problem.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        difficulty,
        category,
        points,
        problemLink,
        constraints,
        tags
      },
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

    await Problem.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Problem removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;