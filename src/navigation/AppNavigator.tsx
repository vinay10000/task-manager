import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
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

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: settings.accentColor,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
            Today: 'calendar-today',
            Weekly: 'calendar-week',
            Monthly: 'calendar-month',
            All: 'format-list-bulleted',
          };
          return <MaterialCommunityIcons name={iconMap[route.name]} color={color} size={size} />;
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

export function AppNavigator() {
  const { settings, hydrated } = useAppState();

  if (!hydrated) {
    return null;
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: COLORS.background,
          card: COLORS.background,
          border: COLORS.border,
          text: COLORS.textPrimary,
          primary: settings.accentColor,
        },
      }}
    >
      {!settings.onboardingDone ? (
        <OnboardingScreen />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.textPrimary,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="TaskEditor"
            component={TaskEditorScreen}
            options={{ presentation: 'modal', title: 'Task' }}
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
