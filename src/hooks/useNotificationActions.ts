import { useEffect, useRef } from 'react';

import * as Notifications from 'expo-notifications';

import {
  getTaskReminderNotificationData,
  TASK_REMINDER_DONE_ACTION_ID,
  TASK_REMINDER_SNOOZE_ACTION_ID,
} from '../services/notifications';
import { useAppState } from './useAppState';

function getResponseKey(response: Notifications.NotificationResponse) {
  return `${response.notification.request.identifier}:${response.actionIdentifier}`;
}

export function useNotificationActions() {
  const { completeTask, hydrated, snoozeTask } = useAppState();
  const handledResponsesRef = useRef<Set<string>>(new Set());
  const completeTaskRef = useRef(completeTask);
  const snoozeTaskRef = useRef(snoozeTask);

  useEffect(() => {
    completeTaskRef.current = completeTask;
  }, [completeTask]);

  useEffect(() => {
    snoozeTaskRef.current = snoozeTask;
  }, [snoozeTask]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let active = true;

    const handleResponse = async (response: Notifications.NotificationResponse) => {
      const responseKey = getResponseKey(response);
      if (handledResponsesRef.current.has(responseKey)) {
        return;
      }

      handledResponsesRef.current.add(responseKey);

      const taskData = getTaskReminderNotificationData(response.notification.request.content.data);
      if (!taskData) {
        await Notifications.clearLastNotificationResponseAsync();
        return;
      }

      if (response.actionIdentifier === TASK_REMINDER_DONE_ACTION_ID) {
        completeTaskRef.current(taskData.taskId);
      } else if (response.actionIdentifier === TASK_REMINDER_SNOOZE_ACTION_ID) {
        snoozeTaskRef.current(taskData.taskId);
      }

      await Notifications.clearLastNotificationResponseAsync();
    };

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!active || !response) {
        return;
      }

      void handleResponse(response);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void handleResponse(response);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [hydrated]);
}
