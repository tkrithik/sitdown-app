import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { RestaurantDetailScreen } from '../screens/RestaurantDetailScreen';
import { SocialScreen } from '../screens/SocialScreen';
import { RandomPickScreen } from '../screens/RandomPickScreen';
import { ChatListScreen } from '../screens/ChatListScreen';
import { MultiDeviceChatScreen } from '../screens/MultiDeviceChatScreen';
import { DisplayNameScreen } from '../screens/DisplayNameScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { useAuth } from '../contexts/AuthContext';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  RestaurantDetail: { restaurant: any };
  MultiDeviceChat: { restaurantName: string; groupId: string };
  ChatList: undefined;
  DisplayName: undefined;
};

export type TabParamList = {
  Home: undefined;
  Social: undefined;
  RandomPick: undefined;
  Messages: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#dc2626',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="RandomPick" 
        component={RandomPickScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'restaurant' : 'restaurant-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Social" 
        component={SocialScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You can add a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "MainTabs" : "DisplayName"}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
        <Stack.Screen name="MultiDeviceChat" component={MultiDeviceChatScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="DisplayName" component={DisplayNameScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

