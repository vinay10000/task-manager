import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';

import { BaseScreen } from '../components/BaseScreen';
import { SwipeableTaskCard } from '../components/SwipeableTaskCard';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { getWeeklyDates, sortTasks } from '../utils/tasks';

export function WeeklyScreen({ navigation }: any) {
  const { tasks, categories, settings, deleteTask, toggleSubtask } = useAppState();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState('all');
  const visibleCategories = useMemo(
    () =>
      categories.filter(
        (c) => c.systemType !== 'uncategorized' || tasks.some((t) => t.categoryId === c.id)
      ),
    [categories, tasks]
  );
  const dates = getWeeklyDates(new Date());
  const selectedTasks = sortTasks(
    tasks.filter(
      (task) => task.dueDate === selectedDate && !task.completed && (categoryId === 'all' || task.categoryId === categoryId)
    ).filter((task, index, self) => index === self.findIndex((t) => t.id === task.id)),
    'dueDate'
  );

  return (
    <BaseScreen scroll contentContainerStyle={styles.screenContent}>
      <Text style={styles.title}>Weekly</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStrip}>
        {dates.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const count = tasks.filter((task) => task.dueDate === key && !task.completed).length;
          const active = key === selectedDate;
          return (
            <Pressable
              key={key}
              style={[
                styles.dayChip,
                { borderColor: active ? settings.accentColor : COLORS.border, backgroundColor: active ? settings.accentColor : COLORS.card },
              ]}
              onPress={() => setSelectedDate(key)}
            >
              <Text style={[styles.dayLabel, { color: active ? COLORS.background : COLORS.textPrimary }]}>{format(date, 'EEE')}</Text>
              <Text style={[styles.dayNumber, { color: active ? COLORS.background : COLORS.textSecondary }]}>{format(date, 'd')}</Text>
              {count > 0 && <View style={[styles.countDot, { backgroundColor: active ? COLORS.background : settings.accentColor }]} />}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterStrip}>
          <CategoryChip label="All" active={categoryId === 'all'} accentColor={settings.accentColor} onPress={() => setCategoryId('all')} />
          {visibleCategories.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              active={categoryId === category.id}
              accentColor={settings.accentColor}
              onPress={() => setCategoryId(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.list}>
        {selectedTasks.length === 0 ? (
          <Text style={styles.empty}>No tasks for {format(new Date(selectedDate), 'MMM d')}.</Text>
        ) : (
          selectedTasks.map((task) => (
            <SwipeableTaskCard
              key={task.id}
              task={task}
              category={categories.find((category) => category.id === task.categoryId)}
              accentColor={settings.accentColor}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              onDelete={() => deleteTask(task.id)}
              onToggleSubtask={(subtaskId) => toggleSubtask(task.id, subtaskId)}
            />
          ))
        )}
      </View>
    </BaseScreen>
  );
}

function CategoryChip({
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
        styles.filterChip,
        { borderColor: active ? accentColor : COLORS.border, backgroundColor: active ? accentColor : COLORS.card },
      ]}
    >
      <Text style={[styles.filterLabelText, { color: active ? COLORS.background : COLORS.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    flexGrow: 0,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  dayStrip: {
    gap: 5,
    paddingRight: 16,
    marginBottom: 8,
  },
  dayChip: {
    width: 46,
    height: 58,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayLabel: {
    fontWeight: '700',
    fontSize: 10,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
  },
  countDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  list: {
    gap: 6,
    flex: 1,
  },
  empty: {
    color: COLORS.textSecondary,
    fontSize: 13,
    paddingVertical: 8,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  filterLabel: {
    color: COLORS.textTertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterStrip: {
    gap: 6,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterLabelText: {
    fontWeight: '700',
    fontSize: 12,
  },
});
