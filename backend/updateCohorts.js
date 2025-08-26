const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mentiby-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// Update existing users with random cohorts for testing
const updateUserCohorts = async () => {
  try {
    await connectDB();
    
    const cohorts = ['Basic', 'Intermediate', 'Advanced', 'Placement'];
    const users = await User.find({});
    
    console.log(`Found ${users.length} users to update...`);
    
    for (let user of users) {
      // Assign cohort based on user's score for demo purposes
      let cohort = 'Basic';
      if (user.totalScore >= 300) {
        cohort = 'Placement';
      } else if (user.totalScore >= 200) {
        cohort = 'Advanced';
      } else if (user.totalScore >= 100) {
        cohort = 'Intermediate';
      }
      
      user.cohort = cohort;
      await user.save();
      console.log(`Updated ${user.username} to ${cohort} cohort`);
    }
    
    console.log('All users updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating users:', err);
    process.exit(1);
  }
};

updateUserCohorts();
