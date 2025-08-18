import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../types';
import { allRestaurants } from '../data/restaurants';
import { useAuth } from '../contexts/AuthContext';
import { AppHeader } from '../components/AppHeader';

interface RandomPickScreenProps {
  navigation?: any;
}

const { width, height } = Dimensions.get('window');

export const RandomPickScreen: React.FC<RandomPickScreenProps> = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const restaurants = allRestaurants;
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [spinHistory, setSpinHistory] = useState<Restaurant[]>([]);
  const spinValue = useRef(new Animated.Value(0)).current;

  const spinWheel = () => {
    if (isSpinning || restaurants.length === 0) return;

    setIsSpinning(true);
    setShowResult(false);

    // Random number of full rotations (3-5) plus random final position
    const rotations = 3 + Math.random() * 2;
    const finalRotation = Math.random() * 360;
    const totalRotation = rotations * 360 + finalRotation;

    Animated.timing(spinValue, {
      toValue: totalRotation,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      // Select random restaurant
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      const restaurant = restaurants[randomIndex];
      setSelectedRestaurant(restaurant);
      setShowResult(true);
      setIsSpinning(false);
      
      // Add to spin history
      setSpinHistory(prev => [restaurant, ...prev.slice(0, 9)]); // Keep last 10
    });
  };

  const handleAccept = () => {
    if (selectedRestaurant && navigation) {
      // Navigate to restaurant detail page
      navigation.navigate('RestaurantDetail', { restaurant: selectedRestaurant });
      setShowResult(false);
    }
  };

  const handleReject = () => {
    setShowResult(false);
    // Reset spin value to allow another spin
    spinValue.setValue(0);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const clearHistory = () => {
    setSpinHistory([]);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Random Pick" navigation={navigation} />

      <View style={styles.wheelContainer}>
        <TouchableOpacity
          style={[styles.wheelButton, isSpinning && styles.spinning]}
          onPress={spinWheel}
          disabled={isSpinning}
        >
          <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
            <Ionicons name="restaurant" size={48} color="#ffffff" />
          </Animated.View>
          <Text style={styles.wheelText}>
            {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
          </Text>
        </TouchableOpacity>
      </View>

      {spinHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Picks</Text>
            <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {spinHistory.map((restaurant, index) => (
              <View key={`${restaurant.id}-${index}`} style={styles.historyItem}>
                <Text style={styles.historyName} numberOfLines={1}>
                  {restaurant.name}
                </Text>
                <Text style={styles.historyCuisine} numberOfLines={1}>
                  {restaurant.cuisine_type}
                </Text>
                <Text style={styles.historyRating}>⭐ {restaurant.rating}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Modal
        visible={showResult}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResult(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Random Pick!</Text>
            {selectedRestaurant && (
              <View style={styles.restaurantInfo}>
                <Image
                  source={{ uri: selectedRestaurant.images[0] }}
                  style={styles.restaurantImage}
                  resizeMode="cover"
                />
                <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
                <Text style={styles.restaurantCuisine}>{selectedRestaurant.cuisine_type}</Text>
                <Text style={styles.restaurantRating}>⭐ {selectedRestaurant.rating}</Text>
                <Text style={styles.restaurantPrice}>{selectedRestaurant.price_range}</Text>
                <Text style={styles.restaurantAddress}>{selectedRestaurant.address}</Text>
              </View>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <Text style={styles.rejectButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.spinAgainButton} 
                onPress={() => {
                  setShowResult(false);
                  spinValue.setValue(0);
                  setTimeout(() => spinWheel(), 100);
                }}
              >
                <Text style={styles.spinAgainButtonText}>Spin Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Text style={styles.acceptButtonText}>Let's Go!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'center',
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: '#e5e7eb',
    textAlign: 'center',
    fontFamily: 'System',
  },
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  wheelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  spinning: {
    opacity: 0.7,
  },
  wheel: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  wheelText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'System',
  },
  historyContainer: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'System',
  },
  clearButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  historyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'System',
  },
  historyCuisine: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'System',
  },
  historyRating: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    fontFamily: 'System',
  },
  restaurantInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  restaurantImage: {
    width: 120,
    height: 80,
    borderRadius: 12,
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  restaurantCuisine: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 6,
    fontFamily: 'System',
  },
  restaurantRating: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 6,
    fontFamily: 'System',
  },
  restaurantPrice: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 6,
    fontFamily: 'System',
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontFamily: 'System',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  rejectButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  spinAgainButton: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  spinAgainButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  acceptButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});
