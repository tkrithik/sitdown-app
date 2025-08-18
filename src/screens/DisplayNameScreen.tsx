import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { multiDeviceChatService, DeviceUser } from '../services/multiDeviceChatService';

interface DisplayNameScreenProps {
  navigation: any;
}

export const DisplayNameScreen: React.FC<DisplayNameScreenProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [currentDevice, setCurrentDevice] = useState<DeviceUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCurrentDevice();
  }, []);

  const loadCurrentDevice = async () => {
    const device = multiDeviceChatService.getCurrentDevice();
    if (device) {
      setCurrentDevice(device);
      setDisplayName(device.displayName);
    }
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    if (displayName.trim().length < 2) {
      Alert.alert('Error', 'Display name must be at least 2 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const success = await multiDeviceChatService.setDisplayName(displayName.trim());
      if (success) {
        Alert.alert(
          'Success!',
          `Your display name has been set to "${displayName.trim()}"`,
          [
            {
              text: 'Continue to Chat',
              onPress: () => navigation.replace('MainTabs'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to save display name. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Setup',
      'You can always change your display name later in the chat settings. Continue with "Anonymous"?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => navigation.replace('MainTabs') },
      ]
    );
  };

  const generateRandomName = () => {
    const names = [
      'Alex', 'Jordan', 'Taylor', 'Casey', 'Riley',
      'Morgan', 'Quinn', 'Avery', 'Blake', 'Drew',
      'Sam', 'Jamie', 'Parker', 'Dakota', 'Reese',
      'Rowan', 'Sage', 'River', 'Phoenix', 'Skyler'
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    setDisplayName(randomName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Ionicons name="person-circle" size={80} color="#3b82f6" />
          <Text style={styles.title}>Welcome to Sit Down Chat!</Text>
          <Text style={styles.subtitle}>
            Set your display name so friends can recognize you in group chats
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name..."
            placeholderTextColor="#9ca3af"
            autoFocus
            maxLength={20}
            autoCapitalize="words"
            autoCorrect={false}
          />
          
          <TouchableOpacity style={styles.randomButton} onPress={generateRandomName}>
            <Ionicons name="shuffle" size={16} color="#3b82f6" />
            <Text style={styles.randomButtonText}>Generate Random Name</Text>
          </TouchableOpacity>

          {currentDevice && (
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceInfoTitle}>Device ID:</Text>
              <Text style={styles.deviceInfoText}>{currentDevice.deviceId}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, (!displayName.trim() || isLoading) && styles.saveButtonDisabled]}
            onPress={handleSaveName}
            disabled={!displayName.trim() || isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What you can do:</Text>
          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles" size={20} color="#10b981" />
            <Text style={styles.featureText}>Join group chats about restaurants</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="people" size={20} color="#10b981" />
            <Text style={styles.featureText}>Chat with friends in real-time</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="heart" size={20} color="#10b981" />
            <Text style={styles.featureText}>React to messages with emojis</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="reply" size={20} color="#10b981" />
            <Text style={styles.featureText}>Reply to specific messages</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontFamily: 'System',
  },
  formContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    fontFamily: 'System',
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#ffffff',
    borderWidth: 2,
    borderColor: '#374151',
    fontFamily: 'System',
  },
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  randomButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 8,
    fontWeight: '500',
    fontFamily: 'System',
  },
  deviceInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#111827',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  deviceInfoTitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
    fontFamily: 'System',
  },
  deviceInfoText: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#374151',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'System',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#9ca3af',
    fontFamily: 'System',
  },
  featuresContainer: {
    flex: 1,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#d1d5db',
    marginLeft: 12,
    fontFamily: 'System',
  },
});
