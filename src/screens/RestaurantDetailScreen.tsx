import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../types';
import { formatDistance } from '../utils/location';
import { SocialFeatures } from '../components/SocialFeatures';
import { BillSplitter } from '../components/BillSplitter';

interface RestaurantDetailScreenProps {
  route: { params: { restaurant: Restaurant } };
  navigation: any;
}

const { width } = Dimensions.get('window');

export const RestaurantDetailScreen: React.FC<RestaurantDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { restaurant } = route.params;
  const [activeTab, setActiveTab] = useState<'menu' | 'overview' | 'reviews' | 'social' | 'split'>('menu');

  const handleCall = () => {
    Linking.openURL(`tel:${restaurant.phone}`);
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}`;
    Linking.openURL(url);
  };

  const renderMenu = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Popular Dishes</Text>
      {restaurant.popular_dishes.map((dish, index) => (
        <View key={index} style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Text style={styles.dishName}>{dish}</Text>
            <Text style={styles.dishDescription}>Delicious and fresh</Text>
          </View>
          <Text style={styles.dishPrice}>$12-18</Text>
        </View>
      ))}
      
      <Text style={styles.sectionTitle}>Dietary Options</Text>
      <View style={styles.dietaryContainer}>
        {restaurant.dietary_options.map((option, index) => (
          <View key={index} style={styles.dietaryTag}>
            <Text style={styles.dietaryText}>{option}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Restaurant Info</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#666" />
          <Text style={styles.infoText}>{restaurant.address}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color="#666" />
          <TouchableOpacity onPress={handleCall}>
            <Text style={[styles.infoText, styles.linkText]}>{restaurant.phone}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="star" size={20} color="#666" />
          <Text style={styles.infoText}>{restaurant.rating} stars</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="card" size={20} color="#666" />
          <Text style={styles.infoText}>Price: {restaurant.price_range}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Hours</Text>
        {Object.entries(restaurant.hours).map(([day, hours]) => (
          <View key={day} style={styles.hoursRow}>
            <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
            <Text style={styles.hoursText}>{hours}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresContainer}>
          {restaurant.features.map((feature, index) => (
            <View key={index} style={styles.featureTag}>
              <Text style={styles.featureText}>{feature.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.mapContainer}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={48} color="#ccc" />
          <Text style={styles.mapPlaceholderText}>Map View</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            {restaurant.coordinates.latitude.toFixed(6)}, {restaurant.coordinates.longitude.toFixed(6)}
          </Text>
        </View>
        <TouchableOpacity style={styles.directionsButton} onPress={handleDirections}>
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={styles.directionsButtonText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Reviews</Text>
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewerName}>John D.</Text>
          <View style={styles.reviewRating}>
            <Ionicons name="star" size={16} color="#ffa502" />
            <Text style={styles.reviewRatingText}>4.5</Text>
          </View>
        </View>
        <Text style={styles.reviewText}>
          "Great food and atmosphere! The service was excellent and the prices were reasonable. 
          I would definitely recommend this place to others."
        </Text>
        <Text style={styles.reviewDate}>2 days ago</Text>
      </View>
      
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewerName}>Sarah M.</Text>
          <View style={styles.reviewRating}>
            <Ionicons name="star" size={16} color="#ffa502" />
            <Text style={styles.reviewRatingText}>4.0</Text>
          </View>
        </View>
        <Text style={styles.reviewText}>
          "Loved the vegetarian options! The staff was friendly and the food came out quickly. 
          Will be coming back soon."
        </Text>
        <Text style={styles.reviewDate}>1 week ago</Text>
      </View>
    </View>
  );

  const renderSocial = () => (
    <View style={styles.tabContent}>
      <SocialFeatures 
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        navigation={navigation}
      />
    </View>
  );

  const renderSplit = () => (
    <View style={styles.tabContent}>
      <BillSplitter restaurantName={restaurant.name} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image source={{ uri: restaurant.images[0] }} style={styles.headerImage} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.cuisineType}>{restaurant.cuisine_type}</Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#ffa502" />
            <Text style={styles.rating}>{restaurant.rating}</Text>
            <Text style={styles.distance}>
              {restaurant.distance ? formatDistance(restaurant.distance) : 'Nearby'}
            </Text>
          </View>

          <Text style={styles.description}>{restaurant.description}</Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
              onPress={() => setActiveTab('menu')}
            >
              <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>
                Menu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                Reviews
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'social' && styles.activeTab]}
              onPress={() => setActiveTab('social')}
            >
              <Text style={[styles.tabText, activeTab === 'social' && styles.activeTabText]}>
                Social
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'split' && styles.activeTab]}
              onPress={() => setActiveTab('split')}
            >
              <Text style={[styles.tabText, activeTab === 'split' && styles.activeTabText]}>
                Split Bill
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'menu' && renderMenu()}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'reviews' && renderReviews()}
          {activeTab === 'social' && renderSocial()}
          {activeTab === 'split' && renderSplit()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'relative',
    height: 250,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: 20,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  cuisineType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
    marginRight: 12,
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2ed573',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2ed573',
    fontWeight: '600',
  },
  tabContent: {
    minHeight: 400,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  dishDescription: {
    fontSize: 14,
    color: '#666',
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ed573',
  },
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietaryTag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  dietaryText: {
    fontSize: 14,
    color: '#2ed573',
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  linkText: {
    color: '#2ed573',
    textDecorationLine: 'underline',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 16,
    color: '#666',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  mapContainer: {
    marginBottom: 20,
  },
  map: {
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '500',
    marginTop: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#adb5bd',
    marginTop: 4,
  },
  directionsButton: {
    backgroundColor: '#2ed573',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
});

