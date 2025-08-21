// Script to check and fix admin privileges
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

const checkAdminUsers = async () => {
  try {
    await connectDB();
    
    const User = require('./models/User');
    
    // Find all admin users
    const adminUsers = await User.find({ isAdmin: true }).select('-password');
    
    console.log('\n📋 Current Admin Users:');
    console.log('========================');
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
      console.log('\n💡 To create an admin user, run:');
      console.log('   node createFirstAdmin.js');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email})`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }
    
    // Find all regular users
    const regularUsers = await User.find({ isAdmin: false }).select('-password');
    
    console.log('\n👥 Regular Users:');
    console.log('==================');
    
    if (regularUsers.length === 0) {
      console.log('❌ No regular users found!');
    } else {
      regularUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email})`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }
    
    console.log(`\n📊 Summary: ${adminUsers.length} admins, ${regularUsers.length} regular users`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

// If you want to remove admin privileges from all users except the first one
const fixAdminPrivileges = async () => {
  try {
    await connectDB();
    
    const User = require('./models/User');
    
    const adminUsers = await User.find({ isAdmin: true }).sort({ createdAt: 1 });
    
    if (adminUsers.length <= 1) {
      console.log('✅ Admin privileges are already correct');
      return;
    }
    
    // Keep only the first admin, remove admin from others
    const firstAdmin = adminUsers[0];
    const othersToFix = adminUsers.slice(1);
    
    console.log(`🔧 Keeping ${firstAdmin.username} as admin`);
    console.log(`🔧 Removing admin privileges from ${othersToFix.length} other users...`);
    
    for (const user of othersToFix) {
      user.isAdmin = false;
      await user.save();
      console.log(`   ✅ Removed admin from ${user.username}`);
    }
    
    console.log('\n🎉 Admin privileges fixed!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

// Run based on command line argument
const command = process.argv[2];

if (command === 'fix') {
  console.log('🔧 Fixing admin privileges...');
  fixAdminPrivileges();
} else {
  console.log('🔍 Checking current admin users...');
  checkAdminUsers();
}

console.log('\nUsage:');
console.log('  node checkAdmins.js        - Check current admin users');
console.log('  node checkAdmins.js fix    - Fix admin privileges (keep only first admin)');
