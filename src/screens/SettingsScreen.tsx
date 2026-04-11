import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BaseScreen } from '../components/BaseScreen';
import { ACCENT_OPTIONS, COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { openNotificationSettings } from '../services/notifications';

export function SettingsScreen({ navigation }: any) {
  const { settings, setAccentColor, notificationGranted, requestNotifications } = useAppState();

  return (
    <BaseScreen scroll>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accent Color</Text>
        <View style={styles.accentGrid}>
          {ACCENT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setAccentColor(option.value)}
              style={[
                styles.accentCircle,
                { backgroundColor: option.value },
                settings.accentColor === option.value && styles.selectedAccent,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.sectionBody}>
          {notificationGranted
            ? 'Local reminders are enabled and will reschedule automatically when tasks change.'
            : 'Notifications are currently unavailable. You can request access now or open system settings.'}
        </Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.button, { backgroundColor: settings.accentColor }]}
            onPress={() => {
              if (notificationGranted) {
                void openNotificationSettings();
              } else {
                void requestNotifications();
              }
            }}
          >
            <Text style={styles.buttonLabel}>{notificationGranted ? 'Open Settings' : 'Enable Notifications'}</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.linkCard} onPress={() => navigation.navigate('CategoryManager')}>
        <Text style={styles.linkTitle}>Manage Categories</Text>
        <Text style={styles.linkBody}>Rename, recolor, create, or retire categories. Deleted tasks move to Uncategorized.</Text>
      </Pressable>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionBody: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  accentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  accentCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  selectedAccent: {
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
  },
  button: {
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  buttonLabel: {
    color: COLORS.background,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  linkCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    gap: 8,
  },
  linkTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  linkBody: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
