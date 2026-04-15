import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useAppState } from '../hooks/useAppState';
import { useThemeColors } from '../hooks/useThemeColors';
import { ActivityHeatmapScreen } from '../screens/ActivityHeatmapScreen';
import { AllTasksScreen } from '../screens/AllTasksScreen';
import { CategoryManagerScreen } from '../screens/CategoryManagerScreen';
import { MonthlyScreen } from '../screens/MonthlyScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { TaskEditorScreen } from '../screens/TaskEditorScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { WeeklyScreen } from '../screens/WeeklyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  const { settings } = useAppState();
  const colors = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 28,
          right: 28,
          bottom: 18,
          height: 64,
          borderRadius: 32,
          borderTopWidth: 0,
          backgroundColor: '#202020',
          shadowColor: '#000000',
          shadowOpacity: 0.35,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12,
        },
        tabBarItemStyle: {
          marginVertical: 8,
        },
        tabBarActiveTintColor: colors.background,
        tabBarInactiveTintColor: '#6D6D71',
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
            Today: 'calendar-today',
            Weekly: 'calendar-week',
            Monthly: 'calendar-month',
            All: 'format-list-bulleted',
          };

          return (
            <TabIconShell active={focused} accentColor={settings.accentColor}>
              <MaterialCommunityIcons name={iconMap[route.name]} color={color} size={size} />
            </TabIconShell>
          );
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Weekly" component={WeeklyScreen} />
      <Tab.Screen name="Monthly" component={MonthlyScreen} />
      <Tab.Screen name="All" component={AllTasksScreen} />
    </Tab.Navigator>
  );
}

function TabIconShell({
  active,
  accentColor,
  children,
}: {
  active: boolean;
  accentColor: string;
  children: ReactNode;
}) {
  return (
    <View
      style={[
        {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
        },
        active && {
          backgroundColor: accentColor,
          shadowColor: accentColor,
          shadowOpacity: 0.42,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 0 },
          elevation: 10,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function AppNavigator() {
  const { settings, hydrated } = useAppState();
  const colors = useThemeColors();

  if (!hydrated) {
    return null;
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.background,
          border: colors.border,
          text: colors.textPrimary,
          primary: settings.accentColor,
        },
      }}
    >
      {!settings.onboardingDone ? (
        <OnboardingScreen />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textPrimary,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="TaskEditor"
            component={TaskEditorScreen}
            options={{
              presentation: 'transparentModal',
              animation: 'fade',
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Detail' }} />
          <Stack.Screen
            name="ActivityHeatmap"
            component={ActivityHeatmapScreen}
            options={{ title: 'Activity' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ presentation: 'modal', title: 'Settings' }}
          />
          <Stack.Screen
            name="CategoryManager"
            component={CategoryManagerScreen}
            options={{ presentation: 'modal', title: 'Categories' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
