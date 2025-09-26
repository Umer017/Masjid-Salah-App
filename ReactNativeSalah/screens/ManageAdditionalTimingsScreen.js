import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

// Services
import ApiService from '../services/ApiService';

export default function ManageAdditionalTimingsScreen({ navigation }) {
  const [masjids, setMasjids] = useState([]);
  const [selectedMasjid, setSelectedMasjid] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [additionalTiming, setAdditionalTiming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeField, setCurrentTimeField] = useState('');
  const [tempTime, setTempTime] = useState(new Date());
  const [formData, setFormData] = useState({
    SunriseTime: '',
    SunsetTime: '',
    ZawalTime: '',
    TahajjudTime: '',
    SehriEndTime: '',
    IftarTime: '',
  });

  useEffect(() => {
    loadMasjids();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      loadAdditionalTiming();
    }
  }, [selectedMasjid, selectedDate]);

  const loadMasjids = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAllMasjids(1, 100);
      if (response.Success) {
        setMasjids(response.Data.Data);
        if (response.Data.Data.length > 0) {
          setSelectedMasjid(response.Data.Data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading masjids:', error);
      Alert.alert('Error', 'Failed to load masjids');
    } finally {
      setLoading(false);
    }
  };

  const loadAdditionalTiming = async () => {
    if (!selectedMasjid) return;

    try {
      const response = await ApiService.getAdditionalTimingByMasjidAndDate(
        selectedMasjid.MasjidId,
        selectedDate
      );

      if (response.Success && response.Data) {
        setAdditionalTiming(response.Data);
        setFormData({
          SunriseTime: response.Data.SunriseTime || '',
          SunsetTime: response.Data.SunsetTime || '',
          ZawalTime: response.Data.ZawalTime || '',
          TahajjudTime: response.Data.TahajjudTime || '',
          SehriEndTime: response.Data.SehriEndTime || '',
          IftarTime: response.Data.IftarTime || '',
        });
      } else {
        setAdditionalTiming(null);
        setFormData({
          SunriseTime: '',
          SunsetTime: '',
          ZawalTime: '',
          TahajjudTime: '',
          SehriEndTime: '',
          IftarTime: '',
        });
      }
    } catch (error) {
      console.error('Error loading additional timing:', error);
      setAdditionalTiming(null);
      setFormData({
        SunriseTime: '',
        SunsetTime: '',
        ZawalTime: '',
        TahajjudTime: '',
        SehriEndTime: '',
        IftarTime: '',
      });
    }
  };

  const handleSave = async () => {
    if (!selectedMasjid) {
      Alert.alert('Error', 'Please select a masjid');
      return;
    }

    try {
      const dataToSend = {
        MasjidId: selectedMasjid.MasjidId,
        Date: selectedDate,
        SunriseTime: formData.SunriseTime || null,
        SunsetTime: formData.SunsetTime || null,
        ZawalTime: formData.ZawalTime || null,
        TahajjudTime: formData.TahajjudTime || null,
        SehriEndTime: formData.SehriEndTime || null,
        IftarTime: formData.IftarTime || null,
      };

      let response;
      if (additionalTiming) {
        response = await ApiService.updateAdditionalTiming(additionalTiming.AdditionalId, dataToSend);
      } else {
        response = await ApiService.createAdditionalTiming(dataToSend);
      }

      if (response.Success) {
        Alert.alert(
          'Success',
          `Additional timings ${additionalTiming ? 'updated' : 'created'} successfully`,
          [{ text: 'OK', onPress: () => {
            setModalVisible(false);
            loadAdditionalTiming(); // Reload to show updated data
          }}]
        );
      } else {
        Alert.alert('Error', response.Message || 'Failed to save additional timings');
      }
    } catch (error) {
      console.error('Error saving additional timings:', error);
      Alert.alert('Error', error.message || 'Failed to save additional timings');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not Set';
    
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${displayHours}:${minutes} ${ampm}`;
    }
    
    return timeString;
  };

  const openTimePicker = (field) => {
    setCurrentTimeField(field);
    // Set initial time value if it exists
    if (formData[field]) {
      const [hours, minutes] = formData[field].split(':').map(num => parseInt(num));
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      setTempTime(date);
    } else {
      // Set a default time based on timing type
      const defaultTimes = {
        'SunriseTime': [6, 0],
        'SunsetTime': [18, 0],
        'ZawalTime': [12, 0],
        'TahajjudTime': [2, 0],
        'SehriEndTime': [4, 30],
        'IftarTime': [19, 0],
      };
      
      const [defaultHour, defaultMinute] = defaultTimes[field] || [12, 0];
      const date = new Date();
      date.setHours(defaultHour, defaultMinute, 0, 0);
      setTempTime(date);
    }
    setShowTimePicker(true);
  };

  const onTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (event.type === 'set' && selectedTime) {
      // Format time as HH:MM in 24-hour format
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      setFormData(prev => ({
        ...prev,
        [currentTimeField]: timeString
      }));
      
      if (Platform.OS === 'ios') {
        setTempTime(selectedTime);
      }
    }
    
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setShowTimePicker(false);
    }
  };

  const confirmIOSTime = () => {
    // For iOS, we need to manually confirm the time
    const hours = tempTime.getHours().toString().padStart(2, '0');
    const minutes = tempTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    setFormData(prev => ({
      ...prev,
      [currentTimeField]: timeString
    }));
    
    setShowTimePicker(false);
  };

  const cancelIOSTime = () => {
    setShowTimePicker(false);
  };

  // Time input component for manual entry
  const TimeInput = ({ field, placeholder }) => {
    const [localTime, setLocalTime] = useState(formData[field] || '');

    const handleTimeInput = (text) => {
      // Format as user types
      let formatted = text.replace(/[^0-9]/g, ''); // Only numbers
      
      if (formatted.length >= 3) {
        formatted = formatted.slice(0, 2) + ':' + formatted.slice(2, 4);
      }
      
      if (formatted.length > 5) {
        formatted = formatted.slice(0, 5);
      }

      setLocalTime(formatted);
    };

    const handleBlur = () => {
      let finalTime = localTime;
      
      // Validate and format the time
      if (finalTime.includes(':')) {
        const [hours, minutes] = finalTime.split(':');
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        
        if (h <= 23 && m <= 59) {
          finalTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        } else {
          finalTime = '';
          Alert.alert('Invalid Time', 'Please enter a valid time (HH:MM)');
        }
      } else if (finalTime.length === 4) {
        // Handle HHMM format
        const h = parseInt(finalTime.slice(0, 2)) || 0;
        const m = parseInt(finalTime.slice(2, 4)) || 0;
        
        if (h <= 23 && m <= 59) {
          finalTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        } else {
          finalTime = '';
          Alert.alert('Invalid Time', 'Please enter a valid time (HH:MM)');
        }
      } else if (finalTime.length > 0 && finalTime.length < 4) {
        finalTime = '';
        Alert.alert('Invalid Time', 'Please enter a valid time (HH:MM)');
      }

      setLocalTime(finalTime);
      setFormData(prev => ({
        ...prev,
        [field]: finalTime
      }));
    };

    return (
      <View style={styles.timeInputWithPicker}>
        <TextInput
          style={styles.timeInput}
          value={localTime}
          onChangeText={handleTimeInput}
          onBlur={handleBlur}
          placeholder={placeholder}
          keyboardType="numeric"
          maxLength={5}
        />
        <TouchableOpacity
          style={styles.timePickerIconButton}
          onPress={() => openTimePicker(field)}
        >
          <Ionicons name="time-outline" size={20} color="#2E8B57" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTimeRow = (label, time, icon) => (
    <View style={styles.timeRow} key={label}>
      <View style={styles.timeHeader}>
        <Ionicons name={icon} size={20} color="#2E8B57" />
        <Text style={styles.timeLabel}>{label}</Text>
      </View>
      <Text style={styles.timeValue}>
        {formatTime(time)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Loading data...</Text>
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
        <Text style={styles.headerTitle}>Manage Additional Timings</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="create" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Masjid Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Masjid</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.masjidChips}>
              {masjids.map((masjid) => (
                <TouchableOpacity
                  key={masjid.MasjidId}
                  style={[
                    styles.masjidChip,
                    selectedMasjid?.MasjidId === masjid.MasjidId && styles.masjidChipSelected
                  ]}
                  onPress={() => setSelectedMasjid(masjid)}
                >
                  <Text style={[
                    styles.masjidChipText,
                    selectedMasjid?.MasjidId === masjid.MasjidId && styles.masjidChipTextSelected
                  ]}>
                    {masjid.MasjidName}
                  </Text>
                  <Text style={[
                    styles.masjidChipLocation,
                    selectedMasjid?.MasjidId === masjid.MasjidId && styles.masjidChipLocationSelected
                  ]}>
                    {masjid.CityName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity 
            style={styles.dateContainer}
            onPress={() => {
              // For now, we'll just show an alert about the date picker
              // In a full implementation, you could integrate a date picker library
              Alert.alert('Date Selection', 'In a full implementation, this would open a date picker. For now, you can manually change the date in the code.');
            }}
          >
            <Ionicons name="calendar" size={20} color="#2E8B57" />
            <Text style={styles.dateText}>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#2E8B57" />
          </TouchableOpacity>
        </View>

        {/* Additional Timings */}
        {selectedMasjid && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Timings</Text>
            {additionalTiming ? (
              <View style={styles.timingsCard}>
                {renderTimeRow('Sunrise', formData.SunriseTime, 'sunny-outline')}
                {renderTimeRow('Sunset', formData.SunsetTime, 'sunny-outline')}
                {renderTimeRow('Zawal', formData.ZawalTime, 'sunny-outline')}
                {renderTimeRow('Sehri Ends', formData.SehriEndTime, 'moon-outline')}
                {renderTimeRow('Iftar', formData.IftarTime, 'restaurant-outline')}
                {renderTimeRow('Tahajjud', formData.TahajjudTime, 'moon-outline')}
              </View>
            ) : (
              <View style={styles.noTimingsCard}>
                <Ionicons name="time-outline" size={40} color="#ccc" />
                <Text style={styles.noTimingsText}>No additional timings set for this date</Text>
                <TouchableOpacity
                  style={styles.addTimingsButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.addTimingsButtonText}>Add Additional Timings</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
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
                  {additionalTiming ? 'Edit Additional Timings' : 'Add Additional Timings'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                <Text style={styles.formNote}>
                  Use 24-hour format (HH:MM) for times. You can type directly or use the time picker.
                </Text>

                {/* Sunrise */}
                <Text style={styles.timingTitle}>Sunrise</Text>
                <View style={styles.timeInputContainer}>
                  <TimeInput field="SunriseTime" placeholder="06:00" />
                </View>

                {/* Sunset */}
                <Text style={styles.timingTitle}>Sunset</Text>
                <View style={styles.timeInputContainer}>
                  <TimeInput field="SunsetTime" placeholder="18:00" />
                </View>

                {/* Zawal */}
                <Text style={styles.timingTitle}>Zawal</Text>
                <View style={styles.timeInputContainer}>
                  <TimeInput field="ZawalTime" placeholder="12:00" />
                </View>

                {/* Sehri Ends */}
                <Text style={styles.timingTitle}>Sehri Ends</Text>
                <View style={styles.timeInputContainer}>
                  <TimeInput field="SehriEndTime" placeholder="04:30" />
                </View>

                {/* Iftar */}
                <Text style={styles.timingTitle}>Iftar</Text>
                <View style={styles.timeInputContainer}>
                  <TimeInput field="IftarTime" placeholder="19:00" />
                </View>

                {/* Tahajjud */}
                <Text style={styles.timingTitle}>Tahajjud</Text>
                <View style={styles.timeInputContainer}>
                  <TimeInput field="TahajjudTime" placeholder="02:00" />
                </View>
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
                    {additionalTiming ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={tempTime}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      {/* iOS Time Picker Confirmation Modal */}
      {showTimePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerContainer}>
              <Text style={styles.timePickerTitle}>Select Time</Text>
              <DateTimePicker
                testID="dateTimePicker"
                value={tempTime}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setTempTime(selectedTime);
                  }
                }}
              />
              <View style={styles.timePickerActions}>
                <TouchableOpacity
                  style={styles.timePickerCancelButton}
                  onPress={cancelIOSTime}
                >
                  <Text style={styles.timePickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerConfirmButton}
                  onPress={confirmIOSTime}
                >
                  <Text style={styles.timePickerConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  masjidChips: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  masjidChip: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
    minWidth: 150,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  masjidChipSelected: {
    backgroundColor: '#2E8B57',
  },
  masjidChipText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  masjidChipTextSelected: {
    color: '#fff',
  },
  masjidChipLocation: {
    fontSize: 14,
    color: '#666',
  },
  masjidChipLocationSelected: {
    color: '#E0E0E0',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  timingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timeRow: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  timeValue: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noTimingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noTimingsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  addTimingsButton: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addTimingsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
  formNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  timingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginTop: 20,
    marginBottom: 10,
  },
  timeInputContainer: {
    marginHorizontal: 5,
  },
  timeInputWithPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  timeInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  timePickerIconButton: {
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
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
  // Time Picker Modal Styles
  timePickerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    minWidth: 300,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  timePickerActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 15,
  },
  timePickerCancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  timePickerCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  timePickerConfirmButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#2E8B57',
    borderRadius: 8,
    alignItems: 'center',
  },
  timePickerConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});