import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  socialConnections: [{
    platform: {
      type: String,
      enum: ['twitter', 'linkedin', 'instagram', 'facebook'],
      required: true
    },
    platformId: {
      type: String,
      required: true
    },
    username: String,
    displayName: String,
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: String,
    tokenSecret: String, // For Twitter OAuth 1.0a
    profileImage: String,
    connectedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  preferences: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    defaultTone: {
      type: String,
      enum: ['professional', 'friendly', 'funny', 'formal', 'casual'],
      default: 'friendly'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      postReminders: { type: Boolean, default: true }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    expiresAt: Date,
    features: {
      maxPosts: { type: Number, default: 10 },
      maxSocialAccounts: { type: Number, default: 3 },
      aiGenerations: { type: Number, default: 50 }
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for better query performance (email index is already created by unique: true)
userSchema.index({ 'socialConnections.platform': 1, 'socialConnections.platformId': 1 })

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Get public profile
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject()
  delete user.password
  // Filter sensitive data from social connections
  if (user.socialConnections) {
    user.socialConnections = user.socialConnections.map(conn => ({
      platform: conn.platform,
      username: conn.username,
      displayName: conn.displayName,
      profileImage: conn.profileImage,
      connectedAt: conn.connectedAt,
      isActive: conn.isActive
    }))
  }
  delete user.emailVerificationToken
  delete user.passwordResetToken
  delete user.passwordResetExpires
  return user
}

// Check if social platform is connected
userSchema.methods.isSocialPlatformConnected = function(platform) {
  return this.socialConnections?.some(conn => 
    conn.platform === platform && conn.isActive
  ) || false
}

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date()
  return this.save()
}

export default mongoose.model('User', userSchema)
