import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LocationService {
  async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Cache the location
      await AsyncStorage.setItem('last_location', JSON.stringify(coords));

      return coords;
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Try to get cached location
      try {
        const cachedLocation = await AsyncStorage.getItem('last_location');
        if (cachedLocation) {
          return JSON.parse(cachedLocation);
        }
      } catch (cacheError) {
        console.error('Error getting cached location:', cacheError);
      }
      
      throw error;
    }
  }

  async getCachedLocation() {
    try {
      const cachedLocation = await AsyncStorage.getItem('last_location');
      return cachedLocation ? JSON.parse(cachedLocation) : null;
    } catch (error) {
      console.error('Error getting cached location:', error);
      return null;
    }
  }

  // Get city name from coordinates (reverse geocoding)
  async getCityFromCoordinates(latitude, longitude) {
    try {
      const [result] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result) {
        return {
          city: result.city || result.subregion || 'Unknown City',
          state: result.region || 'Unknown State',
          country: result.country || 'Unknown Country',
        };
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

export default new LocationService();