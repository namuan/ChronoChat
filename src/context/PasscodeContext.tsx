import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { passcodeCrypto } from '../utils/passcodeCrypto';

interface PasscodeContextType {
  hasPasscode: boolean;
  isPasscodeVerified: boolean;
  isLoading: boolean;
  setupPasscode: (passcode: string) => Promise<void>;
  verifyPasscode: (passcode: string) => Promise<boolean>;
  resetPasscode: () => Promise<void>;
  checkPasscodeStatus: () => Promise<void>;
}

const PasscodeContext = createContext<PasscodeContextType | undefined>(undefined);

export const usePasscode = () => {
  const context = useContext(PasscodeContext);
  if (!context) {
    throw new Error('usePasscode must be used within a PasscodeProvider');
  }
  return context;
};

interface PasscodeProviderProps {
  children: ReactNode;
}

export const PasscodeProvider: React.FC<PasscodeProviderProps> = ({ children }) => {
  const [hasPasscode, setHasPasscode] = useState<boolean>(false);
  const [isPasscodeVerified, setIsPasscodeVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check passcode status on app startup
  useEffect(() => {
    checkPasscodeStatus();
  }, []);

  const checkPasscodeStatus = async () => {
    try {
      setIsLoading(true);
      const passcodeExists = await passcodeCrypto.hasPasscode();
      setHasPasscode(passcodeExists);
      
      // If no passcode exists, user needs to set one up
      if (!passcodeExists) {
        setIsPasscodeVerified(false);
      }
    } catch (error) {
      console.error('Error checking passcode status:', error);
      setHasPasscode(false);
      setIsPasscodeVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const setupPasscode = async (passcode: string) => {
    try {
      await passcodeCrypto.storePasscode(passcode);
      setHasPasscode(true);
      setIsPasscodeVerified(true);
    } catch (error) {
      console.error('Error setting up passcode:', error);
      throw new Error('Failed to setup passcode');
    }
  };

  const verifyPasscode = async (passcode: string): Promise<boolean> => {
    try {
      const isValid = await passcodeCrypto.verifyPasscode(passcode);
      if (isValid) {
        setIsPasscodeVerified(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying passcode:', error);
      return false;
    }
  };

  const resetPasscode = async () => {
    try {
      await passcodeCrypto.removePasscode();
      setHasPasscode(false);
      setIsPasscodeVerified(false);
    } catch (error) {
      console.error('Error resetting passcode:', error);
      throw new Error('Failed to reset passcode');
    }
  };

  const value: PasscodeContextType = {
    hasPasscode,
    isPasscodeVerified,
    isLoading,
    setupPasscode,
    verifyPasscode,
    resetPasscode,
    checkPasscodeStatus,
  };

  return (
    <PasscodeContext.Provider value={value}>
      {children}
    </PasscodeContext.Provider>
  );
};