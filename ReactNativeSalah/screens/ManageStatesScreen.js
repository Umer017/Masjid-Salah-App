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
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Services
import ApiService from '../services/ApiService';

export default function ManageStatesScreen({ navigation }) {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newStateName, setNewStateName] = useState('');

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAllStates();
      if (response.Success) {
        setStates(response.Data);
      } else {
        Alert.alert('Error', response.Message || 'Failed to load states');
      }
    } catch (error) {
      console.error('Error loading states:', error);
      Alert.alert('Error', error.message || 'Failed to load states');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStates();
    setRefreshing(false);
  };

  const handleAddState = async () => {
    if (!newStateName.trim()) {
      Alert.alert('Error', 'Please enter a state name');
      return;
    }

    try {
      const response = await ApiService.createState({
        StateName: newStateName.trim()
      });

      if (response.Success) {
        setNewStateName('');
        await loadStates();
        Alert.alert('Success', 'State added successfully');
      } else {
        Alert.alert('Error', response.Message || 'Failed to add state');
      }
    } catch (error) {
      console.error('Error adding state:', error);
      Alert.alert('Error', error.message || 'Failed to add state');
    }
  };

  const handleEditState = (state) => {
    Alert.prompt(
      'Edit State',
      'Enter new state name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async (newName) => {
            if (!newName || !newName.trim()) {
              Alert.alert('Error', 'Please enter a valid state name');
              return;
            }

            try {
              const response = await ApiService.updateState(state.StateId, {
                StateName: newName.trim()
              });

              if (response.Success) {
                await loadStates();
                Alert.alert('Success', 'State updated successfully');
              } else {
                Alert.alert('Error', response.Message || 'Failed to update state');
              }
            } catch (error) {
              console.error('Error updating state:', error);
              Alert.alert('Error', error.message || 'Failed to update state');
            }
          }
        }
      ],
      'plain-text',
      state.StateName
    );
  };

  const handleDeleteState = (state) => {
    Alert.alert(
      'Delete State',
      `Are you sure you want to delete "${state.StateName}"? This will also delete all cities and masjids in this state.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deleteState(state.StateId);

              if (response.Success) {
                await loadStates();
                Alert.alert('Success', 'State deleted successfully');
              } else {
                Alert.alert('Error', response.Message || 'Failed to delete state');
              }
            } catch (error) {
              console.error('Error deleting state:', error);
              Alert.alert('Error', error.message || 'Failed to delete state');
            }
          }
        }
      ]
    );
  };

  const renderStateItem = ({ item }) => (
    <View style={styles.stateCard}>
      <View style={styles.stateHeader}>
        <Text style={styles.stateName}>{item.StateName}</Text>
        <View style={styles.stateActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditState(item)}
          >
            <Ionicons name="pencil" size={20} color="#2E8B57" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteState(item)}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.cityCount}>{item.Cities.length} cities</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Loading states...</Text>
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
        <Text style={styles.headerTitle}>Manage States</Text>
      </View>

      {/* Add State Form */}
      <View style={styles.addForm}>
        <TextInput
          style={styles.input}
          placeholder="Enter new state name"
          value={newStateName}
          onChangeText={setNewStateName}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddState}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add State</Text>
        </TouchableOpacity>
      </View>

      {/* States List */}
      <FlatList
        data={states}
        keyExtractor={(item) => item.StateId.toString()}
        renderItem={renderStateItem}
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
            <Ionicons name="map-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No States Found</Text>
            <Text style={styles.emptyMessage}>Add your first state to get started</Text>
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
  addForm: {
    backgroundColor: '#fff',
    margin: 15,
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
  stateCard: {
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
  stateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  stateActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 10,
  },
  cityCount: {
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