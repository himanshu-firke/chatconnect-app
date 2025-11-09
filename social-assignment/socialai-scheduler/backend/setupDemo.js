import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Post from './models/Post.js'
import dotenv from 'dotenv'

dotenv.config()

const setupDemo = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing demo user
    await User.deleteOne({ email: 'demo@socialai.com' })
    console.log('🧹 Cleared existing demo user')

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 12)
    
    const demoUser = new User({
      name: 'Demo User',
      email: 'demo@socialai.com',
      password: hashedPassword,
      isVerified: true,
      role: 'user',
      isActive: true,
      socialConnections: []
    })

    await demoUser.save()
    console.log('👤 Demo user created successfully!')

    // Create sample posts
    const samplePosts = [
      {
        user: demoUser._id,
        content: {
          text: "🚀 Welcome to SocialAI Scheduler! This is a demo post to showcase our AI-powered social media management platform. #AI #SocialMedia #Demo",
          hashtags: ['AI', 'SocialMedia', 'Demo'],
          mentions: []
        },
        platforms: [
          {
            name: 'twitter',
            status: 'scheduled'
          },
          {
            name: 'linkedin',
            status: 'scheduled'
          }
        ],
        scheduling: {
          scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000),
          timezone: 'UTC'
        },
        aiGenerated: {
          isAiGenerated: true,
          tone: 'professional',
          generatedAt: new Date()
        },
        media: []
      },
      {
        user: demoUser._id,
        content: {
          text: "Just published a post using AI content generation! 🤖 The future of social media management is here. What do you think? #TechTalk #Innovation",
          hashtags: ['TechTalk', 'Innovation'],
          mentions: []
        },
        platforms: [
          {
            name: 'twitter',
            status: 'published',
            publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            metrics: {
              views: 850,
              likes: 42,
              comments: 8,
              shares: 12,
              clicks: 25,
              lastUpdated: new Date()
            }
          }
        ],
        scheduling: {
          scheduledFor: new Date(Date.now() - 1 * 60 * 60 * 1000),
          timezone: 'UTC'
        },
        aiGenerated: {
          isAiGenerated: true,
          tone: 'friendly',
          generatedAt: new Date()
        },
        media: []
      }
    ]

    await Post.insertMany(samplePosts)
    console.log('📝 Sample posts created!')

    console.log('\n🎉 Demo setup complete!')
    console.log('📧 Email: demo@socialai.com')
    console.log('🔑 Password: demo123')
    console.log('\n✨ You can now login with these credentials!')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

setupDemo()
