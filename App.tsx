import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from './src/components/ToastHost';
import { AppProvider } from './src/context/AppProvider';
import { useAppState } from './src/hooks/useAppState';
import { AppNavigator } from './src/navigation/AppNavigator';

function AppShell() {
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
    <SafeAreaProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
