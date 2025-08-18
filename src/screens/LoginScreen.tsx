import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      let success = false;

      if (isLogin) {
        success = await login(email.trim(), password);
      } else {
        success = await register(email.trim(), password, name.trim());
      }

      if (!success) {
        Alert.alert('Error', isLogin ? 'Login failed' : 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#dc2626" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Ionicons name="restaurant" size={80} color="#ffffff" />
            <Text style={styles.title}>Sit Down</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Join the community'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
              <Text style={styles.toggleButtonText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.toggleButtonTextBold}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dc2626',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: '#e5e7eb',
    textAlign: 'center',
    fontFamily: 'System',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
    fontFamily: 'System',
  },
  passwordToggle: {
    padding: 8,
  },
  submitButton: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  toggleButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'System',
  },
  toggleButtonTextBold: {
    color: '#374151',
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'System',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'System',
  },
});
