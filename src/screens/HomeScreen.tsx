import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { RestaurantCard } from '../components/RestaurantCard';
import { FilterComponent } from '../components/FilterComponent';
import { AppHeader } from '../components/AppHeader';

import { RestaurantMap } from '../components/RestaurantMap';
import { allRestaurants } from '../data/restaurants';
import { getRestaurantsInRadius, defaultLocation, calculateDistance } from '../utils/location';
import { Restaurant, FilterOptions, Location as LocationType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [userLocation, setUserLocation] = useState<LocationType>(defaultLocation);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    dietary: [],
    priceRange: [],
    cuisineType: [],
    radius: 50, // Increased from 5 to 50 miles to show restaurants regardless of location
  });
  const [likedRestaurants, setLikedRestaurants] = useState<string[]>([]);
  const [savedRestaurants, setSavedRestaurants] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, userLocation, debouncedSearchQuery]);

  // Debounce search query to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        // If location is denied, still show restaurants using default location
        console.log('Location permission denied, using default location');
        setUserLocation(defaultLocation);
      }
    } catch (error) {
      console.log('Error getting location:', error);
      // Fallback to default location on error
      setUserLocation(defaultLocation);
    }
  };

  const applyFilters = () => {
    let filtered = allRestaurants; // Show all restaurants by default

    // Apply search query filter
    if (debouncedSearchQuery.trim() !== '') {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        restaurant.cuisine_type.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Apply dietary filters
    if (filters.dietary.length > 0) {
      filtered = filtered.filter(restaurant =>
        filters.dietary.some(dietary =>
          restaurant.dietary_options.includes(dietary)
        )
      );
    }

    // Apply price range filters
    if (filters.priceRange.length > 0) {
      filtered = filtered.filter(restaurant =>
        filters.priceRange.includes(restaurant.price_range)
      );
    }

    // Apply cuisine type filters
    if (filters.cuisineType.length > 0) {
      filtered = filtered.filter(restaurant =>
        filters.cuisineType.includes(restaurant.cuisine_type)
      );
    }

    // Add distance information for all restaurants
    filtered = filtered.map(restaurant => ({
      ...restaurant,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        restaurant.coordinates.latitude,
        restaurant.coordinates.longitude
      )
    }));

    // Sort by distance
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setFilteredRestaurants(filtered);
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const handleLike = (restaurantId: string) => {
    setLikedRestaurants(prev =>
      prev.includes(restaurantId)
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  const handleSave = (restaurantId: string) => {
    setSavedRestaurants(prev =>
      prev.includes(restaurantId)
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };



  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <RestaurantCard
      restaurant={item}
      onPress={handleRestaurantPress}
      onLike={handleLike}
      onSave={handleSave}
      isLiked={likedRestaurants.includes(item.id)}
      isSaved={savedRestaurants.includes(item.id)}
    />
  );

  // Memoized SearchBar component to prevent re-renders
  const SearchBar = useMemo(() => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search restaurants, cuisine, or location..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#999"
        autoCorrect={false}
        autoCapitalize="none"
      />
      <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
      {searchQuery !== debouncedSearchQuery && (
        <View style={styles.searchLoading}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#6366f1" />
        </View>
      )}
    </View>
  ), [searchQuery, debouncedSearchQuery]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <AppHeader title="Sit Down" navigation={navigation} />
      
      {/* Search Bar */}
      {SearchBar}
      
      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'list' && styles.activeViewButton]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons name="list" size={20} color={viewMode === 'list' ? '#fff' : '#666'} />
          <Text style={[styles.viewButtonText, viewMode === 'list' && styles.activeViewButtonText]}>
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'map' && styles.activeViewButton]}
          onPress={() => setViewMode('map')}
        >
          <Ionicons name="map" size={20} color={viewMode === 'map' ? '#fff' : '#666'} />
          <Text style={[styles.viewButtonText, viewMode === 'map' && styles.activeViewButtonText]}>
            Map
          </Text>
        </TouchableOpacity>
      </View>
      
      <FilterComponent filters={filters} onFiltersChange={setFilters} />
    </View>
  ), [SearchBar, viewMode, filters]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No restaurants found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
    </View>
  );

  const renderMapView = () => (
    <RestaurantMap
      restaurants={filteredRestaurants}
      userLocation={userLocation}
      onRestaurantPress={handleRestaurantPress}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {viewMode === 'list' ? (
        <View style={styles.listViewContainer}>
          {renderHeader()}
          <FlatList
            data={filteredRestaurants}
            renderItem={renderRestaurant}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>
      ) : (
        <View style={styles.mapViewContainer}>
          {renderHeader()}
          {renderMapView()}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dc2626', // Red background
  },
  listViewContainer: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#dc2626', // Red background
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
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
    right: 20,
    top: 12,
    color: '#6b7280', // Gray color
  },
  searchLoading: {
    position: 'absolute',
    right: 50,
    top: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff', // White text
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#e5e7eb', // Light gray text
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#374151', // Dark gray background
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeViewButton: {
    backgroundColor: '#ffffff', // White background
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af', // Light gray text
    marginLeft: 4,
    fontFamily: 'System',
  },
  activeViewButtonText: {
    color: '#1f2937', // Dark gray text
  },
  mapViewContainer: {
    flex: 1,
  },
});

