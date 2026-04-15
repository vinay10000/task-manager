import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { TaskInstance } from '../types/models';

const CHANNEL_ID = 'task-reminders';
export const TASK_REMINDER_CATEGORY_ID = 'taskReminderActions';
export const TASK_REMINDER_DONE_ACTION_ID = 'taskReminderDone';
export const TASK_REMINDER_SNOOZE_ACTION_ID = 'taskReminderSnooze10';

export interface TaskReminderNotificationData {
  taskId: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotificationChannel(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(TASK_REMINDER_CATEGORY_ID, [
    {
      identifier: TASK_REMINDER_DONE_ACTION_ID,
      buttonTitle: 'Done',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: TASK_REMINDER_SNOOZE_ACTION_ID,
      buttonTitle: 'Snooze 10 min',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);

  if (Platform.OS !== 'android') {
    return;
  }

  const channelExists = await Notifications.getNotificationChannelAsync(CHANNEL_ID);
  if (channelExists) {
    return;
  }

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Task Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
    showBadge: false,
  });
}

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

export function getTaskReminderNotificationData(data: unknown): TaskReminderNotificationData | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const taskId = (data as { taskId?: unknown }).taskId;
  if (typeof taskId !== 'string' || !taskId) {
    return null;
  }

  return { taskId };
}

export async function rescheduleAllTaskReminders(tasks: TaskInstance[]) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => request.content.data?.taskId != null)
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier))
  );
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
        categoryIdentifier: TASK_REMINDER_CATEGORY_ID,
        ...(Platform.OS === 'android' && {
          channelId: CHANNEL_ID,
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerAt),
      },
    });
  }
}
