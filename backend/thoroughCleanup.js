const mongoose = require('mongoose');
const User = require('./models/User');
const Problem = require('./models/Problem');

async function thoroughCleanup() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mentiby-tracker');
    console.log('Connected to MongoDB');
    
    // Get all valid problem IDs
    const validProblems = await Problem.find({});
    const validProblemIds = new Set(validProblems.map(p => p._id.toString()));
    console.log('Valid problem IDs in database:', validProblemIds.size);
    
    // Get all users
    const users = await User.find({});
    let totalCleaned = 0;
    
    for (const user of users) {
      const originalSolvedCount = user.solvedProblems.length;
      
      if (originalSolvedCount > 0) {
        console.log(`\nProcessing user: ${user.username}`);
        console.log(`Original solved problems: ${originalSolvedCount}`);
        
        // Filter out invalid problem references
        const validSolvedProblems = user.solvedProblems.filter(sp => {
          const problemIdStr = sp.problemId ? sp.problemId.toString() : null;
          return problemIdStr && validProblemIds.has(problemIdStr);
        });
        
        const removedCount = originalSolvedCount - validSolvedProblems.length;
        
        if (removedCount > 0) {
          console.log(`Removing ${removedCount} invalid references`);
          console.log(`Valid solved problems after cleanup: ${validSolvedProblems.length}`);
          
          // Update user with only valid solved problems
          user.solvedProblems = validSolvedProblems;
          
          // Recalculate total score
          const newTotalScore = validSolvedProblems.reduce((total, sp) => total + (sp.points || 0), 0);
          user.totalScore = newTotalScore;
          
          console.log(`Updated total score: ${newTotalScore}`);
          
          await user.save();
          totalCleaned += removedCount;
        } else {
          console.log('No invalid references found');
        }
      }
    }
    
    console.log(`\nCleanup complete! Removed ${totalCleaned} invalid references total`);
    
    // Verify the cleanup
    console.log('\nVerification:');
    const updatedUsers = await User.find({}).populate('solvedProblems.problemId');
    for (const user of updatedUsers) {
      if (user.solvedProblems.length > 0) {
        const validCount = user.solvedProblems.filter(sp => sp.problemId != null).length;
        const invalidCount = user.solvedProblems.filter(sp => sp.problemId == null).length;
        console.log(`${user.username}: ${validCount} valid, ${invalidCount} invalid, score: ${user.totalScore}`);
      }
    }
    
    await mongoose.disconnect();
    console.log('\nDatabase disconnected');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

thoroughCleanup();
