// Script to make a user admin
// Run this after creating a user account

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mentiby-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const makeUserAdmin = async (email) => {
  try {
    await connectDB();
    
    const User = require('./models/User');
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`User with email ${email} not found.`);
      console.log('Please register an account first, then run this script.');
      return;
    }
    
    user.isAdmin = true;
    await user.save();
    
    console.log(`✅ User ${user.username} (${email}) is now an admin!`);
    console.log('You can now access the admin panel at:');
    console.log('- /admin/dashboard');
    console.log('- /admin/problems');
    console.log('- /admin/problems/new');
    
  } catch (err) {
    console.error('Error making user admin:', err);
  } finally {
    process.exit();
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node makeAdmin.js <email>');
  console.log('Example: node makeAdmin.js admin@example.com');
  process.exit(1);
}

makeUserAdmin(email);
