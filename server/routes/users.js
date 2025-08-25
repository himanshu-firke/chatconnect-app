const express = require('express');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /users
// @desc    Get all users except current user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user._id } 
    }).select('username email isOnline lastSeen createdAt');

    res.json({
      success: true,
      data: {
        users
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /users/conversations
// @desc    Get user's conversations with last messages
// @access  Private
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'username email isOnline lastSeen')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.participants.find(p => p._id.toString() !== req.user._id.toString());
      
      return {
        id: conv._id,
        user: otherUser,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        updatedAt: conv.updatedAt
      };
    });

    res.json({
      success: true,
      data: {
        conversations: formattedConversations
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversations'
    });
  }
});

// @route   GET /users/:userId/messages
// @desc    Get conversation messages between current user and specified user
// @access  Private
router.get('/:userId/messages', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;

    // Verify the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get messages between users
    const messages = await Message.getConversation(
      req.user._id, 
      userId, 
      parseInt(limit), 
      skip
    );

    // Mark messages as read (messages sent to current user)
    await Message.markConversationAsRead(userId, req.user._id);

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        otherUser: {
          id: otherUser._id,
          username: otherUser.username,
          email: otherUser.email,
          isOnline: otherUser.isOnline,
          lastSeen: otherUser.lastSeen
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: messages.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
});

// @route   POST /users/:userId/messages
// @desc    Send message to user (fallback for non-socket)
// @access  Private
router.post('/:userId/messages', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { content, messageType = 'text' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Create message
    const message = new Message({
      sender: req.user._id,
      recipient: userId,
      content: content.trim(),
      messageType
    });

    await message.save();
    await message.populate('sender', 'username isOnline lastSeen');
    await message.populate('recipient', 'username isOnline lastSeen');

    // Update or create conversation
    const conversation = await Conversation.findOrCreate(req.user._id, userId);
    await conversation.updateLastMessage(message._id);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @route   PUT /users/:userId/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:userId/messages/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      recipient: req.user._id
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking message as read'
    });
  }
});

module.exports = router;
