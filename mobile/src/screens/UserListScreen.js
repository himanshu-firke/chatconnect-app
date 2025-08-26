import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import socketService from '../services/socketService';

const UserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' or 'users'
  const { user, logout } = useAuth();

  useEffect(() => {
    loadData();
    setupSocketListeners();

    return () => {
      socketService.removeAllListeners('user:online');
      socketService.removeAllListeners('user:offline');
      socketService.removeAllListeners('message:new');
    };
  }, []);

  const setupSocketListeners = () => {
    // Listen for user status changes
    socketService.onUserOnline((data) => {
      updateUserStatus(data.userId, true);
    });

    socketService.onUserOffline((data) => {
      updateUserStatus(data.userId, false, data.lastSeen);
    });

    // Listen for new messages
    socketService.onMessageReceived((data) => {
      updateConversationWithNewMessage(data.message);
    });
  };

  const updateUserStatus = (userId, isOnline, lastSeen = null) => {
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u._id === userId
          ? { ...u, isOnline, ...(lastSeen && { lastSeen }) }
          : u
      )
    );

    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.user._id === userId
          ? { ...conv, user: { ...conv.user, isOnline, ...(lastSeen && { lastSeen }) } }
          : conv
      )
    );
  };

  const updateConversationWithNewMessage = (message) => {
    setConversations(prevConversations => {
      const existingIndex = prevConversations.findIndex(
        conv => conv.user._id === message.sender._id
      );

      if (existingIndex >= 0) {
        const updatedConversations = [...prevConversations];
        updatedConversations[existingIndex] = {
          ...updatedConversations[existingIndex],
          lastMessage: message,
          lastMessageAt: message.createdAt,
        };
        // Move to top
        const [updated] = updatedConversations.splice(existingIndex, 1);
        return [updated, ...updatedConversations];
      } else {
        // New conversation
        return [{
          id: `new_${message.sender._id}`,
          user: message.sender,
          lastMessage: message,
          lastMessageAt: message.createdAt,
        }, ...prevConversations];
      }
    });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadUsers(), loadConversations()]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await api.get('/users/conversations');
      setConversations(response.data.data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleUserPress = (selectedUser) => {
    navigation.navigate('Chat', { 
      userId: selectedUser._id,
      username: selectedUser.username,
      isOnline: selectedUser.isOnline,
      lastSeen: selectedUser.lastSeen,
    });
  };

  const handleLogout = async () => {
    console.log('🔐 Logout button pressed');
    
    // For web, skip confirmation dialog and logout directly
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - logging out directly');
      try {
        await logout();
        console.log('✅ Web logout completed');
      } catch (error) {
        console.error('❌ Web logout failed:', error);
      }
      return;
    }

    // For mobile, show confirmation dialog
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            console.log('🔐 User confirmed logout');
            try {
              await logout();
            } catch (error) {
              console.error('❌ Mobile logout failed:', error);
            }
          }
        },
      ]
    );
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter(conv =>
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const formatMessagePreview = (message) => {
    if (!message) return 'No messages yet';
    const isOwn = message.sender._id === user?.id;
    const prefix = isOwn ? 'You: ' : '';
    return `${prefix}${message.content}`;
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item)}>
      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: item.isOnline ? '#27ae60' : '#95a5a6' }]}>
          <Text style={styles.avatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.userStatus}>
            {item.isOnline ? 'Online' : `Last seen ${formatLastSeen(item.lastSeen)}`}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
    </TouchableOpacity>
  );

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item.user)}>
      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: item.user.isOnline ? '#27ae60' : '#95a5a6' }]}>
          <Text style={styles.avatarText}>
            {item.user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {formatMessagePreview(item.lastMessage)}
          </Text>
        </View>
      </View>
      <View style={styles.conversationMeta}>
        <Text style={styles.timestamp}>
          {formatLastSeen(item.lastMessageAt)}
        </Text>
        {item.user.isOnline && <View style={styles.onlineIndicator} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ChatConnect</Text>
        <TouchableOpacity 
          onPress={handleLogout} 
          style={styles.logoutButton}
          accessible={true}
          accessibilityLabel="Logout button"
          testID="logout-button"
        >
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'conversations' && styles.activeTab]}
          onPress={() => setActiveTab('conversations')}
        >
          <Text style={[styles.tabText, activeTab === 'conversations' && styles.activeTabText]}>
            Conversations
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            All Users
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'conversations' ? filteredConversations : filteredUsers}
        keyExtractor={(item) => activeTab === 'conversations' ? item.id || item.user._id : item._id}
        renderItem={activeTab === 'conversations' ? renderConversationItem : renderUserItem}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={activeTab === 'conversations' ? "chatbubbles-outline" : "people-outline"} 
              size={64} 
              color="#bdc3c7" 
            />
            <Text style={styles.emptyText}>
              {activeTab === 'conversations' 
                ? 'No conversations yet\nStart chatting with someone!' 
                : 'No users found'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logoutButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3498db',
    borderRadius: 7,
  },
  tabText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  lastMessage: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 4,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#27ae60',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});

export default UserListScreen;
