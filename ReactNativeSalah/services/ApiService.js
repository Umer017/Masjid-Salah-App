import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Update this URL to match your API's actual URL
//const BASE_URL = 'http://salahapi.somee.com/api'; // API URL for production

// For Android devices, we need to use the machine's IP address instead of localhost
const getBaseUrl = () => {
  // Always use the production URL for builds
  // In development mode through Expo Go, you can modify this for local testing
  return 'https://salahapi.somee.com/api';
};

const BASE_URL = getBaseUrl();

class ApiService {
  constructor() {
    console.log('ApiService initialized with BASE_URL:', BASE_URL);
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 30000, // Increased timeout for network requests
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Add additional configurations for better network compatibility
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      async (config) => {
        console.log('Making API request to:', config.baseURL + config.url);
        const token = await AsyncStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.log('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for better error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log('API response received:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.log('API response error:', error.message, error.response?.status);
        if (error.response) {
          console.log('Error response data:', error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  // Admin Authentication
  async adminLogin(username, password) {
    try {
      const response = await this.api.post('/admin/login', {
        Username: username,
        Password: password,
      });
      
      if (response.data.Success && response.data.Data) {
        // Store the token from the response (may be in different formats)
        const token = response.data.Data.Token || response.data.Data.token || response.data.Token || 'admin_logged_in';
        await AsyncStorage.setItem('admin_token', token);
        await AsyncStorage.setItem('admin_data', JSON.stringify(response.data.Data));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  }

  async adminLogout() {
    await AsyncStorage.removeItem('admin_token');
    await AsyncStorage.removeItem('admin_data');
  }

  async isAdminLoggedIn() {
    const token = await AsyncStorage.getItem('admin_token');
    return !!token;
  }

  async getAdminData() {
    const data = await AsyncStorage.getItem('admin_data');
    return data ? JSON.parse(data) : null;
  }

  // Location APIs
  async getAllStates() {
    try {
      const response = await this.api.get('/states');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStateById(stateId) {
    try {
      const response = await this.api.get(`/states/${stateId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createState(stateData) {
    try {
      const response = await this.api.post('/states', stateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateState(stateId, stateData) {
    try {
      const response = await this.api.put(`/states/${stateId}`, stateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteState(stateId) {
    try {
      const response = await this.api.delete(`/states/${stateId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCitiesByState(stateId) {
    try {
      const response = await this.api.get(`/cities/by-state/${stateId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCityById(cityId) {
    try {
      const response = await this.api.get(`/cities/${cityId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCity(cityData) {
    try {
      const response = await this.api.post('/cities', cityData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCity(cityId, cityData) {
    try {
      const response = await this.api.put(`/cities/${cityId}`, cityData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCity(cityId) {
    try {
      const response = await this.api.delete(`/cities/${cityId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Masjid APIs
  async getAllMasjids(page = 1, pageSize = 10, searchParams = {}) {
    try {
      const params = new URLSearchParams({
        PageNumber: page,
        PageSize: pageSize,
        ...searchParams,
      });
      const response = await this.api.get(`/masjids?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMasjidsByCity(cityId) {
    try {
      const response = await this.api.get(`/masjids/by-city/${cityId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNearbyMasjids(latitude, longitude, radiusInKm = 10) {
    try {
      const response = await this.api.get(`/masjids/nearby?latitude=${latitude}&longitude=${longitude}&radiusInKm=${radiusInKm}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMasjidWithTimings(masjidId, date = null) {
    try {
      const url = date 
        ? `/masjids/${masjidId}/with-timings?date=${date}`
        : `/masjids/${masjidId}/with-timings`;
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createMasjid(masjidData) {
    try {
      const response = await this.api.post('/masjids', masjidData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateMasjid(masjidId, masjidData) {
    try {
      const response = await this.api.put(`/masjids/${masjidId}`, masjidData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteMasjid(masjidId) {
    try {
      const response = await this.api.delete(`/masjids/${masjidId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Prayer Timing APIs
  async getDailySchedule(masjidId, date) {
    try {
      const response = await this.api.get(`/salahtimings/daily-schedule/masjid/${masjidId}/date/${date}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDefaultSchedule(masjidId) {
    try {
      const response = await this.api.get(`/salahtimings/default-schedule/masjid/${masjidId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSalahTimingByMasjidAndDate(masjidId, date) {
    try {
      const response = await this.api.get(`/salahtimings/masjid/${masjidId}/date/${date}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createSalahTiming(timingData) {
    try {
      const response = await this.api.post('/salahtimings', timingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSalahTiming(salahId, timingData) {
    try {
      const response = await this.api.put(`/salahtimings/${salahId}`, timingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Additional Timing APIs
  async getAdditionalTimingByMasjidAndDate(masjidId, date) {
    try {
      const response = await this.api.get(`/additionaltimings/masjid/${masjidId}/date/${date}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAdditionalTiming(timingData) {
    try {
      const response = await this.api.post('/additionaltimings', timingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAdditionalTiming(additionalId, timingData) {
    try {
      const response = await this.api.put(`/additionaltimings/${additionalId}`, timingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Special Events APIs
  async getUpcomingEvents(masjidId = null, daysAhead = 30) {
    try {
      const params = new URLSearchParams();
      if (masjidId) params.append('masjidId', masjidId);
      params.append('daysAhead', daysAhead);
      
      const response = await this.api.get(`/specialevents/upcoming?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSpecialEventsByMasjid(masjidId, startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await this.api.get(`/specialevents/masjid/${masjidId}?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createSpecialEvent(eventData) {
    try {
      const response = await this.api.post('/specialevents', eventData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.Message || error.response.data?.message || 'Server error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      // This is likely a network error
      if (Platform.OS === 'android') {
        return new Error('Network error: Unable to connect to server. Make sure you are connected to the same network as the API server and that the server is running.');
      } else {
        return new Error('Network error: Unable to connect to server. Check your internet connection and make sure the API server is running.');
      }
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new ApiService();