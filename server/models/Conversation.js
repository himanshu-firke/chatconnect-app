const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only 2 participants for 1:1 chat
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Conversation must have exactly 2 participants'));
  }
  next();
});

// Index for efficient queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function(userId1, userId2) {
  let conversation = await this.findOne({
    participants: { $all: [userId1, userId2] }
  }).populate('participants', 'username isOnline lastSeen')
    .populate('lastMessage');

  if (!conversation) {
    conversation = await this.create({
      participants: [userId1, userId2]
    });
    conversation = await this.findById(conversation._id)
      .populate('participants', 'username isOnline lastSeen')
      .populate('lastMessage');
  }

  return conversation;
};

// Update last message
conversationSchema.methods.updateLastMessage = function(messageId) {
  this.lastMessage = messageId;
  this.lastMessageAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
