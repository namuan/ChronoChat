import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePasscode } from '../context/PasscodeContext';

interface PasscodePromptScreenProps {
  onPasscodeVerified: () => void;
}

export default function PasscodePromptScreen({ onPasscodeVerified }: PasscodePromptScreenProps) {
  const { verifyPasscode } = usePasscode();
  const [passcode, setPasscode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState<number | null>(null);

  useEffect(() => {
    // Check if app is locked due to too many attempts
    checkLockStatus();
  }, []);

  const checkLockStatus = async () => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const lockData = await AsyncStorage.getItem('chronochat_lock_data');
      
      if (lockData) {
        const { lockUntil, attempts: savedAttempts } = JSON.parse(lockData);
        const now = Date.now();
        
        if (now < lockUntil) {
          setIsLocked(true);
          setLockTime(lockUntil);
          setAttempts(savedAttempts);
        } else {
          // Lock period has passed, clear lock data
          await AsyncStorage.removeItem('chronochat_lock_data');
        }
      }
    } catch (error) {
      console.error('Error checking lock status:', error);
    }
  };

  const handlePasscodeSubmit = async () => {
    if (passcode.length < 4) {
      Alert.alert('Error', 'Please enter your complete passcode');
      return;
    }

    try {
      const isValid = await verifyPasscode(passcode);
      
      if (isValid) {
        // Clear any lock data on successful verification
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.removeItem('chronochat_lock_data');
        
        onPasscodeVerified();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPasscode('');
        
        if (newAttempts >= 5) {
          // Lock the app for 5 minutes after 5 failed attempts
          const lockUntil = Date.now() + (5 * 60 * 1000); // 5 minutes from now
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.setItem('chronochat_lock_data', JSON.stringify({
            lockUntil,
            attempts: newAttempts
          }));
          
          setIsLocked(true);
          setLockTime(lockUntil);
          Alert.alert('App Locked', 'Too many failed attempts. Please try again in 5 minutes.');
        } else {
          const remainingAttempts = 5 - newAttempts;
          Alert.alert('Incorrect Passcode', `Wrong passcode. ${remainingAttempts} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error('Passcode verification error:', error);
      Alert.alert('Error', 'Failed to verify passcode. Please try again.');
    }
  };

  const formatLockTime = () => {
    if (!lockTime) return '';
    
    const now = Date.now();
    const remainingTime = Math.max(0, lockTime - now);
    const minutes = Math.floor(remainingTime / (60 * 1000));
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lockedContent}>
          <Text style={styles.lockedTitle}>App Locked</Text>
          <Text style={styles.lockedSubtitle}>
            Too many failed passcode attempts
          </Text>
          <Text style={styles.lockTimer}>
            Try again in: {formatLockTime()}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Enter Passcode</Text>
            <Text style={styles.subtitle}>
              Enter your passcode to access your notes
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter Passcode"
                value={passcode}
                onChangeText={setPasscode}
                keyboardType="numeric"
                secureTextEntry={true}
                maxLength={6}
                autoFocus={true}
                textAlign="center"
                onSubmitEditing={handlePasscodeSubmit}
                returnKeyType="done"
              />
              
              <View style={styles.passcodeIndicators}>
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: passcode.length >= index 
                          ? '#007AFF' 
                          : '#E0E0E0'
                      }
                    ] as any}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.primaryButton,
                passcode.length < 4 && styles.disabledButton
              ]}
              onPress={handlePasscodeSubmit}
              disabled={passcode.length < 4}
            >
              <Text style={styles.primaryButtonText}>Unlock</Text>
            </TouchableOpacity>

            <Text style={styles.attemptsText}>
              Attempts remaining: {5 - attempts}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 32,
  },
  input: {
    fontSize: 24,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    marginBottom: 20,
    letterSpacing: 8,
  },
  passcodeIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  attemptsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  lockedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
    textAlign: 'center',
  },
  lockedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  lockTimer: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    textAlign: 'center',
  },
});