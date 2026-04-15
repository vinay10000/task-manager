import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { ToastHost } from './src/components/ToastHost';
import { AppProvider } from './src/context/AppProvider';
import { useNotificationActions } from './src/hooks/useNotificationActions';
import { useAppState } from './src/hooks/useAppState';
import { AppNavigator } from './src/navigation/AppNavigator';

function AppShell() {
  useNotificationActions();
  const { warnings, dismissWarning } = useAppState();

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
      <ToastHost messages={warnings} onDismiss={dismissWarning} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
