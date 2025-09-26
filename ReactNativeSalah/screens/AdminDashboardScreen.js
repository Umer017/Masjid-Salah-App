import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Services
import ApiService from '../services/ApiService';

export default function AdminDashboardScreen({ navigation }) {
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const data = await ApiService.getAdminData();
      setAdminData(data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await ApiService.adminLogout();
            // Navigate to main app
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainApp' }],
            });
          },
        },
      ]
    );
  };

  const dashboardItems = [
    {
      title: 'Manage Masjids',
      subtitle: 'Add, edit, and remove masjids',
      icon: 'business',
      color: '#2E8B57',
      onPress: () => navigation.navigate('ManageMasjids'),
    },
    {
      title: 'Manage Prayer Timings',
      subtitle: 'Set prayer times for masjids',
      icon: 'time',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('ManageTimings'),
    },
    {
      title: 'Manage States',
      subtitle: 'Add, edit, and remove states',
      icon: 'map',
      color: '#4ECDC4',
      onPress: () => navigation.navigate('ManageStates'),
    },
    {
      title: 'Manage Cities',
      subtitle: 'Add, edit, and remove cities',
      icon: 'location',
      color: '#FFE66D',
      onPress: () => navigation.navigate('ManageCities'),
    },
    {
      title: 'Manage Additional Timings',
      subtitle: 'Manage sunrise, sunset, and other timings',
      icon: 'sunny',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('ManageAdditionalTimings'),
    },
    {
      title: 'Special Events',
      subtitle: 'Manage special events and announcements',
      icon: 'calendar',
      color: '#4ECDC4',
      onPress: () => {
        Alert.alert('Coming Soon', 'Special Events management will be available soon');
      },
    },
    {
      title: 'Reports & Analytics',
      subtitle: 'View usage statistics and reports',
      icon: 'analytics',
      color: '#A8E6CF',
      onPress: () => {
        Alert.alert('Coming Soon', 'Reports & Analytics will be available soon');
      },
    },
    {
      title: 'Settings',
      subtitle: 'App settings and configuration',
      icon: 'settings',
      color: '#95A5A6',
      onPress: () => {
        Alert.alert('Coming Soon', 'Settings will be available soon');
      },
    },
  ];

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
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Ionicons name="shield-checkmark" size={40} color="#2E8B57" />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>
                Welcome, {adminData?.Username || 'Admin'}!
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Manage your Salah Timing App from here
              </Text>
            </View>
          </View>
          {adminData?.Role && (
            <View style={styles.roleChip}>
              <Text style={styles.roleText}>{adminData.Role}</Text>
            </View>
          )}
        </View>

        {/* Dashboard Grid */}
        <View style={styles.gridContainer}>
          {dashboardItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dashboardCard}
              onPress={item.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={30} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="business" size={24} color="#2E8B57" />
              <Text style={styles.statNumber}>--</Text>
              <Text style={styles.statLabel}>Total Masjids</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#FF6B6B" />
              <Text style={styles.statNumber}>--</Text>
              <Text style={styles.statLabel}>Prayer Times</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color="#4ECDC4" />
              <Text style={styles.statNumber}>--</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="location" size={24} color="#FFE66D" />
              <Text style={styles.statNumber}>--</Text>
              <Text style={styles.statLabel}>Cities</Text>
            </View>
          </View>
          <Text style={styles.statsNote}>
            * Statistics will be loaded from the API in future updates
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  menuButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  logoutButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    marginLeft: 15,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  roleChip: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: '#2E8B57',
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    width: '48%',
    paddingVertical: 15,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statsNote: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});