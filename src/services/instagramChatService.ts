import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseDb, isFirebaseEnabled } from './firebase';
import { 
  collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, writeBatch, getDocs,
  updateDoc, serverTimestamp, where, limit
} from 'firebase/firestore';
import { 
  ChatUser, ChatMessage, ChatRoom, MessageReaction, ChatNotification 
} from '../types';

// Event Emitter for real-time updates
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: any) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

// Mock users for development
const mockUsers: ChatUser[] = [
  {
    id: 'user1',
    username: 'sarah_m',
    fullName: 'Sarah Mitchell',
    profilePicture: 'https://picsum.photos/200/200?random=1',
    isOnline: true,
    lastSeen: Date.now(),
    isVerified: true,
  },
  {
    id: 'user2',
    username: 'mike_j',
    fullName: 'Mike Johnson',
    profilePicture: 'https://picsum.photos/200/200?random=2',
    isOnline: true,
    lastSeen: Date.now(),
    isVerified: false,
  },
  {
    id: 'user3',
    username: 'emma_l',
    fullName: 'Emma Lopez',
    profilePicture: 'https://picsum.photos/200/200?random=3',
    isOnline: false,
    lastSeen: Date.now() - 300000,
    isVerified: true,
  },
  {
    id: 'user4',
    username: 'alex_k',
    fullName: 'Alex Kim',
    profilePicture: 'https://picsum.photos/200/200?random=4',
    isOnline: true,
    lastSeen: Date.now(),
    isVerified: false,
  },
  {
    id: 'user5',
    username: 'jessica_r',
    fullName: 'Jessica Rodriguez',
    profilePicture: 'https://picsum.photos/200/200?random=5',
    isOnline: false,
    lastSeen: Date.now() - 600000,
    isVerified: true,
  },
];

class InstagramChatService extends EventEmitter {
  private chatRooms: Map<string, ChatRoom> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();
  private currentUserId: string = 'anonymous-user';
  private typingUsers: Map<string, Set<string>> = new Map();
  private firebaseEnabled: boolean = false;
  private roomUnsubscribers: Map<string, () => void> = new Map();
  private messageStatusTimers: Map<string, NodeJS.Timeout> = new Map();
  private messageIdCounter: number = 0;

  constructor() {
    super();
    this.firebaseEnabled = isFirebaseEnabled();
    this.initializeDeviceId();
    this.initializeChatRooms();
    
    if (this.firebaseEnabled) {
      this.setupFirebaseListeners();
    } else {
      this.loadChatHistory();
      this.startSimulation();
    }
  }

  private async initializeDeviceId() {
    // For anonymous usage, we'll use a consistent anonymous user ID
    // This ensures messages are properly identified as "yours" vs "others"
    this.currentUserId = 'anonymous-user';
    
    try {
      // Store the anonymous user ID for consistency
      await AsyncStorage.setItem('anonymous_user_id', this.currentUserId);
    } catch (error) {
      console.error('Error storing anonymous user ID:', error);
    }
  }

  private addInitialMessages() {
    // Add some initial messages to demonstrate the chat functionality
    const initialMessages: ChatMessage[] = [
      {
        id: 'initial-1',
        text: 'Hey everyone! Who wants to grab dinner at Campus Burgers tonight?',
        senderId: 'user1',
        timestamp: Date.now() - 3600000, // 1 hour ago
        status: 'read',
        isDeleted: false,
        reactions: [],
      },
      {
        id: 'initial-2',
        text: 'I\'m definitely in! 🍔',
        senderId: 'anonymous-user',
        timestamp: Date.now() - 1800000, // 30 minutes ago
        status: 'read',
        isDeleted: false,
        reactions: [],
      },
      {
        id: 'initial-3',
        text: 'Count me in too! What time works for everyone?',
        senderId: 'user2',
        timestamp: Date.now() - 900000, // 15 minutes ago
        status: 'read',
        isDeleted: false,
        reactions: [],
      },
    ];

    // Add messages to the campus burgers chat
    this.messages.set('campus-burgers-group', initialMessages);
    
    // Update the chat room with the last message
    const campusChat = this.chatRooms.get('campus-burgers-group');
    if (campusChat) {
      campusChat.lastMessage = initialMessages[initialMessages.length - 1];
      campusChat.lastActivity = initialMessages[initialMessages.length - 1].timestamp;
      this.chatRooms.set('campus-burgers-group', campusChat);
    }
  }

  private initializeChatRooms() {
    // Campus Burgers Group Chat
    const campusBurgersChat: ChatRoom = {
      id: 'campus-burgers-group',
      type: 'group',
      name: 'Campus Burgers Group',
      participants: mockUsers,
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      lastActivity: Date.now(),
      groupInfo: {
        description: 'Group for Campus Burgers meetups and discussions',
        createdBy: 'user1',
        createdAt: Date.now() - 86400000, // 1 day ago
        admins: ['user1', 'user2'],
      },
    };

    // The Study Hall Group Chat
    const studyHallChat: ChatRoom = {
      id: 'study-hall-group',
      type: 'group',
      name: 'The Study Hall Group',
      participants: mockUsers,
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      lastActivity: Date.now(),
      groupInfo: {
        description: 'Study group for The Study Hall restaurant',
        createdBy: 'user3',
        createdAt: Date.now() - 172800000, // 2 days ago
        admins: ['user3', 'user4'],
      },
    };

    // Direct message with Sarah
    const sarahChat: ChatRoom = {
      id: 'sarah-direct',
      type: 'direct',
      participants: [mockUsers[0]],
      unreadCount: 0,
      isPinned: true,
      isMuted: false,
      lastActivity: Date.now(),
    };

    this.chatRooms.set(campusBurgersChat.id, campusBurgersChat);
    this.chatRooms.set(studyHallChat.id, studyHallChat);
    this.chatRooms.set(sarahChat.id, sarahChat);
    
    // Add some initial messages to demonstrate the chat
    this.addInitialMessages();
  }

  private setupFirebaseListeners() {
    // Listen for new messages across all rooms
    this.chatRooms.forEach(room => {
      this.activateRoom(room.id);
    });
  }

  private async loadChatHistory() {
    try {
      const savedMessages = await AsyncStorage.getItem('instagram_chat_messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        Object.keys(parsed).forEach(roomId => {
          this.messages.set(roomId, parsed[roomId]);
        });
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

  private async saveChatHistory() {
    try {
      const messagesObj: Record<string, ChatMessage[]> = {};
      this.messages.forEach((messages, roomId) => {
        messagesObj[roomId] = messages;
      });
      await AsyncStorage.setItem('instagram_chat_messages', JSON.stringify(messagesObj));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  // Public API Methods

  public getChatRooms(): ChatRoom[] {
    return Array.from(this.chatRooms.values())
      .sort((a, b) => b.lastActivity - a.lastActivity);
  }

  public getPinnedChats(): ChatRoom[] {
    return Array.from(this.chatRooms.values())
      .filter(room => room.isPinned)
      .sort((a, b) => b.lastActivity - a.lastActivity);
  }

  public getMessages(roomId: string): ChatMessage[] {
    return this.messages.get(roomId) || [];
  }

  public async sendMessage(
    roomId: string, 
    text: string, 
    replyTo?: { messageId: string; text: string; senderName: string },
    media?: { type: 'image' | 'video' | 'audio'; url: string; thumbnail?: string; duration?: number }
  ): Promise<ChatMessage> {
    if (this.firebaseEnabled) {
      return this.sendMessageFirebase(roomId, text, replyTo, media);
    } else {
      return this.sendMessageLocal(roomId, text, replyTo, media);
    }
  }

  private async sendMessageFirebase(
    roomId: string, 
    text: string, 
    replyTo?: { messageId: string; text: string; senderName: string },
    media?: { type: 'image' | 'video' | 'audio'; url: string; thumbnail?: string; duration?: number }
  ): Promise<ChatMessage> {
    const db = getFirebaseDb();
    if (!db) throw new Error('Firebase DB not available');

    const messageData = {
      text,
      senderId: this.currentUserId,
      timestamp: serverTimestamp(),
      status: 'sending',
      isDeleted: false,
      replyTo,
      reactions: [],
      media,
    };

    const ref = await addDoc(collection(db, 'chats', roomId, 'messages'), messageData);
    
    const message: ChatMessage = {
      id: ref.id,
      text,
      senderId: this.currentUserId,
      timestamp: Date.now(),
      status: 'sending',
      isDeleted: false,
      replyTo,
      reactions: [],
      media,
    };

    // Update room's last message and activity
    await updateDoc(doc(db, 'chats', roomId), {
      lastMessage: messageData,
      lastActivity: serverTimestamp(),
    });

    this.emit('message', { roomId, message });
    this.simulateMessageStatus(message.id, roomId);
    
    return message;
  }

  private async sendMessageLocal(
    roomId: string, 
    text: string, 
    replyTo?: { messageId: string; text: string; senderName: string },
    media?: { type: 'image' | 'video' | 'audio'; url: string; thumbnail?: string; duration?: number }
  ): Promise<ChatMessage> {
    this.messageIdCounter++;
    const message: ChatMessage = {
      id: `${Date.now()}-${this.messageIdCounter}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      senderId: this.currentUserId,
      timestamp: Date.now(),
      status: 'sending',
      isDeleted: false,
      replyTo,
      reactions: [],
      media,
    };

    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []);
    }
    this.messages.get(roomId)!.push(message);

    // Update chat room
    const chatRoom = this.chatRooms.get(roomId);
    if (chatRoom) {
      chatRoom.lastMessage = message;
      chatRoom.lastActivity = Date.now();
      this.chatRooms.set(roomId, chatRoom);
    }

    await this.saveChatHistory();
    this.emit('message', { roomId, message });
    
    // Simulate message status progression
    this.simulateMessageStatus(message.id, roomId);
    
    // Simulate user response
    this.simulateUserResponse(roomId, text);
    
    return message;
  }

  private simulateMessageStatus(messageId: string, roomId: string) {
    // Simulate message status progression: sending -> sent -> delivered -> read
    const statuses: Array<'sent' | 'delivered' | 'read'> = ['sent', 'delivered', 'read'];
    let statusIndex = 0;

    const updateStatus = () => {
      if (statusIndex < statuses.length) {
        const newStatus = statuses[statusIndex];
        this.updateMessageStatus(roomId, messageId, newStatus);
        statusIndex++;
        
        if (statusIndex < statuses.length) {
          const timer = setTimeout(updateStatus, 1000 + Math.random() * 2000);
          this.messageStatusTimers.set(messageId, timer);
        }
      }
    };

    const timer = setTimeout(updateStatus, 500 + Math.random() * 1000);
    this.messageStatusTimers.set(messageId, timer);
  }

  public updateMessageStatus(roomId: string, messageId: string, status: 'sent' | 'delivered' | 'read') {
    const messages = this.messages.get(roomId);
    if (messages) {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        messages[messageIndex].status = status;
        this.emit('messageStatusUpdate', { roomId, messageId, status });
        
        if (this.firebaseEnabled) {
          // Update in Firebase
          const db = getFirebaseDb();
          if (db) {
            updateDoc(doc(db, 'chats', roomId, 'messages', messageId), { status });
          }
        } else {
          this.saveChatHistory();
        }
      }
    }
  }

  public async addReaction(roomId: string, messageId: string, emoji: string): Promise<boolean> {
    const reaction: MessageReaction = {
      emoji,
      userId: this.currentUserId,
      userName: 'You',
    };

    if (this.firebaseEnabled) {
      const db = getFirebaseDb();
      if (!db) return false;
      
      try {
        const messageRef = doc(db, 'chats', roomId, 'messages', messageId);
        const message = await getDocs(query(collection(db, 'chats', roomId, 'messages'), where('__name__', '==', messageId)));
        
        if (!message.empty) {
          const messageData = message.docs[0].data();
          const reactions = messageData.reactions || [];
          reactions.push(reaction);
          
          await updateDoc(messageRef, { reactions });
          this.emit('reactionAdded', { roomId, messageId, reaction });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error adding reaction:', error);
        return false;
      }
    } else {
      const messages = this.messages.get(roomId);
      if (messages) {
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          messages[messageIndex].reactions.push(reaction);
          await this.saveChatHistory();
          this.emit('reactionAdded', { roomId, messageId, reaction });
          return true;
        }
      }
      return false;
    }
  }

  public async deleteMessage(roomId: string, messageId: string): Promise<boolean> {
    if (this.firebaseEnabled) {
      const db = getFirebaseDb();
      if (!db) return false;
      
      try {
        await updateDoc(doc(db, 'chats', roomId, 'messages', messageId), { isDeleted: true });
        this.emit('messageDeleted', { roomId, messageId });
        return true;
      } catch (error) {
        console.error('Error deleting message:', error);
        return false;
      }
    } else {
      const messages = this.messages.get(roomId);
      if (messages) {
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          messages[messageIndex].isDeleted = true;
          await this.saveChatHistory();
          this.emit('messageDeleted', { roomId, messageId });
          return true;
        }
      }
      return false;
    }
  }

  public setTyping(roomId: string, userId: string, isTyping: boolean) {
    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }
    
    if (isTyping) {
      this.typingUsers.get(roomId)!.add(userId);
    } else {
      this.typingUsers.get(roomId)!.delete(userId);
    }
    
    this.emit('typing', { roomId, userId, isTyping });
  }

  public getTypingUsers(roomId: string): string[] {
    return Array.from(this.typingUsers.get(roomId) || []);
  }

  public markAsRead(roomId: string) {
    const chatRoom = this.chatRooms.get(roomId);
    if (chatRoom) {
      chatRoom.unreadCount = 0;
      this.chatRooms.set(roomId, chatRoom);
      this.emit('unreadUpdate', { roomId, unreadCount: 0 });
    }
  }

  public getUnreadCount(roomId: string): number {
    return this.chatRooms.get(roomId)?.unreadCount || 0;
  }

  public togglePinChat(roomId: string) {
    const chatRoom = this.chatRooms.get(roomId);
    if (chatRoom) {
      chatRoom.isPinned = !chatRoom.isPinned;
      this.chatRooms.set(roomId, chatRoom);
      this.emit('chatPinned', { roomId, isPinned: chatRoom.isPinned });
    }
  }

  public toggleMuteChat(roomId: string) {
    const chatRoom = this.chatRooms.get(roomId);
    if (chatRoom) {
      chatRoom.isMuted = !chatRoom.isMuted;
      this.chatRooms.set(roomId, chatRoom);
      this.emit('chatMuted', { roomId, isMuted: chatRoom.isMuted });
    }
  }

  private async simulateUserResponse(roomId: string, triggerMessage: string) {
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const delay = 2000 + Math.random() * 3000;
    
    setTimeout(async () => {
      const response = this.generateContextualResponse(triggerMessage, randomUser.fullName);
      
      this.messageIdCounter++;
      const message: ChatMessage = {
        id: `${Date.now()}-${this.messageIdCounter}-${Math.random().toString(36).substr(2, 9)}`,
        text: response,
        senderId: randomUser.id,
        timestamp: Date.now(),
        status: 'sending',
        isDeleted: false,
        reactions: [],
      };

      if (!this.messages.has(roomId)) {
        this.messages.set(roomId, []);
      }
      this.messages.get(roomId)!.push(message);

      const chatRoom = this.chatRooms.get(roomId);
      if (chatRoom) {
        chatRoom.lastMessage = message;
        chatRoom.lastActivity = Date.now();
        chatRoom.unreadCount++;
        this.chatRooms.set(roomId, chatRoom);
      }

      await this.saveChatHistory();
      this.emit('message', { roomId, message });
      this.simulateMessageStatus(message.id, roomId);
    }, delay);
  }

  private generateContextualResponse(triggerMessage: string, userName: string): string {
    const lowerMessage = triggerMessage.toLowerCase();
    
    if (lowerMessage.includes('burger') || lowerMessage.includes('food')) {
      const responses = [
        "I'm definitely in! 🍔",
        "That sounds amazing! What time?",
        "Count me in for some burgers!",
        "I've been craving burgers all day!",
        "Perfect choice! Their veggie burger is 🔥",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('when')) {
      const responses = [
        "I'm free around 7 PM!",
        "How about 8:30?",
        "I can do anytime after 6!",
        "7:30 works perfectly for me!",
        "I'm flexible, whatever works for everyone!",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (lowerMessage.includes('study') || lowerMessage.includes('work')) {
      const responses = [
        "I need a study break too!",
        "Perfect timing for some brain food!",
        "I'll bring my laptop and we can work together!",
        "Great idea! Food + productivity = success!",
        "I'm totally down for a study session!",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    const genericResponses = [
      "Sounds good to me! 👍",
      "I'm in! 😊",
      "That works for me!",
      "Count me in!",
      "Perfect! 👌",
      "I'm definitely down for that!",
      "Sounds like a plan!",
      "I'm excited! 🎉",
    ];
    
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }

  private startSimulation() {
    setInterval(() => {
      const roomIds = Array.from(this.chatRooms.keys());
      const randomRoomId = roomIds[Math.floor(Math.random() * roomIds.length)];
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      
      const randomMessages = [
        "Anyone up for dinner later?",
        "I'm starving! 😅",
        "What's everyone's plan for tonight?",
        "I heard they have new menu items!",
        "Perfect weather for outdoor seating!",
        "I'm bringing some friends!",
        "Can't wait to see everyone!",
        "This place is always packed on weekends!",
        "I love their atmosphere!",
        "Anyone want to split an appetizer?",
      ];
      
      const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      this.simulateUserResponse(randomRoomId, randomMessage);
    }, 30000 + Math.random() * 30000);
  }

  public activateRoom(roomId: string) {
    if (!this.firebaseEnabled) return;
    if (this.roomUnsubscribers.has(roomId)) return;

    const db = getFirebaseDb();
    if (!db) return;

    const qRef = query(
      collection(db, 'chats', roomId, 'messages'), 
      orderBy('timestamp', 'asc')
    );
    
    const unsub = onSnapshot(qRef, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as any;
        msgs.push({
          id: docSnap.id,
          text: data.text,
          senderId: data.senderId,
          timestamp: data.timestamp?.toMillis?.() || data.timestamp || Date.now(),
          status: data.status || 'sent',
          isDeleted: data.isDeleted || false,
          replyTo: data.replyTo,
          reactions: data.reactions || [],
          media: data.media,
        });
      });
      
      this.messages.set(roomId, msgs);
      
      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        this.emit('message', { roomId, message: last });
      }
    });
    
    this.roomUnsubscribers.set(roomId, unsub);
  }

  public deactivateRoom(roomId: string) {
    if (!this.firebaseEnabled) return;
    
    const unsub = this.roomUnsubscribers.get(roomId);
    if (unsub) {
      unsub();
      this.roomUnsubscribers.delete(roomId);
    }
  }

  public subscribe(event: string, callback: Function) {
    this.on(event, callback);
  }

  public unsubscribe(event: string, callback: Function) {
    this.off(event, callback);
  }

  public cleanup() {
    // Clear all timers
    this.messageStatusTimers.forEach(timer => clearTimeout(timer));
    this.messageStatusTimers.clear();
    
    // Deactivate all rooms
    this.roomUnsubscribers.forEach(unsub => unsub());
    this.roomUnsubscribers.clear();
  }
}

// Export singleton instance
export const instagramChatService = new InstagramChatService();

// Export types
export type { ChatUser, ChatMessage, ChatRoom, MessageReaction, ChatNotification };
