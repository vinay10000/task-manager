import AsyncStorage from '@react-native-async-storage/async-storage';

import { PersistedAppData } from '../types/models';
import { createDefaultCategories, getDefaultSettings } from '../utils/tasks';

const STORAGE_KEYS = {
  tasks: '@task_instances',
  series: '@task_series',
  categories: '@categories',
  settings: '@app_settings',
} as const;

let writeQueue = Promise.resolve();

async function safeRead<T>(key: string, fallback: T) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return { value: fallback, warning: null };
    }
    return { value: JSON.parse(raw) as T, warning: null };
  } catch {
    return { value: fallback, warning: `Recovered invalid data for ${key}.` };
  }
}

export async function loadPersistedAppData() {
  const [tasks, series, categories, settings] = await Promise.all([
    safeRead(STORAGE_KEYS.tasks, []),
    safeRead(STORAGE_KEYS.series, []),
    safeRead(STORAGE_KEYS.categories, []),
    safeRead(STORAGE_KEYS.settings, getDefaultSettings()),
  ]);

  const warnings = [tasks.warning, series.warning, categories.warning, settings.warning].filter(Boolean) as string[];

  return {
    data: {
      tasks: Array.isArray(tasks.value) ? tasks.value : [],
      series: Array.isArray(series.value) ? series.value : [],
      categories: Array.isArray(categories.value) && categories.value.length > 0 ? categories.value : createDefaultCategories(),
      settings: {
        ...getDefaultSettings(),
        ...(settings.value ?? {}),
      },
    } satisfies PersistedAppData,
    warnings,
  };
}

export function persistAppData(data: PersistedAppData) {
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.tasks, JSON.stringify(data.tasks)],
        [STORAGE_KEYS.series, JSON.stringify(data.series)],
        [STORAGE_KEYS.categories, JSON.stringify(data.categories)],
        [STORAGE_KEYS.settings, JSON.stringify(data.settings)],
      ]);
    });

  return writeQueue;
}
