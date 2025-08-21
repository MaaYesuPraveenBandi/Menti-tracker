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
    console.log('Received problem creation request:', req.body);
    
    const {
      title,
      difficulty,
      points,
      problemLink
    } = req.body;

    console.log('Extracted fields:', { title, difficulty, points, problemLink });

    const problem = new Problem({
      title,
      description: '', // Default empty description
      difficulty,
      category: 'General', // Default category
      points,
      problemLink,
      constraints: '', // Default empty constraints
      tags: [], // Default empty tags
      examples: [],
      testCases: []
    });

    console.log('Created problem object:', problem);
    
    await problem.save();
    console.log('Problem saved successfully:', problem._id);
    res.json(problem);
  } catch (err) {
    console.error('Error in POST /problems:', err.message);
    console.error('Full error:', err);
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
      difficulty,
      points,
      problemLink
    } = req.body;

    let problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    problem = await Problem.findByIdAndUpdate(
      req.params.id,
      {
        title,
        difficulty,
        points,
        problemLink,
        // Keep existing values for fields not in the simplified form
        description: problem.description || '',
        category: problem.category || 'General',
        constraints: problem.constraints || '',
        tags: problem.tags || []
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

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/users/:id/admin
// @desc    Make user an admin (admin only)
// @access  Private
router.put('/users/:id/admin', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.isAdmin = true;
    await user.save();

    res.json({ 
      msg: `${user.username} is now an admin`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/users/:id/remove-admin
// @desc    Remove admin privileges from user (admin only)
// @access  Private
router.put('/users/:id/remove-admin', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prevent removing admin from yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'Cannot remove admin privileges from yourself' });
    }

    user.isAdmin = false;
    await user.save();

    res.json({ 
      msg: `Admin privileges removed from ${user.username}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;