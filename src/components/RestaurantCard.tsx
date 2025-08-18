import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../types';
import { formatDistance } from '../utils/location';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: (restaurant: Restaurant) => void;
  onLike?: (restaurantId: string) => void;
  onSave?: (restaurantId: string) => void;
  isLiked?: boolean;
  isSaved?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with margins

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  onLike,
  onSave,
  isLiked = false,
  isSaved = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(restaurant)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: restaurant.images[0] }}
          style={styles.image}
          resizeMode="cover"
          onError={() => console.log('Image failed to load:', restaurant.images[0])}
          defaultSource={{ uri: 'https://picsum.photos/400/300?random=999' }}
        />
        {restaurant.images.length > 1 && (
          <View style={styles.imageCount}>
            <Ionicons name="images" size={16} color="#fff" />
            <Text style={styles.imageCountText}>+{restaurant.images.length - 1}</Text>
          </View>
        )}
        <View style={styles.overlay}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{restaurant.price_range}</Text>
          </View>
          {onLike && (
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => onLike(restaurant.id)}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={isLiked ? '#ff4757' : '#fff'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#ffa502" />
            <Text style={styles.rating}>{restaurant.rating}</Text>
          </View>
          
          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine_type}
          </Text>
        </View>
        
        <View style={styles.bottomRow}>
          <Text style={styles.distance}>
            {restaurant.distance ? formatDistance(restaurant.distance) : 'Nearby'}
          </Text>
          
          {onSave && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => onSave(restaurant.id)}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={16}
                color={isSaved ? '#2ed573' : '#666'}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {restaurant.dietary_options.length > 0 && (
          <View style={styles.dietaryContainer}>
            {restaurant.dietary_options.slice(0, 2).map((option, index) => (
              <View key={index} style={styles.dietaryTag}>
                <Text style={styles.dietaryText}>{option}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#ffffff', // White background
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb', // Light gray border
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  overlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  likeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 6,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937', // Dark gray text
    marginBottom: 4,
    fontFamily: 'System',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  rating: {
    fontSize: 12,
    color: '#6b7280', // Gray text
    marginLeft: 2,
    fontFamily: 'System',
  },
  cuisine: {
    fontSize: 12,
    color: '#6b7280', // Gray text
    flex: 1,
    fontFamily: 'System',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distance: {
    fontSize: 12,
    color: '#6b7280', // Gray text
    fontFamily: 'System',
  },
  saveButton: {
    padding: 4,
  },
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietaryTag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  dietaryText: {
    fontSize: 10,
    color: '#2ed573',
    fontWeight: '500',
  },
});

