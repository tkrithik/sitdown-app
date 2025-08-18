import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FinalChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: number;
  isCurrentUser: boolean;
}

class FinalChatService {
  private messages: Map<string, FinalChatMessage[]> = new Map();
  private currentUserId: string = '';
  private listeners: Map<string, Function[]> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.initializeDeviceId();
    this.startSync();
  }

  private async initializeDeviceId() {
    try {
      const existing = await AsyncStorage.getItem('device_id');
      if (existing) {
        this.currentUserId = existing;
        return;
      }
      const id = 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      await AsyncStorage.setItem('device_id', id);
      this.currentUserId = id;
    } catch {}
  }

  private startSync() {
    // Sync messages every 2 seconds
    this.syncInterval = setInterval(() => {
      if (!this.isProcessing) {
        this.syncMessages();
      }
    }, 2000);
  }

  private async syncMessages() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const allMessages = await AsyncStorage.getItem('global_chat_messages');
      if (allMessages) {
        const parsed = JSON.parse(allMessages);
        
        Object.keys(parsed).forEach(roomId => {
          const roomMessages = parsed[roomId] || [];
          const currentMessages = this.messages.get(roomId) || [];
          
          // Only update if there are actually new messages
          if (roomMessages.length > currentMessages.length) {
            // Replace the entire message list to avoid duplicates
            this.messages.set(roomId, roomMessages);
            
            // Notify listeners of the complete update
            this.notifyListeners(roomId, 'messages', roomMessages);
          }
        });
      }
    } catch (error) {
      console.log('Sync error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async saveToGlobalStorage() {
    try {
      const messagesObj: Record<string, FinalChatMessage[]> = {};
      this.messages.forEach((messages, roomId) => {
        messagesObj[roomId] = messages;
      });
      await AsyncStorage.setItem('global_chat_messages', JSON.stringify(messagesObj));
    } catch (error) {
      console.log('Save error:', error);
    }
  }

  public getMessages(roomId: string): FinalChatMessage[] {
    return this.messages.get(roomId) || [];
  }

  public async sendMessage(roomId: string, text: string): Promise<FinalChatMessage> {
    const message: FinalChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${this.currentUserId}`,
      text,
      userId: this.currentUserId,
      userName: 'You',
      userAvatar: 'https://picsum.photos/100/100?random=999',
      timestamp: Date.now(),
      isCurrentUser: true,
    };

    // Add message locally first
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []);
    }
    this.messages.get(roomId)!.push(message);

    // Save to global storage
    await this.saveToGlobalStorage();

    // Notify listeners
    this.notifyListeners(roomId, 'message', message);

    return message;
  }

  public async deleteMessage(roomId: string, messageId: string): Promise<boolean> {
    const messages = this.messages.get(roomId);
    if (messages) {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        messages.splice(messageIndex, 1);
        await this.saveToGlobalStorage();
        this.notifyListeners(roomId, 'messageDeleted', { messageId });
        return true;
      }
    }
    return false;
  }

  public async clearChat(roomId: string): Promise<void> {
    this.messages.set(roomId, []);
    await this.saveToGlobalStorage();
    this.notifyListeners(roomId, 'chatCleared');
  }

  public on(roomId: string, event: string, callback: Function) {
    const key = `${roomId}:${event}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback);
  }

  public off(roomId: string, event: string, callback: Function) {
    const key = `${roomId}:${event}`;
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(roomId: string, event: string, data?: any) {
    const key = `${roomId}:${event}`;
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  public destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export const finalChatService = new FinalChatService();
// Types are now centralized in ../types/index.ts

