import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainScreen from './src/screens/MainScreen';
import TagTimelineScreen from './src/screens/TagTimelineScreen';
import PasscodeSetupScreen from './src/screens/PasscodeSetupScreen';
import PasscodePromptScreen from './src/screens/PasscodePromptScreen';
import { NoteProvider } from './src/context/NoteContext';
import { PasscodeProvider, usePasscode } from './src/context/PasscodeContext';

const Stack = createStackNavigator();

function AppNavigator() {
  const { hasPasscode, isPasscodeVerified, isLoading, setupPasscode, verifyPasscode } = usePasscode();

  if (isLoading) {
    // Show loading screen while checking passcode status
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <Text style={{ fontSize: 18, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  // If no passcode exists, show setup screen
  if (!hasPasscode) {
    return (
      <PasscodeSetupScreen onSetupComplete={() => {
        // The setupPasscode function in the context will handle state updates
      }} />
    );
  }

  // If passcode exists but not verified, show prompt screen
  if (hasPasscode && !isPasscodeVerified) {
    return (
      <PasscodePromptScreen onPasscodeVerified={() => {
        // The verifyPasscode function in the context will handle state updates
      }} />
    );
  }

  // If passcode is verified, show main app
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="TagTimeline" component={TagTimelineScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NoteProvider>
        <PasscodeProvider>
          <AppNavigator />
        </PasscodeProvider>
      </NoteProvider>
    </SafeAreaProvider>
  );
}