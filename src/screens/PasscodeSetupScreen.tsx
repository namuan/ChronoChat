import React, { useState } from 'react';
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

interface PasscodeSetupScreenProps {
  onSetupComplete: () => void;
}

export default function PasscodeSetupScreen({ onSetupComplete }: PasscodeSetupScreenProps) {
  const { setupPasscode } = usePasscode();
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleFirstPasscodeSubmit = () => {
    if (passcode.length < 4) {
      Alert.alert('Error', 'Passcode must be at least 4 digits');
      return;
    }
    setIsConfirming(true);
  };

  const handleConfirmPasscode = async () => {
    if (passcode !== confirmPasscode) {
      Alert.alert('Error', 'Passcodes do not match. Please try again.');
      setConfirmPasscode('');
      setIsConfirming(false);
      return;
    }

    try {
      await setupPasscode(passcode);
      Alert.alert('Success', 'Passcode has been set successfully!');
      onSetupComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to set passcode. Please try again.');
      console.error('Passcode setup error:', error);
    }
  };

  const handleBack = () => {
    setIsConfirming(false);
    setConfirmPasscode('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Set Up Passcode</Text>
            <Text style={styles.subtitle}>
              {isConfirming 
                ? 'Please confirm your passcode' 
                : 'Create a passcode to secure your notes'
              }
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={isConfirming ? 'Confirm Passcode' : 'Enter Passcode'}
                value={isConfirming ? confirmPasscode : passcode}
                onChangeText={isConfirming ? setConfirmPasscode : setPasscode}
                keyboardType="numeric"
                secureTextEntry={true}
                maxLength={6}
                autoFocus={true}
                textAlign="center"
                onSubmitEditing={isConfirming ? handleConfirmPasscode : handleFirstPasscodeSubmit}
                returnKeyType="done"
              />
              
              <View style={styles.passcodeIndicators}>
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: (isConfirming ? confirmPasscode : passcode).length >= index 
                          ? '#007AFF' 
                          : '#E0E0E0'
                      }
                    ] as any}
                  />
                ))}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              {isConfirming && (
                <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.primaryButton,
                  (isConfirming ? confirmPasscode.length < 4 : passcode.length < 4) && styles.disabledButton
                ]}
                onPress={isConfirming ? handleConfirmPasscode : handleFirstPasscodeSubmit}
                disabled={isConfirming ? confirmPasscode.length < 4 : passcode.length < 4}
              >
                <Text style={styles.primaryButtonText}>
                  {isConfirming ? 'Confirm' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
});