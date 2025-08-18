import { Location } from '../types';

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 5280)} ft`; // Convert to feet
  }
  return `${distance} mi`;
};

// Get restaurants within a certain radius
export const getRestaurantsInRadius = (
  restaurants: any[],
  userLocation: Location,
  radius: number
): any[] => {
  return restaurants
    .map(restaurant => ({
      ...restaurant,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        restaurant.coordinates.latitude,
        restaurant.coordinates.longitude
      )
    }))
    .filter(restaurant => restaurant.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
};

// Default location (Santa Clara, CA area)
export const defaultLocation: Location = {
  latitude: 37.3382,
  longitude: -121.8863
};

