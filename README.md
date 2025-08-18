# 🍽️ SitDown - Restaurant Discovery & Social Chat App

A modern React Native app that combines restaurant discovery with an Instagram-style universal chat system, built with Expo and Firebase.

## ✨ Features

### 🏪 Restaurant Discovery
- **Smart Search** - Find restaurants by cuisine, location, and preferences
- **Random Picker** - Let fate decide your next meal
- **Detailed Info** - Photos, ratings, menus, and real-time availability
- **Distance Tracking** - See how far restaurants are from you

### 💬 Universal Chat System
- **Instagram-Style Interface** - Modern, intuitive chat experience
- **Multi-Device Support** - Chat from any device with unique IDs
- **Group & Direct Chats** - Restaurant groups and friend conversations
- **Real-Time Messaging** - Instant message delivery with Firebase
- **Rich Features** - Reactions, replies, typing indicators, message status

### 👥 Social Features
- **Friend Connections** - Connect with other food lovers
- **Restaurant Groups** - Join communities for specific venues
- **Activity Feed** - See what friends are up to
- **Meetup Planning** - Organize group dining experiences

### 🔐 User Management
- **Device-Based Accounts** - Simple setup without complex registration
- **Display Names** - Customize your chat identity
- **Profile Pictures** - Express yourself with avatars
- **Online Status** - See who's active in real-time

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sitdown-app.git
   cd sitdown-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - Scan the QR code with Expo Go (Android)
   - Use Camera app to scan QR code (iOS)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## 🏗️ Architecture

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **AsyncStorage** for local data persistence

### Chat System
- **Firebase Realtime Database** for real-time messaging
- **EventEmitter** for local state management
- **Multi-device architecture** with unique device IDs
- **Universal interface** across all screens

### State Management
- **React Context** for authentication
- **Local state** with React hooks
- **Service layer** for business logic
- **Event-driven updates** for real-time features

## 📱 Screens & Navigation

### Main Tabs
- **🏠 Home** - Restaurant discovery and search
- **👥 Social** - Friends, groups, and social features
- **🎲 Random Pick** - Random restaurant selection
- **💬 Messages** - Universal chat interface

### Chat System
- **ChatListScreen** - Overview of all conversations
- **MultiDeviceChatScreen** - Universal chat interface
- **DisplayNameScreen** - Set your chat identity

## 🔧 Configuration

### Firebase Setup (Optional)
The app works in local mode by default. To enable Firebase:

1. Create a Firebase project
2. Enable Realtime Database
3. Add your config to `src/services/firebase.ts`
4. Set `isFirebaseEnabled = true`

### Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🎨 UI/UX Features

### Design System
- **Modern Material Design** inspired interface
- **Dark/Light theme** support
- **Responsive layouts** for all screen sizes
- **Smooth animations** and transitions

### Chat Interface
- **Message bubbles** with user avatars
- **Typing indicators** in real-time
- **Message reactions** with emoji support
- **Reply threading** for conversations
- **Online status** indicators
- **Unread message** counters

## 🧪 Testing

### Manual Testing
1. **Chat Functionality**
   - Send messages in different rooms
   - Test reactions and replies
   - Verify typing indicators
   - Check message status updates

2. **Navigation**
   - Test all tab navigation
   - Verify chat room access
   - Check authentication flow

3. **Multi-Device**
   - Test on different devices
   - Verify device ID generation
   - Check display name persistence

## 📦 Building for Production

### Expo Build
```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Build for web
expo build:web
```

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for platforms
eas build --platform android
eas build --platform ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo** for the amazing development platform
- **Firebase** for real-time backend services
- **React Native** community for inspiration
- **Instagram** for chat interface inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/sitdown-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/sitdown-app/discussions)
- **Email**: your.email@example.com

---

**Made with ❤️ for food lovers everywhere**

*Discover restaurants, connect with friends, and plan your next amazing meal with SitDown!*



TO DO:
Check for any bugs after initial commit.
Need to make chat functionality better, need to test with two real users and see how chat will work. Need to install that functionality.
