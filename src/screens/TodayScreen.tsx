import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { BaseScreen } from '../components/BaseScreen';
import { SwipeableTaskCard } from '../components/SwipeableTaskCard';
import { COLORS, PRIORITY_OPTIONS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { Priority } from '../types/models';
import { getTodayBuckets } from '../utils/tasks';

export function TodayScreen({ navigation }: any) {
  const { tasks, categories, settings, completeTask, deleteTask, toggleSubtask } = useAppState();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    high: false,
    medium: false,
    low: false,
    completed: true,
  });

  const uniqueTasks = tasks.filter((task, index, self) => index === self.findIndex((t) => t.id === task.id));
  const categoryFiltered = uniqueTasks.filter((task) => categoryFilter === 'all' || task.categoryId === categoryFilter);
  const { overdue, todayTasks, completed } = getTodayBuckets(categoryFiltered);
  const taskMap = todayTasks;

  const grouped = PRIORITY_OPTIONS.reduce<Record<Priority, typeof taskMap>>(
    (acc, priority) => ({
      ...acc,
      [priority]: taskMap.filter((task) => task.priority === priority),
    }),
    { high: [], medium: [], low: [] }
  );

  const doneToday = completed.length;
  const totalToday = taskMap.length + doneToday;
  const progress = totalToday === 0 ? 0 : doneToday / totalToday;

  return (
    <BaseScreen scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Today</Text>
          <Text style={styles.dateLabel}>{new Date().toDateString()}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Settings')}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.filterWrapper}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <FilterPill
            label="All"
            active={categoryFilter === 'all'}
            accentColor={settings.accentColor}
            onPress={() => setCategoryFilter('all')}
          />
          {categories
            .filter((category) => category.systemType !== 'uncategorized' || tasks.some((task) => task.categoryId === category.id))
            .map((category) => (
              <FilterPill
                key={category.id}
                label={category.name}
                active={categoryFilter === category.id}
                accentColor={settings.accentColor}
                onPress={() => setCategoryFilter(category.id)}
              />
            ))}
        </ScrollView>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsText}>
          {doneToday} of {totalToday} tasks done
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: settings.accentColor }]} />
        </View>
      </View>

      {overdue.length > 0 ? (
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Overdue</Text>
          {overdue.map((task) => (
            <SwipeableTaskCard
              key={task.id}
              task={task}
              category={categories.find((category) => category.id === task.categoryId)}
              accentColor={settings.accentColor}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              onComplete={() => completeTask(task.id)}
              onDelete={() => deleteTask(task.id)}
              onToggleSubtask={(subtaskId) => toggleSubtask(task.id, subtaskId)}
            />
          ))}
        </View>
      ) : null}

      {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
        <View key={priority} style={styles.group}>
          <Pressable
            style={styles.groupHeader}
            onPress={() => setCollapsed((current) => ({ ...current, [priority]: !current[priority] }))}
          >
            <Text style={styles.groupTitle}>{priority.toUpperCase()}</Text>
            <MaterialCommunityIcons
              name={collapsed[priority] ? 'chevron-down' : 'chevron-up'}
              size={20}
              color={COLORS.textSecondary}
            />
          </Pressable>
          {!collapsed[priority] &&
            grouped[priority].map((task) => (
              <SwipeableTaskCard
                key={task.id}
                task={task}
                category={categories.find((category) => category.id === task.categoryId)}
                accentColor={settings.accentColor}
                onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                onComplete={() => completeTask(task.id)}
                onDelete={() => deleteTask(task.id)}
                onToggleSubtask={(subtaskId) => toggleSubtask(task.id, subtaskId)}
              />
            ))}
        </View>
      ))}

      <View style={styles.group}>
        <Pressable
          style={styles.groupHeader}
          onPress={() => setCollapsed((current) => ({ ...current, completed: !current.completed }))}
        >
          <Text style={[styles.groupTitle, { color: COLORS.textSecondary }]}>Completed</Text>
          <MaterialCommunityIcons
            name={collapsed.completed ? 'chevron-down' : 'chevron-up'}
            size={20}
            color={COLORS.textSecondary}
          />
        </Pressable>
        {!collapsed.completed &&
          completed.map((task) => (
            <SwipeableTaskCard
              key={task.id}
              task={task}
              category={categories.find((category) => category.id === task.categoryId)}
              accentColor={settings.accentColor}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              onDelete={() => deleteTask(task.id)}
              onToggleSubtask={(subtaskId) => toggleSubtask(task.id, subtaskId)}
            />
          ))}
      </View>

      <Pressable
        style={[styles.fab, { backgroundColor: settings.accentColor }]}
        onPress={() => navigation.navigate('TaskEditor')}
      >
        <MaterialCommunityIcons name="plus" size={28} color={COLORS.background} />
      </Pressable>
    </BaseScreen>
  );
}

function FilterPill({
  label,
  active,
  accentColor,
  onPress,
}: {
  label: string;
  active: boolean;
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        { borderColor: active ? accentColor : COLORS.border, backgroundColor: active ? accentColor : COLORS.card },
      ]}
    >
      <Text style={[styles.pillLabel, { color: active ? COLORS.background : COLORS.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  greeting: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  dateLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  filterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  filterLabel: {
    color: COLORS.textTertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterRow: {
    gap: 6,
    paddingRight: 16,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillLabel: {
    fontWeight: '700',
    fontSize: 12,
  },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  statsText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.input,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  group: {
    gap: 6,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  groupTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
