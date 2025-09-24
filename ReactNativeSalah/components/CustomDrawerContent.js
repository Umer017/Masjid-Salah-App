import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CustomDrawerContent(props) {
  const { isAdminLoggedIn, onAdminLogout } = props;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await onAdminLogout();
            // Reset navigation to main app
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'MainApp' }],
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#2E8B57', '#3CB371']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="moon" size={40} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Salah Timing</Text>
          <Text style={styles.headerSubtitle}>Prayer Times App</Text>
        </View>
      </LinearGradient>

      {/* Drawer Content */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerContent}
      >
        {/* Main Navigation Items */}
        <View style={styles.drawerSection}>
          <DrawerItem
            label="Home"
            icon={({ color }) => (
              <Ionicons name="home" size={22} color={color} />
            )}
            onPress={() => props.navigation.navigate('MainApp')}
            labelStyle={styles.drawerLabel}
            style={styles.drawerItem}
          />
        </View>

        <View style={styles.divider} />

        {/* Admin Section */}
        <View style={styles.drawerSection}>
          <Text style={styles.sectionTitle}>Administration</Text>
          
          {!isAdminLoggedIn ? (
            <DrawerItem
              label="Admin Login"
              icon={({ color }) => (
                <Ionicons name="log-in" size={22} color={color} />
              )}
              onPress={() => props.navigation.navigate('AdminLogin')}
              labelStyle={styles.drawerLabel}
              style={styles.drawerItem}
            />
          ) : (
            <>
              <DrawerItem
                label="Admin Dashboard"
                icon={({ color }) => (
                  <Ionicons name="speedometer" size={22} color={color} />
                )}
                onPress={() => props.navigation.navigate('AdminPanel')}
                labelStyle={styles.drawerLabel}
                style={styles.drawerItem}
              />
              
              <DrawerItem
                label="Manage Masjids"
                icon={({ color }) => (
                  <Ionicons name="business" size={22} color={color} />
                )}
                onPress={() => props.navigation.navigate('AdminPanel', {
                  screen: 'ManageMasjids'
                })}
                labelStyle={styles.drawerLabel}
                style={styles.drawerItem}
              />
              
              <DrawerItem
                label="Manage Timings"
                icon={({ color }) => (
                  <Ionicons name="time" size={22} color={color} />
                )}
                onPress={() => props.navigation.navigate('AdminPanel', {
                  screen: 'ManageTimings'
                })}
                labelStyle={styles.drawerLabel}
                style={styles.drawerItem}
              />
              
              <View style={styles.divider} />
              
              <DrawerItem
                label="Logout"
                icon={({ color }) => (
                  <Ionicons name="log-out" size={22} color="#FF6B6B" />
                )}
                onPress={handleLogout}
                labelStyle={[styles.drawerLabel, { color: '#FF6B6B' }]}
                style={styles.drawerItem}
              />
            </>
          )}
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for the Ummah</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E8',
    marginTop: 4,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 10,
  },
  drawerSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 10,
    marginLeft: 16,
  },
  drawerItem: {
    borderRadius: 8,
    marginVertical: 2,
  },
  drawerLabel: {
    fontSize: 16,
    marginLeft: -20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
});