import * as Crypto from 'expo-crypto';

const PASSCODE_KEY = 'chronochat_passcode_encrypted';
const SECRET_SALT = 'ChronoChatSecureSalt2024'; // In production, this should be more secure

export interface PasscodeData {
  hashedPasscode: string;
  createdAt: number;
}

// Simple hash function using Expo Crypto
async function hashPasscode(passcode: string): Promise<string> {
  try {
    const data = passcode + SECRET_SALT;
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
    return hash;
  } catch (error) {
    console.error('Error hashing passcode:', error);
    throw new Error('Failed to hash passcode');
  }
}

export const passcodeCrypto = {
  // Hash and store passcode
  async storePasscode(passcode: string): Promise<void> {
    try {
      const hashedPasscode = await hashPasscode(passcode);
      const passcodeData: PasscodeData = {
        hashedPasscode: hashedPasscode,
        createdAt: Date.now()
      };
      
      // Use AsyncStorage to store hashed data
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem(PASSCODE_KEY, JSON.stringify(passcodeData));
    } catch (error) {
      console.error('Error storing passcode:', error);
      throw new Error('Failed to store passcode securely');
    }
  },

  // Check if passcode exists (we don't retrieve the hash for security)
  async hasPasscode(): Promise<boolean> {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const storedData = await AsyncStorage.getItem(PASSCODE_KEY);
      return storedData !== null;
    } catch (error) {
      console.error('Error checking passcode existence:', error);
      return false;
    }
  },

  // Remove passcode (for reset functionality)
  async removePasscode(): Promise<void> {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.removeItem(PASSCODE_KEY);
    } catch (error) {
      console.error('Error removing passcode:', error);
      throw new Error('Failed to remove passcode');
    }
  },

  // Verify passcode by hashing input and comparing
  async verifyPasscode(inputPasscode: string): Promise<boolean> {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const storedData = await AsyncStorage.getItem(PASSCODE_KEY);
      
      if (!storedData) {
        return false;
      }

      const passcodeData: PasscodeData = JSON.parse(storedData);
      const inputHash = await hashPasscode(inputPasscode);
      
      return inputHash === passcodeData.hashedPasscode;
    } catch (error) {
      console.error('Error verifying passcode:', error);
      return false;
    }
  }
};