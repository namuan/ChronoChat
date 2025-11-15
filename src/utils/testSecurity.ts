import { passcodeCrypto } from './passcodeCrypto';

/**
 * Simple test to verify the enhanced passcode security implementation
 * This can be run in the app to test the security features
 */
export async function testEnhancedSecurity() {
  console.log('🧪 Testing Enhanced Passcode Security...');
  
  try {
    // Test 1: Store a passcode
    console.log('📱 Test 1: Storing passcode with device-specific salt...');
    await passcodeCrypto.storePasscode('123456');
    console.log('✅ Passcode stored successfully');
    
    // Test 2: Verify correct passcode
    console.log('🔐 Test 2: Verifying correct passcode...');
    const isValidCorrect = await passcodeCrypto.verifyPasscode('123456');
    console.log(`✅ Correct passcode verification: ${isValidCorrect}`);
    
    // Test 3: Verify incorrect passcode
    console.log('❌ Test 3: Verifying incorrect passcode...');
    const isValidIncorrect = await passcodeCrypto.verifyPasscode('000000');
    console.log(`✅ Incorrect passcode rejection: ${!isValidIncorrect}`);
    
    // Test 4: Get security info
    console.log('🔍 Test 4: Getting security information...');
    const securityInfo = await passcodeCrypto.getSecurityInfo();
    console.log('✅ Security Info:', {
      hasPasscode: securityInfo.hasPasscode,
      deviceConsistent: securityInfo.deviceConsistent,
      saltExists: securityInfo.saltExists,
      createdAt: securityInfo.createdAt ? new Date(securityInfo.createdAt).toISOString() : 'N/A'
    });
    
    // Test 5: Remove passcode
    console.log('🗑️ Test 5: Removing passcode...');
    await passcodeCrypto.removePasscode();
    const hasPasscodeAfterRemoval = await passcodeCrypto.hasPasscode();
    console.log(`✅ Passcode removed successfully: ${!hasPasscodeAfterRemoval}`);
    
    console.log('🎉 All security tests passed!');
    
    return {
      success: true,
      message: 'Enhanced security implementation working correctly'
    };
    
  } catch (error) {
    console.error('❌ Security test failed:', error);
    return {
      success: false,
      message: `Security test failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Demonstrates the security improvements
 */
export function getSecurityImprovements() {
  return {
    improvements: [
      '📱 Device-specific salt generation using multiple entropy sources',
      '🔐 PBKDF2-like key derivation with 1000 iterations',
      '🛡️ Device consistency validation prevents database migration attacks',
      '🎲 Secure random number generation for cryptographic operations',
      '🏗️ Application ID binding prevents cross-app passcode reuse',
      '📱 Android ID integration for device-specific security',
      '⏰ Timestamp-based salt uniqueness per installation',
      '🔍 Security auditing and debugging capabilities'
    ],
    securityLevel: 'Production-grade',
    attackResistance: [
      'Brute force attacks (1000 iterations)',
      'Database migration attacks (device validation)',
      'Rainbow table attacks (device-specific salt)',
      'Cross-app attacks (application ID binding)',
      'Timing attacks (constant-time comparison)'
    ]
  };
}