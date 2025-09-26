import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Services
import ApiService from '../services/ApiService';

// Helper for green color used in UI
const PRIMARY_GREEN = '#2E8B57';
const LIGHT_GREEN = '#2E8B57';

export default function MasjidDetailsScreen({ route, navigation }) {
  const { masjid } = route.params;
  const [dailySchedule, setDailySchedule] = useState(null);
  const [defaultSchedule, setDefaultSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDailySchedule();
  }, [selectedDate]);

  const loadDailySchedule = async () => {
    try {
      setLoading(true);

      const defaultResponse = await ApiService.getDefaultSchedule(masjid.MasjidId);
      if (defaultResponse.Success && defaultResponse.Data) setDefaultSchedule(defaultResponse.Data);

      const response = await ApiService.getDailySchedule(masjid.MasjidId, selectedDate);
      if (response.Success && response.Data) {
        setDailySchedule(response.Data);
      } else {
        const timingResponse = await ApiService.getSalahTimingByMasjidAndDate(masjid.MasjidId, selectedDate);
        const additionalResponse = await ApiService.getAdditionalTimingByMasjidAndDate(masjid.MasjidId, selectedDate);
        const eventsResponse = await ApiService.getSpecialEventsByMasjid(masjid.MasjidId, selectedDate, selectedDate);

        let salahTiming = null;
        if (timingResponse.Success && timingResponse.Data) salahTiming = timingResponse.Data;
        else if (defaultResponse.Success && defaultResponse.Data) salahTiming = {
          FajrAzanTime: defaultResponse.Data.FajrAzanTime,
          FajrIqamahTime: defaultResponse.Data.FajrIqamahTime,
          DhuhrAzanTime: defaultResponse.Data.DhuhrAzanTime,
          DhuhrIqamahTime: defaultResponse.Data.DhuhrIqamahTime,
          AsrAzanTime: defaultResponse.Data.AsrAzanTime,
          AsrIqamahTime: defaultResponse.Data.AsrIqamahTime,
          MaghribAzanTime: defaultResponse.Data.MaghribAzanTime,
          MaghribIqamahTime: defaultResponse.Data.MaghribIqamahTime,
          IshaAzanTime: defaultResponse.Data.IshaAzanTime,
          IshaIqamahTime: defaultResponse.Data.IshaIqamahTime,
          JummahAzanTime: defaultResponse.Data.JummahAzanTime,
          JummahIqamahTime: defaultResponse.Data.JummahIqamahTime,
        };

        setDailySchedule({
          Date: selectedDate,
          Masjid: masjid,
          SalahTiming: salahTiming,
          AdditionalTimings: additionalResponse.Success ? additionalResponse.Data : null,
          SpecialEvents: eventsResponse.Success ? eventsResponse.Data : [],
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load prayer timings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailySchedule();
    setRefreshing(false);
  };

  // Format time as HH:MM AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return 'Not Set';
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      let hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${displayHours}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Prayer icons based on name
  const getPrayerIcon = (prayerName) => {
    switch (prayerName) {
      case 'Fajr':
      case 'Dhuhr':
        return 'sunny-outline';
      case 'Asr':
        return 'cloud-outline';
      case 'Maghrib':
      case 'Isha':
        return 'moon-outline';
      case 'Jummah':
        return 'people-outline';
      default:
        return 'time-outline';
    }
  };

  const PrayerCard = ({ prayerName, azanTime, iqamahTime, isDefault }) => (
    <View style={styles.prayerCard}>
      <View style={styles.prayerRow}>
        <Ionicons name={getPrayerIcon(prayerName)} size={24} color="#FFD600" style={{ marginRight: 10 }} />
        <Text style={styles.prayerName}>{prayerName}</Text>
        {isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>
      <View style={styles.prayerTimesRow}>
        <View style={styles.prayerTimesCol}>
          <Text style={styles.prayerTimesLabel}>Azan</Text>
          <Text style={styles.prayerTimesGreen}>{formatTime(azanTime)}</Text>
        </View>
        <View style={styles.prayerTimesCol}>
          <Text style={styles.prayerTimesLabel}>Iqamah</Text>
          <Text style={styles.prayerTimesBlack}>{formatTime(iqamahTime)}</Text>
        </View>
      </View>
    </View>
  );

  const AdditionalTimingCard = ({ title, time, icon }) => (
    <View style={styles.additionalTimingCard}>
      <View style={styles.additionalTimingRow}>
        <Ionicons name={icon} size={20} color="#2E8B57" style={{ marginRight: 10 }} />
        <Text style={styles.additionalTimingTitle}>{title}</Text>
      </View>
      <Text style={styles.additionalTimingTime}>{formatTime(time)}</Text>
    </View>
  );

  const renderPrayerCards = () => {
    const timings = dailySchedule?.SalahTiming || defaultSchedule;
    if (!timings) return null;
    const defaultBadgeCheck = (prayer, azanTime) => (
      defaultSchedule &&
      defaultSchedule[prayer + 'AzanTime'] === azanTime
    );
    return (
      <View>
        <PrayerCard
          prayerName="Fajr"
          azanTime={timings.FajrAzanTime}
          iqamahTime={timings.FajrIqamahTime}
          isDefault={defaultBadgeCheck('Fajr', timings.FajrAzanTime)}
        />
        <PrayerCard
          prayerName="Dhuhr"
          azanTime={timings.DhuhrAzanTime}
          iqamahTime={timings.DhuhrIqamahTime}
          isDefault={defaultBadgeCheck('Dhuhr', timings.DhuhrAzanTime)}
        />
        <PrayerCard
          prayerName="Asr"
          azanTime={timings.AsrAzanTime}
          iqamahTime={timings.AsrIqamahTime}
          isDefault={defaultBadgeCheck('Asr', timings.AsrAzanTime)}
        />
        {timings.MaghribAzanTime &&
          <PrayerCard
            prayerName="Maghrib"
            azanTime={timings.MaghribAzanTime}
            iqamahTime={timings.MaghribIqamahTime}
            isDefault={defaultBadgeCheck('Maghrib', timings.MaghribAzanTime)}
          />}
        {timings.IshaAzanTime &&
          <PrayerCard
            prayerName="Isha"
            azanTime={timings.IshaAzanTime}
            iqamahTime={timings.IshaIqamahTime}
            isDefault={defaultBadgeCheck('Isha', timings.IshaAzanTime)}
          />}
        {(timings.JummahAzanTime || timings.JummahIqamahTime) &&
          <PrayerCard
            prayerName="Jummah"
            azanTime={timings.JummahAzanTime}
            iqamahTime={timings.JummahIqamahTime}
            isDefault={defaultBadgeCheck('Jummah', timings.JummahAzanTime)}
          />}
      </View>
    );
  };

  const renderAdditionalTimings = () => {
    const additionalTimings = dailySchedule?.AdditionalTimings;
    if (!additionalTimings) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Timings</Text>
        <View style={styles.additionalTimingsContainer}>
          {additionalTimings.SunriseTime && (
            <AdditionalTimingCard 
              title="Sunrise" 
              time={additionalTimings.SunriseTime} 
              icon="sunny-outline" 
            />
          )}
          {additionalTimings.ZawalTime && (
            <AdditionalTimingCard 
              title="Zawal" 
              time={additionalTimings.ZawalTime} 
              icon="sunny-outline" 
            />
          )}
          {additionalTimings.SunsetTime && (
            <AdditionalTimingCard 
              title="Sunset" 
              time={additionalTimings.SunsetTime} 
              icon="sunny-outline" 
            />
          )}
          {additionalTimings.SehriEndTime && (
            <AdditionalTimingCard 
              title="Sehri Ends" 
              time={additionalTimings.SehriEndTime} 
              icon="moon-outline" 
            />
          )}
          {additionalTimings.IftarTime && (
            <AdditionalTimingCard 
              title="Iftar" 
              time={additionalTimings.IftarTime} 
              icon="restaurant-outline" 
            />
          )}
          {additionalTimings.TahajjudTime && (
            <AdditionalTimingCard 
              title="Tahajjud" 
              time={additionalTimings.TahajjudTime} 
              icon="moon-outline" 
            />
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color={PRIMARY_GREEN} />
        <Text style={styles.loadingText}>Loading prayer timings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{masjid.MasjidName}</Text>
      </View>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_GREEN]}
          />
        }
      >
        {/* Masjid Info Card */}
        <View style={styles.masjidCard}>
          <Text style={styles.masjidBig}>{masjid.MasjidName}</Text>
          <Text style={styles.masjidGreen}>{masjid.CityName}, {masjid.StateName}</Text>
          <Text style={styles.masjidAddress}>{masjid.Address}</Text>
          {masjid.ImamName && (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={PRIMARY_GREEN} />
              <Text style={styles.infoText}>Imam: {masjid.ImamName}</Text>
            </View>
          )}
          {masjid.ContactNumber && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={PRIMARY_GREEN} />
              <Text style={styles.infoText}>{masjid.ContactNumber}</Text>
            </View>
          )}
          {masjid.distance && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={PRIMARY_GREEN} />
              <Text style={styles.infoText}>{masjid.distance} km away</Text>
            </View>
          )}
          {defaultSchedule && (
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color={PRIMARY_GREEN} />
              <Text style={styles.infoText}>
                Last updated: {formatLastUpdated(defaultSchedule.LastUpdated)}
              </Text>
            </View>
          )}
          {/* Current Time */}
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={PRIMARY_GREEN} />
            <Text style={styles.infoText}>
              Current Time: {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.directionsButton}
            activeOpacity={0.90}
            onPress={() => {
              const url = Platform.select({
                ios: `maps:0,0?q=${masjid.Latitude},${masjid.Longitude}`,
                default: `https://www.google.com/maps/dir/?api=1&destination=${masjid.Latitude},${masjid.Longitude}`,
              });
              Linking.openURL(url).catch(() => {
                Alert.alert('Error', 'Unable to open Maps');
              });
            }}
          >
            <Ionicons name="navigate" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
        {/* Date Card */}
        <View style={styles.dateCard}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          {dailySchedule?.IslamicDate && (
            <Text style={styles.islamicDateText}>Islamic Date: {dailySchedule.IslamicDate}</Text>
          )}
        </View>
        {/* Prayer Times Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prayer Times</Text>
          {renderPrayerCards()}
        </View>
        {/* Additional Timings Section */}
        {renderAdditionalTimings()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F9FB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F9FB' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#333', fontWeight: '500' },
  header: {
    backgroundColor: PRIMARY_GREEN,
    paddingTop: 30,
    paddingBottom: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 4,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  backButton: {
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 3,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    letterSpacing: 0.5,
  },
  content: { flex: 1 },
  masjidCard: {
    backgroundColor: '#fff',
    margin: 14,
    marginBottom: 8,
    padding: 14,
    borderRadius: 11,
    elevation: 2,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  masjidBig: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  masjidGreen: {
    fontSize: 15,
    fontWeight: 'bold',
    color: PRIMARY_GREEN,
    marginBottom: 2,
  },
  masjidAddress: {
    fontSize: 12,
    color: '#758ca3',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 7,
    fontSize: 12,
    color: '#222',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 8,
    justifyContent: 'center',
    elevation: 2,
  },
  directionsText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dateCard: {
    backgroundColor: '#fff',
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#222',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  islamicDateText: {
    fontSize: 12,
    color: PRIMARY_GREEN,
    marginTop: 4,
  },
  section: { marginHorizontal: 14, marginBottom: 8 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  prayerCard: {
    backgroundColor: '#fff',
    padding: 11,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'column',
    elevation: 1,
    shadowColor: '#222',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  prayerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 4,
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  defaultBadgeText: {
    color: PRIMARY_GREEN,
    fontSize: 11,
    fontWeight: 'bold',
  },
  prayerTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  prayerTimesCol: {
    flex: 1,
    alignItems: 'center',
  },
  prayerTimesLabel: {
    fontSize: 11,
    color: '#758ca3',
    marginBottom: 2,
    fontWeight: '500',
  },
  prayerTimesGreen: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PRIMARY_GREEN,
  },
  prayerTimesBlack: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  additionalTimingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  additionalTimingCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    width: '48%',
    elevation: 1,
    shadowColor: '#222',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  additionalTimingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  additionalTimingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#222',
  },
  additionalTimingTime: {
    fontSize: 13,
    fontWeight: 'bold',
    color: PRIMARY_GREEN,
    textAlign: 'center',
  },
});