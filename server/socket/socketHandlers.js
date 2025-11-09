const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Store active users and their typing status
const activeUsers = new Map();
const typingUsers = new Map();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Handle socket connection
const handleConnection = (io) => {
  return async (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.userId})`);

    // Set user online and store socket info
    await socket.user.setOnlineStatus(true, socket.id);
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user
    });

    // Join user to their personal room
    socket.join(socket.userId);

    // Broadcast user online status
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      username: socket.user.username,
      isOnline: true
    });

    // Handle joining conversation rooms
    socket.on('join_conversation', async (data) => {
      try {
        const { otherUserId } = data;
        const roomId = [socket.userId, otherUserId].sort().join('_');
        socket.join(roomId);
        
        console.log(`📱 User ${socket.user.username} joined conversation room: ${roomId}`);
      } catch (error) {
        console.error('Join conversation error:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle sending messages (OPTIMIZED)
    socket.on('message:send', async (data) => {
      try {
        const { recipientId, content, messageType = 'text' } = data;

        if (!content || content.trim().length === 0) {
          return socket.emit('error', { message: 'Message content is required' });
        }

        // Quick recipient check (lean query for speed)
        const recipient = await User.findById(recipientId).select('username').lean();
        if (!recipient) {
          return socket.emit('error', { message: 'Recipient not found' });
        }

        // Create message
        const message = new Message({
          sender: socket.userId,
          recipient: recipientId,
          content: content.trim(),
          messageType
        });

        // Save and populate in parallel for speed
        await message.save();
        const [populatedMessage] = await Promise.all([
          Message.findById(message._id)
            .populate('sender', 'username isOnline lastSeen')
            .populate('recipient', 'username isOnline lastSeen')
            .lean(),
          // Update conversation asynchronously (don't wait)
          Conversation.findOrCreate(socket.userId, recipientId)
            .then(conv => conv.updateLastMessage(message._id))
            .catch(err => console.error('Conversation update error:', err))
        ]);

        // Send to recipient immediately if online
        const recipientSocket = activeUsers.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('message:new', {
            message: populatedMessage
          });
          
          // Mark as delivered asynchronously
          message.markAsDelivered().catch(err => 
            console.error('Mark delivered error:', err)
          );
        }

        // Confirm to sender immediately
        socket.emit('message:sent', {
          message: populatedMessage
        });

        console.log(`💬 Message sent from ${socket.user.username} to ${recipient.username}`);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing:start', async (data) => {
      try {
        const { recipientId } = data;
        const roomId = [socket.userId, recipientId].sort().join('_');
        
        // Store typing status
        if (!typingUsers.has(roomId)) {
          typingUsers.set(roomId, new Set());
        }
        typingUsers.get(roomId).add(socket.userId);

        // Notify recipient
        const recipientSocket = activeUsers.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('typing:start', {
            userId: socket.userId,
            username: socket.user.username
          });
        }

      } catch (error) {
        console.error('Typing start error:', error);
      }
    });

    socket.on('typing:stop', async (data) => {
      try {
        const { recipientId } = data;
        const roomId = [socket.userId, recipientId].sort().join('_');
        
        // Remove typing status
        if (typingUsers.has(roomId)) {
          typingUsers.get(roomId).delete(socket.userId);
          if (typingUsers.get(roomId).size === 0) {
            typingUsers.delete(roomId);
          }
        }

        // Notify recipient
        const recipientSocket = activeUsers.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('typing:stop', {
            userId: socket.userId,
            username: socket.user.username
          });
        }

      } catch (error) {
        console.error('Typing stop error:', error);
      }
    });

    // Handle message read receipts
    socket.on('message:read', async (data) => {
      try {
        const { messageId, senderId } = data;

        const message = await Message.findOne({
          _id: messageId,
          recipient: socket.userId
        });

        if (message) {
          await message.markAsRead();

          // Notify sender
          const senderSocket = activeUsers.get(senderId);
          if (senderSocket) {
            io.to(senderSocket.socketId).emit('message:read', {
              messageId,
              readAt: message.readAt,
              readBy: socket.userId
            });
          }
        }

      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.user.username} (${socket.userId})`);

      try {
        // Set user offline
        await socket.user.setOnlineStatus(false);
        
        // Remove from active users
        activeUsers.delete(socket.userId);

        // Clean up typing indicators
        for (const [roomId, typingSet] of typingUsers.entries()) {
          if (typingSet.has(socket.userId)) {
            typingSet.delete(socket.userId);
            if (typingSet.size === 0) {
              typingUsers.delete(roomId);
            }
          }
        }

        // Broadcast user offline status
        socket.broadcast.emit('user:offline', {
          userId: socket.userId,
          username: socket.user.username,
          isOnline: false,
          lastSeen: new Date()
        });

      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  };
};

module.exports = {
  authenticateSocket,
  handleConnection,
  activeUsers,
  typingUsers
};
