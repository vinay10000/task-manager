import { addDays, addMonths, compareAsc, format, isAfter, parseISO, startOfDay } from 'date-fns';

import { ACCENT_OPTIONS, DEFAULT_CATEGORY_NAMES } from '../constants/theme';
import {
  ActivityDay,
  AppSettings,
  Category,
  Priority,
  ReminderOffset,
  Subtask,
  SubtaskBlueprint,
  TaskDraft,
  TaskInstance,
  TaskSeries,
  TaskSort,
  TaskStatusFilter,
} from '../types/models';
import { generateId } from './ids';

export function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function getDefaultSettings(): AppSettings {
  const accent = ACCENT_OPTIONS[0];
  return {
    accentColor: accent.value,
    accentName: accent.name,
    notificationPermissionAsked: false,
    onboardingDone: false,
    timezone: getTimezone(),
  };
}

export function createDefaultCategories(): Category[] {
  const palette = ['#FF6B8A', '#06D6A0', '#FFB627', '#A78BFA', '#2DD4BF', '#FBBF77', '#BFFF00', '#FF7F50'];
  const colors = [...palette]
    .sort(() => Math.random() - 0.5)
    .slice(0, DEFAULT_CATEGORY_NAMES.length);
  return [
    ...DEFAULT_CATEGORY_NAMES.map((name, index) => ({
      id: generateId('category'),
      name,
      color: colors[index],
      isDefault: true,
      systemType: 'none' as const,
    })),
    {
      id: generateId('category'),
      name: 'Uncategorized',
      color: '#666666',
      isDefault: true,
      systemType: 'uncategorized' as const,
    },
  ];
}

export function normalizeTitle(title: string) {
  return title.trim();
}

export function normalizeTags(tags: string[]) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const rawTag of tags) {
    const tag = rawTag.trim().toLowerCase();
    if (!tag || seen.has(tag)) {
      continue;
    }
    seen.add(tag);
    normalized.push(tag);
  }

  return normalized;
}

export function clampRecurrenceInterval(value: number) {
  if (Number.isNaN(value) || value < 1) {
    return 1;
  }
  return Math.min(365, Math.floor(value));
}

export function getDateKey(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

export function mergeLocalDateAndTime(date: string | null, time: string | null) {
  if (!date) {
    return null;
  }

  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = (time ?? '09:00').split(':').map(Number);
  const merged = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return Number.isNaN(merged.getTime()) ? null : merged;
}

export function computeReminderTime(
  dueDate: string | null,
  dueTime: string | null,
  offset: ReminderOffset
) {
  if (!dueDate || !dueTime || !offset) {
    return null;
  }

  const due = mergeLocalDateAndTime(dueDate, dueTime);
  if (!due) {
    return null;
  }

  const reminder = new Date(due);
  if (offset === '5min') {
    reminder.setMinutes(reminder.getMinutes() - 5);
  } else if (offset === '15min') {
    reminder.setMinutes(reminder.getMinutes() - 15);
  } else if (offset === '1hr') {
    reminder.setHours(reminder.getHours() - 1);
  }

  return reminder.toISOString();
}

export function formatDateLabel(date: string | null) {
  if (!date) {
    return 'No due date';
  }
  try {
    return format(parseISO(`${date}T00:00:00`), 'EEE, MMM d');
  } catch {
    return date;
  }
}

export function formatDateTimeLabel(date: string | null, time: string | null) {
  if (!date) {
    return 'No schedule';
  }
  const merged = mergeLocalDateAndTime(date, time);
  if (!merged) {
    return date;
  }
  return format(merged, time ? 'EEE, MMM d • h:mm a' : 'EEE, MMM d');
}

export function buildSubtasks(subtasks: Subtask[]) {
  return subtasks.map((subtask, index) => ({
    id: subtask.id || generateId('subtask'),
    title: subtask.title.trim(),
    completed: subtask.completed,
    sortOrder: index,
  }));
}

export function buildSubtaskBlueprints(subtasks: Subtask[]): SubtaskBlueprint[] {
  return buildSubtasks(subtasks).map(({ id, title, sortOrder }) => ({ id, title, sortOrder }));
}

export function subtaskBlueprintsToSubtasks(subtasks: SubtaskBlueprint[]): Subtask[] {
  return subtasks.map((subtask) => ({
    id: generateId('subtask'),
    title: subtask.title,
    completed: false,
    sortOrder: subtask.sortOrder,
  }));
}

export function upsertActivityLog(activityLog: ActivityDay[], date: string, patch: Partial<ActivityDay>) {
  const existing = activityLog.find((entry) => entry.date === date);
  if (!existing) {
    return [
      ...activityLog,
      {
        date,
        subtasksCompleted: patch.subtasksCompleted ?? 0,
        wasEdited: patch.wasEdited ?? false,
        wasCompleted: patch.wasCompleted ?? false,
      },
    ];
  }

  return activityLog.map((entry) =>
    entry.date === date
      ? {
          ...entry,
          subtasksCompleted:
            patch.subtasksCompleted !== undefined ? patch.subtasksCompleted : entry.subtasksCompleted,
          wasEdited: patch.wasEdited ?? entry.wasEdited,
          wasCompleted: patch.wasCompleted ?? entry.wasCompleted,
        }
      : entry
  );
}

export function createTaskSeries(draft: TaskDraft): TaskSeries {
  const now = new Date().toISOString();
  return {
    id: generateId('series'),
    title: normalizeTitle(draft.title),
    description: draft.description.trim(),
    categoryId: draft.categoryId,
    tags: normalizeTags(draft.tags),
    priority: draft.priority,
    recurrenceRule: draft.recurrenceRule === 'none' ? 'daily' : draft.recurrenceRule,
    recurrenceInterval: clampRecurrenceInterval(draft.recurrenceInterval),
    dueTime: draft.dueTime,
    hasReminder: draft.hasReminder,
    reminderOffset: draft.reminderOffset,
    subtaskBlueprints: buildSubtaskBlueprints(draft.subtasks),
    createdAt: now,
    archivedAt: null,
  };
}

export function createTaskInstanceFromDraft(
  draft: TaskDraft,
  sortOrder: number,
  seriesId: string | null = null
): TaskInstance {
  const now = new Date().toISOString();
  return {
    id: generateId('task'),
    seriesId,
    title: normalizeTitle(draft.title),
    description: draft.description.trim(),
    categoryId: draft.categoryId,
    tags: normalizeTags(draft.tags),
    priority: draft.priority,
    dueDate: draft.dueDate,
    dueTime: draft.dueTime,
    hasReminder: draft.hasReminder && !!draft.dueDate && !!draft.dueTime,
    reminderOffset: draft.hasReminder && draft.dueDate && draft.dueTime ? draft.reminderOffset : null,
    reminderTime: draft.hasReminder ? computeReminderTime(draft.dueDate, draft.dueTime, draft.reminderOffset) : null,
    reminderFired: false,
    subtasks: buildSubtasks(draft.subtasks),
    sortOrder,
    completed: false,
    completedAt: null,
    createdAt: now,
    activityLog: [],
  };
}

export function createInstanceFromSeries(series: TaskSeries, dueDate: string, sortOrder: number): TaskInstance {
  const now = new Date().toISOString();
  return {
    id: generateId('task'),
    seriesId: series.id,
    title: series.title,
    description: series.description,
    categoryId: series.categoryId,
    tags: [...series.tags],
    priority: series.priority,
    dueDate,
    dueTime: series.dueTime,
    hasReminder: series.hasReminder && !!series.dueTime,
    reminderOffset: series.hasReminder ? series.reminderOffset : null,
    reminderTime: series.hasReminder ? computeReminderTime(dueDate, series.dueTime, series.reminderOffset) : null,
    reminderFired: false,
    subtasks: subtaskBlueprintsToSubtasks(series.subtaskBlueprints),
    sortOrder,
    completed: false,
    completedAt: null,
    createdAt: now,
    activityLog: [],
  };
}

export function computeNextDueDate(series: TaskSeries, completedAtIso: string) {
  const anchor = startOfDay(new Date(completedAtIso));
  if (series.recurrenceRule === 'daily') {
    return format(addDays(anchor, series.recurrenceInterval), 'yyyy-MM-dd');
  }
  if (series.recurrenceRule === 'weekly') {
    return format(addDays(anchor, series.recurrenceInterval * 7), 'yyyy-MM-dd');
  }
  if (series.recurrenceRule === 'monthly') {
    return format(addMonths(anchor, series.recurrenceInterval), 'yyyy-MM-dd');
  }
  return format(addDays(anchor, series.recurrenceInterval), 'yyyy-MM-dd');
}

export function nextSortOrder(tasks: TaskInstance[]) {
  return tasks.reduce((max, task) => Math.max(max, task.sortOrder), -1) + 1;
}

export function sortTasks(tasks: TaskInstance[], sort: TaskSort) {
  const items = [...tasks];

  if (sort === 'custom') {
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  if (sort === 'priority') {
    const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    return items.sort((a, b) => order[a.priority] - order[b.priority] || a.sortOrder - b.sortOrder);
  }
  if (sort === 'alphabetical') {
    return items.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sort === 'createdAt') {
    return items.sort((a, b) => compareAsc(parseISO(b.createdAt), parseISO(a.createdAt)));
  }

  return items.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) {
      return a.sortOrder - b.sortOrder;
    }
    if (!a.dueDate) {
      return 1;
    }
    if (!b.dueDate) {
      return -1;
    }
    const aDate = mergeLocalDateAndTime(a.dueDate, a.dueTime);
    const bDate = mergeLocalDateAndTime(b.dueDate, b.dueTime);
    if (!aDate || !bDate) {
      return a.sortOrder - b.sortOrder;
    }
    return compareAsc(aDate, bDate);
  });
}

export function filterTasks(
  tasks: TaskInstance[],
  status: TaskStatusFilter,
  categoryId: string,
  search: string
) {
  const query = search.trim().toLowerCase();
  return tasks.filter((task) => {
    if (status === 'active' && task.completed) {
      return false;
    }
    if (status === 'completed' && !task.completed) {
      return false;
    }
    if (categoryId !== 'all' && task.categoryId !== categoryId) {
      return false;
    }
    if (!query) {
      return true;
    }
    return `${task.title} ${task.description} ${task.tags.join(' ')}`.toLowerCase().includes(query);
  });
}

export function getTodayBuckets(tasks: TaskInstance[]) {
  const today = startOfDay(new Date());
  const datedActive = tasks.filter((task) => !task.completed && !!task.dueDate);

  const overdue = datedActive.filter((task) => {
    const due = mergeLocalDateAndTime(task.dueDate, task.dueTime);
    return due ? isAfter(today, startOfDay(due)) : false;
  });

  const todayTasks = datedActive.filter((task) => task.dueDate === getDateKey(today));
  const completed = tasks.filter((task) => task.completed && task.completedAt?.startsWith(getDateKey(today)));

  return { overdue: sortTasks(overdue, 'dueDate'), todayTasks: sortTasks(todayTasks, 'priority'), completed };
}

export function getWeeklyDates(anchorDate: Date) {
  const start = startOfDay(anchorDate);
  const offset = start.getDay();
  const weekStart = addDays(start, -offset);
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function canReorderAllTasks(
  sort: TaskSort,
  categoryId: string,
  status: TaskStatusFilter,
  search: string
) {
  return sort === 'custom' && categoryId === 'all' && status === 'all' && search.trim().length === 0;
}
