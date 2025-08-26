const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Problem = require('./models/Problem');

const cleanupUserData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mentiby-tracker');
    console.log('Connected to MongoDB');

    // Get all existing problem IDs
    const existingProblems = await Problem.find({}, '_id');
    const existingProblemIds = new Set(existingProblems.map(p => p._id.toString()));
    
    console.log(`Found ${existingProblemIds.size} existing problems`);

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to clean up`);

    let totalCleaned = 0;

    for (let user of users) {
      const originalSolvedCount = user.solvedProblems.length;
      
      // Filter out solved problems that reference deleted problems
      const validSolvedProblems = user.solvedProblems.filter(solved => 
        existingProblemIds.has(solved.problemId.toString())
      );

      const cleanedCount = originalSolvedCount - validSolvedProblems.length;
      
      if (cleanedCount > 0) {
        console.log(`User ${user.username}: Removing ${cleanedCount} invalid problem references`);
        
        // Update user's solved problems
        user.solvedProblems = validSolvedProblems;
        
        // Recalculate total score based on valid problems only
        // We need to populate the problems to get their points
        await user.populate('solvedProblems.problemId', 'points');
        
        user.totalScore = user.solvedProblems.reduce((total, solved) => {
          return total + (solved.problemId ? solved.problemId.points : 0);
        }, 0);
        
        await user.save();
        totalCleaned += cleanedCount;
      }
    }

    console.log(`Cleanup complete! Removed ${totalCleaned} invalid problem references total`);
    
    // Show summary
    const totalProblems = await Problem.countDocuments();
    console.log(`Current problems in database: ${totalProblems}`);
    
    const usersWithCounts = await User.find({}, 'username solvedProblems totalScore');
    for (let user of usersWithCounts) {
      console.log(`${user.username}: ${user.solvedProblems.length} solved, ${user.totalScore} points`);
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the cleanup
cleanupUserData();
