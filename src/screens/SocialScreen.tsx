import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { AppHeader } from '../components/AppHeader';

interface SocialEvent {
  id: string;
  restaurant: Restaurant;
  attendees: User[];
  time: string;
  date: string;
  description: string;
  isJoined: boolean;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  isGoing: boolean;
  time?: string;
}

export const SocialScreen: React.FC = ({ navigation }: any) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'trending' | 'friends'>('events');
  const [socialEvents, setSocialEvents] = useState<SocialEvent[]>([]);

  // Mock data
  const initialSocialEvents: SocialEvent[] = [
    {
      id: '1',
      restaurant: {
        id: '1',
        name: 'Campus Burgers',
        cuisine_type: 'American',
        price_range: '$',
        rating: 4.2,
        address: '123 College Ave, Santa Clara, CA 95050',
        phone: '(555) 123-4567',
        hours: {},
        coordinates: { latitude: 37.3382, longitude: -121.8863 },
        dietary_options: ['vegetarian'],
        features: ['late_night', 'takeout', 'outdoor_seating'],
        description: 'Classic American burgers and fries with a college-friendly atmosphere.',
        images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'],
        popular_dishes: ['Campus Classic Burger', 'Veggie Delight Burger', 'Sweet Potato Fries', 'Craft Milkshakes']
      },
      attendees: [
        { id: '1', name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', isGoing: true, time: '7:30 PM' },
        { id: '2', name: 'Mike J.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', isGoing: true, time: '8:00 PM' },
        { id: '3', name: 'Emma L.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', isGoing: false },
      ],
      time: '7:30 PM',
      date: 'Tonight',
      description: 'Late night burger run! Who\'s in?',
      isJoined: false,
    },
    {
      id: '2',
      restaurant: {
        id: '6',
        name: 'The Study Hall',
        cuisine_type: 'American',
        price_range: '$$',
        rating: 4.5,
        address: '987 University Blvd, Santa Clara, CA 95050',
        phone: '(555) 678-9012',
        hours: {},
        coordinates: { latitude: 37.3410, longitude: -121.8830 },
        dietary_options: ['vegetarian'],
        features: ['full_bar', 'study_friendly', 'wifi'],
        description: 'College-friendly restaurant with great food, full bar, and study atmosphere.',
        images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'],
        popular_dishes: ['Study Burger', 'Mac & Cheese', 'Craft Beer', 'Wings']
      },
      attendees: [
        { id: '4', name: 'Alex K.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', isGoing: true, time: '9:00 PM' },
        { id: '5', name: 'Jessica R.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', isGoing: true, time: '9:15 PM' },
      ],
      time: '9:00 PM',
      date: 'Tomorrow',
      description: 'Study session with drinks!',
      isJoined: true,
    },
  ];

  const initialTrendingRestaurants = [
    { 
      id: '1', 
      name: 'Campus Burgers', 
      attendees: [
        { id: '1', name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
        { id: '2', name: 'Mike J.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
        { id: '3', name: 'Emma L.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
      ], 
      rating: 4.2, 
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop' 
    },
    { 
      id: '2', 
      name: 'Taco Express', 
      attendees: [
        { id: '4', name: 'Alex K.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
        { id: '5', name: 'Jessica R.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
      ], 
      rating: 4.0, 
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop' 
    },
    { 
      id: '3', 
      name: 'Pita Palace', 
      attendees: [
        { id: '6', name: 'David L.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
      ], 
      rating: 4.3, 
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop' 
    },
  ];

  const initialFriends = [
    { id: '1', name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', status: 'Going to Campus Burgers', time: '2 min ago' },
    { id: '2', name: 'Mike J.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', status: 'Looking for dinner', time: '5 min ago' },
    { id: '3', name: 'Emma L.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', status: 'At The Study Hall', time: '10 min ago' },
  ];

  const [trendingRestaurants, setTrendingRestaurants] = useState(initialTrendingRestaurants);
  const [friends, setFriends] = useState(initialFriends);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState(initialTrendingRestaurants);

  const handleJoinEvent = (eventId: string) => {
    setSocialEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isJoined: !event.isJoined }
        : event
    ));
  };

  const handleJoinTrending = (restaurantId: string) => {
    setTrendingRestaurants(prev => prev.map(restaurant => {
      if (restaurant.id === restaurantId) {
        // Check if current user is already attending
        const isAlreadyAttending = restaurant.attendees?.some((attendee: any) => attendee.id === 'currentUser');
        
        if (isAlreadyAttending) {
          // User is already attending, remove them
          return {
            ...restaurant,
            attendees: restaurant.attendees?.filter((attendee: any) => attendee.id !== 'currentUser') || []
          };
        } else {
          // User is not attending, add them
          const newAttendee = {
            id: 'currentUser',
            name: 'You',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
          };
          return {
            ...restaurant,
            attendees: [...(restaurant.attendees || []), newAttendee]
          };
        }
      }
      return restaurant;
    }));
  };

  const handleMessageFriend = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
            navigation.navigate('MultiDeviceChat', {
        restaurantName: friend.name,
        groupId: `friend-${friendId}`
      });
    }
  };

  // Initialize social events
  useEffect(() => {
    setSocialEvents(initialSocialEvents);
  }, []);

  // Initialize trending restaurants and friends
  useEffect(() => {
    setTrendingRestaurants(initialTrendingRestaurants);
    setFriends(initialFriends);
  }, []);

  // Filter restaurants based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRestaurants(trendingRestaurants);
    } else {
      const filtered = trendingRestaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, trendingRestaurants]);

  const renderEvent = ({ item }: { item: SocialEvent }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item.restaurant })}
    >
      <View style={styles.eventHeader}>
        <Image source={{ uri: item.restaurant.images[0] }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.restaurant.name}</Text>
          <Text style={styles.eventCuisine}>{item.restaurant.cuisine_type}</Text>
          <Text style={styles.eventTime}>{item.date} at {item.time}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.joinButton, item.isJoined && styles.joinedButton]}
          onPress={() => handleJoinEvent(item.id)}
        >
          <Text style={[styles.joinButtonText, item.isJoined && styles.joinedButtonText]}>
            {item.isJoined ? 'Joined' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.eventDescription}>{item.description}</Text>
      
      <View style={styles.attendeesSection}>
        <Text style={styles.attendeesTitle}>Attending ({item.attendees.filter(a => a.isGoing).length})</Text>
        <View style={styles.attendeesList}>
          {item.attendees.slice(0, 3).map((attendee) => (
            <View key={attendee.id} style={styles.attendee}>
              <Image source={{ uri: attendee.avatar }} style={styles.attendeeAvatar} />
              <Text style={styles.attendeeName}>{attendee.name}</Text>
            </View>
          ))}
          {item.attendees.length > 3 && (
            <Text style={styles.moreAttendees}>+{item.attendees.length - 3} more</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTrendingRestaurant = ({ item }: { item: any }) => {
    const isAttending = item.attendees?.some((attendee: any) => attendee.id === 'currentUser');
    const attendeeCount = item.attendees?.length || 0;
    
    return (
      <TouchableOpacity 
        style={styles.trendingCard}
        onPress={() => handleJoinTrending(item.id)}
      >
        <Image source={{ uri: item.image }} style={styles.trendingImage} />
        <View style={styles.trendingInfo}>
          <Text style={styles.trendingName}>{item.name}</Text>
          <Text style={styles.trendingAttendees}>{attendeeCount} people going</Text>
          <View style={styles.trendingRating}>
            <Ionicons name="star" size={16} color="#ffa502" />
            <Text style={styles.trendingRatingText}>{item.rating}</Text>
          </View>
          <View style={styles.trendingActions}>
            <TouchableOpacity 
              style={[styles.trendingJoinButton, isAttending && styles.trendingJoinedButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleJoinTrending(item.id);
              }}
            >
              <Text style={[styles.trendingJoinButtonText, isAttending && styles.trendingJoinedButtonText]}>
                {isAttending ? 'Leave' : 'Join'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => navigation.navigate('MultiDeviceChat', {
                restaurantName: item.name,
                groupId: `${item.name.toLowerCase().replace(/\s+/g, '-')}-group`
              })}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#6366f1" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFriend = ({ item }: { item: any }) => (
    <View style={styles.friendCard}>
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendStatus}>{item.status}</Text>
        <Text style={styles.friendTime}>{item.time}</Text>
      </View>
              <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => handleMessageFriend(item.id)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
        </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Social" navigation={navigation} />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
          onPress={() => setActiveTab('trending')}
        >
          <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
            Trending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'events' && (
        <FlatList
          data={socialEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'trending' && (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search restaurants..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          </View>
          <FlatList
            data={filteredRestaurants}
            renderItem={renderTrendingRestaurant}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}

      {activeTab === 'friends' && (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dc2626', // Red background
  },
  header: {
    padding: 20,
    backgroundColor: '#dc2626', // Red background
    borderBottomWidth: 1,
    borderBottomColor: '#991b1b', // Dark red border
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff', // White text
    marginBottom: 4,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#e5e7eb', // Light gray text
    fontFamily: 'System',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#374151', // Dark gray background
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dc2626', // Red border
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff', // White background
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9ca3af', // Light gray text
    fontFamily: 'System',
  },
  activeTabText: {
    color: '#1f2937', // Dark gray text
  },
  listContainer: {
    padding: 16,
  },
  searchContainer: {
    backgroundColor: '#374151', // Dark gray background
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dc2626', // Red border
  },
  searchInput: {
    backgroundColor: '#ffffff', // White background
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
    color: '#1f2937', // Dark gray text
    borderWidth: 1,
    borderColor: '#e5e7eb', // Light gray border
    fontFamily: 'System',
  },
  searchIcon: {
    position: 'absolute',
    right: 35,
    top: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  eventCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 14,
    color: '#2ed573',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  joinedButton: {
    backgroundColor: '#e9ecef',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: '#666',
  },
  eventDescription: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 16,
    lineHeight: 22,
  },
  attendeesSection: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  attendeesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  attendeesList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendee: {
    alignItems: 'center',
    marginRight: 16,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  attendeeName: {
    fontSize: 12,
    color: '#666',
  },
  moreAttendees: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  trendingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trendingImage: {
    width: '100%',
    height: 120,
  },
  trendingInfo: {
    padding: 16,
  },
  trendingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  trendingAttendees: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginBottom: 4,
  },
  trendingRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingRatingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  friendCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  friendTime: {
    fontSize: 12,
    color: '#999',
  },
  messageButton: {
    padding: 8,
  },
  trendingJoinButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  trendingJoinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  trendingJoinedButton: {
    backgroundColor: '#e9ecef',
  },
  trendingJoinedButtonText: {
    color: '#666',
  },
  trendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  chatButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: 'transparent',
  },
});
