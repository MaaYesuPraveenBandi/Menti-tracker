const mongoose = require('mongoose');
const User = require('./models/User');
const Problem = require('./models/Problem');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mentiby-tracker');
    console.log('Connected to MongoDB');
    
    const problems = await Problem.find({});
    console.log('Total problems in database:', problems.length);
    
    const users = await User.find({}).populate('solvedProblems.problemId');
    console.log('Total users:', users.length);
    
    for (const user of users) {
      const validSolved = user.solvedProblems.filter(sp => sp.problemId != null);
      const invalidSolved = user.solvedProblems.filter(sp => sp.problemId == null);
      
      console.log(`User ${user.username}: ${user.solvedProblems.length} total, ${validSolved.length} valid, ${invalidSolved.length} invalid`);
      
      if (invalidSolved.length > 0) {
        console.log('  -> Invalid references found for user:', user.username);
        console.log('  -> User total score:', user.totalScore);
      }
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkData();
