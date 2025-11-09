import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import socketService from '../services/socketService';
import AppIcon from '../components/AppIcon';

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

  const updateUserStatus = useCallback((userId, isOnline, lastSeen = null) => {
    setUsers(prevUsers => {
      const userIndex = prevUsers.findIndex(u => u._id === userId);
      if (userIndex === -1) return prevUsers;
      
      const updatedUsers = [...prevUsers];
      updatedUsers[userIndex] = { 
        ...updatedUsers[userIndex], 
        isOnline, 
        ...(lastSeen && { lastSeen }) 
      };
      return updatedUsers;
    });

    setConversations(prevConversations => {
      const convIndex = prevConversations.findIndex(conv => conv.user._id === userId);
      if (convIndex === -1) return prevConversations;
      
      const updatedConversations = [...prevConversations];
      updatedConversations[convIndex] = {
        ...updatedConversations[convIndex],
        user: { 
          ...updatedConversations[convIndex].user, 
          isOnline, 
          ...(lastSeen && { lastSeen }) 
        }
      };
      return updatedConversations;
    });
  }, []);

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
      const uniqueUsers = response.data.data.users.filter((user, index, self) => 
        index === self.findIndex(u => u._id === user._id)
      );
      setUsers(uniqueUsers);
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

  const filteredUsers = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return users
      .filter(u =>
        u.username.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      )
      .filter((user, index, self) => 
        index === self.findIndex(u => u._id === user._id)
      );
  }, [users, searchQuery]);

  const filteredConversations = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return conversations.filter(conv =>
      conv.user.username.toLowerCase().includes(searchLower)
    );
  }, [conversations, searchQuery]);

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
        <View style={styles.headerLeft}>
          <AppIcon size={40} showText={false} />
          <Text style={styles.headerTitle}>ChatConnect</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
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
        initialNumToRender={15}
        maxToRenderPerBatch={8}
        windowSize={8}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
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
    backgroundColor: '#F8F9FD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F9',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 4,
    borderWidth: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  activeTab: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  tabText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  userStatus: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
});

export default UserListScreen;
