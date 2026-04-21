import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useContexts';
import { Loader } from '../components/Loaders';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TabNavigator from './TabNavigator';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import QRScanEventScreen from '../screens/QRScanEventScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  console.log("auth:", isAuthenticated)
  if (loading) return <Loader message="Loading..." />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : (
        // App stack
        <>
          <Stack.Screen
            name="Main"
            component={TabNavigator}
          />

          <Stack.Screen
            name="EventDetails"
            component={EventDetailsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="CreateEvent"
            component={CreateEventScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="QRScanEvent"
            component={QRScanEventScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
