import * as Crypto from 'expo-crypto';

import { generateSecureRandom } from './secureRandom';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PASSCODE_KEY = 'chronochat_passcode_encrypted';
const SALT_KEY = 'chronochat_secure_salt';
const DEVICE_INFO_KEY = 'chronochat_device_info';
const SIMULATOR_KEY = 'chronochat_simulator_mode';

export interface PasscodeData {
  hashedPasscode: string;
  createdAt: number;
}

interface DeviceInfo {
  isSimulator: boolean;
  platform: string;
  applicationId?: string;
  androidId?: string;
  deviceName?: string;
  deviceYearClass?: number;
  installationId?: string;
  createdAt: number;
}

/**
 * Detects if the app is running on a simulator/emulator
 */
function isRunningOnSimulator(): boolean {
  // Check multiple indicators for simulator detection
  const indicators = [
    // iOS Simulator indicators
    Platform.OS === 'ios' && (
      Constants.deviceName?.includes('Simulator') ||
      Constants.deviceName?.includes('simulator') ||
      Constants.platform?.ios?.model?.includes('Simulator') ||
      // iOS simulator has specific device names
      ['iPhone Simulator', 'iPad Simulator', 'iPod Simulator'].includes(Constants.deviceName || '')
    ),
    
    // Android Emulator indicators
    Platform.OS === 'android' && (
      Constants.deviceName?.includes('emulator') ||
      Constants.deviceName?.includes('sdk') ||
      // Android emulator specific indicators
      (Constants.platform?.android?.versionCode === 25 && Constants.deviceName === 'Android SDK built for x86')
    ),
    
    // General development environment indicators
    __DEV__, // This is true in development mode
    
    // Expo development client indicators
    Constants.appOwnership === 'expo' && __DEV__
  ];
  
  return indicators.some(indicator => indicator === true);
}

/**
 * Generates simulator-specific entropy for development/testing
 */
async function generateSimulatorEntropy(): Promise<string> {
  try {
    // For simulators, we use a combination of:
    // 1. Platform + development mode
    // 2. Installation ID (unique per app install)
    // 3. Device year class (hardware capability)
    // 4. Secure random data
    
    const entropySources: string[] = [];
    
    // Platform and development indicators
    entropySources.push(`${Platform.OS}-${Platform.Version}`);
    entropySources.push(__DEV__ ? 'development' : 'production');
    
    // Installation-specific identifiers
    if (Constants.installationId) {
      entropySources.push(Constants.installationId);
    }
    
    // Device capabilities
    if (Constants.deviceYearClass) {
      entropySources.push(Constants.deviceYearClass.toString());
    }
    
    // Session-specific randomness
    const sessionRandom = await generateSecureRandom(16);
    entropySources.push(sessionRandom);
    
    // Timestamp for uniqueness
    entropySources.push(Date.now().toString());
    
    // Combine and hash all entropy sources
    const combinedEntropy = entropySources.join('|');
    const simulatorSalt = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combinedEntropy
    );
    
    console.log('🔧 Generated simulator-specific salt');
    return simulatorSalt;
    
  } catch (error) {
    console.error('Error generating simulator entropy:', error);
    // Fallback to secure random
    return await generateSecureRandom(32);
  }
}

/**
 * Generates device-specific salt using multiple entropy sources
 * Adapts to simulator vs physical device environments
 */
async function generateDeviceSpecificSalt(): Promise<string> {
  try {
    const isSimulator = isRunningOnSimulator();
    
    if (isSimulator) {
      return await generateSimulatorEntropy();
    }
    
    // For physical devices, use stronger device-specific entropy
    const { default: Application } = await import('expo-application');
    const entropySources: string[] = [];
    
    // 1. Application ID (unique to this app)
    if (Application.applicationId) {
      entropySources.push(Application.applicationId);
    }
    
    // 2. Android ID (unique to device, but requires permission)
    if (Platform.OS === 'android') {
      try {
        const androidId = await Application.getAndroidId();
        if (androidId) {
          entropySources.push(androidId);
        }
      } catch (error) {
        console.log('Could not access Android ID, using fallback');
      }
    }
    
    // 3. Device name (if available)
    try {
      // @ts-ignore - deviceName might be available as a property
      if (Application.deviceName) {
        // @ts-ignore
        entropySources.push(Application.deviceName);
      }
    } catch (error) {
      console.log('Could not access device name');
    }
    
    // 4. Installation ID (unique per app install)
    if (Constants.installationId) {
      entropySources.push(Constants.installationId);
    }
    
    // 5. Device year class (hardware capability)
    if (Constants.deviceYearClass) {
      entropySources.push(Constants.deviceYearClass.toString());
    }
    
    // 6. Secure random bytes (stronger for physical devices)
    const secureRandom = await generateSecureRandom(32);
    entropySources.push(secureRandom);
    
    // 7. Timestamp (makes salt unique per installation)
    entropySources.push(Date.now().toString());
    
    // Combine all entropy sources and hash them
    const combinedEntropy = entropySources.join('|');
    const deviceSalt = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combinedEntropy
    );
    
    console.log('📱 Generated device-specific salt for physical device');
    return deviceSalt;
    
  } catch (error) {
    console.error('Error generating device-specific salt:', error);
    // Fallback to a secure random salt if device-specific generation fails
    return await generateSecureRandom(32);
  }
}

/**
 * Gets or creates a secure, device-specific salt
 * Adapts behavior based on simulator vs physical device
 */
async function getOrCreateSalt(): Promise<string> {
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    
    // Check if we already have a stored salt
    let storedSalt = await AsyncStorage.getItem(SALT_KEY);
    const isSimulator = isRunningOnSimulator();
    
    if (!storedSalt) {
      // Generate a new device-specific salt
      storedSalt = await generateDeviceSpecificSalt();
      
      // Store device info for additional security validation
      const deviceInfo: DeviceInfo = {
        isSimulator,
        platform: Platform.OS,
        createdAt: Date.now()
      };
      
      // Add device-specific identifiers if available
      try {
        const { default: Application } = await import('expo-application');
        
        if (Application.applicationId) {
          deviceInfo.applicationId = Application.applicationId;
        }
        
        if (Platform.OS === 'android' && !isSimulator) {
          try {
            const androidId = await Application.getAndroidId();
            if (androidId) {
              deviceInfo.androidId = androidId;
            }
          } catch (error) {
            console.log('Could not access Android ID for device info');
          }
        }
        
        try {
          // @ts-ignore - deviceName might be available as a property
          if (Application.deviceName) {
            // @ts-ignore
            deviceInfo.deviceName = Application.deviceName;
          }
        } catch (error) {
          console.log('Could not access device name for device info');
        }
      } catch (error) {
        console.log('Could not access Application module for device info');
      }
      
      // Add Expo-specific identifiers
      if (Constants.installationId) {
        deviceInfo.installationId = Constants.installationId;
      }
      
      if (Constants.deviceYearClass) {
        deviceInfo.deviceYearClass = Constants.deviceYearClass;
      }
      
      // Store simulator mode for future reference
      await AsyncStorage.setItem(SIMULATOR_KEY, isSimulator.toString());
      
      // Store both salt and device info
      await AsyncStorage.setItem(SALT_KEY, storedSalt);
      await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
      
      console.log(`🔐 Salt created for ${isSimulator ? 'simulator' : 'physical device'}`);
    } else {
      // Verify that the current environment matches the stored environment
      const storedIsSimulator = await AsyncStorage.getItem(SIMULATOR_KEY);
      if (storedIsSimulator !== null) {
        const wasSimulator = storedIsSimulator === 'true';
        if (wasSimulator !== isSimulator) {
          console.warn(`⚠️ Environment changed from ${wasSimulator ? 'simulator' : 'device'} to ${isSimulator ? 'simulator' : 'device'}`);
          // In production, you might want to require re-authentication here
        }
      }
    }
    
    return storedSalt;
  } catch (error) {
    console.error('Error getting or creating salt:', error);
    // Fallback to generating a new salt
    return await generateDeviceSpecificSalt();
  }
}

/**
 * Securely hashes the passcode with the device-specific salt
 * Uses PBKDF2-like approach with multiple iterations
 * Adapts iteration count for simulator vs device performance
 */
async function secureHashPasscode(passcode: string, salt: string, isSimulator: boolean = false): Promise<string> {
  try {
    // Use fewer iterations for simulators to maintain performance
    const iterations = isSimulator ? 100 : 1000; // 100 for simulator, 1000 for device
    
    // Use multiple iterations to make brute force attacks harder
    let hash = passcode + salt;
    
    // Apply multiple iterations of SHA-256 (PBKDF2-like approach)
    for (let i = 0; i < iterations; i++) {
      hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        hash + i.toString()
      );
    }
    
    console.log(`🔐 Applied ${iterations} hashing iterations for ${isSimulator ? 'simulator' : 'device'}`);
    return hash;
    
  } catch (error) {
    console.error('Error hashing passcode:', error);
    throw new Error('Failed to hash passcode securely');
  }
}

/**
 * Validates that the current device matches the stored device info
 * Adapts validation for simulator vs physical device environments
 */
async function validateDeviceConsistency(): Promise<boolean> {
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const { default: Application } = await import('expo-application');
    
    const storedDeviceInfoStr = await AsyncStorage.getItem(DEVICE_INFO_KEY);
    if (!storedDeviceInfoStr) {
      return true; // No device info stored yet, allow
    }
    
    const storedDeviceInfo: DeviceInfo = JSON.parse(storedDeviceInfoStr);
    const currentIsSimulator = isRunningOnSimulator();
    
    // Check simulator consistency
    if (storedDeviceInfo.isSimulator !== currentIsSimulator) {
      console.warn(`Environment changed from ${storedDeviceInfo.isSimulator ? 'simulator' : 'device'} to ${currentIsSimulator ? 'simulator' : 'device'}`);
      // In development, allow this for testing
      // In production, you might want to require re-authentication
      if (!__DEV__) {
        return false;
      }
    }
    
    // Check application ID consistency (if available)
    if (storedDeviceInfo.applicationId && Application.applicationId) {
      if (storedDeviceInfo.applicationId !== Application.applicationId) {
        console.warn('Application ID mismatch detected');
        return false;
      }
    }
    
    // Check Android ID consistency for physical devices (if available)
    if (Platform.OS === 'android' && !currentIsSimulator && storedDeviceInfo.androidId) {
      try {
        const androidId = await Application.getAndroidId();
        if (androidId && storedDeviceInfo.androidId !== androidId) {
          console.warn('Android ID mismatch detected');
          return false;
        }
      } catch (error) {
        console.log('Could not validate Android ID');
      }
    }
    
    // For simulators, be more lenient but still validate
    if (currentIsSimulator) {
      console.log('🔧 Running on simulator - applying relaxed validation');
      // For simulators, we mainly check that it's the same app installation
      if (storedDeviceInfo.installationId && Constants.installationId) {
        if (storedDeviceInfo.installationId !== Constants.installationId) {
          console.warn('Installation ID mismatch on simulator');
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error validating device consistency:', error);
    // In development, allow on error for testing
    return __DEV__;
  }
}

export const passcodeCrypto = {
  /**
   * Stores a passcode securely with device-specific hashing
   * Works on both simulators and physical devices
   */
  async storePasscode(passcode: string): Promise<void> {
    try {
      const isSimulator = isRunningOnSimulator();
      
      // Validate device consistency first
      const isDeviceValid = await validateDeviceConsistency();
      if (!isDeviceValid) {
        throw new Error('Device validation failed - possible security breach');
      }
      
      // Get or create device-specific salt
      const salt = await getOrCreateSalt();
      
      // Securely hash the passcode (with simulator-optimized iterations)
      const hashedPasscode = await secureHashPasscode(passcode, salt, isSimulator);
      
      const passcodeData: PasscodeData = {
        hashedPasscode: hashedPasscode,
        createdAt: Date.now()
      };
      
      // Store the hashed passcode data
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem(PASSCODE_KEY, JSON.stringify(passcodeData));
      
      console.log(`🔐 Passcode stored securely for ${isSimulator ? 'simulator' : 'physical device'}`);
      
    } catch (error) {
      console.error('Error storing passcode:', error);
      throw new Error('Failed to store passcode securely');
    }
  },

  /**
   * Checks if a passcode exists
   */
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

  /**
   * Removes the stored passcode (for reset functionality)
   */
  async removePasscode(): Promise<void> {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.removeItem(PASSCODE_KEY);
      console.log('🗑️ Passcode removed successfully');
    } catch (error) {
      console.error('Error removing passcode:', error);
      throw new Error('Failed to remove passcode');
    }
  },

  /**
   * Verifies a passcode against the stored hash
   * Works on both simulators and physical devices
   */
  async verifyPasscode(inputPasscode: string): Promise<boolean> {
    try {
      const isSimulator = isRunningOnSimulator();
      
      // Validate device consistency
      const isDeviceValid = await validateDeviceConsistency();
      if (!isDeviceValid) {
        console.warn('Device validation failed during verification');
        return false;
      }
      
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const storedData = await AsyncStorage.getItem(PASSCODE_KEY);
      
      if (!storedData) {
        return false;
      }

      const passcodeData: PasscodeData = JSON.parse(storedData);
      const salt = await getOrCreateSalt();
      const inputHash = await secureHashPasscode(inputPasscode, salt, isSimulator);
      
      const isValid = inputHash === passcodeData.hashedPasscode;
      
      if (isValid) {
        console.log(`✅ Passcode verification successful on ${isSimulator ? 'simulator' : 'device'}`);
      } else {
        console.log(`❌ Passcode verification failed on ${isSimulator ? 'simulator' : 'device'}`);
      }
      
      return isValid;
      
    } catch (error) {
      console.error('Error verifying passcode:', error);
      return false;
    }
  },

  /**
   * Gets comprehensive security information for debugging/auditing
   * Includes simulator-specific information
   */
  async getSecurityInfo(): Promise<{
    hasPasscode: boolean;
    deviceConsistent: boolean;
    saltExists: boolean;
    isSimulator: boolean;
    platform: string;
    createdAt?: number;
    deviceInfo?: DeviceInfo;
  }> {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      
      const hasPasscodeResult = await this.hasPasscode();
      const deviceConsistent = await validateDeviceConsistency();
      const isSimulator = isRunningOnSimulator();
      
      const saltExists = !!(await AsyncStorage.getItem(SALT_KEY));
      
      const storedData = await AsyncStorage.getItem(PASSCODE_KEY);
      let createdAt: number | undefined;
      
      if (storedData) {
        const passcodeData: PasscodeData = JSON.parse(storedData);
        createdAt = passcodeData.createdAt;
      }
      
      const deviceInfoStr = await AsyncStorage.getItem(DEVICE_INFO_KEY);
      let deviceInfo: DeviceInfo | undefined;
      if (deviceInfoStr) {
        deviceInfo = JSON.parse(deviceInfoStr);
      }
      
      return {
        hasPasscode: hasPasscodeResult,
        deviceConsistent,
        saltExists,
        isSimulator,
        platform: Platform.OS,
        createdAt,
        deviceInfo
      };
      
    } catch (error) {
      console.error('Error getting security info:', error);
      return {
        hasPasscode: false,
        deviceConsistent: false,
        saltExists: false,
        isSimulator: isRunningOnSimulator(),
        platform: Platform.OS
      };
    }
  },

  /**
   * Gets current environment information
   */
  getEnvironmentInfo(): {
    isSimulator: boolean;
    platform: string;
    deviceName?: string;
    isDevelopment: boolean;
  } {
    return {
      isSimulator: isRunningOnSimulator(),
      platform: Platform.OS,
      deviceName: Constants.deviceName,
      isDevelopment: __DEV__
    };
  }
};