const mongoose = require('mongoose');
const User = require('./models/User');
const Problem = require('./models/Problem');

async function fixScores() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mentiby-tracker');
    console.log('Connected to MongoDB');
    
    // Get all problems with their points
    const problems = await Problem.find({});
    const problemPointsMap = {};
    problems.forEach(p => {
      problemPointsMap[p._id.toString()] = p.points || 0;
    });
    
    console.log('Problem points map created for', problems.length, 'problems');
    
    // Fix user scores
    const users = await User.find({}).populate('solvedProblems.problemId');
    
    for (const user of users) {
      if (user.solvedProblems.length > 0) {
        console.log(`\nFixing score for user: ${user.username}`);
        console.log(`Solved problems: ${user.solvedProblems.length}`);
        
        let totalScore = 0;
        for (const solvedProblem of user.solvedProblems) {
          if (solvedProblem.problemId) {
            const problemId = solvedProblem.problemId._id.toString();
            const points = problemPointsMap[problemId] || 0;
            totalScore += points;
            console.log(`  Problem ${solvedProblem.problemId.title}: ${points} points`);
          }
        }
        
        console.log(`  Total calculated score: ${totalScore}`);
        console.log(`  Previous score: ${user.totalScore}`);
        
        if (user.totalScore !== totalScore) {
          user.totalScore = totalScore;
          await user.save();
          console.log(`  ✅ Score updated to: ${totalScore}`);
        } else {
          console.log(`  ✓ Score already correct`);
        }
      }
    }
    
    await mongoose.disconnect();
    console.log('\nScore fixing complete!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixScores();
