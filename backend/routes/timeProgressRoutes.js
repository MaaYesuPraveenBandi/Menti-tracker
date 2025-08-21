const express = require('express');
const Problem = require('../models/Problem');
const Session = require('../models/Session');
const Completion = require('../models/Completion');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST api/progress/start
// @desc    Start a problem session with time-lock
// @access  Private
router.post('/start', auth, async (req, res) => {
  const { problemId } = req.body;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    // Check if already completed
    const existingCompletion = await Completion.findOne({
      userId: req.user.id,
      problemId
    });

    if (existingCompletion) {
      return res.status(400).json({ msg: 'Problem already completed' });
    }

    const startedAt = new Date();
    const recommendedMinutes = problem.difficulty === 'Easy' ? 30 : 
                              problem.difficulty === 'Medium' ? 40 : 60;
    
    const earliestCompleteAt = new Date(startedAt.getTime() + recommendedMinutes * 60000);

    // Create new problem session
    await Session.create({
      userId: req.user.id,
      scope: 'problem',
      problemId,
      startedAt
    });

    res.json({
      startedAt,
      earliestCompleteAt,
      recommendedMinutes
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/progress/stop
// @desc    Stop the current problem session
// @access  Private
router.post('/stop', auth, async (req, res) => {
  const { problemId } = req.body;

  try {
    const session = await Session.findOne({
      userId: req.user.id,
      scope: 'problem',
      problemId,
      endedAt: { $exists: false }
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.json({ msg: 'No active session found' });
    }

    session.endedAt = new Date();
    session.durationMinutes = Math.max(0, 
      (session.endedAt.getTime() - session.startedAt.getTime()) / 60000
    );
    
    await session.save();

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/progress/complete
// @desc    Mark problem as completed (if time-lock passed)
// @access  Private
router.post('/complete', auth, async (req, res) => {
  const { problemId } = req.body;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    // Check if already completed
    const existingCompletion = await Completion.findOne({
      userId: req.user.id,
      problemId
    });

    if (existingCompletion) {
      return res.status(400).json({ msg: 'Problem already completed' });
    }

    // Get all sessions for this problem
    const sessions = await Session.find({
      userId: req.user.id,
      scope: 'problem',
      problemId
    }).sort({ startedAt: 1 });

    if (sessions.length === 0) {
      return res.status(400).json({ msg: 'No sessions found. Please start the problem first.' });
    }

    // Calculate total time and check time-lock
    const firstStart = sessions[0].startedAt;
    const totalMinutes = sessions.reduce((acc, session) => {
      return acc + (session.durationMinutes || 0);
    }, 0);

    const recommendedMinutes = problem.difficulty === 'Easy' ? 30 : 
                              problem.difficulty === 'Medium' ? 40 : 60;
    
    const earliestCompleteAt = new Date(firstStart.getTime() + recommendedMinutes * 60000);
    const now = new Date();

    if (now < earliestCompleteAt) {
      return res.status(400).json({ 
        msg: 'Time-lock active', 
        earliestCompleteAt,
        remainingMinutes: Math.ceil((earliestCompleteAt.getTime() - now.getTime()) / 60000)
      });
    }

    // Create completion record
    const completion = await Completion.create({
      userId: req.user.id,
      problemId,
      startedAt: firstStart,
      completedAt: now,
      actualMinutes: Math.round(totalMinutes),
      withinRecommended: totalMinutes <= recommendedMinutes
    });

    res.json({
      msg: 'Problem completed successfully!',
      completion,
      withinRecommended: completion.withinRecommended
    });
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Problem already completed' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/progress/solved
// @desc    Get user's solved problems
// @access  Private
router.get('/solved', auth, async (req, res) => {
  try {
    const completions = await Completion.find({ userId: req.user.id })
      .populate('problemId', 'title difficulty topic')
      .sort({ completedAt: -1 });

    res.json(completions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/progress/overview
// @desc    Get user's progress overview
// @access  Private
router.get('/overview', auth, async (req, res) => {
  try {
    const [totalProblems, solvedCount, sessionsData] = await Promise.all([
      Problem.countDocuments({}),
      Completion.countDocuments({ userId: req.user.id }),
      Session.aggregate([
        { $match: { userId: req.user.id } },
        { $group: { _id: null, totalMinutes: { $sum: '$durationMinutes' } } }
      ])
    ]);

    const minutesInvested = Math.round(sessionsData[0]?.totalMinutes || 0);

    // Calculate streak (consecutive days with completions)
    const completions = await Completion.find({ userId: req.user.id })
      .select('completedAt')
      .sort({ completedAt: -1 });

    const dates = new Set(
      completions.map(c => c.completedAt.toISOString().slice(0, 10))
    );

    let currentStreakDays = 0;
    let checkDate = new Date();
    
    while (dates.has(checkDate.toISOString().slice(0, 10))) {
      currentStreakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    res.json({
      solvedCount,
      totalProblems,
      minutesInvested,
      currentStreakDays,
      progressPercentage: totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/progress/status/:problemId
// @desc    Get current status of a problem (locked/unlocked/completed)
// @access  Private
router.get('/status/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    // Check if completed
    const completion = await Completion.findOne({
      userId: req.user.id,
      problemId
    });

    if (completion) {
      return res.json({
        status: 'completed',
        completion
      });
    }

    // Check sessions and time-lock
    const sessions = await Session.find({
      userId: req.user.id,
      scope: 'problem',
      problemId
    }).sort({ startedAt: 1 });

    if (sessions.length === 0) {
      return res.json({
        status: 'not_started',
        canStart: true
      });
    }

    const firstStart = sessions[0].startedAt;
    const recommendedMinutes = problem.difficulty === 'Easy' ? 30 : 
                              problem.difficulty === 'Medium' ? 40 : 60;
    
    const earliestCompleteAt = new Date(firstStart.getTime() + recommendedMinutes * 60000);
    const now = new Date();

    const isLocked = now < earliestCompleteAt;

    res.json({
      status: isLocked ? 'locked' : 'unlocked',
      firstStart,
      earliestCompleteAt,
      remainingMinutes: isLocked ? Math.ceil((earliestCompleteAt.getTime() - now.getTime()) / 60000) : 0,
      totalSessions: sessions.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/time-progress/unsolve
// @desc    Unmark a problem as completed (remove completion)
// @access  Private
router.post('/unsolve', auth, async (req, res) => {
  const { problemId } = req.body;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    // Find and remove the completion
    const completion = await Completion.findOneAndDelete({
      userId: req.user.id,
      problemId
    });

    if (!completion) {
      return res.status(400).json({ msg: 'Problem was not completed yet' });
    }

    // Also remove all sessions for this problem
    await Session.deleteMany({
      userId: req.user.id,
      scope: 'problem',
      problemId
    });

    res.json({
      msg: 'Problem unmarked as solved',
      deletedCompletion: completion
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
