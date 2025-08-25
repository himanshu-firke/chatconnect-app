const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

// Mark message as delivered
messageSchema.methods.markAsDelivered = function() {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

// Mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  if (!this.isDelivered) {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }
  return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(userId1, userId2, limit = 50, skip = 0) {
  return this.find({
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 }
    ]
  })
  .populate('sender', 'username isOnline lastSeen')
  .populate('recipient', 'username isOnline lastSeen')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to mark all messages as read
messageSchema.statics.markConversationAsRead = function(senderId, recipientId) {
  return this.updateMany(
    { sender: senderId, recipient: recipientId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

module.exports = mongoose.model('Message', messageSchema);
