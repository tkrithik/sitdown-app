import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showUserInfo?: boolean;
  navigation?: any;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  showUserInfo = true,
  navigation,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.header}>
      {/* Left side - Back button or empty space */}
      <View style={styles.leftSection}>
        {showBackButton && onBackPress && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Center - Title */}
      <View style={styles.centerSection}>
        {title && <Text style={styles.title}>{title}</Text>}
      </View>

      {/* Right side - User info and logout */}
      <View style={styles.rightSection}>
        {showUserInfo && isAuthenticated && user && (
          <View style={styles.userInfo}>
            <Image source={{ uri: user.avatar || 'https://picsum.photos/100/100?random=999' }} style={styles.userAvatar} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
        
        {showUserInfo && !isAuthenticated && (
          <TouchableOpacity 
            style={styles.guestInfo} 
            onPress={() => navigation?.navigate('Login')}
            disabled={!navigation}
          >
            <Ionicons name="log-in-outline" size={20} color={navigation ? "#3b82f6" : "#9ca3af"} />
            <Text style={styles.guestText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    minHeight: 60,
  },
  leftSection: {
    width: 60,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 60,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'System',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  userDetails: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'System',
  },
  userEmail: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: 'System',
  },
  logoutButton: {
    padding: 4,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  guestText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
    fontFamily: 'System',
  },
});
