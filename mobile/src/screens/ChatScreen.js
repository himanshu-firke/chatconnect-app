import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  const setupSocketListeners = () => {
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
      setMessages(prev =>
        prev.map(msg =>
          msg._id === data.messageId
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      );
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
  };

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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#3498db',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  typingBubble: {
    backgroundColor: '#ecf0f1',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: '#fff',
  },
  otherText: {
    color: '#2c3e50',
  },
  typingText: {
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherTimestamp: {
    color: '#95a5a6',
  },
  deliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 36,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#3498db',
  },
  sendButtonInactive: {
    backgroundColor: '#f1f3f4',
  },
});

export default ChatScreen;
