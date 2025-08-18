import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatService, ChatMessage, ChatRoom } from '../services/chatService';

interface ChatScreenProps {
  route: { params: { restaurantName: string; groupId: string } };
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { restaurantName, groupId } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  
  const isDirectMessage = groupId.startsWith('friend-');
  const chatRoomId = groupId;

  // Load messages and subscribe to chat events
  useEffect(() => {
    loadMessages();
    loadOnlineUsers();
    
    // Subscribe to chat events
    const handleNewMessage = ({ roomId, message }: { roomId: string; message: ChatMessage }) => {
      if (roomId === chatRoomId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleTyping = ({ roomId, userId, isTyping }: { roomId: string; userId: string; isTyping: boolean }) => {
      if (roomId === chatRoomId) {
        if (isTyping) {
          setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== userId));
        }
      }
    };

    const handleMessageDeleted = ({ roomId, messageId }: { roomId: string; messageId: string }) => {
      if (roomId === chatRoomId) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    };

    const handleChatCleared = ({ roomId }: { roomId: string }) => {
      if (roomId === chatRoomId) {
        setMessages([]);
      }
    };

    const handleUserStatusUpdate = ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      loadOnlineUsers();
    };

    // Subscribe to events
    chatService.subscribe('message', handleNewMessage);
    chatService.subscribe('typing', handleTyping);
    chatService.subscribe('messageDeleted', handleMessageDeleted);
    chatService.subscribe('chatCleared', handleChatCleared);
    chatService.subscribe('userStatusUpdate', handleUserStatusUpdate);

    // Mark messages as read
    chatService.markAsRead(chatRoomId);

    // Cleanup subscriptions
    return () => {
      chatService.unsubscribe('message', handleNewMessage);
      chatService.unsubscribe('typing', handleTyping);
      chatService.unsubscribe('messageDeleted', handleMessageDeleted);
      chatService.unsubscribe('chatCleared', handleChatCleared);
      chatService.unsubscribe('userStatusUpdate', handleUserStatusUpdate);
    };
  }, [chatRoomId]);

  const loadMessages = () => {
    const roomMessages = chatService.getMessages(chatRoomId);
    setMessages(roomMessages);
  };

  const loadOnlineUsers = () => {
    const online = chatService.getOnlineUsers(chatRoomId);
    setOnlineUsers(online);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage(chatRoomId, newMessage.trim());
      setNewMessage('');
      setIsTyping(false);
      chatService.setTyping(chatRoomId, 'currentUser', false);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      chatService.setTyping(chatRoomId, 'currentUser', true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      chatService.setTyping(chatRoomId, 'currentUser', false);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const deleteMessage = async (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await chatService.deleteMessage(chatRoomId, messageId);
            if (!success) {
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => chatService.clearChat(chatRoomId),
        },
      ]
    );
  };

  const showMoreOptions = () => {
    Alert.alert(
      'Chat Options',
      'Choose an action',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Chat', onPress: clearChat, style: 'destructive' },
        { text: 'View Online Members', onPress: () => {} },
      ]
    );
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
    ]}>
      {!item.isCurrentUser && (
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
      )}
      
      <View style={[
        styles.messageBubble,
        item.isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]}>
        {!item.isCurrentUser && (
          <Text style={styles.userName}>{item.userName}</Text>
        )}
        
        <Text style={[
          styles.messageText,
          item.isCurrentUser ? styles.currentUserText : styles.otherUserText
        ]}>
          {item.text}
        </Text>
        
        <Text style={[
          styles.timestamp,
          item.isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
        ]}>
          {formatTime(item.timestamp)}
        </Text>
        
        {item.isCurrentUser && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteMessage(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingNames = typingUsers
      .map(userId => {
        const user = onlineUsers.find(u => u.id === userId);
        return user ? user.name : 'Someone';
      })
      .join(', ');

    return (
      <View style={styles.typingIndicator}>
        <Text style={styles.typingText}>
          {typingNames} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </Text>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    );
  };

  const renderOnlineMembers = () => {
    if (isDirectMessage || onlineUsers.length === 0) return null;

    return (
      <View style={styles.onlineMembersContainer}>
        <Text style={styles.onlineMembersTitle}>Online Members</Text>
        <View style={styles.onlineMembersList}>
          {onlineUsers.map(user => (
            <View key={user.id} style={styles.onlineMember}>
              <Image source={{ uri: user.avatar }} style={styles.onlineMemberAvatar} />
              <Text style={styles.onlineMemberName}>{user.name}</Text>
              <View style={styles.onlineIndicator} />
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{restaurantName}</Text>
          <Text style={styles.headerSubtitle}>
            {isDirectMessage ? 'Direct Message' : 'Group Chat'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton} onPress={showMoreOptions}>
          <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {renderOnlineMembers()}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        ListFooterComponent={renderTypingIndicator}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={newMessage.trim() ? '#ffffff' : '#9ca3af'}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dc2626',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#dc2626',
    borderBottomWidth: 1,
    borderBottomColor: '#991b1b',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e5e7eb',
    fontFamily: 'System',
  },
  moreButton: {
    padding: 8,
  },
  onlineMembersContainer: {
    backgroundColor: '#374151',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4b5563',
  },
  onlineMembersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    fontFamily: 'System',
  },
  onlineMembersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  onlineMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  onlineMemberAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  onlineMemberName: {
    fontSize: 12,
    color: '#e5e7eb',
    marginRight: 6,
    fontFamily: 'System',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    position: 'relative',
  },
  currentUserBubble: {
    backgroundColor: '#374151',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'System',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'System',
  },
  currentUserText: {
    color: '#ffffff',
  },
  otherUserText: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'System',
  },
  currentUserTimestamp: {
    color: '#9ca3af',
    textAlign: 'right',
  },
  otherUserTimestamp: {
    color: '#9ca3af',
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
    fontFamily: 'System',
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontFamily: 'System',
  },
  sendButton: {
    backgroundColor: '#374151',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
});
