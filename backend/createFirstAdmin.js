// Quick script to create first admin user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const createFirstAdmin = async () => {
  try {
    await connectDB();
    
    const User = require('./models/User');
    
    // Check if any admin exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log(`✅ Admin already exists: ${existingAdmin.username} (${existingAdmin.email})`);
      return;
    }
    
    // Create first admin user
    const adminData = {
      username: 'admin',
      email: 'admin@mentiby.com',
      password: 'admin123',
      isAdmin: true,
      solvedProblems: [],
      totalScore: 0,
      rank: 1
    };
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);
    
    const adminUser = new User(adminData);
    await adminUser.save();
    
    console.log('🎉 First admin user created successfully!');
    console.log('📧 Email: admin@mentiby.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('You can now:');
    console.log('1. Go to http://localhost:3000');
    console.log('2. Login with the above credentials');
    console.log('3. Access Admin Panel from the sidebar');
    
  } catch (err) {
    console.error('Error creating admin user:', err);
  } finally {
    process.exit();
  }
};

createFirstAdmin();
