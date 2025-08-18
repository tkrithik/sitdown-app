import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getFirebaseRealtimeDb, isFirebaseEnabled 
} from './firebase';
import { 
  ref, set, push, onValue, off, serverTimestamp, Database 
} from 'firebase/database';
import { 
  ChatUser, ChatMessage, ChatRoom, MessageReaction 
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

// Device user interface
interface DeviceUser {
  deviceId: string;
  displayName: string;
  isOnline: boolean;
  lastSeen: number;
  profilePicture?: string;
}

class MultiDeviceChatService extends EventEmitter {
  private chatRooms: Map<string, ChatRoom> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();
  private currentDevice: DeviceUser | null = null;
  private typingUsers: Map<string, Set<string>> = new Map();
  private firebaseEnabled: boolean = false;
  private database: Database | null = null;
  private roomUnsubscribers: Map<string, () => void> = new Map();
  private messageStatusTimers: Map<string, NodeJS.Timeout> = new Map();
  private messageIdCounter: number = 0;
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.firebaseEnabled = isFirebaseEnabled();
    this.initializeService();
  }

  private async initializeService() {
    if (this.firebaseEnabled) {
      try {
        // Get Firebase Realtime Database
        this.database = getFirebaseRealtimeDb();
        if (this.database) {
          console.log('Firebase Realtime Database initialized');
        } else {
          console.log('Firebase Realtime Database not available, using local mode');
          this.firebaseEnabled = false;
        }
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        this.firebaseEnabled = false;
      }
    }

    await this.initializeDevice();
    this.initializeChatRooms();
    
    if (this.firebaseEnabled && this.database) {
      this.setupFirebaseListeners();
    } else {
      this.loadChatHistory();
      this.startSimulation();
    }

    this.isInitialized = true;
  }

  private async initializeDevice() {
    try {
      // Check if device is already initialized
      const existingDevice = await AsyncStorage.getItem('device_user');
      if (existingDevice) {
        this.currentDevice = JSON.parse(existingDevice);
        console.log('Using existing device:', this.currentDevice);
        return;
      }

      // Create new device user
      const deviceId = `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      this.currentDevice = {
        deviceId,
        displayName: 'Anonymous',
        isOnline: true,
        lastSeen: Date.now(),
        profilePicture: `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
      };

      // Store device info
      await AsyncStorage.setItem('device_user', JSON.stringify(this.currentDevice));
      console.log('New device created:', this.currentDevice);
    } catch (error) {
      console.error('Error initializing device:', error);
      // Fallback to anonymous device
      this.currentDevice = {
        deviceId: `fallback-${Date.now()}`,
        displayName: 'Anonymous',
        isOnline: true,
        lastSeen: Date.now(),
        profilePicture: 'https://picsum.photos/200/200?random=999',
      };
    }
  }

  public async setDisplayName(displayName: string): Promise<boolean> {
    if (!this.currentDevice) return false;

    try {
      this.currentDevice.displayName = displayName;
      await AsyncStorage.setItem('device_user', JSON.stringify(this.currentDevice));
      
      // Update in Firebase if available
      if (this.firebaseEnabled && this.database) {
        const userRef = ref(this.database, `users/${this.currentDevice.deviceId}`);
        await set(userRef, {
          displayName,
          isOnline: true,
          lastSeen: serverTimestamp(),
          profilePicture: this.currentDevice.profilePicture,
        });
      }

      this.emit('userUpdated', this.currentDevice);
      return true;
    } catch (error) {
      console.error('Error updating display name:', error);
      return false;
    }
  }

  public getCurrentDevice(): DeviceUser | null {
    return this.currentDevice;
  }

  private initializeChatRooms() {
    // Campus Burgers Group Chat
    const campusBurgersChat: ChatRoom = {
      id: 'campus-burgers-group',
      type: 'group',
      name: 'Campus Burgers Group',
      participants: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      lastActivity: Date.now(),
      groupInfo: {
        description: 'Group for Campus Burgers meetups and discussions',
        createdBy: 'system',
        createdAt: Date.now() - 86400000, // 1 day ago
        admins: ['system'],
      },
    };

    // The Study Hall Group Chat
    const studyHallChat: ChatRoom = {
      id: 'study-hall-group',
      type: 'group',
      name: 'The Study Hall Group',
      participants: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      lastActivity: Date.now(),
      groupInfo: {
        description: 'Study group for The Study Hall restaurant',
        createdBy: 'system',
        createdAt: Date.now() - 172800000, // 2 days ago
        admins: ['system'],
      },
    };

    this.chatRooms.set(campusBurgersChat.id, campusBurgersChat);
    this.chatRooms.set(studyHallChat.id, studyHallChat);
  }

  private setupFirebaseListeners() {
    if (!this.database) return;

    // Listen for online users
    this.listenForOnlineUsers();
    
    // Listen for new messages in all rooms
    this.chatRooms.forEach(room => {
      this.activateRoom(room.id);
    });
  }

  private listenForOnlineUsers() {
    if (!this.database) return;

    const usersRef = ref(this.database, 'users');
    onValue(usersRef, (snapshot) => {
      const users: DeviceUser[] = [];
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData && userData.deviceId !== this.currentDevice?.deviceId) {
          users.push({
            deviceId: childSnapshot.key!,
            displayName: userData.displayName || 'Anonymous',
            isOnline: userData.isOnline || false,
            lastSeen: userData.lastSeen || Date.now(),
            profilePicture: userData.profilePicture,
          });
        }
      });

      // Update chat room participants
      this.chatRooms.forEach((room, roomId) => {
        if (room.type === 'group') {
          room.participants = users.map(user => ({
            id: user.deviceId,
            username: user.displayName.toLowerCase().replace(/\s+/g, '_'),
            fullName: user.displayName,
            profilePicture: user.profilePicture || 'https://picsum.photos/200/200?random=999',
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
            isVerified: false,
          }));
          this.chatRooms.set(roomId, room);
        }
      });

      this.emit('usersUpdated', users);
    });
  }

  private async loadChatHistory() {
    try {
      const savedMessages = await AsyncStorage.getItem('multi_device_chat_messages');
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
      await AsyncStorage.setItem('multi_device_chat_messages', JSON.stringify(messagesObj));
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
    if (!this.currentDevice) {
      throw new Error('Device not initialized');
    }

    if (this.firebaseEnabled && this.database) {
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
    if (!this.database || !this.currentDevice) {
      throw new Error('Firebase or device not available');
    }

    this.messageIdCounter++;
    const messageId = `${Date.now()}-${this.messageIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
    
    const messageData = {
      id: messageId,
      text,
      senderId: this.currentDevice.deviceId,
      senderName: this.currentDevice.displayName,
      timestamp: serverTimestamp(),
      status: 'sending',
      isDeleted: false,
      replyTo,
      reactions: [],
      media,
    };

    // Add to Firebase
    const messagesRef = ref(this.database, `chats/${roomId}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, messageData);
    
    const message: ChatMessage = {
      id: messageId,
      text,
      senderId: this.currentDevice.deviceId,
      timestamp: Date.now(),
      status: 'sending',
      isDeleted: false,
      replyTo,
      reactions: [],
      media,
    };

    // Update room's last message and activity
    const roomRef = ref(this.database, `chats/${roomId}`);
    await set(ref(roomRef, 'lastMessage'), messageData);
    await set(ref(roomRef, 'lastActivity'), serverTimestamp());

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
    if (!this.currentDevice) {
      throw new Error('Device not initialized');
    }

    this.messageIdCounter++;
    const message: ChatMessage = {
      id: `${Date.now()}-${this.messageIdCounter}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      senderId: this.currentDevice.deviceId,
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
        
        if (this.firebaseEnabled && this.database) {
          // Update in Firebase
          const messageRef = ref(this.database, `chats/${roomId}/messages/${messageId}`);
          set(ref(messageRef, 'status'), status);
        } else {
          this.saveChatHistory();
        }
      }
    }
  }

  public async addReaction(roomId: string, messageId: string, emoji: string): Promise<boolean> {
    if (!this.currentDevice) return false;

    const reaction: MessageReaction = {
      emoji,
      userId: this.currentDevice.deviceId,
      userName: this.currentDevice.displayName,
    };

    if (this.firebaseEnabled && this.database) {
      try {
        const messageRef = ref(this.database, `chats/${roomId}/messages/${messageId}`);
        const message = await this.getFirebaseMessage(roomId, messageId);
        
        if (message) {
          const reactions = message.reactions || [];
          reactions.push(reaction);
          
          await set(ref(messageRef, 'reactions'), reactions);
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

  private async getFirebaseMessage(roomId: string, messageId: string): Promise<any> {
    if (!this.database) return null;
    
    try {
      const messageRef = ref(this.database, `chats/${roomId}/messages/${messageId}`);
      return new Promise((resolve) => {
        onValue(messageRef, (snapshot) => {
          resolve(snapshot.val());
        }, { onlyOnce: true });
      });
    } catch (error) {
      console.error('Error getting Firebase message:', error);
      return null;
    }
  }

  public async deleteMessage(roomId: string, messageId: string): Promise<boolean> {
    if (this.firebaseEnabled && this.database) {
      try {
        const messageRef = ref(this.database, `chats/${roomId}/messages/${messageId}`);
        await set(ref(messageRef, 'isDeleted'), true);
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
    // Only simulate responses in local mode
    if (this.firebaseEnabled) return;

    const mockNames = ['Sarah', 'Mike', 'Emma', 'Alex', 'Jessica'];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const delay = 2000 + Math.random() * 3000;
    
    setTimeout(async () => {
      const response = this.generateContextualResponse(triggerMessage, randomName);
      
      this.messageIdCounter++;
      const message: ChatMessage = {
        id: `${Date.now()}-${this.messageIdCounter}-${Math.random().toString(36).substr(2, 9)}`,
        text: response,
        senderId: `mock-${randomName.toLowerCase()}`,
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
    // Only simulate in local mode
    if (this.firebaseEnabled) return;

    setInterval(() => {
      const roomIds = Array.from(this.chatRooms.keys());
      const randomRoomId = roomIds[Math.floor(Math.random() * roomIds.length)];
      const mockNames = ['Sarah', 'Mike', 'Emma', 'Alex', 'Jessica'];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      
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
    if (!this.firebaseEnabled || !this.database) return;
    if (this.roomUnsubscribers.has(roomId)) return;

    const messagesRef = ref(this.database, `chats/${roomId}/messages`);
    const unsub = onValue(messagesRef, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.val();
        if (data && !data.isDeleted) {
          msgs.push({
            id: data.id,
            text: data.text,
            senderId: data.senderId,
            timestamp: data.timestamp || Date.now(),
            status: data.status || 'sent',
            isDeleted: data.isDeleted || false,
            replyTo: data.replyTo,
            reactions: data.reactions || [],
            media: data.media,
          });
        }
      });
      
      // Sort by timestamp
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      
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

  public isReady(): boolean {
    return this.isInitialized && this.currentDevice !== null;
  }
}

// Export singleton instance
export const multiDeviceChatService = new MultiDeviceChatService();

// Export types
export type { DeviceUser };
