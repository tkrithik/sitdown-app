import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WebSocketChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: number;
  isCurrentUser: boolean;
}

class WebSocketChatService {
  private messages: Map<string, WebSocketChatMessage[]> = new Map();
  private currentUserId: string = '';
  private listeners: Map<string, Function[]> = new Map();
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeDeviceId();
    this.connectWebSocket();
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

  private connectWebSocket() {
    try {
      // Connect to local WebSocket server (we'll create this)
      this.ws = new WebSocket('ws://localhost:3001');
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        // Send device info
        this.ws?.send(JSON.stringify({
          type: 'device_info',
          deviceId: this.currentUserId,
          deviceName: 'Phone'
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.log('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.log('WebSocket error:', error);
        this.attemptReconnect();
      };
    } catch (error) {
      console.log('WebSocket connection failed:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connectWebSocket();
      }, 2000 * this.reconnectAttempts);
    }
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'message':
        this.handleNewMessage(data.roomId, data.message);
        break;
      case 'messages':
        this.handleMessagesUpdate(data.roomId, data.messages);
        break;
      case 'message_deleted':
        this.handleMessageDeleted(data.roomId, data.messageId);
        break;
      case 'chat_cleared':
        this.handleChatCleared(data.roomId);
        break;
    }
  }

  private handleNewMessage(roomId: string, message: WebSocketChatMessage) {
    // Update local cache
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []);
    }
    this.messages.get(roomId)!.push(message);
    
    // Notify listeners
    this.notifyListeners(roomId, 'message', message);
  }

  private handleMessagesUpdate(roomId: string, messages: WebSocketChatMessage[]) {
    this.messages.set(roomId, messages);
    this.notifyListeners(roomId, 'messages', messages);
  }

  private handleMessageDeleted(roomId: string, messageId: string) {
    const messages = this.messages.get(roomId);
    if (messages) {
      const updated = messages.filter(msg => msg.id !== messageId);
      this.messages.set(roomId, updated);
      this.notifyListeners(roomId, 'messageDeleted', { messageId });
    }
  }

  private handleChatCleared(roomId: string) {
    this.messages.set(roomId, []);
    this.notifyListeners(roomId, 'chatCleared');
  }

  public getMessages(roomId: string): WebSocketChatMessage[] {
    return this.messages.get(roomId) || [];
  }

  public async sendMessage(roomId: string, text: string): Promise<WebSocketChatMessage> {
    const message: WebSocketChatMessage = {
      id: Date.now().toString() + '-' + this.currentUserId,
      text,
      userId: this.currentUserId,
      userName: 'You',
      userAvatar: 'https://picsum.photos/100/100?random=999',
      timestamp: Date.now(),
      isCurrentUser: true,
    };

    // Add message locally first (optimistic update)
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []);
    }
    this.messages.get(roomId)!.push(message);

    // Send via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'send_message',
        roomId,
        message
      }));
    } else {
      // Fallback: save locally if WebSocket is not available
      await this.saveMessageLocally(roomId, message);
    }

    // Notify listeners
    this.notifyListeners(roomId, 'message', message);

    return message;
  }

  private async saveMessageLocally(roomId: string, message: WebSocketChatMessage) {
    try {
      const key = `local_chat_${roomId}`;
      const existing = await AsyncStorage.getItem(key);
      const messages = existing ? JSON.parse(existing) : [];
      messages.push(message);
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.log('Error saving message locally:', error);
    }
  }

  public async deleteMessage(roomId: string, messageId: string): Promise<boolean> {
    const messages = this.messages.get(roomId);
    if (messages) {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        messages.splice(messageIndex, 1);
        
        // Send delete request via WebSocket
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'delete_message',
            roomId,
            messageId
          }));
        }
        
        this.notifyListeners(roomId, 'messageDeleted', { messageId });
        return true;
      }
    }
    return false;
  }

  public async clearChat(roomId: string): Promise<void> {
    this.messages.set(roomId, []);
    
    // Send clear request via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'clear_chat',
        roomId
      }));
    }
    
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketChatService = new WebSocketChatService();
// Types are now centralized in ../types/index.ts

