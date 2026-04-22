import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { UIProvider, UIContext } from './context/UIContext';
import RootNavigator from './navigation/RootNavigator';
import Toast from './components/Toast';

function AppWithToast() {
  return (
    <UIContext.Consumer>
      {({ toast, hideToast }) => (
        <>
          <RootNavigator />
          <Toast toast={toast} onHide={hideToast} />
        </>
      )}
    </UIContext.Consumer>
  );
}

export default function RootApp() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <UIProvider>
          <AuthProvider>
            <EventProvider>
              <StatusBar style="light" />
              <AppWithToast />
            </EventProvider>
          </AuthProvider>
        </UIProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
