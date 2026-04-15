import { StyleSheet, Text, View } from 'react-native';

import { BaseScreen } from '../components/BaseScreen';
import { Heatmap } from '../components/Heatmap';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { useThemeColors } from '../hooks/useThemeColors';

function computeStreaks(dates: string[]) {
  const ordered = [...new Set(dates)].sort();
  let best = 0;
  let current = 0;
  let running = 0;
  let previous: Date | null = null;

  for (const dateKey of ordered) {
    const currentDate = new Date(`${dateKey}T00:00:00`);
    if (previous) {
      const deltaDays = Math.round((currentDate.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      running = deltaDays === 1 ? running + 1 : 1;
    } else {
      running = 1;
    }
    best = Math.max(best, running);
    previous = currentDate;
  }

  const today = new Date();
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  while (ordered.includes(cursor.toISOString().slice(0, 10))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { best, current };
}

export function ActivityHeatmapScreen({ route }: any) {
  const { taskId } = route.params;
  const { tasks, settings } = useAppState();
  const colors = useThemeColors();
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return (
      <BaseScreen>
        <Text style={[styles.empty, { color: colors.textSecondary }]}>Task not found.</Text>
      </BaseScreen>
    );
  }

  const related = task.seriesId ? tasks.filter((item) => item.seriesId === task.seriesId) : [task];
  const activityLog = related.flatMap((item) => item.activityLog);
  const activeDateKeys = [...new Set(activityLog.filter((entry) => entry.wasCompleted || entry.subtasksCompleted > 0).map((entry) => entry.date))];
  const activeDays = activeDateKeys.length;
  const totalSubtasksDone = activityLog.reduce((sum, entry) => sum + entry.subtasksCompleted, 0);
  const streaks = computeStreaks(activeDateKeys);

  return (
    <BaseScreen scroll>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Activity Heatmap</Text>
      <Heatmap accentColor={settings.accentColor} activityLog={activityLog} />
      <View style={[styles.stats, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.stat, { color: colors.textSecondary }]}>Active Days: {activeDays}</Text>
        <Text style={[styles.stat, { color: colors.textSecondary }]}>Best Streak: {streaks.best}</Text>
        <Text style={[styles.stat, { color: colors.textSecondary }]}>Current Streak: {streaks.current}</Text>
        <Text style={[styles.stat, { color: colors.textSecondary }]}>Total Subtasks Done: {totalSubtasksDone}</Text>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  stats: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 10,
  },
  stat: {},
  empty: {},
});
