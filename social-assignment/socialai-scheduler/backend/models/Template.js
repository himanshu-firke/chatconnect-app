import mongoose from 'mongoose'

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'marketing', 'motivation', 'education', 'company', 'news', 'personal', 'promotional'],
    default: 'general'
  },
  platforms: [{
    type: String,
    enum: ['twitter', 'linkedin', 'instagram', 'facebook'],
    default: ['twitter']
  }],
  tone: {
    type: String,
    enum: ['friendly', 'professional', 'casual', 'funny', 'formal'],
    default: 'friendly'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  variables: [{
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'url'],
      default: 'text'
    }
  }]
}, {
  timestamps: true
})

// Index for better query performance
templateSchema.index({ user: 1, category: 1 })
templateSchema.index({ user: 1, usageCount: -1 })
templateSchema.index({ user: 1, createdAt: -1 })

// Virtual for engagement rate (if we track template performance)
templateSchema.virtual('engagementRate').get(function() {
  // This would be calculated based on posts created from this template
  // For now, return a mock value
  return Math.random() * 10
})

// Method to extract variables from content
templateSchema.methods.extractVariables = function() {
  const variableRegex = /{([^}]+)}/g
  const variables = []
  let match
  
  while ((match = variableRegex.exec(this.content)) !== null) {
    const variableName = match[1].trim()
    if (!variables.find(v => v.name === variableName)) {
      variables.push({
        name: variableName,
        description: `Variable for ${variableName}`,
        type: 'text'
      })
    }
  }
  
  return variables
}

// Method to replace variables in content
templateSchema.methods.replaceVariables = function(variables = {}) {
  let content = this.content
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g')
    content = content.replace(regex, variables[key])
  })
  
  return content
}

// Static method to get popular templates
templateSchema.statics.getPopular = function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ usageCount: -1 })
    .limit(limit)
    .populate('user', 'name email')
}

// Static method to get recent templates
templateSchema.statics.getRecent = function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
}

// Pre-save middleware to extract variables
templateSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.variables = this.extractVariables()
  }
  next()
})

const Template = mongoose.model('Template', templateSchema)

export default Template
