import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [2200, 'Post content cannot exceed 2200 characters']
    },
    hashtags: [{
      type: String,
      trim: true
    }],
    mentions: [{
      type: String,
      trim: true
    }]
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'gif'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: String, // Cloudinary public ID
    alt: String,
    dimensions: {
      width: Number,
      height: Number
    }
  }],
  platforms: [{
    name: {
      type: String,
      enum: ['twitter', 'linkedin', 'instagram'],
      required: true
    },
    postId: String, // Platform-specific post ID after publishing
    status: {
      type: String,
      enum: ['scheduled', 'published', 'failed', 'cancelled'],
      default: 'scheduled'
    },
    publishedAt: Date,
    error: String,
    metrics: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      lastUpdated: Date
    }
  }],
  scheduling: {
    scheduledFor: {
      type: Date,
      required: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly']
      },
      interval: Number, // Every X days/weeks/months
      daysOfWeek: [Number], // 0-6 for recurring weekly posts
      endDate: Date
    }
  },
  aiGenerated: {
    isAiGenerated: {
      type: Boolean,
      default: false
    },
    prompt: String,
    tone: {
      type: String,
      enum: ['professional', 'friendly', 'funny', 'formal', 'casual']
    },
    model: String, // AI model used
    generatedAt: Date
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed', 'cancelled'],
    default: 'draft'
  },
  analytics: {
    totalEngagement: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    bestPerformingPlatform: String,
    lastAnalyticsUpdate: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  campaign: {
    type: String,
    trim: true
  },
  approvalStatus: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String
  }
}, {
  timestamps: true
})

// Indexes for better query performance
postSchema.index({ user: 1, createdAt: -1 })
postSchema.index({ 'scheduling.scheduledFor': 1 })
postSchema.index({ status: 1 })
postSchema.index({ 'platforms.name': 1, 'platforms.status': 1 })
postSchema.index({ tags: 1 })
postSchema.index({ campaign: 1 })

// Virtual for total engagement across all platforms
postSchema.virtual('totalEngagementCount').get(function() {
  return this.platforms.reduce((total, platform) => {
    const metrics = platform.metrics
    return total + (metrics.likes + metrics.comments + metrics.shares)
  }, 0)
})

// Method to check if post is ready to publish
postSchema.methods.isReadyToPublish = function() {
  const now = new Date()
  return this.status === 'scheduled' && 
         this.scheduling.scheduledFor <= now &&
         this.platforms.some(p => p.status === 'scheduled')
}

// Method to get platform-specific content
postSchema.methods.getPlatformContent = function(platform) {
  const baseContent = this.content.text
  const hashtags = this.content.hashtags.join(' ')
  
  switch (platform) {
    case 'twitter':
      // Twitter has 280 character limit
      const twitterContent = baseContent.length > 240 
        ? baseContent.substring(0, 240) + '...' 
        : baseContent
      return `${twitterContent} ${hashtags}`.trim()
    
    case 'linkedin':
      // LinkedIn allows longer content
      return `${baseContent}\n\n${hashtags}`.trim()
    
    case 'instagram':
      // Instagram focuses on hashtags
      return `${baseContent}\n\n${hashtags}`.trim()
    
    default:
      return `${baseContent} ${hashtags}`.trim()
  }
}

// Method to update platform metrics
postSchema.methods.updatePlatformMetrics = function(platform, metrics) {
  const platformIndex = this.platforms.findIndex(p => p.name === platform)
  if (platformIndex !== -1) {
    this.platforms[platformIndex].metrics = {
      ...this.platforms[platformIndex].metrics,
      ...metrics,
      lastUpdated: new Date()
    }
    
    // Update overall analytics
    this.analytics.totalEngagement = this.totalEngagementCount
    this.analytics.lastAnalyticsUpdate = new Date()
    
    return this.save()
  }
  return Promise.resolve(this)
}

// Static method to find posts ready for publishing
postSchema.statics.findReadyToPublish = function() {
  const now = new Date()
  return this.find({
    status: 'scheduled',
    'scheduling.scheduledFor': { $lte: now },
    'platforms.status': 'scheduled'
  }).populate('user', 'socialAccounts')
}

// Static method to get user's post analytics
postSchema.statics.getUserAnalytics = function(userId, dateRange = {}) {
  const matchStage = { user: mongoose.Types.ObjectId(userId) }
  
  if (dateRange.start && dateRange.end) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    }
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        publishedPosts: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        totalEngagement: { $sum: '$analytics.totalEngagement' },
        avgEngagementRate: { $avg: '$analytics.engagementRate' }
      }
    }
  ])
}

export default mongoose.model('Post', postSchema)
