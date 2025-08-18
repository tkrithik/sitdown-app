# Instagram-Style Chat System for Sit Down App

## Overview

This document describes the new Instagram-style chat system that has been implemented to replace the previous chat service. The new system provides a modern, feature-rich messaging experience similar to Instagram Direct Messages.

## Features

### 🚀 Core Messaging Features
- **Real-time messaging** with typing indicators
- **Message status tracking** (sending → sent → delivered → read)
- **Reply to messages** with preview
- **Message reactions** (❤️, 👍, 😊, 🎉, 🔥, 👏)
- **Message deletion** (soft delete)
- **Media support** (images, videos, audio - structure ready)

### 💬 Chat Management
- **Group chats** for restaurant meetups
- **Direct messages** between users
- **Pinned chats** for important conversations
- **Chat muting** options
- **Online status indicators**
- **Unread message counts**

### 🎨 Instagram-Style UI
- **Dark theme** with modern design
- **Bubble chat interface** with rounded corners
- **Avatar management** with online indicators
- **Date separators** for message organization
- **Smooth animations** and transitions

## Architecture

### Services

#### `instagramChatService.ts`
The main chat service that handles:
- Message sending/receiving
- Real-time updates via EventEmitter
- Firebase integration (when enabled)
- Local storage fallback
- Mock user simulation for development

#### `chatService.ts` (Legacy)
The previous chat service - kept for backward compatibility

### Screens

#### `InstagramChatScreen.tsx`
The main chat interface featuring:
- Message bubbles with status indicators
- Reply functionality
- Reaction system
- Typing indicators
- Online member display

#### `ChatListScreen.tsx`
The chat list interface showing:
- All active conversations
- Pinned chats section
- Unread message badges
- Online status indicators
- Last message previews

### Types

#### `ChatMessage`
```typescript
interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isDeleted: boolean;
  replyTo?: {
    messageId: string;
    text: string;
    senderName: string;
  };
  reactions: MessageReaction[];
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
    duration?: number;
  };
}
```

#### `ChatRoom`
```typescript
interface ChatRoom {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  lastActivity: number;
  groupInfo?: {
    description: string;
    createdBy: string;
    createdAt: number;
    admins: string[];
  };
}
```

## Usage

### Starting a Chat

#### From Social Screen
```typescript
navigation.navigate('InstagramChat', {
  restaurantName: 'Campus Burgers',
  groupId: 'campus-burgers-group'
});
```

#### From Chat List
```typescript
navigation.navigate('InstagramChat', {
  restaurantName: chatRoom.name,
  groupId: chatRoom.id
});
```

### Sending Messages

```typescript
// Simple text message
await instagramChatService.sendMessage(roomId, 'Hello!');

// Message with reply
await instagramChatService.sendMessage(roomId, 'That sounds great!', {
  messageId: 'msg123',
  text: 'Want to grab dinner?',
  senderName: 'Sarah'
});

// Message with media
await instagramChatService.sendMessage(roomId, 'Check this out!', undefined, {
  type: 'image',
  url: 'https://example.com/image.jpg'
});
```

### Adding Reactions

```typescript
await instagramChatService.addReaction(roomId, messageId, '❤️');
```

### Managing Chats

```typescript
// Pin/unpin a chat
instagramChatService.togglePinChat(roomId);

// Mute/unmute a chat
instagramChatService.toggleMuteChat(roomId);

// Mark messages as read
instagramChatService.markAsRead(roomId);
```

## Navigation

The new chat system is integrated into the main navigation:

- **Messages Tab**: Shows the chat list (`ChatListScreen`)
- **InstagramChat Screen**: Individual chat conversations
- **Social Screen**: Quick access to start chats about restaurants

## Firebase Integration

When Firebase is enabled, the chat system:
- Stores messages in Firestore
- Provides real-time synchronization
- Handles user authentication
- Manages chat room metadata

## Local Development

For development without Firebase:
- Mock users are automatically generated
- Messages are stored in AsyncStorage
- Simulated responses create realistic chat flow
- All features work offline

## Styling

The chat system uses a consistent dark theme:
- **Primary**: #000000 (Black)
- **Secondary**: #111827 (Dark Gray)
- **Accent**: #3b82f6 (Blue)
- **Text**: #ffffff (White)
- **Muted**: #9ca3af (Light Gray)

## Future Enhancements

- [ ] **Push notifications** for new messages
- [ ] **File sharing** (documents, PDFs)
- [ ] **Voice messages** recording and playback
- [ ] **Video calls** integration
- [ ] **Message search** functionality
- [ ] **Chat backup** and export
- [ ] **Custom emoji** reactions
- [ ] **Message threading** for complex conversations

## Migration from Old System

The old `chatService.ts` is still available for backward compatibility. To migrate:

1. Replace imports from `chatService` to `instagramChatService`
2. Update navigation to use `InstagramChat` instead of `Chat`
3. Update message handling to use new types
4. Remove old chat-related code

## Troubleshooting

### Common Issues

1. **Messages not appearing**: Check if the room is activated with `activateRoom()`
2. **Typing indicators not working**: Ensure `setTyping()` is called correctly
3. **Reactions not updating**: Verify event subscriptions are active
4. **Firebase errors**: Check Firebase configuration and permissions

### Debug Mode

Enable debug logging by setting:
```typescript
// In instagramChatService.ts
private debugMode = true;
```

## Contributing

When adding new features to the chat system:

1. Follow the existing TypeScript patterns
2. Add proper error handling
3. Include unit tests for new functionality
4. Update this documentation
5. Ensure backward compatibility

## License

This chat system is part of the Sit Down App and follows the same licensing terms.
