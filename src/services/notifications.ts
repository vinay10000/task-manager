import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';

import { TaskInstance } from '../types/models';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const response = await Notifications.requestPermissionsAsync();
  return response.status === 'granted';
}

export async function getNotificationPermissionGranted() {
  const response = await Notifications.getPermissionsAsync();
  return response.status === 'granted';
}

export async function openNotificationSettings() {
  await Linking.openSettings();
}

export async function rescheduleAllTaskReminders(tasks: TaskInstance[]) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = Date.now();

  for (const task of tasks) {
    if (task.completed || !task.hasReminder || !task.reminderTime) {
      continue;
    }

    const triggerAt = new Date(task.reminderTime).getTime();
    if (Number.isNaN(triggerAt) || triggerAt <= now) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: task.title,
        body: task.description || 'Task reminder',
        data: { taskId: task.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerAt),
      },
    });
  }
}
