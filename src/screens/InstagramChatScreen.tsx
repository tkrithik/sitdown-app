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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { instagramChatService } from '../services/instagramChatService';
import { ChatMessage, ChatRoom, ChatUser } from '../types';

interface InstagramChatScreenProps {
  route: { params: { restaurantName: string; groupId: string } };
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const InstagramChatScreen: React.FC<InstagramChatScreenProps> = ({ route, navigation }) => {
  const { restaurantName, groupId } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [replyTo, setReplyTo] = useState<{ messageId: string; text: string; senderName: string } | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const chatRoomId = groupId;
  const chatRoom = instagramChatService.getChatRooms().find(room => room.id === chatRoomId);

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

    const handleMessageStatusUpdate = ({ roomId, messageId, status }: { roomId: string; messageId: string; status: string }) => {
      if (roomId === chatRoomId) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: status as any } : msg
        ));
      }
    };

    const handleReactionAdded = ({ roomId, messageId, reaction }: { roomId: string; messageId: string; reaction: any }) => {
      if (roomId === chatRoomId) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, reactions: [...msg.reactions, reaction] } : msg
        ));
      }
    };

    // Subscribe to events
    instagramChatService.subscribe('message', handleNewMessage);
    instagramChatService.subscribe('typing', handleTyping);
    instagramChatService.subscribe('messageDeleted', handleMessageDeleted);
    instagramChatService.subscribe('messageStatusUpdate', handleMessageStatusUpdate);
    instagramChatService.subscribe('reactionAdded', handleReactionAdded);

    // Mark messages as read
    instagramChatService.markAsRead(chatRoomId);

    // Cleanup subscriptions
    return () => {
      instagramChatService.unsubscribe('message', handleNewMessage);
      instagramChatService.unsubscribe('typing', handleTyping);
      instagramChatService.unsubscribe('messageDeleted', handleMessageDeleted);
      instagramChatService.unsubscribe('messageStatusUpdate', handleMessageStatusUpdate);
      instagramChatService.unsubscribe('reactionAdded', handleReactionAdded);
    };
  }, [chatRoomId]);

  const loadMessages = () => {
    const roomMessages = instagramChatService.getMessages(chatRoomId);
    setMessages(roomMessages);
  };

  const loadOnlineUsers = () => {
    if (chatRoom) {
      setOnlineUsers(chatRoom.participants.filter(user => user.isOnline));
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await instagramChatService.sendMessage(chatRoomId, newMessage.trim(), replyTo || undefined);
      setNewMessage('');
      setReplyTo(null);
      setIsTyping(false);
      instagramChatService.setTyping(chatRoomId, 'anonymous-user', false);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      instagramChatService.setTyping(chatRoomId, 'anonymous-user', true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      instagramChatService.setTyping(chatRoomId, 'anonymous-user', false);
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
            const success = await instagramChatService.deleteMessage(chatRoomId, messageId);
            if (!success) {
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const addReaction = async (messageId: string, emoji: string) => {
    await instagramChatService.addReaction(chatRoomId, messageId, emoji);
    setShowReactions(null);
  };

  const toggleReactions = (messageId: string) => {
    setShowReactions(showReactions === messageId ? null : messageId);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color="#9ca3af" />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color="#9ca3af" />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={12} color="#9ca3af" />;
      case 'read':
        return <Ionicons name="checkmark-done" size={12} color="#3b82f6" />;
      default:
        return null;
    }
  };

  const renderReplyPreview = () => {
    if (!replyTo) return null;

    return (
      <View style={styles.replyPreview}>
        <View style={styles.replyPreviewContent}>
          <Text style={styles.replyPreviewText} numberOfLines={1}>
            Replying to {replyTo.senderName}: {replyTo.text}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.replyPreviewClose}
          onPress={() => setReplyTo(null)}
        >
          <Ionicons name="close" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isCurrentUser = item.senderId === 'anonymous-user';
    const showDate = index === 0 || 
      formatDate(item.timestamp) !== formatDate(messages[index - 1]?.timestamp);
    const showAvatar = !isCurrentUser && (
      index === messages.length - 1 || 
      messages[index + 1]?.senderId !== item.senderId ||
      formatDate(item.timestamp) !== formatDate(messages[index + 1]?.timestamp)
    );

    if (item.isDeleted) {
      return (
        <View style={styles.deletedMessageContainer}>
          <Text style={styles.deletedMessageText}>This message was deleted</Text>
        </View>
      );
    }

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}>
          {showAvatar && !isCurrentUser && (
            <Image source={{ uri: chatRoom?.participants.find(p => p.id === item.senderId)?.profilePicture }} style={styles.avatar} />
          )}
          
          {!showAvatar && !isCurrentUser && (
            <View style={styles.avatarSpacer} />
          )}
          
          <View style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
            item.replyTo && styles.messageWithReply
          ]}>
            {item.replyTo && (
              <View style={styles.replyContainer}>
                <Text style={styles.replyText} numberOfLines={2}>
                  {item.replyTo.senderName}: {item.replyTo.text}
                </Text>
              </View>
            )}
            
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText
            ]}>
              {item.text}
            </Text>
            
            <View style={styles.messageFooter}>
              <Text style={[
                styles.timestamp,
                isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
              ]}>
                {formatTime(item.timestamp)}
              </Text>
              
              {isCurrentUser && (
                <View style={styles.statusContainer}>
                  {getMessageStatusIcon(item.status)}
                </View>
              )}
            </View>
            
            {item.reactions.length > 0 && (
              <View style={styles.reactionsContainer}>
                {item.reactions.map((reaction, idx) => (
                  <View key={idx} style={styles.reactionBubble}>
                    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                    <Text style={styles.reactionCount}>{item.reactions.filter(r => r.emoji === reaction.emoji).length}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.messageActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleReactions(item.id)}
            >
              <Ionicons name="heart-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setReplyTo({ messageId: item.id, text: item.text, senderName: 'Anonymous' })}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            {isCurrentUser && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => deleteMessage(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {showReactions === item.id && (
          <View style={styles.reactionsPanel}>
            {['❤️', '👍', '😊', '🎉', '🔥', '👏'].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionOption}
                onPress={() => addReaction(item.id, emoji)}
              >
                <Text style={styles.reactionOptionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingNames = typingUsers
      .map(userId => {
        const user = chatRoom?.participants.find(p => p.id === userId);
        return user ? user.fullName : 'Someone';
      })
      .join(', ');

    return (
      <View style={styles.typingIndicator}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>
            {typingNames} {typingUsers.length === 1 ? 'is' : 'are'} typing
          </Text>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  };

  const renderOnlineMembers = () => {
    if (!chatRoom || chatRoom.type === 'direct' || onlineUsers.length === 0) return null;

    return (
      <View style={styles.onlineMembersContainer}>
        <Text style={styles.onlineMembersTitle}>Online Members</Text>
        <View style={styles.onlineMembersList}>
          {onlineUsers.map(user => (
            <View key={user.id} style={styles.onlineMember}>
              <Image source={{ uri: user.profilePicture }} style={styles.onlineMemberAvatar} />
              <Text style={styles.onlineMemberName}>{user.fullName}</Text>
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
            {chatRoom?.type === 'direct' ? 'Direct Message' : 'Group Chat'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {renderOnlineMembers()}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        ListFooterComponent={renderTypingIndicator}
      />

      {renderReplyPreview()}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={newMessage}
            onChangeText={handleTyping}
            placeholder="Message..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={1000}
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
        </View>
      </KeyboardAvoidingView>
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
    padding: 16,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
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
    color: '#9ca3af',
    fontFamily: 'System',
  },
  moreButton: {
    padding: 8,
  },
  onlineMembersContainer: {
    backgroundColor: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
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
    color: '#9ca3af',
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
    backgroundColor: '#000000',
  },
  messagesContainer: {
    padding: 16,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontFamily: 'System',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
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
  avatarSpacer: {
    width: 40,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    position: 'relative',
  },
  currentUserBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#374151',
    borderBottomLeftRadius: 4,
  },
  messageWithReply: {
    paddingTop: 8,
  },
  replyContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyText: {
    fontSize: 12,
    color: '#9ca3af',
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
    color: '#ffffff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: 'System',
  },
  currentUserTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTimestamp: {
    color: '#9ca3af',
  },
  statusContainer: {
    marginLeft: 4,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  reactionEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: 'System',
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    opacity: 0,
  },
  actionButton: {
    padding: 4,
    marginLeft: 4,
  },
  reactionsPanel: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 8,
    marginLeft: 48,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  reactionOption: {
    padding: 8,
    marginHorizontal: 2,
  },
  reactionOptionEmoji: {
    fontSize: 20,
  },
  deletedMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  deletedMessageText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    fontFamily: 'System',
  },
  typingIndicator: {
    marginLeft: 48,
    marginBottom: 8,
  },
  typingBubble: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 14,
    color: '#9ca3af',
    marginRight: 8,
    fontFamily: 'System',
  },
  typingDots: {
    flexDirection: 'row',
    marginTop: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
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
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  replyPreviewContent: {
    flex: 1,
    marginRight: 8,
  },
  replyPreviewText: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'System',
  },
  replyPreviewClose: {
    padding: 4,
  },
  inputContainer: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#374151',
    fontFamily: 'System',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
});
