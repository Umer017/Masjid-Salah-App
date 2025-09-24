import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-gesture-handler';

// Screens
import SplashScreenComponent from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import MasjidDetailsScreen from './screens/MasjidDetailsScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import ManageMasjidsScreen from './screens/ManageMasjidsScreen';
import ManageTimingsScreen from './screens/ManageTimingsScreen';

// Components
import CustomDrawerContent from './components/CustomDrawerContent';

// Services
import ApiService from './services/ApiService';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function MainStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Salah Timing App' }}
      />
      <Stack.Screen 
        name="MasjidDetails" 
        component={MasjidDetailsScreen} 
        options={{ title: 'Masjid Details' }}
      />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminDashboard">
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen} 
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen 
        name="ManageMasjids" 
        component={ManageMasjidsScreen} 
        options={{ title: 'Manage Masjids' }}
      />
      <Stack.Screen 
        name="ManageTimings" 
        component={ManageTimingsScreen} 
        options={{ title: 'Manage Timings' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const navigationRef = useRef();

  useEffect(() => {
    async function prepare() {
      try {
        // Check if admin is logged in
        const adminLoggedIn = await ApiService.isAdminLoggedIn();
        setIsAdminLoggedIn(adminLoggedIn);

        // Simulate minimum splash screen time
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('Error during app initialization:', e);
        // Even if there's an error, we should still hide the splash screen
      } finally {
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = async () => {
    await ApiService.adminLogout();
    setIsAdminLoggedIn(false);
    // Navigate to main app
    navigationRef.current?.navigate('MainApp');
  };

  if (isLoading) {
    return <SplashScreenComponent />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Drawer.Navigator
        drawerContent={(props) => (
          <CustomDrawerContent 
            {...props} 
            isAdminLoggedIn={isAdminLoggedIn}
            onAdminLogout={handleAdminLogout}
          />
        )}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#f5f5f5',
            width: 280,
          },
        }}
      >
        <Drawer.Screen 
          name="MainApp" 
          component={MainStack}
          options={{
            drawerLabel: 'Home',
            title: 'Salah Timing App',
          }}
        />
        
        {!isAdminLoggedIn ? (
          <Drawer.Screen 
            name="AdminLogin" 
            options={{
              drawerLabel: 'Admin Login',
              title: 'Admin Login',
            }}
          >
            {(props) => (
              <AdminLoginScreen 
                {...props} 
                onLoginSuccess={handleAdminLogin}
              />
            )}
          </Drawer.Screen>
        ) : (
          <Drawer.Screen 
            name="AdminPanel" 
            component={AdminStack}
            options={{
              drawerLabel: 'Admin Panel',
              title: 'Admin Panel',
            }}
          />
        )}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}