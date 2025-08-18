import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../types';

interface RandomizerWheelProps {
  restaurants: Restaurant[];
  onRestaurantSelected: (restaurant: Restaurant) => void;
}

const { width } = Dimensions.get('window');

export const RandomizerWheel: React.FC<RandomizerWheelProps> = ({
  restaurants,
  onRestaurantSelected,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
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
    });
  };

  const handleAccept = () => {
    if (selectedRestaurant) {
      onRestaurantSelected(selectedRestaurant);
    }
    setShowResult(false);
  };

  const handleReject = () => {
    setShowResult(false);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.wheelButton, isSpinning && styles.spinning]}
        onPress={spinWheel}
        disabled={isSpinning}
      >
        <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
          <Ionicons name="restaurant" size={32} color="#fff" />
        </Animated.View>
        <Text style={styles.wheelText}>
          {isSpinning ? 'Spinning...' : 'Random Pick!'}
        </Text>
      </TouchableOpacity>

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
                <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
                <Text style={styles.restaurantCuisine}>{selectedRestaurant.cuisine_type}</Text>
                <Text style={styles.restaurantRating}>⭐ {selectedRestaurant.rating}</Text>
                <Text style={styles.restaurantPrice}>{selectedRestaurant.price_range}</Text>
              </View>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <Text style={styles.rejectButtonText}>Try Again</Text>
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
    alignItems: 'center',
    paddingVertical: 16,
  },
  wheelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  spinning: {
    opacity: 0.7,
  },
  wheel: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  wheelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  restaurantInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  restaurantRating: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  restaurantPrice: {
    fontSize: 16,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  acceptButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
});
