import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const testLogin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Find the demo user
    const user = await User.findOne({ email: 'demo@socialai.com' }).select('+password')
    
    if (!user) {
      console.log('❌ Demo user not found')
      process.exit(1)
    }

    console.log('👤 Demo user found:', {
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      hasPassword: !!user.password
    })

    // Test password comparison
    const testPassword = 'demo123'
    console.log('🔐 Testing password comparison...')
    
    try {
      const isValid = await user.comparePassword(testPassword)
      console.log('✅ Password comparison result:', isValid)
      
      if (!isValid) {
        console.log('🔧 Password mismatch - recreating user with proper hash...')
        
        // Delete and recreate user with proper password hash
        await User.deleteOne({ email: 'demo@socialai.com' })
        
        const hashedPassword = await bcrypt.hash('demo123', 12)
        const newUser = new User({
          name: 'Demo User',
          email: 'demo@socialai.com',
          password: hashedPassword,
          isVerified: true,
          role: 'user',
          isActive: true,
          socialConnections: []
        })
        
        await newUser.save()
        console.log('✅ Demo user recreated with proper password hash')
      }
      
    } catch (error) {
      console.log('❌ Password comparison failed:', error.message)
    }

    await mongoose.disconnect()
    console.log('🎉 Test complete!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testLogin()
