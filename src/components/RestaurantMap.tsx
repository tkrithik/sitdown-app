import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Restaurant } from '../types';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  userLocation: { latitude: number; longitude: number };
  onRestaurantPress: (restaurant: Restaurant) => void;
}

const { width, height } = Dimensions.get('window');

export const RestaurantMap: React.FC<RestaurantMapProps> = ({
  restaurants,
  userLocation,
  onRestaurantPress,
}) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const initialRegion = {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const handleMarkerPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleCalloutPress = (restaurant: Restaurant) => {
    onRestaurantPress(restaurant);
  };

  const getMarkerColor = (restaurant: Restaurant) => {
    // Different colors based on restaurant type or rating
    if (restaurant.rating >= 4.5) return '#2ed573'; // Green for high rating
    if (restaurant.rating >= 4.0) return '#ffa502'; // Orange for good rating
    return '#e74c3c'; // Red for lower rating
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* User location marker */}
        <Marker
          coordinate={userLocation}
          title="You are here"
          description="Your current location"
        >
          <View style={styles.userMarker}>
            <Ionicons name="location" size={24} color="#3498db" />
          </View>
        </Marker>

        {/* Restaurant markers */}
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.coordinates.latitude,
              longitude: restaurant.coordinates.longitude,
            }}
            title={restaurant.name}
            description={`${restaurant.cuisine_type} • ${restaurant.price_range} • ⭐ ${restaurant.rating}`}
            onPress={() => handleMarkerPress(restaurant)}
          >
            <View style={[styles.restaurantMarker, { backgroundColor: getMarkerColor(restaurant) }]}>
              <Ionicons name="restaurant" size={16} color="#fff" />
            </View>
            <Callout onPress={() => handleCalloutPress(restaurant)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{restaurant.name}</Text>
                <Text style={styles.calloutCuisine}>{restaurant.cuisine_type}</Text>
                <Text style={styles.calloutRating}>⭐ {restaurant.rating}</Text>
                <Text style={styles.calloutPrice}>{restaurant.price_range}</Text>
                <TouchableOpacity
                  style={styles.calloutButton}
                  onPress={() => handleCalloutPress(restaurant)}
                >
                  <Text style={styles.calloutButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Restaurant count indicator */}
      <View style={styles.countIndicator}>
        <Text style={styles.countText}>{restaurants.length} restaurants nearby</Text>
      </View>

      {/* Selected restaurant modal */}
      <Modal
        visible={!!selectedRestaurant}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedRestaurant(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRestaurant && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedRestaurant.name}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedRestaurant(null)}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalCuisine}>{selectedRestaurant.cuisine_type}</Text>
                <Text style={styles.modalRating}>⭐ {selectedRestaurant.rating}</Text>
                <Text style={styles.modalPrice}>{selectedRestaurant.price_range}</Text>
                <Text style={styles.modalAddress}>{selectedRestaurant.address}</Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedRestaurant(null);
                      onRestaurantPress(selectedRestaurant);
                    }}
                  >
                    <Text style={styles.modalButtonText}>View Full Details</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  userMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#3498db',
  },
  restaurantMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  callout: {
    width: 200,
    padding: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  calloutCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  calloutRating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  calloutPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  calloutButton: {
    backgroundColor: '#2ed573',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  countIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalCuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  modalRating: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  modalPrice: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  modalAddress: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#2ed573',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
