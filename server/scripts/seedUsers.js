require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const sampleUsers = [
  {
    username: 'alice_demo',
    email: 'alice@chatconnect.demo',
    password: 'password123'
  },
  {
    username: 'bob_demo',
    email: 'bob@chatconnect.demo',
    password: 'password123'
  },
  {
    username: 'charlie_demo',
    email: 'charlie@chatconnect.demo',
    password: 'password123'
  },
  {
    username: 'diana_demo',
    email: 'diana@chatconnect.demo',
    password: 'password123'
  },
  {
    username: 'evan_demo',
    email: 'evan@chatconnect.demo',
    password: 'password123'
  }
];

const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seeding process...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');
    
    // Create sample users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push({
        id: user._id,
        username: user.username,
        email: user.email
      });
      console.log(`✅ Created user: ${user.username}`);
    }
    
    console.log('\n🎉 User seeding completed successfully!');
    console.log('\n📋 Sample Users Created:');
    createdUsers.forEach(user => {
      console.log(`   • ${user.username} (${user.email})`);
    });
    
    console.log('\n🔑 Default Password: password123');
    console.log('\n💡 You can now login with any of these users to test the chat app!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
