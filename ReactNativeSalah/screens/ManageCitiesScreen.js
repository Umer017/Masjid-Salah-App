import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';


// Services
import ApiService from '../services/ApiService';

export default function ManageCitiesScreen({ navigation }) {
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [selectedStateId, setSelectedStateId] = useState(null);

  useEffect(() => {
    loadStatesAndCities();
  }, []);

  const loadStatesAndCities = async () => {
    try {
      setLoading(true);
      
      // Load states
      const statesResponse = await ApiService.getAllStates();
      if (statesResponse.Success) {
        setStates(statesResponse.Data);
        if (statesResponse.Data.length > 0) {
          setSelectedStateId(statesResponse.Data[0].StateId);
        }
      } else {
        Alert.alert('Error', statesResponse.Message || 'Failed to load states');
        return;
      }

      // Load cities
      if (statesResponse.Data.length > 0) {
        const citiesResponse = await ApiService.getCitiesByState(statesResponse.Data[0].StateId);
        if (citiesResponse.Success) {
          setCities(citiesResponse.Data);
        } else {
          Alert.alert('Error', citiesResponse.Message || 'Failed to load cities');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadCitiesByState = async (stateId) => {
    try {
      const response = await ApiService.getCitiesByState(stateId);
      if (response.Success) {
        setCities(response.Data);
      } else {
        Alert.alert('Error', response.Message || 'Failed to load cities');
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      Alert.alert('Error', error.message || 'Failed to load cities');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedStateId) {
      await loadCitiesByState(selectedStateId);
    }
    setRefreshing(false);
  };

  const handleAddCity = async () => {
    if (!newCityName.trim()) {
      Alert.alert('Error', 'Please enter a city name');
      return;
    }

    if (!selectedStateId) {
      Alert.alert('Error', 'Please select a state');
      return;
    }

    try {
      const response = await ApiService.createCity({
        CityName: newCityName.trim(),
        StateId: selectedStateId
      });

      if (response.Success) {
        setNewCityName('');
        await loadCitiesByState(selectedStateId);
        Alert.alert('Success', 'City added successfully');
      } else {
        Alert.alert('Error', response.Message || 'Failed to add city');
      }
    } catch (error) {
      console.error('Error adding city:', error);
      Alert.alert('Error', error.message || 'Failed to add city');
    }
  };

  const handleEditCity = (city) => {
    Alert.prompt(
      'Edit City',
      'Enter new city name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async (newName) => {
            if (!newName || !newName.trim()) {
              Alert.alert('Error', 'Please enter a valid city name');
              return;
            }

            try {
              const response = await ApiService.updateCity(city.CityId, {
                CityName: newName.trim(),
                StateId: city.StateId
              });

              if (response.Success) {
                await loadCitiesByState(selectedStateId);
                Alert.alert('Success', 'City updated successfully');
              } else {
                Alert.alert('Error', response.Message || 'Failed to update city');
              }
            } catch (error) {
              console.error('Error updating city:', error);
              Alert.alert('Error', error.message || 'Failed to update city');
            }
          }
        }
      ],
      'plain-text',
      city.CityName
    );
  };

  const handleDeleteCity = (city) => {
    Alert.alert(
      'Delete City',
      `Are you sure you want to delete "${city.CityName}"? This will also delete all masjids in this city.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deleteCity(city.CityId);

              if (response.Success) {
                await loadCitiesByState(selectedStateId);
                Alert.alert('Success', 'City deleted successfully');
              } else {
                Alert.alert('Error', response.Message || 'Failed to delete city');
              }
            } catch (error) {
              console.error('Error deleting city:', error);
              Alert.alert('Error', error.message || 'Failed to delete city');
            }
          }
        }
      ]
    );
  };

  const renderCityItem = ({ item }) => (
    <View style={styles.cityCard}>
      <View style={styles.cityHeader}>
        <Text style={styles.cityName}>{item.CityName}</Text>
        <View style={styles.cityActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditCity(item)}
          >
            <Ionicons name="pencil" size={20} color="#2E8B57" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteCity(item)}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.stateName}>{item.StateName}</Text>
      <Text style={styles.masjidCount}>{item.Masjids.length} masjids</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Loading cities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Cities</Text>
      </View>

      {/* State Selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Select State:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedStateId}
            style={styles.picker}
            onValueChange={(itemValue) => {
              setSelectedStateId(itemValue);
              loadCitiesByState(itemValue);
            }}
          >
            {states.map((state) => (
              <Picker.Item key={state.StateId} label={state.StateName} value={state.StateId} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Add City Form */}
      <View style={styles.addForm}>
        <TextInput
          style={styles.input}
          placeholder="Enter new city name"
          value={newCityName}
          onChangeText={setNewCityName}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCity}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add City</Text>
        </TouchableOpacity>
      </View>

      {/* Cities List */}
      <FlatList
        data={cities}
        keyExtractor={(item) => item.CityId.toString()}
        renderItem={renderCityItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E8B57']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Cities Found</Text>
            <Text style={styles.emptyMessage}>
              {selectedStateId 
                ? 'Add your first city to get started' 
                : 'Select a state to view cities'}
            </Text>
          </View>
        }
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
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectorContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  addForm: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#2E8B57',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  listContainer: {
    padding: 15,
  },
  cityCard: {
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
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cityActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 10,
  },
  stateName: {
    fontSize: 16,
    color: '#2E8B57',
    marginBottom: 5,
  },
  masjidCount: {
    fontSize: 14,
    color: '#666',
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
    paddingHorizontal: 40,
  },
});