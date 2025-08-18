import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: string;
  name: string;
  avatar: string;
  isGoing: boolean;
  time?: string;
}

interface SocialFeaturesProps {
  restaurantId: string;
  restaurantName: string;
  navigation: any;
}

// Mock data - in a real app, this would come from a backend
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah M.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    isGoing: true,
    time: '7:30 PM',
  },
  {
    id: '2',
    name: 'Mike J.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    isGoing: true,
    time: '8:00 PM',
  },
  {
    id: '3',
    name: 'Emma L.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isGoing: false,
  },
  {
    id: '4',
    name: 'Alex K.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isGoing: true,
    time: '7:45 PM',
  },
  {
    id: '5',
    name: 'Jessica R.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    isGoing: false,
  },
];

export const SocialFeatures: React.FC<SocialFeaturesProps> = ({
  restaurantId,
  restaurantName,
  navigation,
}) => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isGoing, setIsGoing] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('8:00 PM');

  const handleJoinGroup = () => {
    if (!isGoing) {
      setIsGoing(true);
      // In a real app, you'd add the current user to the group
      const currentUser: User = {
        id: 'current-user',
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
        isGoing: true,
        time: selectedTime,
      };
      setUsers([currentUser, ...users]);
    } else {
      setIsGoing(false);
      setUsers(users.filter(user => user.id !== 'current-user'));
    }
  };

  const goingUsers = users.filter(user => user.isGoing);
  const maybeUsers = users.filter(user => !user.isGoing);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Who's Going?</Text>
        <Text style={styles.subtitle}>{goingUsers.length} people going tonight</Text>
      </View>

      {/* Join Button */}
      <TouchableOpacity
        style={[styles.joinButton, isGoing && styles.leaveButton]}
        onPress={handleJoinGroup}
      >
        <Ionicons 
          name={isGoing ? "close-circle" : "add-circle"} 
          size={20} 
          color="#fff" 
        />
        <Text style={styles.joinButtonText}>
          {isGoing ? 'Leave Group' : 'Join Group'}
        </Text>
      </TouchableOpacity>

      {/* Going Section */}
      {goingUsers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Going Tonight</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {goingUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <Text style={styles.userName}>{user.name}</Text>
                {user.time && (
                  <Text style={styles.userTime}>{user.time}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Maybe Section */}
      {maybeUsers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maybe Going</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {maybeUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <Text style={styles.userName}>{user.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Popular Times */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Times</Text>
        <View style={styles.popularTimes}>
          <View style={styles.timeSlot}>
            <Text style={styles.timeText}>6:00 PM</Text>
            <Text style={styles.timeCount}>12 people</Text>
          </View>
          <View style={styles.timeSlot}>
            <Text style={styles.timeText}>7:30 PM</Text>
            <Text style={styles.timeCount}>18 people</Text>
          </View>
          <View style={styles.timeSlot}>
            <Text style={styles.timeText}>9:00 PM</Text>
            <Text style={styles.timeCount}>8 people</Text>
          </View>
        </View>
      </View>

      {/* Group Chat Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Chat</Text>
        <View style={styles.chatPreview}>
          <View style={styles.chatMessage}>
            <Text style={styles.chatSender}>Sarah M.</Text>
            <Text style={styles.chatText}>Anyone want to split an appetizer?</Text>
          </View>
          <View style={styles.chatMessage}>
            <Text style={styles.chatSender}>Mike J.</Text>
            <Text style={styles.chatText}>I'm down! The nachos look amazing</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => {
            // Create a chat room ID based on restaurant name
            const chatRoomId = restaurantName.toLowerCase().replace(/\s+/g, '-') + '-group';
            navigation.navigate('MultiDeviceChat', { 
              restaurantName: restaurantName, 
              groupId: chatRoomId 
            });
          }}
        >
          <Text style={styles.chatButtonText}>Join Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#2ed573',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  leaveButton: {
    backgroundColor: '#e74c3c',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  userCard: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  userName: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
  },
  userTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  popularTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeSlot: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  timeCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chatPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  chatMessage: {
    marginBottom: 8,
  },
  chatSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  chatText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
