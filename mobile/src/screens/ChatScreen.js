import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import socketService from '../services/socketService';
import AppIcon from '../components/AppIcon';

const ChatScreen = ({ route, navigation }) => {
  const { userId, username, isOnline: initialOnlineStatus, lastSeen } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(initialOnlineStatus);
  const [userLastSeen, setUserLastSeen] = useState(lastSeen);
  const flatListRef = useRef();
  const typingTimeoutRef = useRef();

  useEffect(() => {
    loadMessages();
    setupSocketListeners();
    socketService.joinConversation(userId);

    return () => {
      clearTimeout(typingTimeoutRef.current);
      socketService.removeAllListeners('message:new');
      socketService.removeAllListeners('message:sent');
      socketService.removeAllListeners('message:read');
      socketService.removeAllListeners('typing:start');
      socketService.removeAllListeners('typing:stop');
      socketService.removeAllListeners('user:online');
      socketService.removeAllListeners('user:offline');
    };
  }, [userId]);

  const setupSocketListeners = useCallback(() => {
    socketService.onMessageReceived((data) => {
      if (data.message.sender._id === userId) {
        setMessages(prev => [data.message, ...prev]);
        // Mark as read immediately since user is viewing the chat
        socketService.markMessageAsRead(data.message._id, data.message.sender._id);
      }
    });

    socketService.onMessageSent((data) => {
      setMessages(prev => [data.message, ...prev]);
    });

    socketService.onMessageRead((data) => {
      setMessages(prev => {
        const messageIndex = prev.findIndex(msg => msg._id === data.messageId);
        if (messageIndex === -1) return prev;
        
        const updatedMessages = [...prev];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          isRead: true,
          readAt: data.readAt
        };
        return updatedMessages;
      });
    });

    socketService.onTypingStart((data) => {
      if (data.userId === userId) {
        setOtherUserTyping(true);
      }
    });

    socketService.onTypingStop((data) => {
      if (data.userId === userId) {
        setOtherUserTyping(false);
      }
    });

    socketService.onUserOnline((data) => {
      if (data.userId === userId) {
        setIsOnline(true);
      }
    });

    socketService.onUserOffline((data) => {
      if (data.userId === userId) {
        setIsOnline(false);
        setUserLastSeen(data.lastSeen);
      }
    });
  }, [userId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/users/${userId}/messages`);
      setMessages(response.data.data.messages.reverse());
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    const content = inputText.trim();
    if (!content) return;

    setInputText('');
    stopTyping();

    try {
      socketService.sendMessage(userId, content);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setInputText(content); // Restore input on error
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);
    
    if (text.length > 0 && !isTyping) {
      startTyping();
    } else if (text.length === 0 && isTyping) {
      stopTyping();
    }
  };

  const startTyping = () => {
    setIsTyping(true);
    socketService.startTyping(userId);
    
    // Clear existing timeout
    clearTimeout(typingTimeoutRef.current);
    
    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(userId);
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return '';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.sender._id === user?.id;
    const showDeliveryStatus = isOwn && item.isDelivered;
    const showReadStatus = isOwn && item.isRead;

    return (
      <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
              {formatTime(item.createdAt)}
            </Text>
            {isOwn && (
              <View style={styles.deliveryStatus}>
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={showDeliveryStatus ? '#27ae60' : '#bdc3c7'}
                />
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={showReadStatus ? '#27ae60' : '#bdc3c7'}
                  style={{ marginLeft: -4 }}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!otherUserTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.otherMessage]}>
        <View style={[styles.messageBubble, styles.otherBubble, styles.typingBubble]}>
          <Text style={styles.typingText}>{username} is typing...</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{username}</Text>
          <Text style={styles.headerSubtitle}>
            {isOnline ? 'Online' : `Last seen ${formatLastSeen(userLastSeen)}`}
          </Text>
        </View>
        <View style={[styles.onlineIndicator, { backgroundColor: isOnline ? '#27ae60' : '#95a5a6' }]} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        style={styles.messagesList}
        inverted
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderTypingIndicator}
        onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() ? '#fff' : '#bdc3c7'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  messageContainer: {
    marginVertical: 5,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: '#667eea',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 0,
  },
  typingBubble: {
    backgroundColor: '#F0F2F9',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  myText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#1a1a2e',
  },
  typingText: {
    color: '#6B7280',
    fontStyle: 'italic',
    fontSize: 14,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  otherTimestamp: {
    color: '#9CA3AF',
  },
  deliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: '#F0F2F9',
    color: '#1a1a2e',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  sendButtonInactive: {
    backgroundColor: '#E5E7EB',
  },
});

export default ChatScreen;
