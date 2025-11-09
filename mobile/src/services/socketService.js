import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCKET_URL } from '../config/api';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      this.socket = io(SOCKET_URL, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'], // Add polling as fallback
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000, // 10 second timeout
      });

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        // Set a timeout to resolve even if connection takes too long
        const timeout = setTimeout(() => {
          console.log('⚠️ Socket connection timeout, but continuing...');
          resolve(); // Resolve anyway to not block the app
        }, 5000); // 5 second timeout

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          console.log('✅ Socket connected');
          this.isConnected = true;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
          this.isConnected = false;
          // Don't reject, just log the error
          clearTimeout(timeout);
          resolve(); // Resolve anyway to not block the app
        });
      });
    } catch (error) {
      console.error('Socket connection failed:', error);
      // Don't throw, just log the error
      return Promise.resolve();
    }
  }

  setupEventHandlers() {
    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 Socket reconnected');
      this.isConnected = true;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('✅ Socket disconnected successfully');
    }
  }

  // Message events
  sendMessage(recipientId, content, messageType = 'text') {
    if (!this.isConnected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('message:send', {
      recipientId,
      content,
      messageType
    });
  }

  onMessageReceived(callback) {
    this.on('message:new', callback);
  }

  onMessageSent(callback) {
    this.on('message:sent', callback);
  }

  onMessageRead(callback) {
    this.on('message:read', callback);
  }

  markMessageAsRead(messageId, senderId) {
    if (!this.isConnected) return;
    
    this.socket.emit('message:read', {
      messageId,
      senderId
    });
  }

  // Typing events
  startTyping(recipientId) {
    if (!this.isConnected) return;
    
    this.socket.emit('typing:start', { recipientId });
  }

  stopTyping(recipientId) {
    if (!this.isConnected) return;
    
    this.socket.emit('typing:stop', { recipientId });
  }

  onTypingStart(callback) {
    this.on('typing:start', callback);
  }

  onTypingStop(callback) {
    this.on('typing:stop', callback);
  }

  // User presence events
  onUserOnline(callback) {
    this.on('user:online', callback);
  }

  onUserOffline(callback) {
    this.on('user:offline', callback);
  }

  // Conversation events
  joinConversation(otherUserId) {
    if (!this.isConnected) return;
    
    this.socket.emit('join_conversation', { otherUserId });
  }

  // Generic event handling
  on(event, callback) {
    if (!this.socket) return;

    this.socket.on(event, callback);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);
    
    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  removeAllListeners(event) {
    if (!this.socket) return;

    if (event) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    } else {
      this.socket.removeAllListeners();
      this.listeners.clear();
    }
  }
}

// Export singleton instance
export default new SocketService();
