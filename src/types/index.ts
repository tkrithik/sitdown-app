export interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  price_range: string;
  rating: number;
  address: string;
  phone: string;
  hours: {
    [key: string]: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  dietary_options: string[];
  features: string[];
  description: string;
  images: string[];
  popular_dishes: string[];
  distance?: number;
}

export interface FilterOptions {
  dietary: string[];
  priceRange: string[];
  cuisineType: string[];
  radius: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  name: string;
  savedRestaurants: string[];
  likedRestaurants: string[];
}

// Instagram-style Chat Types
export interface ChatUser {
  id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  isOnline: boolean;
  lastSeen: number;
  isVerified: boolean;
}

export interface ChatMessage {
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

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface ChatRoom {
  id: string;
  type: 'direct' | 'group';
  name?: string; // For group chats
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

export interface ChatNotification {
  id: string;
  type: 'message' | 'reaction' | 'typing' | 'online';
  roomId: string;
  data: any;
  timestamp: number;
}

