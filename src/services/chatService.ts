import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseDb, isFirebaseEnabled } from './firebase';
import { 
  collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, writeBatch, getDocs
} from 'firebase/firestore';

// Custom Event Emitter for React Native
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

// Chat message interface
export interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: number;
  isCurrentUser: boolean;
}

// Chat room interface
export interface ChatRoom {
  id: string;
  name: string;
  type: 'group' | 'direct';
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

// Chat user interface
export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: number;
}

// Mock users for simulation
const mockUsers: ChatUser[] = [
  {
    id: 'user1',
    name: 'Sarah M.',
    avatar: 'https://picsum.photos/100/100?random=1',
    isOnline: true,
    lastSeen: Date.now(),
  },
  {
    id: 'user2',
    name: 'Mike J.',
    avatar: 'https://picsum.photos/100/100?random=2',
    isOnline: true,
    lastSeen: Date.now(),
  },
  {
    id: 'user3',
    name: 'Emma L.',
    avatar: 'https://picsum.photos/100/100?random=3',
    isOnline: false,
    lastSeen: Date.now() - 300000, // 5 minutes ago
  },
  {
    id: 'user4',
    name: 'Alex K.',
    avatar: 'https://picsum.photos/100/100?random=4',
    isOnline: true,
    lastSeen: Date.now(),
  },
  {
    id: 'user5',
    name: 'Jessica R.',
    avatar: 'https://picsum.photos/100/100?random=5',
    isOnline: false,
    lastSeen: Date.now() - 600000, // 10 minutes ago
  },
];

// Chat service class
class ChatService extends EventEmitter {
  private chatRooms: Map<string, ChatRoom> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();
  private currentUserId: string = 'currentUser';
  private typingUsers: Map<string, Set<string>> = new Map();
  private isSimulating: boolean = false;
  private firebaseEnabled: boolean = false;
  private roomUnsubscribers: Map<string, () => void> = new Map();

  constructor() {
    super();
    this.initializeChatRooms();
    this.initializeDeviceId();
    this.firebaseEnabled = isFirebaseEnabled();
    if (this.firebaseEnabled) {
      // When Firebase is enabled, rely on Firestore for persistence and realtime
      this.isSimulating = false;
    } else {
      // Local-only mode with AsyncStorage and simulated users
      this.loadChatHistory();
      this.startSimulation();
    }
  }

  private async initializeDeviceId() {
    try {
      const existing = await AsyncStorage.getItem('device_id');
      if (existing) {
        this.currentUserId = existing;
        return;
      }
      const id = this.generateDeviceId();
      await AsyncStorage.setItem('device_id', id);
      this.currentUserId = id;
    } catch {}
  }

  private generateDeviceId(): string {
    // Simple random ID
    return 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // Initialize default chat rooms
  private initializeChatRooms() {
    // Group chat for Campus Burgers
    const campusBurgersChat: ChatRoom = {
      id: 'campus-burgers-group',
      name: 'Campus Burgers Group',
      type: 'group',
      participants: mockUsers,
      unreadCount: 0,
    };

    // Group chat for The Study Hall
    const studyHallChat: ChatRoom = {
      id: 'study-hall-group',
      name: 'The Study Hall Group',
      type: 'group',
      participants: mockUsers,
      unreadCount: 0,
    };

    // Direct message with Sarah
    const sarahChat: ChatRoom = {
      id: 'sarah-direct',
      name: 'Sarah M.',
      type: 'direct',
      participants: [mockUsers[0]],
      unreadCount: 0,
    };

    this.chatRooms.set(campusBurgersChat.id, campusBurgersChat);
    this.chatRooms.set(studyHallChat.id, studyHallChat);
    this.chatRooms.set(sarahChat.id, sarahChat);
  }

  // Load chat history from storage
  private async loadChatHistory() {
    try {
      const savedMessages = await AsyncStorage.getItem('chat_messages');
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

  // Save chat history to storage
  private async saveChatHistory() {
    try {
      const messagesObj: Record<string, ChatMessage[]> = {};
      this.messages.forEach((messages, roomId) => {
        messagesObj[roomId] = messages;
      });
      await AsyncStorage.setItem('chat_messages', JSON.stringify(messagesObj));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  // Get all chat rooms
  public getChatRooms(): ChatRoom[] {
    return Array.from(this.chatRooms.values());
  }

  // Get messages for a specific chat room
  public getMessages(roomId: string): ChatMessage[] {
    return this.messages.get(roomId) || [];
  }

  // Send a message
  public async sendMessage(roomId: string, text: string): Promise<ChatMessage> {
    if (this.firebaseEnabled) {
      const db = getFirebaseDb();
      if (!db) throw new Error('Firebase DB not available');
      const payload = {
        text,
        userId: this.currentUserId,
        userName: 'You',
        userAvatar: 'https://picsum.photos/100/100?random=999',
        timestamp: Date.now(),
      };
      const ref = await addDoc(collection(db, 'chats', roomId, 'messages'), payload);
      const message: ChatMessage = {
        id: ref.id,
        text: payload.text,
        userId: payload.userId,
        userName: payload.userName,
        userAvatar: payload.userAvatar,
        timestamp: payload.timestamp,
        isCurrentUser: true,
      };
      // Optimistic emit; snapshot will also arrive
      this.emit('message', { roomId, message });
      return message;
    } else {
      const message: ChatMessage = {
        id: Date.now().toString(),
        text,
        userId: this.currentUserId,
        userName: 'You',
        userAvatar: 'https://picsum.photos/100/100?random=999',
        timestamp: Date.now(),
        isCurrentUser: true,
      };
  
      if (!this.messages.has(roomId)) {
        this.messages.set(roomId, []);
      }
      this.messages.get(roomId)!.push(message);
  
      const chatRoom = this.chatRooms.get(roomId);
      if (chatRoom) {
        chatRoom.lastMessage = message;
        this.chatRooms.set(roomId, chatRoom);
      }
  
      await this.saveChatHistory();
      this.emit('message', { roomId, message });
      this.simulateUserResponse(roomId, text);
      return message;
    }
  }

  // Simulate other users responding to messages
  private async simulateUserResponse(roomId: string, triggerMessage: string) {
    if (this.isSimulating) return;
    
    this.isSimulating = true;
    
    // Random delay to simulate thinking
    const delay = 2000 + Math.random() * 3000;
    
    setTimeout(async () => {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      
      // Generate contextual response
      const response = this.generateContextualResponse(triggerMessage, randomUser.name);
      
      const message: ChatMessage = {
        id: Date.now().toString(),
        text: response,
        userId: randomUser.id,
        userName: randomUser.name,
        userAvatar: randomUser.avatar,
        timestamp: Date.now(),
        isCurrentUser: false,
      };

      // Add message to room
      if (!this.messages.has(roomId)) {
        this.messages.set(roomId, []);
      }
      this.messages.get(roomId)!.push(message);

      // Update last message in chat room
      const chatRoom = this.chatRooms.get(roomId);
      if (chatRoom) {
        chatRoom.lastMessage = message;
        chatRoom.unreadCount++;
        this.chatRooms.set(roomId, chatRoom);
      }

      // Save to storage
      await this.saveChatHistory();

      // Emit message event
      this.emit('message', { roomId, message });

      this.isSimulating = false;
    }, delay);
  }

  // Generate contextual responses based on the trigger message
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
    
    // Generic responses
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

  // Start simulation of user activity
  private startSimulation() {
    // Simulate random messages every 30-60 seconds
    setInterval(() => {
      if (this.isSimulating) return;
      
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

  // Set typing indicator
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

  // Get typing users for a room
  public getTypingUsers(roomId: string): string[] {
    return Array.from(this.typingUsers.get(roomId) || []);
  }

  // Mark messages as read
  public markAsRead(roomId: string) {
    const chatRoom = this.chatRooms.get(roomId);
    if (chatRoom) {
      chatRoom.unreadCount = 0;
      this.chatRooms.set(roomId, chatRoom);
      this.emit('unreadUpdate', { roomId, unreadCount: 0 });
    }
  }

  // Get unread count for a room
  public getUnreadCount(roomId: string): number {
    return this.chatRooms.get(roomId)?.unreadCount || 0;
  }

  // Delete a message
  public async deleteMessage(roomId: string, messageId: string): Promise<boolean> {
    if (this.firebaseEnabled) {
      const db = getFirebaseDb();
      if (!db) return false;
      try {
        await deleteDoc(doc(db, 'chats', roomId, 'messages', messageId));
        this.emit('messageDeleted', { roomId, messageId });
        return true;
      } catch {
        return false;
      }
    } else {
      const messages = this.messages.get(roomId);
      if (messages) {
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          messages.splice(messageIndex, 1);
          await this.saveChatHistory();
          this.emit('messageDeleted', { roomId, messageId });
          return true;
        }
      }
      return false;
    }
  }

  // Clear chat history for a room
  public async clearChat(roomId: string): Promise<void> {
    if (this.firebaseEnabled) {
      const db = getFirebaseDb();
      if (!db) return;
      const q = query(collection(db, 'chats', roomId, 'messages'));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      this.emit('chatCleared', { roomId });
    } else {
      this.messages.set(roomId, []);
      await this.saveChatHistory();
      this.emit('chatCleared', { roomId });
    }
  }

  // Get online users for a room
  public getOnlineUsers(roomId: string): ChatUser[] {
    const chatRoom = this.chatRooms.get(roomId);
    if (chatRoom) {
      return chatRoom.participants.filter(user => user.isOnline);
    }
    return [];
  }

  // Update user online status
  public updateUserStatus(userId: string, isOnline: boolean) {
    mockUsers.forEach(user => {
      if (user.id === userId) {
        user.isOnline = isOnline;
        user.lastSeen = Date.now();
      }
    });
    
    this.emit('userStatusUpdate', { userId, isOnline });
  }

  // Subscribe to chat events
  public subscribe(event: string, callback: Function) {
    this.on(event, callback);
  }

  // Unsubscribe from chat events
  public unsubscribe(event: string, callback: Function) {
    this.off(event, callback);
  }

  // Activate realtime sync for a room (Firebase only)
  public activateRoom(roomId: string) {
    if (!this.firebaseEnabled) return;
    const db = getFirebaseDb();
    if (!db) return;
    if (this.roomUnsubscribers.has(roomId)) return; // already listening

    const qRef = query(collection(db, 'chats', roomId, 'messages'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(qRef, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as any;
        msgs.push({
          id: docSnap.id,
          text: data.text,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          timestamp: data.timestamp,
          isCurrentUser: data.userId === this.currentUserId,
        });
      });
      // Replace local cache
      this.messages.set(roomId, msgs);
      // Emit last message as a 'message' event to trigger UI append
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
}

// Export singleton instance
export const chatService = new ChatService();

// Export types - Note: These are now defined in ../types/index.ts
