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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Services
import ApiService from '../services/ApiService';

export default function MasjidDetailsScreen({ route, navigation }) {
  const { masjid } = route.params;
  const [dailySchedule, setDailySchedule] = useState(null);
  const [defaultSchedule, setDefaultSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadDailySchedule();
  }, [selectedDate]);

  const loadDailySchedule = async () => {
    try {
      setLoading(true);
      
      // Load default schedule (single schedule per masjid)
      const defaultResponse = await ApiService.getDefaultSchedule(masjid.MasjidId);
      
      if (defaultResponse.Success && defaultResponse.Data) {
        setDefaultSchedule(defaultResponse.Data);
      }
      
      // Load daily schedule for specific date
      const response = await ApiService.getDailySchedule(masjid.MasjidId, selectedDate);
      
      if (response.Success && response.Data) {
        setDailySchedule(response.Data);
      } else {
        // If no daily schedule, try to get just prayer timings
        const timingResponse = await ApiService.getSalahTimingByMasjidAndDate(masjid.MasjidId, selectedDate);
        const additionalResponse = await ApiService.getAdditionalTimingByMasjidAndDate(masjid.MasjidId, selectedDate);
        const eventsResponse = await ApiService.getSpecialEventsByMasjid(masjid.MasjidId, selectedDate, selectedDate);
        
        // If no specific timing exists for the date, use default schedule
        let salahTiming = null;
        if (timingResponse.Success && timingResponse.Data) {
          salahTiming = timingResponse.Data;
        } else if (defaultResponse.Success && defaultResponse.Data) {
          // Use default schedule as fallback
          salahTiming = {
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
        }
        
        setDailySchedule({
          Date: selectedDate,
          Masjid: masjid,
          SalahTiming: salahTiming,
          AdditionalTimings: additionalResponse.Success ? additionalResponse.Data : null,
          SpecialEvents: eventsResponse.Success ? eventsResponse.Data : [],
        });
      }
    } catch (error) {
      console.error('Error loading daily schedule:', error);
      // Even if there's an error, try to show default schedule if available
      try {
        const defaultResponse = await ApiService.getDefaultSchedule(masjid.MasjidId);
        if (defaultResponse.Success && defaultResponse.Data) {
          setDefaultSchedule(defaultResponse.Data);
          setDailySchedule({
            Date: selectedDate,
            Masjid: masjid,
            SalahTiming: {
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
            },
            AdditionalTimings: null,
            SpecialEvents: [],
          });
        }
      } catch (defaultError) {
        console.error('Error loading default schedule:', defaultError);
      }
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

  const formatTime = (timeString) => {
    if (!timeString) return 'Not Set';
    
    // Handle time format from API (assumes HH:mm:ss format)
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPrayerTimeCard = (prayerName, azanTime, iqamahTime, icon) => (
    <View style={styles.prayerCard} key={prayerName}>
      <View style={styles.prayerHeader}>
        <Ionicons name={icon} size={24} color="#2E8B57" />
        <Text style={styles.prayerName}>{prayerName}</Text>
        {defaultSchedule && (
          // Check if we're showing default timings
          (!dailySchedule?.SalahTiming?.FajrAzanTime && prayerName === 'Fajr') ||
          (!dailySchedule?.SalahTiming?.DhuhrAzanTime && prayerName === 'Dhuhr') ||
          (!dailySchedule?.SalahTiming?.AsrAzanTime && prayerName === 'Asr') ||
          (!dailySchedule?.SalahTiming?.MaghribAzanTime && prayerName === 'Maghrib') ||
          (!dailySchedule?.SalahTiming?.IshaAzanTime && prayerName === 'Isha') ||
          (!dailySchedule?.SalahTiming?.JummahAzanTime && prayerName === 'Jummah') ||
          // Or if the timing matches the default schedule
          (defaultSchedule.FajrAzanTime && azanTime === defaultSchedule.FajrAzanTime && prayerName === 'Fajr') ||
          (defaultSchedule.DhuhrAzanTime && azanTime === defaultSchedule.DhuhrAzanTime && prayerName === 'Dhuhr') ||
          (defaultSchedule.AsrAzanTime && azanTime === defaultSchedule.AsrAzanTime && prayerName === 'Asr') ||
          (defaultSchedule.MaghribAzanTime && azanTime === defaultSchedule.MaghribAzanTime && prayerName === 'Maghrib') ||
          (defaultSchedule.IshaAzanTime && azanTime === defaultSchedule.IshaAzanTime && prayerName === 'Isha') ||
          (defaultSchedule.JummahAzanTime && azanTime === defaultSchedule.JummahAzanTime && prayerName === 'Jummah')
        ) && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>
      <View style={styles.prayerTimes}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>Azan</Text>
          <Text style={styles.timeValue}>{formatTime(azanTime)}</Text>
        </View>
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>Iqamah</Text>
          <Text style={styles.timeValue}>{formatTime(iqamahTime)}</Text>
        </View>
      </View>
    </View>
  );

  const renderAdditionalTimings = (additionalTiming) => {
    if (!additionalTiming) return null;

    const timings = [
      { label: 'Sunrise', time: additionalTiming.SunriseTime, icon: 'sunny' },
      { label: 'Sunset', time: additionalTiming.SunsetTime, icon: 'sunny' },
      { label: 'Zawal', time: additionalTiming.ZawalTime, icon: 'time' },
      { label: 'Tahajjud', time: additionalTiming.TahajjudTime, icon: 'star' },
      { label: 'Sehri End', time: additionalTiming.SehriEndTime, icon: 'restaurant' },
      { label: 'Iftar', time: additionalTiming.IftarTime, icon: 'moon' },
    ].filter(timing => timing.time);

    if (timings.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Timings</Text>
        {timings.map((timing) => (
          <View style={styles.additionalTimeRow} key={timing.label}>
            <View style={styles.additionalTimeLeft}>
              <Ionicons name={timing.icon} size={20} color="#2E8B57" />
              <Text style={styles.additionalTimeLabel}>{timing.label}</Text>
            </View>
            <Text style={styles.additionalTimeValue}>{formatTime(timing.time)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSpecialEvents = (events) => {
    if (!events || events.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Special Events</Text>
        {events.map((event) => (
          <View style={styles.eventCard} key={event.EventId}>
            <View style={styles.eventHeader}>
              <Ionicons name="calendar" size={20} color="#2E8B57" />
              <Text style={styles.eventName}>{event.EventName}</Text>
            </View>
            {event.EventTime && (
              <Text style={styles.eventTime}>{formatTime(event.EventTime)}</Text>
            )}
            {event.Description && (
              <Text style={styles.eventDescription}>{event.Description}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Loading prayer timings...</Text>
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {masjid.MasjidName}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E8B57']}
          />
        }
      >
        {/* Masjid Info */}
        <View style={styles.masjidInfo}>
          <Text style={styles.masjidName}>{masjid.MasjidName}</Text>
          <Text style={styles.masjidLocation}>
            {masjid.CityName}, {masjid.StateName}
          </Text>
          <Text style={styles.masjidAddress}>{masjid.Address}</Text>
          
          {masjid.ImamName && (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={16} color="#666" />
              <Text style={styles.infoText}>Imam: {masjid.ImamName}</Text>
            </View>
          )}

          {masjid.ContactNumber && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color="#666" />
              <Text style={styles.infoText}>{masjid.ContactNumber}</Text>
            </View>
          )}

          {masjid.distance && (
            <View style={styles.infoRow}>
              <Ionicons name="walk" size={16} color="#2E8B57" />
              <Text style={[styles.infoText, { color: '#2E8B57' }]}>
                {masjid.distance} km away
              </Text>
            </View>
          )}
          
          {/* Last Updated Info */}
          {defaultSchedule && (
            <View style={styles.infoRow}>
              <Ionicons name="time" size={16} color="#2E8B57" />
              <Text style={[styles.infoText, { color: '#2E8B57' }]}>
                Last updated: {formatLastUpdated(defaultSchedule.LastUpdated)}
              </Text>
            </View>
          )}
          
          {/* Directions Button */}
          {masjid.Latitude && masjid.Longitude && (
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${masjid.Latitude},${masjid.Longitude}`;
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

        {/* Date */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          {dailySchedule?.IslamicDate && (
            <Text style={styles.islamicDate}>{dailySchedule.IslamicDate}</Text>
          )}
        </View>

        {/* Prayer Times */}
        {(dailySchedule?.SalahTiming || defaultSchedule) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prayer Times</Text>
            {dailySchedule?.SalahTiming ? (
              <>
                {renderPrayerTimeCard('Fajr', dailySchedule.SalahTiming.FajrAzanTime, dailySchedule.SalahTiming.FajrIqamahTime, 'sunny')}
                {renderPrayerTimeCard('Dhuhr', dailySchedule.SalahTiming.DhuhrAzanTime, dailySchedule.SalahTiming.DhuhrIqamahTime, 'sunny')}
                {renderPrayerTimeCard('Asr', dailySchedule.SalahTiming.AsrAzanTime, dailySchedule.SalahTiming.AsrIqamahTime, 'partly-sunny')}
                {renderPrayerTimeCard('Maghrib', dailySchedule.SalahTiming.MaghribAzanTime, dailySchedule.SalahTiming.MaghribIqamahTime, 'moon')}
                {renderPrayerTimeCard('Isha', dailySchedule.SalahTiming.IshaAzanTime, dailySchedule.SalahTiming.IshaIqamahTime, 'moon')}
                {(dailySchedule.SalahTiming.JummahAzanTime || dailySchedule.SalahTiming.JummahIqamahTime) &&
                  renderPrayerTimeCard('Jummah', dailySchedule.SalahTiming.JummahAzanTime, dailySchedule.SalahTiming.JummahIqamahTime, 'people')
                }
              </>
            ) : defaultSchedule ? (
              <>
                {renderPrayerTimeCard('Fajr', defaultSchedule.FajrAzanTime, defaultSchedule.FajrIqamahTime, 'sunny')}
                {renderPrayerTimeCard('Dhuhr', defaultSchedule.DhuhrAzanTime, defaultSchedule.DhuhrIqamahTime, 'sunny')}
                {renderPrayerTimeCard('Asr', defaultSchedule.AsrAzanTime, defaultSchedule.AsrIqamahTime, 'partly-sunny')}
                {renderPrayerTimeCard('Maghrib', defaultSchedule.MaghribAzanTime, defaultSchedule.MaghribIqamahTime, 'moon')}
                {renderPrayerTimeCard('Isha', defaultSchedule.IshaAzanTime, defaultSchedule.IshaIqamahTime, 'moon')}
                {(defaultSchedule.JummahAzanTime || defaultSchedule.JummahIqamahTime) &&
                  renderPrayerTimeCard('Jummah', defaultSchedule.JummahAzanTime, defaultSchedule.JummahIqamahTime, 'people')
                }
                <View style={styles.defaultInfoContainer}>
                  <Ionicons name="information-circle" size={16} color="#2E8B57" />
                  <Text style={styles.defaultInfoText}>
                    Showing default schedule. Last updated: {formatLastUpdated(defaultSchedule.LastUpdated)}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        ) : (
          <View style={styles.noDataCard}>
            <Ionicons name="time-outline" size={40} color="#ccc" />
            <Text style={styles.noDataText}>Prayer timings not available for this date</Text>
          </View>
        )}

        {/* Additional Timings */}
        {renderAdditionalTimings(dailySchedule?.AdditionalTimings)}

        {/* Special Events */}
        {renderSpecialEvents(dailySchedule?.SpecialEvents)}
      </ScrollView>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  masjidInfo: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  masjidName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  masjidLocation: {
    fontSize: 16,
    color: '#2E8B57',
    marginBottom: 5,
  },
  masjidAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  dateSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  islamicDate: {
    fontSize: 14,
    color: '#2E8B57',
    marginTop: 5,
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  prayerCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  prayerTimes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  additionalTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  additionalTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  additionalTimeLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  additionalTimeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  eventTime: {
    fontSize: 14,
    color: '#2E8B57',
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  noDataCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  defaultBadge: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 10,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E8B57',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },

});
