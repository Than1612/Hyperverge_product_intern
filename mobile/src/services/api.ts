import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Token will be added by individual API calls
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access - redirecting to login');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async login(phoneNumber: string, otp: string) {
    const response = await apiClient.post('/auth/login', { phoneNumber, otp });
    return response.data.data;
  },

  async getCurrentUser() {
    const token = await import('@react-native-async-storage/async-storage').then(
      (AsyncStorage) => AsyncStorage.default.getItem('auth_token')
    );
    
    const response = await apiClient.get('/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  async updateProfile(userData: any) {
    const token = await import('@react-native-async-storage/async-storage').then(
      (AsyncStorage) => AsyncStorage.default.getItem('auth_token')
    );
    
    const response = await apiClient.put('/users/profile', userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }
};

export default apiClient;
