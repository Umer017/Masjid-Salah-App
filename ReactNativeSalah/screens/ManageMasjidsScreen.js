import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Services
import ApiService from '../services/ApiService';

export default function ManageMasjidsScreen({ navigation }) {
  const [masjids, setMasjids] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMasjid, setEditingMasjid] = useState(null);
  const [formData, setFormData] = useState({
    MasjidName: '',
    Address: '',
    CityId: '',
    Latitude: '',
    Longitude: '',
    ContactNumber: '',
    ImamName: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [masjidsResponse, statesResponse] = await Promise.all([
        ApiService.getAllMasjids(1, 50),
        ApiService.getAllStates(),
      ]);

      if (masjidsResponse.Success) {
        setMasjids(masjidsResponse.Data.Data);
      }

      if (statesResponse.Success) {
        setStates(statesResponse.Data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadCitiesForState = async (stateId) => {
    try {
      const response = await ApiService.getCitiesByState(stateId);
      if (response.Success) {
        setCities(response.Data);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const openAddModal = () => {
    setEditingMasjid(null);
    setFormData({
      MasjidName: '',
      Address: '',
      CityId: '',
      Latitude: '',
      Longitude: '',
      ContactNumber: '',
      ImamName: '',
    });
    setCities([]);
    setModalVisible(true);
  };

  const openEditModal = (masjid) => {
    setEditingMasjid(masjid);
    setFormData({
      MasjidName: masjid.MasjidName,
      Address: masjid.Address,
      CityId: masjid.CityId.toString(),
      Latitude: masjid.Latitude?.toString() || '',
      Longitude: masjid.Longitude?.toString() || '',
      ContactNumber: masjid.ContactNumber || '',
      ImamName: masjid.ImamName || '',
    });

    // Load cities for the state of this masjid
    const state = states.find(s => s.Cities.some(c => c.CityId === masjid.CityId));
    if (state) {
      setCities(state.Cities);
    }

    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.MasjidName.trim() || !formData.Address.trim() || !formData.CityId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const dataToSend = {
        MasjidName: formData.MasjidName.trim(),
        Address: formData.Address.trim(),
        CityId: parseInt(formData.CityId),
        Latitude: formData.Latitude ? parseFloat(formData.Latitude) : null,
        Longitude: formData.Longitude ? parseFloat(formData.Longitude) : null,
        ContactNumber: formData.ContactNumber.trim() || null,
        ImamName: formData.ImamName.trim() || null,
      };

      let response;
      if (editingMasjid) {
        response = await ApiService.updateMasjid(editingMasjid.MasjidId, dataToSend);
      } else {
        response = await ApiService.createMasjid(dataToSend);
      }

      if (response.Success) {
        Alert.alert(
          'Success',
          `Masjid ${editingMasjid ? 'updated' : 'created'} successfully`,
          [{ text: 'OK', onPress: () => {
            setModalVisible(false);
            loadData();
          }}]
        );
      } else {
        Alert.alert('Error', response.Message || 'Failed to save masjid');
      }
    } catch (error) {
      console.error('Error saving masjid:', error);
      Alert.alert('Error', error.message || 'Failed to save masjid');
    }
  };

  const handleDelete = (masjid) => {
    Alert.alert(
      'Delete Masjid',
      `Are you sure you want to delete "${masjid.MasjidName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deleteMasjid(masjid.MasjidId);
              if (response.Success) {
                Alert.alert('Success', 'Masjid deleted successfully');
                loadData();
              } else {
                Alert.alert('Error', response.Message || 'Failed to delete masjid');
              }
            } catch (error) {
              console.error('Error deleting masjid:', error);
              Alert.alert('Error', error.message || 'Failed to delete masjid');
            }
          },
        },
      ]
    );
  };

  const renderMasjidItem = ({ item }) => (
    <View style={styles.masjidCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.masjidName}>{item.MasjidName}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={18} color="#2E8B57" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.location}>{item.CityName}, {item.StateName}</Text>
      <Text style={styles.address} numberOfLines={2}>{item.Address}</Text>
      
      {item.ImamName && (
        <Text style={styles.imam}>Imam: {item.ImamName}</Text>
      )}
      
      {item.ContactNumber && (
        <Text style={styles.contact}>Contact: {item.ContactNumber}</Text>
      )}
      
      {/* Management Buttons */}
      <View style={styles.managementButtons}>
        <TouchableOpacity
          style={styles.managementButton}
          onPress={() => navigation.navigate('ManageTimings', { masjid: item })}
        >
          <Ionicons name="time-outline" size={16} color="#fff" />
          <Text style={styles.managementButtonText}>Prayer Timings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.managementButton, styles.additionalTimingsButton]}
          onPress={() => navigation.navigate('ManageAdditionalTimings', { masjid: item })}
        >
          <Ionicons name="calendar-outline" size={16} color="#fff" />
          <Text style={styles.managementButtonText}>Additional Timings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Loading masjids...</Text>
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
        <Text style={styles.headerTitle}>Manage Masjids</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Masjids List */}
      <FlatList
        data={masjids}
        keyExtractor={(item) => item.MasjidId.toString()}
        renderItem={renderMasjidItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingMasjid ? 'Edit Masjid' : 'Add New Masjid'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={styles.formContainer}>
                <Text style={styles.fieldLabel}>Masjid Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.MasjidName}
                  onChangeText={(text) => setFormData({...formData, MasjidName: text})}
                  placeholder="Enter masjid name"
                />

                <Text style={styles.fieldLabel}>Address *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.Address}
                  onChangeText={(text) => setFormData({...formData, Address: text})}
                  placeholder="Enter full address"
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.fieldLabel}>State *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipsContainer}>
                    {states.map((state) => (
                      <TouchableOpacity
                        key={state.StateId}
                        style={[
                          styles.chip,
                          cities.length > 0 && cities[0]?.StateId === state.StateId && styles.chipSelected
                        ]}
                        onPress={() => loadCitiesForState(state.StateId)}
                      >
                        <Text style={[
                          styles.chipText,
                          cities.length > 0 && cities[0]?.StateId === state.StateId && styles.chipTextSelected
                        ]}>
                          {state.StateName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {cities.length > 0 && (
                  <>
                    <Text style={styles.fieldLabel}>City *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.chipsContainer}>
                        {cities.map((city) => (
                          <TouchableOpacity
                            key={city.CityId}
                            style={[
                              styles.chip,
                              formData.CityId === city.CityId.toString() && styles.chipSelected
                            ]}
                            onPress={() => setFormData({...formData, CityId: city.CityId.toString()})}
                          >
                            <Text style={[
                              styles.chipText,
                              formData.CityId === city.CityId.toString() && styles.chipTextSelected
                            ]}>
                              {city.CityName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </>
                )}

                <Text style={styles.fieldLabel}>Imam Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.ImamName}
                  onChangeText={(text) => setFormData({...formData, ImamName: text})}
                  placeholder="Enter imam's name"
                />

                <Text style={styles.fieldLabel}>Contact Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.ContactNumber}
                  onChangeText={(text) => setFormData({...formData, ContactNumber: text})}
                  placeholder="Enter contact number"
                  keyboardType="phone-pad"
                />

                <Text style={styles.fieldLabel}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  value={formData.Latitude}
                  onChangeText={(text) => setFormData({...formData, Latitude: text})}
                  placeholder="Enter latitude (optional)"
                  keyboardType="decimal-pad"
                />

                <Text style={styles.fieldLabel}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  value={formData.Longitude}
                  onChangeText={(text) => setFormData({...formData, Longitude: text})}
                  placeholder="Enter longitude (optional)"
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>
                    {editingMasjid ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 5,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  masjidName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 5,
  },
  deleteButton: {
    padding: 8,
  },
  location: {
    fontSize: 14,
    color: '#2E8B57',
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 18,
  },
  imam: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contact: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  chip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  chipSelected: {
    backgroundColor: '#2E8B57',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#2E8B57',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  managementButtons: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  
  managementButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E8B57',
    paddingVertical: 8,
    borderRadius: 6,
  },
  
  additionalTimingsButton: {
    backgroundColor: '#3CB371',
  },
  
  managementButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  
});
