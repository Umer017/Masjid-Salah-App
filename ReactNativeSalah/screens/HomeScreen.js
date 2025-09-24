import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Services
import ApiService from '../services/ApiService';
import LocationService from '../services/LocationService';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [masjids, setMasjids] = useState([]);
  const [allMasjids, setAllMasjids] = useState([]); // Store all masjids for search
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Search query state

  useEffect(() => {
    loadData();
  }, []);

  // Filter masjids based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setMasjids(allMasjids);
    } else {
      const filtered = allMasjids.filter(masjid => 
        masjid.MasjidName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        masjid.CityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        masjid.StateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (masjid.ImamName && masjid.ImamName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setMasjids(filtered);
    }
  }, [searchQuery, allMasjids]);

  const loadData = async () => {
    try {
      setLoading(true);
      await getUserLocationAndMasjids();
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocationAndMasjids = async () => {
    try {
      // Get user's current location
      const location = await LocationService.getCurrentLocation();
      setUserLocation(location);

      // Get city info from coordinates
      const cityInfo = await LocationService.getCityFromCoordinates(
        location.latitude,
        location.longitude
      );
      setLocationInfo(cityInfo);

      // Try to get nearby masjids first
      const nearbyResponse = await ApiService.getNearbyMasjids(
        location.latitude,
        location.longitude,
        10 // 10km radius
      );

      let masjidList = [];
      
      if (nearbyResponse.Success && nearbyResponse.Data.length > 0) {
        // Add distance to each masjid
        const masjidsWithDistance = nearbyResponse.Data.map(masjid => ({
          ...masjid,
          distance: masjid.Latitude && masjid.Longitude 
            ? LocationService.calculateDistance(
                location.latitude,
                location.longitude,
                masjid.Latitude,
                masjid.Longitude
              )
            : null
        }));

        // Sort by distance
        masjidsWithDistance.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        masjidList = masjidsWithDistance;
      } else {
        // If no nearby masjids, get all masjids
        const allMasjidsResponse = await ApiService.getAllMasjids(1, 100); // Get more masjids for search
        if (allMasjidsResponse.Success && allMasjidsResponse.Data.Data.length > 0) {
          masjidList = allMasjidsResponse.Data.Data;
        }
      }
      
      setMasjids(masjidList);
      setAllMasjids(masjidList); // Store all masjids for search
    } catch (error) {
      console.error('Error getting location and masjids:', error);
      
      // Fallback: try to get all masjids without location
      try {
        const allMasjidsResponse = await ApiService.getAllMasjids(1, 100); // Get more masjids for search
        if (allMasjidsResponse.Success) {
          setMasjids(allMasjidsResponse.Data.Data);
          setAllMasjids(allMasjidsResponse.Data.Data);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        setMasjids([]);
        setAllMasjids([]);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserLocationAndMasjids();
    setRefreshing(false);
  };

  const renderMasjidItem = ({ item }) => (
    <TouchableOpacity
      style={styles.masjidCard}
      onPress={() => navigation.navigate('MasjidDetails', { masjid: item })}
    >
      <View style={styles.cardHeader}>
        <Ionicons name="business" size={24} color="#2E8B57" />
        <Text style={styles.masjidName}>{item.MasjidName}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.locationText}>
            {item.CityName}, {item.StateName}
          </Text>
        </View>
        
        {item.distance && (
          <View style={styles.infoRow}>
            <Ionicons name="walk" size={16} color="#666" />
            <Text style={styles.distanceText}>
              {item.distance} km away
            </Text>
          </View>
        )}
        
        {item.ImamName && (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.imamText}>
              Imam: {item.ImamName}
            </Text>
          </View>
        )}

        {item.ContactNumber && (
          <View style={styles.infoRow}>
            <Ionicons name="call" size={16} color="#666" />
            <Text style={styles.contactText}>
              {item.ContactNumber}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.addressText} numberOfLines={2}>
          {item.Address}
        </Text>
        {/* Directions Button */}
        {item.Latitude && item.Longitude && (
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${item.Latitude},${item.Longitude}`;
              Linking.openURL(url).catch(() => {
                Alert.alert('Error', 'Unable to open Google Maps');
              });
            }}
          >
            <Ionicons name="navigate" size={16} color="#fff" />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="business-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Masjids Found</Text>
      <Text style={styles.emptyMessage}>
        {searchQuery 
          ? `No masjids match your search for "${searchQuery}"`
          : locationInfo 
            ? `No masjids found near ${locationInfo.city}, ${locationInfo.state}`
            : 'No masjids found in your area'
        }
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadData}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Finding masjids near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Salah Timing App</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search masjids, cities, imams..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Location Info */}
      {locationInfo && !searchQuery && (
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={16} color="#2E8B57" />
          <Text style={styles.locationInfoText}>
            {locationInfo.city}, {locationInfo.state}
          </Text>
        </View>
      )}

      {/* Masjids List */}
      <FlatList
        data={masjids}
        keyExtractor={(item) => item.MasjidId.toString()}
        renderItem={renderMasjidItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E8B57']}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#2E8B57',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  locationInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  masjidCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  masjidName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  cardContent: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  distanceText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '500',
  },
  imamText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  addressText: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
    marginBottom: 10,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E8B57',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});