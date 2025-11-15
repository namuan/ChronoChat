import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainScreen from './src/screens/MainScreen';
import TagTimelineScreen from './src/screens/TagTimelineScreen';
import { NoteProvider } from './src/context/NoteContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NoteProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="TagTimeline" component={TagTimelineScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </NoteProvider>
    </SafeAreaProvider>
  );
}