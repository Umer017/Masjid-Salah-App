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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

// Services
import ApiService from '../services/ApiService';

export default function ManageTimingsScreen({ navigation }) {
  const [masjids, setMasjids] = useState([]);
  const [selectedMasjid, setSelectedMasjid] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [salahTiming, setSalahTiming] = useState(null);
  const [defaultSchedule, setDefaultSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeField, setCurrentTimeField] = useState('');
  const [tempTime, setTempTime] = useState(new Date());
  const [formData, setFormData] = useState({
    FajrAzanTime: '',
    FajrIqamahTime: '',
    DhuhrAzanTime: '',
    DhuhrIqamahTime: '',
    AsrAzanTime: '',
    AsrIqamahTime: '',
    MaghribAzanTime: '',
    MaghribIqamahTime: '',
    IshaAzanTime: '',
    IshaIqamahTime: '',
    JummahAzanTime: '',
    JummahIqamahTime: '',
    IslamicDate: '',
  });
  // New state for default schedule modal
  const [defaultScheduleModalVisible, setDefaultScheduleModalVisible] = useState(false);
  // New state for monthly input modal
  const [monthlyInputModalVisible, setMonthlyInputModalVisible] = useState(false);
  // New state for schedule list modal
  const [scheduleListModalVisible, setScheduleListModalVisible] = useState(false);
  // New state for schedule list
  const [scheduleList, setScheduleList] = useState([]);
  // New state for monthly input form
  const [monthlyFormData, setMonthlyFormData] = useState({
    StartDate: new Date().toISOString().split('T')[0],
    EndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    FajrAzanTime: '',
    FajrIqamahTime: '',
    DhuhrAzanTime: '',
    DhuhrIqamahTime: '',
    AsrAzanTime: '',
    AsrIqamahTime: '',
    MaghribAzanTime: '',
    MaghribIqamahTime: '',
    IshaAzanTime: '',
    IshaIqamahTime: '',
    JummahAzanTime: '',
    JummahIqamahTime: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date'); // 'date', 'start', 'end'

  useEffect(() => {
    loadMasjids();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      loadSalahTiming();
      loadDefaultSchedule();
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

  const loadSalahTiming = async () => {
    if (!selectedMasjid) return;

    try {
      const response = await ApiService.getSalahTimingByMasjidAndDate(
        selectedMasjid.MasjidId,
        selectedDate
      );

      if (response.Success && response.Data) {
        setSalahTiming(response.Data);
        setFormData({
          FajrAzanTime: response.Data.FajrAzanTime || '',
          FajrIqamahTime: response.Data.FajrIqamahTime || '',
          DhuhrAzanTime: response.Data.DhuhrAzanTime || '',
          DhuhrIqamahTime: response.Data.DhuhrIqamahTime || '',
          AsrAzanTime: response.Data.AsrAzanTime || '',
          AsrIqamahTime: response.Data.AsrIqamahTime || '',
          MaghribAzanTime: response.Data.MaghribAzanTime || '',
          MaghribIqamahTime: response.Data.MaghribIqamahTime || '',
          IshaAzanTime: response.Data.IshaAzanTime || '',
          IshaIqamahTime: response.Data.IshaIqamahTime || '',
          JummahAzanTime: response.Data.JummahAzanTime || '',
          JummahIqamahTime: response.Data.JummahIqamahTime || '',
          IslamicDate: response.Data.IslamicDate || '',
        });
      } else {
        setSalahTiming(null);
        // If no specific timing for date, use default schedule as initial values
        if (defaultSchedule) {
          setFormData({
            FajrAzanTime: defaultSchedule.FajrAzanTime || '',
            FajrIqamahTime: defaultSchedule.FajrIqamahTime || '',
            DhuhrAzanTime: defaultSchedule.DhuhrAzanTime || '',
            DhuhrIqamahTime: defaultSchedule.DhuhrIqamahTime || '',
            AsrAzanTime: defaultSchedule.AsrAzanTime || '',
            AsrIqamahTime: defaultSchedule.AsrIqamahTime || '',
            MaghribAzanTime: defaultSchedule.MaghribAzanTime || '',
            MaghribIqamahTime: defaultSchedule.MaghribIqamahTime || '',
            IshaAzanTime: defaultSchedule.IshaAzanTime || '',
            IshaIqamahTime: defaultSchedule.IshaIqamahTime || '',
            JummahAzanTime: defaultSchedule.JummahAzanTime || '',
            JummahIqamahTime: defaultSchedule.JummahIqamahTime || '',
            IslamicDate: '',
          });
        } else {
          setFormData({
            FajrAzanTime: '',
            FajrIqamahTime: '',
            DhuhrAzanTime: '',
            DhuhrIqamahTime: '',
            AsrAzanTime: '',
            AsrIqamahTime: '',
            MaghribAzanTime: '',
            MaghribIqamahTime: '',
            IshaAzanTime: '',
            IshaIqamahTime: '',
            JummahAzanTime: '',
            JummahIqamahTime: '',
            IslamicDate: '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading salah timing:', error);
      setSalahTiming(null);
      // Even if there's an error, try to populate with default values if available
      if (defaultSchedule) {
        setFormData({
          FajrAzanTime: defaultSchedule.FajrAzanTime || '',
          FajrIqamahTime: defaultSchedule.FajrIqamahTime || '',
          DhuhrAzanTime: defaultSchedule.DhuhrAzanTime || '',
          DhuhrIqamahTime: defaultSchedule.DhuhrIqamahTime || '',
          AsrAzanTime: defaultSchedule.AsrAzanTime || '',
          AsrIqamahTime: defaultSchedule.AsrIqamahTime || '',
          MaghribAzanTime: defaultSchedule.MaghribAzanTime || '',
          MaghribIqamahTime: defaultSchedule.MaghribIqamahTime || '',
          IshaAzanTime: defaultSchedule.IshaAzanTime || '',
          IshaIqamahTime: defaultSchedule.IshaIqamahTime || '',
          JummahAzanTime: defaultSchedule.JummahAzanTime || '',
          JummahIqamahTime: defaultSchedule.JummahIqamahTime || '',
          IslamicDate: '',
        });
      }
    }
  };

  const loadDefaultSchedule = async () => {
    if (!selectedMasjid) return;

    try {
      const response = await ApiService.getDefaultSchedule(selectedMasjid.MasjidId);
      if (response.Success && response.Data) {
        setDefaultSchedule(response.Data);
      } else {
        setDefaultSchedule(null);
      }
    } catch (error) {
      console.error('Error loading default schedule:', error);
      setDefaultSchedule(null);
    }
  };

  const loadScheduleList = async () => {
    if (!selectedMasjid) return;

    try {
      setLoading(true);
      // Get schedule list for the next 30 days
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await ApiService.getSalahTimingsByMasjidWithDefault(
        selectedMasjid.MasjidId,
        startDate,
        endDate
      );

      if (response.Success && response.Data) {
        setScheduleList(response.Data);
      } else {
        setScheduleList([]);
      }
    } catch (error) {
      console.error('Error loading schedule list:', error);
      setScheduleList([]);
    } finally {
      setLoading(false);
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
        IslamicDate: formData.IslamicDate.trim() || null,
        FajrAzanTime: formData.FajrAzanTime || null,
        FajrIqamahTime: formData.FajrIqamahTime || null,
        DhuhrAzanTime: formData.DhuhrAzanTime || null,
        DhuhrIqamahTime: formData.DhuhrIqamahTime || null,
        AsrAzanTime: formData.AsrAzanTime || null,
        AsrIqamahTime: formData.AsrIqamahTime || null,
        MaghribAzanTime: formData.MaghribAzanTime || null,
        MaghribIqamahTime: formData.MaghribIqamahTime || null,
        IshaAzanTime: formData.IshaAzanTime || null,
        IshaIqamahTime: formData.IshaIqamahTime || null,
        JummahAzanTime: formData.JummahAzanTime || null,
        JummahIqamahTime: formData.JummahIqamahTime || null,
      };

      let response;
      if (salahTiming) {
        response = await ApiService.updateSalahTiming(salahTiming.SalahId, dataToSend);
      } else {
        response = await ApiService.createSalahTiming(dataToSend);
      }

      if (response.Success) {
        Alert.alert(
          'Success',
          `Prayer timings ${salahTiming ? 'updated' : 'created'} successfully`,
          [{ text: 'OK', onPress: () => {
            setModalVisible(false);
            loadSalahTiming(); // Reload to show updated data
          }}]
        );
      } else {
        Alert.alert('Error', response.Message || 'Failed to save prayer timings');
      }
    } catch (error) {
      console.error('Error saving prayer timings:', error);
      Alert.alert('Error', error.message || 'Failed to save prayer timings');
    }
  };

  // New function to handle saving default schedule
  const handleSaveDefaultSchedule = async () => {
    if (!selectedMasjid) {
      Alert.alert('Error', 'Please select a masjid');
      return;
    }

    try {
      const dataToSend = {
        MasjidId: selectedMasjid.MasjidId,
        FajrAzanTime: formData.FajrAzanTime || null,
        FajrIqamahTime: formData.FajrIqamahTime || null,
        DhuhrAzanTime: formData.DhuhrAzanTime || null,
        DhuhrIqamahTime: formData.DhuhrIqamahTime || null,
        AsrAzanTime: formData.AsrAzanTime || null,
        AsrIqamahTime: formData.AsrIqamahTime || null,
        MaghribAzanTime: formData.MaghribAzanTime || null,
        MaghribIqamahTime: formData.MaghribIqamahTime || null,
        IshaAzanTime: formData.IshaAzanTime || null,
        IshaIqamahTime: formData.IshaIqamahTime || null,
        JummahAzanTime: formData.JummahAzanTime || null,
        JummahIqamahTime: formData.JummahIqamahTime || null,
      };

      let response;
      if (defaultSchedule) {
        // Update existing default schedule
        response = await ApiService.updateDefaultSchedule(defaultSchedule.ScheduleId, dataToSend);
      } else {
        // Create new default schedule
        response = await ApiService.createDefaultSchedule(dataToSend);
      }

      if (response.Success) {
        Alert.alert(
          'Success',
          `Default schedule ${defaultSchedule ? 'updated' : 'created'} successfully`,
          [{ text: 'OK', onPress: () => {
            setDefaultScheduleModalVisible(false);
            loadDefaultSchedule(); // Reload to show updated data
          }}]
        );
      } else {
        Alert.alert('Error', response.Message || 'Failed to save default schedule');
      }
    } catch (error) {
      console.error('Error saving default schedule:', error);
      Alert.alert('Error', error.message || 'Failed to save default schedule');
    }
  };

  // New function to handle monthly input save
  const handleSaveMonthlyInput = async () => {
    if (!selectedMasjid) {
      Alert.alert('Error', 'Please select a masjid');
      return;
    }

    try {
      const dataToSend = {
        MasjidId: selectedMasjid.MasjidId,
        StartDate: monthlyFormData.StartDate,
        EndDate: monthlyFormData.EndDate,
        FajrAzanTime: monthlyFormData.FajrAzanTime || null,
        FajrIqamahTime: monthlyFormData.FajrIqamahTime || null,
        DhuhrAzanTime: monthlyFormData.DhuhrAzanTime || null,
        DhuhrIqamahTime: monthlyFormData.DhuhrIqamahTime || null,
        AsrAzanTime: monthlyFormData.AsrAzanTime || null,
        AsrIqamahTime: monthlyFormData.AsrIqamahTime || null,
        MaghribAzanTime: monthlyFormData.MaghribAzanTime || null,
        MaghribIqamahTime: monthlyFormData.MaghribIqamahTime || null,
        IshaAzanTime: monthlyFormData.IshaAzanTime || null,
        IshaIqamahTime: monthlyFormData.IshaIqamahTime || null,
        JummahAzanTime: monthlyFormData.JummahAzanTime || null,
        JummahIqamahTime: monthlyFormData.JummahIqamahTime || null,
      };

      const response = await ApiService.batchCreateSalahTimings(dataToSend);

      if (response.Success) {
        Alert.alert(
          'Success',
          `Monthly prayer timings created successfully (${response.Data.length} dates)`,
          [{ text: 'OK', onPress: () => {
            setMonthlyInputModalVisible(false);
            loadSalahTiming(); // Reload to show updated data
          }}]
        );
      } else {
        Alert.alert('Error', response.Message || 'Failed to save monthly prayer timings');
      }
    } catch (error) {
      console.error('Error saving monthly prayer timings:', error);
      Alert.alert('Error', error.message || 'Failed to save monthly prayer timings');
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

  const openTimePicker = (field, isMonthly = false) => {
    setCurrentTimeField(field);
    // Set initial time value if it exists
    const timeValue = isMonthly ? monthlyFormData[field] : formData[field];
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(num => parseInt(num));
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      setTempTime(date);
    } else {
      // Set a default time based on prayer type
      const defaultTimes = {
        'FajrAzanTime': [5, 30],
        'FajrIqamahTime': [5, 45],
        'DhuhrAzanTime': [12, 30],
        'DhuhrIqamahTime': [12, 45],
        'AsrAzanTime': [16, 0],
        'AsrIqamahTime': [16, 15],
        'MaghribAzanTime': [18, 30],
        'MaghribIqamahTime': [18, 45],
        'IshaAzanTime': [20, 0],
        'IshaIqamahTime': [20, 15],
        'JummahAzanTime': [12, 30],
        'JummahIqamahTime': [12, 45],
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
      
      setMonthlyFormData(prev => ({
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
    
    setMonthlyFormData(prev => ({
      ...prev,
      [currentTimeField]: timeString
    }));
    
    setShowTimePicker(false);
  };

  const cancelIOSTime = () => {
    setShowTimePicker(false);
  };

  const openDatePicker = (mode = 'date') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      switch (datePickerMode) {
        case 'date':
          setSelectedDate(formattedDate);
          break;
        case 'start':
          setMonthlyFormData(prev => ({
            ...prev,
            StartDate: formattedDate
          }));
          break;
        case 'end':
          setMonthlyFormData(prev => ({
            ...prev,
            EndDate: formattedDate
          }));
          break;
      }
      
      if (Platform.OS === 'ios') {
        setTempTime(selectedDate);
      }
    }
    
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const confirmIOSDate = () => {
    // For iOS, we need to manually confirm the date
    const formattedDate = tempTime.toISOString().split('T')[0];
    
    switch (datePickerMode) {
      case 'date':
        setSelectedDate(formattedDate);
        break;
      case 'start':
        setMonthlyFormData(prev => ({
          ...prev,
          StartDate: formattedDate
        }));
        break;
      case 'end':
        setMonthlyFormData(prev => ({
          ...prev,
          EndDate: formattedDate
        }));
        break;
    }
    
    setShowDatePicker(false);
  };

  const cancelIOSDate = () => {
    setShowDatePicker(false);
  };

  // Time input component for manual entry
  const TimeInput = ({ field, placeholder, isMonthly = false }) => {
    const [localTime, setLocalTime] = useState(isMonthly ? monthlyFormData[field] : formData[field] || '');

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
      if (isMonthly) {
        setMonthlyFormData(prev => ({
          ...prev,
          [field]: finalTime
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: finalTime
        }));
      }
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
          onPress={() => openTimePicker(field, isMonthly)}
        >
          <Ionicons name="time-outline" size={20} color="#2E8B57" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTimeRow = (label, azanTime, iqamahTime, icon, isDefault = false) => (
    <View style={styles.timeRow} key={label}>
      <View style={styles.timeHeader}>
        <Ionicons name={icon} size={20} color="#2E8B57" />
        <Text style={styles.timeLabel}>{label}</Text>
        {isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>
      <View style={styles.timeValues}>
        <Text style={styles.timeValue}>
          Azan: {formatTime(azanTime)}
        </Text>
        <Text style={styles.timeValue}>
          Iqamah: {formatTime(iqamahTime)}
        </Text>
      </View>
    </View>
  );

  const renderScheduleItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.scheduleItem}
      onPress={() => {
        setSelectedDate(item.Date);
        setScheduleListModalVisible(false);
        // Load the specific timing for this date
        loadSalahTiming();
      }}
    >
      <Text style={styles.scheduleDate}>{new Date(item.Date).toLocaleDateString()}</Text>
      <Text style={styles.scheduleTiming}>
        Fajr: {formatTime(item.FajrAzanTime)} | Dhuhr: {formatTime(item.DhuhrAzanTime)} | Asr: {formatTime(item.AsrAzanTime)}
      </Text>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Manage Prayer Timings</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              loadScheduleList();
              setScheduleListModalVisible(true);
            }}
          >
            <Ionicons name="list" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setMonthlyInputModalVisible(true)}
          >
            <Ionicons name="calendar" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="create" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
            onPress={() => openDatePicker('date')}
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
          {formData.IslamicDate && (
            <Text style={styles.islamicDate}>Islamic Date: {formData.IslamicDate}</Text>
          )}
          {defaultSchedule && (
            <Text style={styles.defaultScheduleNote}>
              Default schedule last updated: {new Date(defaultSchedule.LastUpdated).toLocaleString()}
            </Text>
          )}
        </View>

        {/* Prayer Timings */}
        {selectedMasjid && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prayer Timings</Text>
            {salahTiming ? (
              <View style={styles.timingsCard}>
                {renderTimeRow('Fajr', formData.FajrAzanTime, formData.FajrIqamahTime, 'sunrise')}
                {renderTimeRow('Dhuhr', formData.DhuhrAzanTime, formData.DhuhrIqamahTime, 'sunny')}
                {renderTimeRow('Asr', formData.AsrAzanTime, formData.AsrIqamahTime, 'partly-sunny')}
                {renderTimeRow('Maghrib', formData.MaghribAzanTime, formData.MaghribIqamahTime, 'sunset')}
                {renderTimeRow('Isha', formData.IshaAzanTime, formData.IshaIqamahTime, 'moon')}
                {(formData.JummahAzanTime || formData.JummahIqamahTime) &&
                  renderTimeRow('Jummah', formData.JummahAzanTime, formData.JummahIqamahTime, 'people')
                }
              </View>
            ) : defaultSchedule ? (
              <View style={styles.timingsCard}>
                {renderTimeRow('Fajr', defaultSchedule.FajrAzanTime, defaultSchedule.FajrIqamahTime, 'sunrise', true)}
                {renderTimeRow('Dhuhr', defaultSchedule.DhuhrAzanTime, defaultSchedule.DhuhrIqamahTime, 'sunny', true)}
                {renderTimeRow('Asr', defaultSchedule.AsrAzanTime, defaultSchedule.AsrIqamahTime, 'partly-sunny', true)}
                {renderTimeRow('Maghrib', defaultSchedule.MaghribAzanTime, defaultSchedule.MaghribIqamahTime, 'sunset', true)}
                {renderTimeRow('Isha', defaultSchedule.IshaAzanTime, defaultSchedule.IshaIqamahTime, 'moon', true)}
                {(defaultSchedule.JummahAzanTime || defaultSchedule.JummahIqamahTime) &&
                  renderTimeRow('Jummah', defaultSchedule.JummahAzanTime, defaultSchedule.JummahIqamahTime, 'people', true)
                }
                <View style={styles.defaultInfoContainer}>
                  <Ionicons name="information-circle" size={16} color="#2E8B57" />
                  <Text style={styles.defaultInfoText}>
                    Showing default schedule. Last updated: {new Date(defaultSchedule.LastUpdated).toLocaleString()}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noTimingsCard}>
                <Ionicons name="time-outline" size={40} color="#ccc" />
                <Text style={styles.noTimingsText}>No prayer timings set for this date</Text>
                <TouchableOpacity
                  style={styles.addTimingsButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.addTimingsButtonText}>Add Prayer Timings</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Modal for specific date */}
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
                  {salahTiming ? 'Edit Prayer Timings' : 'Add Prayer Timings'}
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

                {defaultSchedule && (
                  <View style={styles.defaultScheduleInfo}>
                    <Ionicons name="information-circle" size={16} color="#2E8B57" />
                    <Text style={styles.defaultScheduleInfoText}>
                      Using default schedule as template
                    </Text>
                  </View>
                )}

                <Text style={styles.fieldLabel}>Islamic Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.IslamicDate}
                  onChangeText={(text) => setFormData({...formData, IslamicDate: text})}
                  placeholder="e.g., 15 Ramadan 1445"
                />

                {/* Fajr */}
                <Text style={styles.prayerTitle}>Fajr</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="FajrAzanTime" placeholder="05:30" />
                    {defaultSchedule?.FajrAzanTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.FajrAzanTime)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="FajrIqamahTime" placeholder="05:45" />
                    {defaultSchedule?.FajrIqamahTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.FajrIqamahTime)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Dhuhr */}
                <Text style={styles.prayerTitle}>Dhuhr</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="DhuhrAzanTime" placeholder="12:30" />
                    {defaultSchedule?.DhuhrAzanTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.DhuhrAzanTime)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="DhuhrIqamahTime" placeholder="12:45" />
                    {defaultSchedule?.DhuhrIqamahTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.DhuhrIqamahTime)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Asr */}
                <Text style={styles.prayerTitle}>Asr</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="AsrAzanTime" placeholder="16:00" />
                    {defaultSchedule?.AsrAzanTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.AsrAzanTime)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="AsrIqamahTime" placeholder="16:15" />
                    {defaultSchedule?.AsrIqamahTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.AsrIqamahTime)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Maghrib */}
                <Text style={styles.prayerTitle}>Maghrib</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="MaghribAzanTime" placeholder="18:30" />
                    {defaultSchedule?.MaghribAzanTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.MaghribAzanTime)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="MaghribIqamahTime" placeholder="18:45" />
                    {defaultSchedule?.MaghribIqamahTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.MaghribIqamahTime)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Isha */}
                <Text style={styles.prayerTitle}>Isha</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="IshaAzanTime" placeholder="20:00" />
                    {defaultSchedule?.IshaAzanTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.IshaAzanTime)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="IshaIqamahTime" placeholder="20:15" />
                    {defaultSchedule?.IshaIqamahTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.IshaIqamahTime)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Jummah */}
                <Text style={styles.prayerTitle}>Jummah (Optional)</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="JummahAzanTime" placeholder="12:30" />
                    {defaultSchedule?.JummahAzanTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.JummahAzanTime)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="JummahIqamahTime" placeholder="12:45" />
                    {defaultSchedule?.JummahIqamahTime && (
                      <Text style={styles.defaultTimeNote}>
                        Default: {formatTime(defaultSchedule.JummahIqamahTime)}
                      </Text>
                    )}
                  </View>
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
                    {salahTiming ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Default Schedule Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={defaultScheduleModalVisible}
        onRequestClose={() => setDefaultScheduleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {defaultSchedule ? 'Edit Default Schedule' : 'Add Default Schedule'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setDefaultScheduleModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                <Text style={styles.formNote}>
                  Set the default prayer times for {selectedMasjid?.MasjidName}. These times will be used as the default for all dates unless specific timings are set.
                </Text>

                {/* Fajr */}
                <Text style={styles.prayerTitle}>Fajr</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="FajrAzanTime" placeholder="05:30" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="FajrIqamahTime" placeholder="05:45" isMonthly={true} />
                  </View>
                </View>

                {/* Dhuhr */}
                <Text style={styles.prayerTitle}>Dhuhr</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="DhuhrAzanTime" placeholder="12:30" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="DhuhrIqamahTime" placeholder="12:45" isMonthly={true} />
                  </View>
                </View>

                {/* Asr */}
                <Text style={styles.prayerTitle}>Asr</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="AsrAzanTime" placeholder="16:00" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="AsrIqamahTime" placeholder="16:15" isMonthly={true} />
                  </View>
                </View>

                {/* Maghrib */}
                <Text style={styles.prayerTitle}>Maghrib</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="MaghribAzanTime" placeholder="18:30" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="MaghribIqamahTime" placeholder="18:45" isMonthly={true} />
                  </View>
                </View>

                {/* Isha */}
                <Text style={styles.prayerTitle}>Isha</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="IshaAzanTime" placeholder="20:00" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="IshaIqamahTime" placeholder="20:15" isMonthly={true} />
                  </View>
                </View>

                {/* Jummah */}
                <Text style={styles.prayerTitle}>Jummah (Optional)</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="JummahAzanTime" placeholder="12:30" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="JummahIqamahTime" placeholder="12:45" isMonthly={true} />
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setDefaultScheduleModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveDefaultSchedule}
                >
                  <Text style={styles.saveButtonText}>
                    {defaultSchedule ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Monthly Input Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={monthlyInputModalVisible}
        onRequestClose={() => setMonthlyInputModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Monthly Prayer Timings</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setMonthlyInputModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                <Text style={styles.formNote}>
                  Set prayer times for a date range. These times will be applied to all dates in the range unless specific timings are set.
                </Text>

                {/* Date Range */}
                <Text style={styles.fieldLabel}>Date Range</Text>
                <View style={styles.dateRangeContainer}>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateInputLabel}>Start Date</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => openDatePicker('start')}
                    >
                      <Text>{monthlyFormData.StartDate}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateInputLabel}>End Date</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => openDatePicker('end')}
                    >
                      <Text>{monthlyFormData.EndDate}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Fajr */}
                <Text style={styles.prayerTitle}>Fajr</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="FajrAzanTime" placeholder="05:30" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="FajrIqamahTime" placeholder="05:45" isMonthly={true} />
                  </View>
                </View>

                {/* Dhuhr */}
                <Text style={styles.prayerTitle}>Dhuhr</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="DhuhrAzanTime" placeholder="12:30" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="DhuhrIqamahTime" placeholder="12:45" isMonthly={true} />
                  </View>
                </View>

                {/* Asr */}
                <Text style={styles.prayerTitle}>Asr</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="AsrAzanTime" placeholder="16:00" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="AsrIqamahTime" placeholder="16:15" isMonthly={true} />
                  </View>
                </View>

                {/* Maghrib */}
                <Text style={styles.prayerTitle}>Maghrib</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="MaghribAzanTime" placeholder="18:30" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="MaghribIqamahTime" placeholder="18:45" isMonthly={true} />
                  </View>
                </View>

                {/* Isha */}
                <Text style={styles.prayerTitle}>Isha</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="IshaAzanTime" placeholder="20:00" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="IshaIqamahTime" placeholder="20:15" isMonthly={true} />
                  </View>
                </View>

                {/* Jummah */}
                <Text style={styles.prayerTitle}>Jummah (Optional)</Text>
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Azan</Text>
                    <TimeInput field="JummahAzanTime" placeholder="12:30" isMonthly={true} />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeInputLabel}>Iqamah</Text>
                    <TimeInput field="JummahIqamahTime" placeholder="12:45" isMonthly={true} />
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setMonthlyInputModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveMonthlyInput}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Schedule List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={scheduleListModalVisible}
        onRequestClose={() => setScheduleListModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule List</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setScheduleListModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.scheduleListContainer}>
              <FlatList
                data={scheduleList}
                keyExtractor={(item) => item.SalahId?.toString() || item.Date}
                renderItem={renderScheduleItem}
                ListEmptyComponent={
                  <View style={styles.emptyScheduleList}>
                    <Ionicons name="calendar-outline" size={40} color="#ccc" />
                    <Text style={styles.emptyScheduleListText}>No schedules found</Text>
                  </View>
                }
              />
            </View>
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

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={new Date(
            datePickerMode === 'date' ? selectedDate : 
            datePickerMode === 'start' ? monthlyFormData.StartDate : 
            monthlyFormData.EndDate
          )}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={datePickerMode === 'end' ? new Date(monthlyFormData.StartDate) : undefined}
          maximumDate={datePickerMode === 'start' ? new Date(monthlyFormData.EndDate) : undefined}
        />
      )}

      {/* iOS Date Picker Confirmation Modal */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerContainer}>
              <Text style={styles.timePickerTitle}>Select Date</Text>
              <DateTimePicker
                testID="datePicker"
                value={new Date(
                  datePickerMode === 'date' ? selectedDate : 
                  datePickerMode === 'start' ? monthlyFormData.StartDate : 
                  monthlyFormData.EndDate
                )}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTempTime(selectedDate);
                  }
                }}
                minimumDate={datePickerMode === 'end' ? new Date(monthlyFormData.StartDate) : undefined}
                maximumDate={datePickerMode === 'start' ? new Date(monthlyFormData.EndDate) : undefined}
              />
              <View style={styles.timePickerActions}>
                <TouchableOpacity
                  style={styles.timePickerCancelButton}
                  onPress={cancelIOSDate}
                >
                  <Text style={styles.timePickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerConfirmButton}
                  onPress={confirmIOSDate}
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
  islamicDate: {
    fontSize: 14,
    color: '#2E8B57',
    marginTop: 5,
    fontStyle: 'italic',
  },
  defaultScheduleNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
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
  defaultBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 10,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: '#2E8B57',
    fontWeight: 'bold',
  },
  timeValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeValue: {
    fontSize: 14,
    color: '#666',
  },
  defaultInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  defaultInfoText: {
    fontSize: 12,
    color: '#2E8B57',
    marginLeft: 8,
    flex: 1,
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
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: '90%',
    margin: 20,
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
  defaultScheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  defaultScheduleInfoText: {
    fontSize: 14,
    color: '#2E8B57',
    marginLeft: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginTop: 20,
    marginBottom: 10,
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timeInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  timeInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
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
  defaultTimeNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
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
  // Additional styles for monthly input and schedule list
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  scheduleListContainer: {
    flex: 1,
    padding: 20,
    maxHeight: '80%',
  },
  scheduleItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  scheduleTiming: {
    fontSize: 14,
    color: '#666',
    flexWrap: 'wrap',
  },
  emptyScheduleList: {
    alignItems: 'center',
    padding: 40,
  },
  emptyScheduleListText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
});