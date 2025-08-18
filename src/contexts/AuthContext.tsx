import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences?: {
    dietary: string[];
    favoriteCuisines: string[];
    maxPriceRange: string;
    maxDistance: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Authentication state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Authentication context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize authentication state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if user is already logged in
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (token && userData) {
        const user = JSON.parse(userData);
        apiService.setToken(token);
        
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // For now, simulate API call (replace with real API when ready)
      if (apiService.isUsingSampleData()) {
        // Simulate successful login with sample data
        const sampleUser: User = {
          id: '1',
          email,
          name: email.split('@')[0], // Use email prefix as name
          avatar: 'https://picsum.photos/100/100?random=1',
          preferences: {
            dietary: ['vegetarian'],
            favoriteCuisines: ['Italian', 'Mexican'],
            maxPriceRange: '$$',
            maxDistance: 25,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const sampleToken = 'sample_token_' + Date.now();

        // Store user data and token
        await AsyncStorage.setItem('auth_token', sampleToken);
        await AsyncStorage.setItem('user_data', JSON.stringify(sampleUser));
        apiService.setToken(sampleToken);

        setAuthState({
          user: sampleUser,
          token: sampleToken,
          isLoading: false,
          isAuthenticated: true,
        });

        return true;
      } else {
        // Real API call (implement when backend is ready)
        const response = await apiService.post<{ user: User; token: string }>('/auth/login', {
          email,
          password,
        });

        if (response.success) {
          const { user, token } = response.data;
          
          await AsyncStorage.setItem('auth_token', token);
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
          apiService.setToken(token);

          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });

          return true;
        } else {
          throw new Error(response.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      if (apiService.isUsingSampleData()) {
        // Simulate successful registration with sample data
        const sampleUser: User = {
          id: Date.now().toString(),
          email,
          name,
          avatar: 'https://picsum.photos/100/100?random=2',
          preferences: {
            dietary: [],
            favoriteCuisines: [],
            maxPriceRange: '$$$',
            maxDistance: 50,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const sampleToken = 'sample_token_' + Date.now();

        await AsyncStorage.setItem('auth_token', sampleToken);
        await AsyncStorage.setItem('user_data', JSON.stringify(sampleUser));
        apiService.setToken(sampleToken);

        setAuthState({
          user: sampleUser,
          token: sampleToken,
          isLoading: false,
          isAuthenticated: true,
        });

        return true;
      } else {
        // Real API call (implement when backend is ready)
        const response = await apiService.post<{ user: User; token: string }>('/auth/register', {
          email,
          password,
          name,
        });

        if (response.success) {
          const { user, token } = response.data;
          
          await AsyncStorage.setItem('auth_token', token);
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
          apiService.setToken(token);

          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });

          return true;
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      apiService.clearToken();

      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!authState.user) return;

      const updatedUser = { ...authState.user, ...userData, updatedAt: new Date().toISOString() };
      
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (!authState.token) return;

      if (apiService.isUsingSampleData()) {
        // For sample data, just reload from storage
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          setAuthState(prev => ({ ...prev, user }));
        }
      } else {
        // Real API call to refresh user data
        const response = await apiService.get<User>('/auth/me');
        if (response.success) {
          await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
          setAuthState(prev => ({ ...prev, user: response.data }));
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
