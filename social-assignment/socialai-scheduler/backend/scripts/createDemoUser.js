import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Post from '../models/Post.js'
import dotenv from 'dotenv'

// Demo environment configuration
dotenv.config({ path: '.env' })

const createDemoUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialai-scheduler-demo');
    console.log('Connected to MongoDB');

    // Clear existing demo data
    await User.deleteOne({ email: 'demo@socialai.com' });
    await Post.deleteMany({ user: null }); // Clean up orphaned posts

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    const demoUser = new User({
      name: 'Demo User',
      email: 'demo@socialai.com',
      password: hashedPassword,
      isVerified: true,
      socialConnections: [
        {
          platform: 'twitter',
          platformUserId: 'demo_twitter_123',
          username: 'demo_user',
          accessToken: 'demo_access_token',
          refreshToken: 'demo_refresh_token',
          isActive: true,
          connectedAt: new Date()
        },
        {
          platform: 'linkedin',
          platformUserId: 'demo_linkedin_456',
          username: 'Demo User',
          accessToken: 'demo_linkedin_token',
          refreshToken: 'demo_linkedin_refresh',
          isActive: true,
          connectedAt: new Date()
        }
      ]
    });

    await demoUser.save();
    console.log('Demo user created successfully!');

    // Create some sample posts
    const samplePosts = [
      {
        user: demoUser._id,
        content: "🚀 Excited to share our new AI-powered social media scheduler! Managing multiple platforms has never been easier. #AI #SocialMedia #Productivity",
        platforms: ['twitter', 'linkedin'],
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: 'scheduled',
        aiGenerated: true,
        tone: 'professional',
        contentType: 'announcement'
      },
      {
        user: demoUser._id,
        content: "Just discovered the power of AI content generation! 🤖 Our new tool creates platform-optimized posts in seconds. What's your favorite AI tool? #TechTalk #Innovation",
        platforms: ['twitter'],
        scheduledFor: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        status: 'scheduled',
        aiGenerated: true,
        tone: 'friendly',
        contentType: 'question'
      },
      {
        user: demoUser._id,
        content: "Productivity tip: Use AI to batch create your social media content for the week. Save time and maintain consistency across all platforms! 💡 #ProductivityHack #SocialMediaTips",
        platforms: ['linkedin'],
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'scheduled',
        aiGenerated: true,
        tone: 'professional',
        contentType: 'tip'
      },
      {
        user: demoUser._id,
        content: "Thanks to everyone who tried our beta! Your feedback helped us build something amazing. 🙏 #Grateful #Community #Beta",
        platforms: ['twitter', 'linkedin'],
        scheduledFor: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (published)
        status: 'published',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        aiGenerated: false,
        tone: 'friendly',
        contentType: 'gratitude',
        analytics: {
          views: 1250,
          likes: 89,
          comments: 12,
          shares: 23,
          clicks: 45,
          engagementRate: 13.5
        }
      }
    ];

    await Post.insertMany(samplePosts);
    console.log('Sample posts created successfully!');

    console.log('\n🎉 Demo setup complete!');
    console.log('📧 Email: demo@socialai.com');
    console.log('🔑 Password: demo123');
    console.log('\nYou can now start the servers and login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating demo user:', error);
    process.exit(1);
  }
};

createDemoUser();
