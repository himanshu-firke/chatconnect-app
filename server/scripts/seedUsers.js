require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const sampleUsers = [
  // Original Users
  { username: 'alice_demo', email: 'alice@chatconnect.demo', password: 'password123' },
  { username: 'bob_demo', email: 'bob@chatconnect.demo', password: 'password123' },
  { username: 'charlie_demo', email: 'charlie@chatconnect.demo', password: 'password123' },
  { username: 'diana_demo', email: 'diana@chatconnect.demo', password: 'password123' },
  { username: 'evan_demo', email: 'evan@chatconnect.demo', password: 'password123' },
  
  // Tech Professionals
  { username: 'sarah_tech', email: 'sarah@chatconnect.demo', password: 'password123' },
  { username: 'michael_dev', email: 'michael@chatconnect.demo', password: 'password123' },
  { username: 'emma_design', email: 'emma@chatconnect.demo', password: 'password123' },
  { username: 'james_product', email: 'james@chatconnect.demo', password: 'password123' },
  { username: 'olivia_data', email: 'olivia@chatconnect.demo', password: 'password123' },
  
  // Creative Professionals
  { username: 'noah_artist', email: 'noah@chatconnect.demo', password: 'password123' },
  { username: 'ava_writer', email: 'ava@chatconnect.demo', password: 'password123' },
  { username: 'liam_photo', email: 'liam@chatconnect.demo', password: 'password123' },
  { username: 'sophia_music', email: 'sophia@chatconnect.demo', password: 'password123' },
  { username: 'lucas_video', email: 'lucas@chatconnect.demo', password: 'password123' },
  
  // Business & Marketing
  { username: 'mia_marketing', email: 'mia@chatconnect.demo', password: 'password123' },
  { username: 'ethan_sales', email: 'ethan@chatconnect.demo', password: 'password123' },
  { username: 'isabella_hr', email: 'isabella@chatconnect.demo', password: 'password123' },
  { username: 'mason_finance', email: 'mason@chatconnect.demo', password: 'password123' },
  { username: 'charlotte_ceo', email: 'charlotte@chatconnect.demo', password: 'password123' },
  
  // Students & Educators
  { username: 'alex_student', email: 'alex@chatconnect.demo', password: 'password123' },
  { username: 'zoe_teacher', email: 'zoe@chatconnect.demo', password: 'password123' },
  { username: 'ryan_prof', email: 'ryan@chatconnect.demo', password: 'password123' },
  { username: 'lily_researcher', email: 'lily@chatconnect.demo', password: 'password123' },
  { username: 'jack_intern', email: 'jack@chatconnect.demo', password: 'password123' },
  
  // International Users
  { username: 'yuki_tokyo', email: 'yuki@chatconnect.demo', password: 'password123' },
  { username: 'carlos_madrid', email: 'carlos@chatconnect.demo', password: 'password123' },
  { username: 'priya_mumbai', email: 'priya@chatconnect.demo', password: 'password123' },
  { username: 'jean_paris', email: 'jean@chatconnect.demo', password: 'password123' },
  { username: 'ahmed_dubai', email: 'ahmed@chatconnect.demo', password: 'password123' }
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
