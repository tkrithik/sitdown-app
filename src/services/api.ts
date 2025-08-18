import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://api.sitdown.com', // Replace with your actual API URL
  TIMEOUT: 10000,
  USE_SAMPLE_DATA: true, // Toggle to switch between sample and real data
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Service Class
class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle common errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );

    // Initialize token from storage
    this.initializeToken();
  }

  // Token Management
  private async initializeToken() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        this.token = token;
      }
    } catch (error) {
      console.error('Error loading auth token:', error);
    }
  }

  public async setToken(token: string) {
    this.token = token;
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  }

  public async clearToken() {
    this.token = null;
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  // Generic API methods
  public async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    if (API_CONFIG.USE_SAMPLE_DATA) {
      return this.getSampleData<T>(endpoint, params);
    }

    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    if (API_CONFIG.USE_SAMPLE_DATA) {
      return this.postSampleData<T>(endpoint, data);
    }

    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    if (API_CONFIG.USE_SAMPLE_DATA) {
      return this.putSampleData<T>(endpoint, data);
    }

    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    if (API_CONFIG.USE_SAMPLE_DATA) {
      return this.deleteSampleData<T>(endpoint);
    }

    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Sample data methods (fallback when USE_SAMPLE_DATA is true)
  private async getSampleData<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    // This will be replaced with actual sample data logic
    return {
      success: true,
      data: {} as T,
      message: 'Using sample data',
    };
  }

  private async postSampleData<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return {
      success: true,
      data: {} as T,
      message: 'Using sample data',
    };
  }

  private async putSampleData<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return {
      success: true,
      data: {} as T,
      message: 'Using sample data',
    };
  }

  private async deleteSampleData<T>(endpoint: string): Promise<ApiResponse<T>> {
    return {
      success: true,
      data: {} as T,
      message: 'Using sample data',
    };
  }

  // Error handling
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || `HTTP ${error.response.status}`;
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server');
    } else {
      // Something else happened
      return new Error(error.message || 'Unknown error occurred');
    }
  }

  // Utility method to toggle between sample and real data
  public toggleSampleData(useSample: boolean) {
    API_CONFIG.USE_SAMPLE_DATA = useSample;
  }

  public isUsingSampleData(): boolean {
    return API_CONFIG.USE_SAMPLE_DATA;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Types are already exported above
