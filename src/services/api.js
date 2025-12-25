import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Local Development Server
// For physical devices, replace 'localhost' with your machine's local IP (e.g., '192.168.1.5')
export const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8080' 
  : 'http://10.0.2.2:8080'; // Android Emulator default proxy to localhost

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Interceptor token error:', e);
    }
    console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout');
    } else if (!error.response) {
      console.error('🌐 Network Error - Is the server UP?');
    } else {
      console.error(`❌ Response Error ${error.response.status}:`, error.response.data);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
};

export const adminAPI = {
  getBuses: async () => {
    const response = await api.get('/api/admin/buses');
    return response.data;
  },
  addBus: async (busData) => {
    const response = await api.post('/api/admin/buses', busData);
    return response.data;
  },
  getRoutes: async () => {
    const response = await api.get('/api/admin/routes');
    return response.data;
  },
  createSchedule: async (routeId, busId, direction = "OUTBOUND") => {
    const response = await api.post('/api/admin/schedules', { routeId, busId, direction });
    return response.data;
  },
  updateSchedule: async (id, busId) => {
    const response = await api.put(`/api/admin/schedules/${id}`, { busId });
    return response.data;
  }
};

export const driverAPI = {
  getTodaySchedule: async () => {
    const response = await api.get('/api/driver/schedules/today');
    return response.data;
  },
  updateLocation: async (locationData) => {
    const response = await api.post('/api/driver/location', locationData);
    return response.data;
  }
};

export const studentAPI = {
  getMorningBuses: async (date, stopId) => {
    const response = await api.get('/api/student/morning-buses', { params: { date, stopId } });
    return response.data;
  },
  getNearbyStops: async (lat, lng, radius) => {
    const response = await api.get('/api/student/nearby-stops', { params: { latitude: lat, longitude: lng, radius } });
    return response.data;
  },
  getLiveBuses: async () => {
    const response = await api.get('/api/student/buses/live');
    return response.data;
  },
  getCommuteStatus: async (lat, lng) => {
    const response = await api.get('/api/student/commute-status', { params: { latitude: lat, longitude: lng } });
    return response.data;
  }
};

export default api;
