import * as Crypto from 'expo-crypto';

/**
 * Generates cryptographically secure random bytes
 * Uses Expo's secure random number generator
 */
export async function generateSecureRandom(length: number): Promise<string> {
  try {
    // Generate random bytes using Expo's secure random generator
    const randomBytes = await Crypto.getRandomBytesAsync(length);
    
    // Convert bytes to hex string for storage
    const hexString = Array.from(randomBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    return hexString;
  } catch (error) {
    console.error('Error generating secure random bytes:', error);
    
    // Fallback: Use timestamp + Math.random as last resort
    const fallbackRandom = Date.now().toString() + Math.random().toString(36).substring(2);
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      fallbackRandom
    );
    
    return hash.substring(0, length * 2); // Return hex representation
  }
}

/**
 * Generates a secure random passcode of specified length
 */
export async function generateSecurePasscode(length: number = 6): Promise<string> {
  try {
    const randomHex = await generateSecureRandom(Math.ceil(length / 2));
    
    // Convert hex to decimal digits
    let passcode = '';
    for (let i = 0; i < randomHex.length && passcode.length < length; i += 2) {
      const byte = parseInt(randomHex.substr(i, 2), 16);
      const digit = byte % 10;
      passcode += digit.toString();
    }
    
    // Ensure we have the required length
    while (passcode.length < length) {
      const randomByte = await Crypto.getRandomBytesAsync(1);
      const digit = randomByte[0] % 10;
      passcode += digit.toString();
    }
    
    return passcode;
  } catch (error) {
    console.error('Error generating secure passcode:', error);
    
    // Fallback to less secure random generation
    let passcode = '';
    for (let i = 0; i < length; i++) {
      passcode += Math.floor(Math.random() * 10).toString();
    }
    
    return passcode;
  }
}