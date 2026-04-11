import { AppState, AppStateStatus } from 'react-native';
import { createContext, ReactNode, useEffect, useState } from 'react';

import { ACCENT_OPTIONS } from '../constants/theme';
import {
  getNotificationPermissionGranted,
  rescheduleAllTaskReminders,
  requestNotificationPermission,
  setupNotificationChannel,
} from '../services/notifications';
import { loadPersistedAppData, persistAppData } from '../services/storage';
import {
  Category,
  PersistedAppData,
  Subtask,
  TaskDraft,
  TaskInstance,
} from '../types/models';
import { generateId } from '../utils/ids';
import {
  clampRecurrenceInterval,
  computeNextDueDate,
  computeReminderTime,
  createDefaultCategories,
  createInstanceFromSeries,
  createTaskInstanceFromDraft,
  createTaskSeries,
  getDateKey,
  getDefaultSettings,
  getTimezone,
  nextSortOrder,
  normalizeTags,
  normalizeTitle,
  upsertActivityLog,
} from '../utils/tasks';

type EditScope = 'single' | 'future';

interface AppContextValue extends PersistedAppData {
  hydrated: boolean;
  warnings: string[];
  notificationGranted: boolean;
  finishOnboarding: (accentValue: string) => void;
  setAccentColor: (accentValue: string) => void;
  requestNotifications: () => Promise<boolean>;
  addCategory: (name: string, color: string) => void;
  updateCategory: (categoryId: string, patch: Partial<Category>) => void;
  deleteCategory: (categoryId: string) => void;
  saveTask: (draft: TaskDraft, options?: { taskId?: string; scope?: EditScope }) => boolean;
  deleteTask: (taskId: string, scope?: EditScope) => void;
  completeTask: (taskId: string) => void;
  snoozeTask: (taskId: string) => void;
  reorderTaskInstances: (orderedIds: string[]) => void;
  reorderSubtasks: (taskId: string, orderedIds: string[]) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  dismissWarning: (warning: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

function dedupeWarnings(messages: string[]) {
  return [...new Set(messages)];
}

function ensureUncategorized(categories: Category[]) {
  const existing = categories.find((category) => category.systemType === 'uncategorized');
  if (existing) {
    return { categories, uncategorizedId: existing.id };
  }

  const uncategorized: Category = {
    id: generateId('category'),
    name: 'Uncategorized',
    color: '#666666',
    isDefault: true,
    systemType: 'uncategorized',
  };

  return { categories: [...categories, uncategorized], uncategorizedId: uncategorized.id };
}

function draftToSubtasks(draft: TaskDraft) {
  return draft.subtasks.map((subtask, index) => ({
    ...subtask,
    id: subtask.id || generateId('subtask'),
    title: subtask.title.trim(),
    sortOrder: index,
  }));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PersistedAppData>({
    categories: createDefaultCategories(),
    series: [],
    tasks: [],
    settings: getDefaultSettings(),
  });
  const [hydrated, setHydrated] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [notificationGranted, setNotificationGranted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadPersistedAppData().then(async ({ data: loadedData, warnings: loadedWarnings }) => {
      if (cancelled) {
        return;
      }

      await setupNotificationChannel();

      setData(loadedData);
      setWarnings(loadedWarnings);
      setNotificationGranted(await getNotificationPermissionGranted());
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    void persistAppData(data);
    if (notificationGranted) {
      void rescheduleAllTaskReminders(data.tasks);
    }
  }, [data, hydrated, notificationGranted]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const subscription = AppState.addEventListener('change', async (status: AppStateStatus) => {
      if (status !== 'active') {
        return;
      }

      const timezone = getTimezone();
      setNotificationGranted(await getNotificationPermissionGranted());

      setData((current) =>
        current.settings.timezone === timezone
          ? current
          : {
              ...current,
              settings: {
                ...current.settings,
                timezone,
              },
              tasks: current.tasks.map((task) => ({
                ...task,
                reminderTime: task.hasReminder
                  ? computeReminderTime(task.dueDate, task.dueTime, task.reminderOffset)
                  : null,
              })),
            }
      );

      const now = new Date().toISOString();
      const missed = data.tasks.filter(
        (task) =>
          !task.completed &&
          task.hasReminder &&
          task.reminderTime &&
          task.reminderTime < now &&
          !task.reminderFired
      );

      if (missed.length > 0) {
        setWarnings((current) => [
          `You have ${missed.length} missed reminder${missed.length > 1 ? 's' : ''}.`,
          ...current.filter((warning) => !warning.includes('missed reminder')),
        ]);
        setData((current) => ({
          ...current,
          tasks: current.tasks.map((task) =>
            missed.some((item) => item.id === task.id) ? { ...task, reminderFired: true } : task
          ),
        }));
      }
    });

    return () => {
      subscription.remove();
    };
  }, [data.tasks, hydrated]);

  const finishOnboarding = (accentValue: string) => {
    const accent = ACCENT_OPTIONS.find((option) => option.value === accentValue) ?? ACCENT_OPTIONS[0];
    setData((current) => ({
      ...current,
      categories: createDefaultCategories(),
      settings: {
        ...current.settings,
        accentColor: accent.value,
        accentName: accent.name,
        onboardingDone: true,
        timezone: getTimezone(),
      },
    }));
  };

  const setAccentColor = (accentValue: string) => {
    const accent = ACCENT_OPTIONS.find((option) => option.value === accentValue) ?? ACCENT_OPTIONS[0];
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        accentColor: accent.value,
        accentName: accent.name,
      },
    }));
  };

  const requestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationGranted(granted);
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        notificationPermissionAsked: true,
      },
    }));
    setWarnings((current) =>
      dedupeWarnings([granted ? 'Notifications enabled.' : 'Notifications stayed disabled.', ...current])
    );
    return granted;
  };

  const addCategory = (name: string, color: string) => {
    const normalized = name.trim();
    if (!normalized) {
      return;
    }
    setData((current) => ({
      ...current,
      categories: [
        ...current.categories,
        {
          id: generateId('category'),
          name: normalized,
          color,
          isDefault: false,
          systemType: 'none',
        },
      ],
    }));
  };

  const updateCategory = (categoryId: string, patch: Partial<Category>) => {
    setData((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === categoryId && category.systemType !== 'uncategorized'
          ? { ...category, ...patch, name: patch.name?.trim() || category.name }
          : category
      ),
    }));
  };

  const deleteCategory = (categoryId: string) => {
    setData((current) => {
      const target = current.categories.find((category) => category.id === categoryId);
      if (!target || target.systemType === 'uncategorized') {
        return current;
      }

      const ensured = ensureUncategorized(current.categories.filter((category) => category.id !== categoryId));

      return {
        ...current,
        categories: ensured.categories,
        series: current.series.map((series) =>
          series.categoryId === categoryId ? { ...series, categoryId: ensured.uncategorizedId } : series
        ),
        tasks: current.tasks.map((task) =>
          task.categoryId === categoryId ? { ...task, categoryId: ensured.uncategorizedId } : task
        ),
      };
    });
  };

  const saveTask = (draft: TaskDraft, options?: { taskId?: string; scope?: EditScope }) => {
    const normalizedTitle = normalizeTitle(draft.title);
    if (!normalizedTitle) {
      setWarnings((current) => dedupeWarnings(['Task title is required.', ...current]));
      return false;
    }

    if (draft.recurrenceRule !== 'none' && !draft.dueDate) {
      setWarnings((current) => dedupeWarnings(['Recurring tasks need a due date.', ...current]));
      return false;
    }

    if (draft.subtasks.some((subtask) => !subtask.title.trim())) {
      setWarnings((current) => dedupeWarnings(['Subtasks cannot be empty.', ...current]));
      return false;
    }

    const nextDraft: TaskDraft = {
      ...draft,
      title: normalizedTitle,
      description: draft.description.trim(),
      tags: normalizeTags(draft.tags),
      recurrenceInterval: clampRecurrenceInterval(draft.recurrenceInterval),
      hasReminder: draft.hasReminder && !!draft.dueDate && !!draft.dueTime,
      reminderOffset: draft.hasReminder && draft.dueDate && draft.dueTime ? draft.reminderOffset : null,
      subtasks: draftToSubtasks(draft),
    };

    setData((current) => {
      const taskId = options?.taskId;
      const scope = options?.scope ?? 'single';

      if (!taskId) {
        if (nextDraft.recurrenceRule !== 'none') {
          const series = createTaskSeries(nextDraft);
          const task = createTaskInstanceFromDraft(nextDraft, nextSortOrder(current.tasks), series.id);
          return {
            ...current,
            series: [...current.series, series],
            tasks: [...current.tasks, task],
          };
        }

        return {
          ...current,
          tasks: [...current.tasks, createTaskInstanceFromDraft(nextDraft, nextSortOrder(current.tasks))],
        };
      }

      const target = current.tasks.find((task) => task.id === taskId);
      if (!target) {
        return current;
      }

      if (!target.seriesId && nextDraft.recurrenceRule !== 'none') {
        const nextSeries = createTaskSeries(nextDraft);
        return {
          ...current,
          series: [...current.series, nextSeries],
          tasks: current.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  seriesId: nextSeries.id,
                  title: nextDraft.title,
                  description: nextDraft.description,
                  categoryId: nextDraft.categoryId,
                  tags: nextDraft.tags,
                  priority: nextDraft.priority,
                  dueDate: nextDraft.dueDate,
                  dueTime: nextDraft.dueTime,
                  hasReminder: nextDraft.hasReminder,
                  reminderOffset: nextDraft.reminderOffset,
                  reminderTime: nextDraft.hasReminder
                    ? computeReminderTime(nextDraft.dueDate, nextDraft.dueTime, nextDraft.reminderOffset)
                    : null,
                  reminderFired: false,
                  subtasks: draftToSubtasks(nextDraft),
                  activityLog: upsertActivityLog(task.activityLog, getDateKey(), { wasEdited: true }),
                }
              : task
          ),
        };
      }

      if (!target.seriesId || scope === 'single') {
        return {
          ...current,
          tasks: current.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  title: nextDraft.title,
                  description: nextDraft.description,
                  categoryId: nextDraft.categoryId,
                  tags: nextDraft.tags,
                  priority: nextDraft.priority,
                  dueDate: nextDraft.dueDate,
                  dueTime: nextDraft.dueTime,
                  hasReminder: nextDraft.hasReminder,
                  reminderOffset: nextDraft.reminderOffset,
                  reminderTime: nextDraft.hasReminder
                    ? computeReminderTime(nextDraft.dueDate, nextDraft.dueTime, nextDraft.reminderOffset)
                    : null,
                  reminderFired: false,
                  subtasks: draftToSubtasks(nextDraft),
                  activityLog: upsertActivityLog(task.activityLog, getDateKey(), { wasEdited: true }),
                }
              : task
          ),
        };
      }

      if (nextDraft.recurrenceRule === 'none') {
        return {
          ...current,
          series: current.series.map((series) =>
            series.id === target.seriesId ? { ...series, archivedAt: new Date().toISOString() } : series
          ),
          tasks: current.tasks.map((task) =>
            task.seriesId === target.seriesId && !task.completed
              ? {
                  ...task,
                  seriesId: null,
                  title: nextDraft.title,
                  description: nextDraft.description,
                  categoryId: nextDraft.categoryId,
                  tags: nextDraft.tags,
                  priority: nextDraft.priority,
                  dueDate: nextDraft.dueDate,
                  dueTime: nextDraft.dueTime,
                  hasReminder: nextDraft.hasReminder,
                  reminderOffset: nextDraft.reminderOffset,
                  reminderTime: nextDraft.hasReminder
                    ? computeReminderTime(nextDraft.dueDate, nextDraft.dueTime, nextDraft.reminderOffset)
                    : null,
                  reminderFired: false,
                  subtasks: draftToSubtasks(nextDraft),
                  activityLog: upsertActivityLog(task.activityLog, getDateKey(), { wasEdited: true }),
                }
              : task
          ),
        };
      }

      return {
        ...current,
        series: current.series.map((series) =>
          series.id === target.seriesId
            ? {
                ...series,
                title: nextDraft.title,
                description: nextDraft.description,
                categoryId: nextDraft.categoryId,
                tags: nextDraft.tags,
                priority: nextDraft.priority,
                recurrenceRule: nextDraft.recurrenceRule === 'none' ? series.recurrenceRule : nextDraft.recurrenceRule,
                recurrenceInterval:
                  nextDraft.recurrenceRule === 'none' ? series.recurrenceInterval : nextDraft.recurrenceInterval,
                dueTime: nextDraft.dueTime,
                hasReminder: nextDraft.hasReminder,
                reminderOffset: nextDraft.reminderOffset,
                subtaskBlueprints: draftToSubtasks(nextDraft).map(({ id, title, sortOrder }) => ({
                  id,
                  title,
                  sortOrder,
                })),
              }
            : series
        ),
        tasks: current.tasks.map((task) =>
          task.seriesId === target.seriesId && !task.completed
            ? {
                ...task,
                title: nextDraft.title,
                description: nextDraft.description,
                categoryId: nextDraft.categoryId,
                tags: nextDraft.tags,
                priority: nextDraft.priority,
                dueDate: nextDraft.dueDate ?? task.dueDate,
                dueTime: nextDraft.dueTime,
                hasReminder: nextDraft.hasReminder && !!(nextDraft.dueDate ?? task.dueDate) && !!nextDraft.dueTime,
                reminderOffset: nextDraft.reminderOffset,
                reminderTime: nextDraft.hasReminder
                  ? computeReminderTime(nextDraft.dueDate ?? task.dueDate, nextDraft.dueTime, nextDraft.reminderOffset)
                  : null,
                reminderFired: false,
                subtasks: draftToSubtasks(nextDraft),
                activityLog: upsertActivityLog(task.activityLog, getDateKey(), { wasEdited: true }),
              }
            : task
        ),
      };
    });
    return true;
  };

  const deleteTask = (taskId: string, scope: EditScope = 'single') => {
    setData((current) => {
      const target = current.tasks.find((task) => task.id === taskId);
      if (!target) {
        return current;
      }

      if (!target.seriesId) {
        return { ...current, tasks: current.tasks.filter((task) => task.id !== taskId) };
      }

      const series = current.series.find((item) => item.id === target.seriesId);
      if (!series) {
        return { ...current, tasks: current.tasks.filter((task) => task.id !== taskId) };
      }

      if (scope === 'future') {
        return {
          ...current,
          series: current.series.map((item) =>
            item.id === target.seriesId ? { ...item, archivedAt: new Date().toISOString() } : item
          ),
          tasks: current.tasks.filter((task) => task.completed || task.seriesId !== target.seriesId),
        };
      }

      const remaining = current.tasks.filter((task) => task.id !== taskId);
      const alreadyOpen = remaining.some((task) => task.seriesId === target.seriesId && !task.completed);
      if (alreadyOpen || series.archivedAt) {
        return { ...current, tasks: remaining };
      }

      return {
        ...current,
        tasks: [...remaining, createInstanceFromSeries(series, computeNextDueDate(series, new Date().toISOString()), nextSortOrder(remaining))],
      };
    });
  };

  const completeTask = (taskId: string) => {
    setData((current) => {
      const target = current.tasks.find((task) => task.id === taskId);
      if (!target) {
        return current;
      }

      // Toggle completion status
      const isCompleting = !target.completed;
      const completedAt = isCompleting ? new Date().toISOString() : null;
      const completedDate = isCompleting ? getDateKey(new Date(completedAt!)) : null;

      const tasks = current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: isCompleting,
              completedAt,
              reminderFired: isCompleting ? true : task.reminderFired,
              activityLog: isCompleting
                ? upsertActivityLog(task.activityLog, completedDate!, { wasCompleted: true })
                : task.activityLog,
            }
          : task
      );

      // Only handle recurring task logic when completing (not when uncompleting)
      if (!isCompleting || !target.seriesId) {
        return { ...current, tasks };
      }

      const series = current.series.find((item) => item.id === target.seriesId);
      if (!series || series.archivedAt) {
        return { ...current, tasks };
      }

      const alreadyOpen = tasks.some((task) => task.seriesId === target.seriesId && !task.completed);
      if (alreadyOpen) {
        return { ...current, tasks };
      }

      return {
        ...current,
        tasks: [...tasks, createInstanceFromSeries(series, computeNextDueDate(series, completedAt!), nextSortOrder(tasks))],
      };
    });
  };

  const snoozeTask = (taskId: string) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId && task.reminderTime
          ? {
              ...task,
              reminderTime: new Date(new Date(task.reminderTime).getTime() + 10 * 60 * 1000).toISOString(),
              reminderFired: false,
            }
          : task
      ),
    }));
  };

  const reorderTaskInstances = (orderedIds: string[]) => {
    setData((current) => {
      const orderedTasks = orderedIds
        .map((id, index) => {
          const task = current.tasks.find((item) => item.id === id);
          return task ? { ...task, sortOrder: index } : null;
        })
        .filter(Boolean) as TaskInstance[];
      const untouched = current.tasks.filter((task) => !orderedIds.includes(task.id));
      return {
        ...current,
        tasks: [...orderedTasks, ...untouched],
      };
    });
  };

  const reorderSubtasks = (taskId: string, orderedIds: string[]) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        const subtasks = orderedIds
          .map((id, index) => {
            const subtask = task.subtasks.find((item) => item.id === id);
            return subtask ? { ...subtask, sortOrder: index } : null;
          })
          .filter(Boolean) as Subtask[];
        return { ...task, subtasks };
      }),
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        const subtasks = task.subtasks.map((subtask) =>
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        );
        return {
          ...task,
          subtasks,
          activityLog: upsertActivityLog(task.activityLog, getDateKey(), {
            subtasksCompleted: subtasks.filter((subtask) => subtask.completed).length,
          }),
        };
      }),
    }));
  };

  const dismissWarning = (warning: string) => {
    setWarnings((current) => current.filter((item) => item !== warning));
  };

  return (
    <AppContext.Provider
      value={{
        ...data,
        hydrated,
        warnings,
        notificationGranted,
        finishOnboarding,
        setAccentColor,
        requestNotifications,
        addCategory,
        updateCategory,
        deleteCategory,
        saveTask,
        deleteTask,
        completeTask,
        snoozeTask,
        reorderTaskInstances,
        reorderSubtasks,
        toggleSubtask,
        dismissWarning,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
