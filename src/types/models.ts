export type Priority = 'low' | 'medium' | 'high';
export type ReminderOffset = 'exact' | '5min' | '15min' | '1hr' | null;
export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'customDays';
export type TaskStatusFilter = 'all' | 'active' | 'completed';
export type TaskSort = 'dueDate' | 'priority' | 'createdAt' | 'alphabetical' | 'custom';

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  systemType: 'none' | 'uncategorized';
}

export interface SubtaskBlueprint {
  id: string;
  title: string;
  sortOrder: number;
}

export interface TaskSeries {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  tags: string[];
  priority: Priority;
  recurrenceRule: RecurrenceRule;
  recurrenceInterval: number;
  dueTime: string | null;
  hasReminder: boolean;
  reminderOffset: ReminderOffset;
  subtaskBlueprints: SubtaskBlueprint[];
  createdAt: string;
  archivedAt: string | null;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  sortOrder: number;
}

export interface ActivityDay {
  date: string;
  subtasksCompleted: number;
  wasEdited: boolean;
  wasCompleted: boolean;
}

export interface TaskInstance {
  id: string;
  seriesId: string | null;
  title: string;
  description: string;
  categoryId: string;
  tags: string[];
  priority: Priority;
  dueDate: string | null;
  dueTime: string | null;
  hasReminder: boolean;
  reminderOffset: ReminderOffset;
  reminderTime: string | null;
  reminderFired: boolean;
  subtasks: Subtask[];
  sortOrder: number;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  activityLog: ActivityDay[];
}

export interface AppSettings {
  accentColor: string;
  accentName: string;
  notificationPermissionAsked: boolean;
  onboardingDone: boolean;
  timezone: string;
}

export interface TaskDraft {
  title: string;
  description: string;
  categoryId: string;
  tags: string[];
  priority: Priority;
  dueDate: string | null;
  dueTime: string | null;
  recurrenceRule: RecurrenceRule | 'none';
  recurrenceInterval: number;
  hasReminder: boolean;
  reminderOffset: ReminderOffset;
  subtasks: Subtask[];
}

export interface PersistedAppData {
  categories: Category[];
  series: TaskSeries[];
  tasks: TaskInstance[];
  settings: AppSettings;
}
