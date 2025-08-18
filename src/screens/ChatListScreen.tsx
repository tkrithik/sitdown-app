import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { multiDeviceChatService } from '../services/multiDeviceChatService';
import { ChatRoom, ChatMessage } from '../types';
import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../contexts/AuthContext';

interface ChatListScreenProps {
  navigation: any;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const { isAuthenticated, user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [pinnedChats, setPinnedChats] = useState<ChatRoom[]>([]);

  useEffect(() => {
    if (multiDeviceChatService.isReady()) {
      loadChatRooms();
      
      // Subscribe to chat updates
      const handleNewMessage = () => {
        loadChatRooms();
      };

      const handleChatPinned = () => {
        loadChatRooms();
      };

      const handleChatMuted = () => {
        loadChatRooms();
      };

      multiDeviceChatService.subscribe('message', handleNewMessage);
      multiDeviceChatService.subscribe('chatPinned', handleChatPinned);
      multiDeviceChatService.subscribe('chatMuted', handleChatMuted);

      return () => {
        multiDeviceChatService.unsubscribe('message', handleNewMessage);
        multiDeviceChatService.unsubscribe('chatPinned', handleChatPinned);
        multiDeviceChatService.unsubscribe('chatMuted', handleChatMuted);
      };
    }
  }, []);

  const loadChatRooms = () => {
    const allRooms = multiDeviceChatService.getChatRooms();
    const pinned = multiDeviceChatService.getPinnedChats();
    
    console.log('Chat rooms loaded:', allRooms);
    console.log('Pinned chats:', pinned);
    
    setChatRooms(allRooms);
    setPinnedChats(pinned);
  };

  const formatLastMessage = (message?: ChatMessage) => {
    if (!message) return 'No messages yet';
    
    if (message.isDeleted) {
      return 'This message was deleted';
    }
    
    if (message.media) {
      switch (message.media.type) {
        case 'image':
          return '📷 Photo';
        case 'video':
          return '🎥 Video';
        case 'audio':
          return '🎵 Audio';
        default:
          return message.text;
      }
    }
    
    return message.text.length > 30 ? message.text.substring(0, 30) + '...' : message.text;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return Math.floor(diffInHours) + 'h';
    } else if (diffInHours < 48) {
      return 'yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUnreadIndicator = (unreadCount: number) => {
    if (unreadCount === 0) return null;
    
    return (
      <View style={styles.unreadBadge}>
        <Text style={styles.unreadText}>
          {unreadCount > 99 ? '99+' : unreadCount.toString()}
        </Text>
      </View>
    );
  };

  const getOnlineIndicator = (user: any) => {
    if (!user || !user.isOnline) return null;
    
    return (
      <View style={styles.onlineIndicator}>
        <View style={styles.onlineInner} />
      </View>
    );
  };

  const renderPinnedSection = () => {
    if (pinnedChats.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Pinned</Text>
        <FlatList
          data={pinnedChats.filter(chat => chat.participants && chat.participants.length > 0)}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => renderPinnedChat(item)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.pinnedList}
        />
      </View>
    );
  };

  const renderPinnedChat = (chat: ChatRoom) => {
    // For group chats, show the first participant, for direct chats find the other user
    const otherParticipant = chat.type === 'direct' 
      ? chat.participants.find(p => p.id !== 'currentUser')
      : chat.participants[0];
    
    return (
      <TouchableOpacity
        style={styles.pinnedChatItem}
        onPress={() => navigation.navigate('MultiDeviceChat', {
          restaurantName: chat.name || otherParticipant?.fullName || 'Chat',
          groupId: chat.id,
        })}
      >
        <View style={styles.pinnedAvatarContainer}>
          <Image source={{ uri: otherParticipant?.profilePicture || 'https://picsum.photos/200/200?random=999' }} style={styles.pinnedAvatar} />
          {getOnlineIndicator(otherParticipant)}
        </View>
        <Text style={styles.pinnedName} numberOfLines={1}>
          {chat.name || otherParticipant?.fullName || 'Chat'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderChatItem = ({ item }: { item: ChatRoom }) => {
    // For group chats, show the first participant, for direct chats find the other user
    const otherParticipant = item.type === 'direct' 
      ? item.participants.find(p => p.id !== 'currentUser')
      : item.participants[0];
    const lastMessage = item.lastMessage;
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('MultiDeviceChat', {
          restaurantName: item.name || otherParticipant?.fullName || 'Chat',
          groupId: item.id,
        })}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: otherParticipant?.profilePicture || 'https://picsum.photos/200/200?random=999' }} style={styles.avatar} />
          {getOnlineIndicator(otherParticipant)}
          {item.isPinned && (
            <View style={styles.pinIndicator}>
              <Ionicons name="pin" size={8} color="#ffffff" />
            </View>
          )}
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.name || otherParticipant?.fullName || 'Chat'}
            </Text>
            {lastMessage && (
              <Text style={styles.lastMessageTime}>
                {formatTime(lastMessage.timestamp)}
              </Text>
            )}
          </View>
          
          <View style={styles.chatPreview}>
            <Text style={styles.lastMessageText} numberOfLines={1}>
              {formatLastMessage(lastMessage)}
            </Text>
            {getUnreadIndicator(item.unreadCount)}
          </View>
        </View>
        
        <View style={styles.chatActions}>
          {item.isMuted && (
            <Ionicons name="notifications-off" size={16} color="#6b7280" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color="#6b7280" />
      <Text style={styles.emptyStateTitle}>No chats yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start a conversation with your friends about restaurants!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <AppHeader title="Messages" navigation={navigation} />

      {!isAuthenticated ? (
        <View style={styles.loginPrompt}>
          <Ionicons name="chatbubbles-outline" size={64} color="#6b7280" />
          <Text style={styles.loginPromptTitle}>Login to Access Chat</Text>
          <Text style={styles.loginPromptSubtitle}>
            You need to be logged in to use the chat features
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {renderPinnedSection()}

          <FlatList
            data={chatRooms.filter(chat => chat.participants && chat.participants.length > 0)}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            style={styles.chatList}
            contentContainerStyle={styles.chatListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            ListHeaderComponent={
              chatRooms.length > 0 ? (
                <Text style={styles.sectionTitle}>All Chats</Text>
              ) : null
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'System',
  },
  newChatButton: {
    padding: 8,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginHorizontal: 16,
    marginBottom: 12,
    fontFamily: 'System',
  },
  pinnedList: {
    paddingHorizontal: 16,
  },
  pinnedChatItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  pinnedAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  pinnedAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  pinnedName: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: 'System',
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingBottom: 16,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'System',
  },
  loginPromptSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: 'System',
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'System',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chatInfo: {
    flex: 1,
    marginRight: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
    fontFamily: 'System',
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'System',
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
    marginRight: 8,
    fontFamily: 'System',
  },
  chatActions: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#000000',
  },
  onlineInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: 1,
    left: 1,
  },
  pinIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'System',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'System',
  },
});
