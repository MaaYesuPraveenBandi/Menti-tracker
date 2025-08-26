const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SolvedProblem = require('../models/SolvedProblem');
const Problem = require('../models/Problem');

// @route   GET /api/user/profile/:email
// @desc    Get user profile data by email
// @access  Private/Admin
router.get('/profile/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: { $regex: new RegExp(`^${req.params.email}$`, 'i') } }).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const solvedProblems = await SolvedProblem.find({ userId: user._id })
            .populate('problemId', ['title', 'difficulty', 'problemLink'])
            .sort({ solvedAt: -1 });

        const totalProblems = await Problem.countDocuments();

        res.json({ user, solvedProblems, totalProblems });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
