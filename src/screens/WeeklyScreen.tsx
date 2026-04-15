import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';

import { BaseScreen } from '../components/BaseScreen';
import { SwipeableTaskCard } from '../components/SwipeableTaskCard';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { useThemeColors } from '../hooks/useThemeColors';
import { getWeeklyDates, sortTasks } from '../utils/tasks';

export function WeeklyScreen({ navigation }: any) {
  const { tasks, categories, settings, deleteTask, toggleSubtask } = useAppState();
  const colors = useThemeColors();
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
      <Text style={[styles.title, { color: colors.textPrimary }]}>Weekly</Text>
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
                { borderColor: active ? settings.accentColor : colors.border, backgroundColor: active ? settings.accentColor : colors.card },
              ]}
              onPress={() => setSelectedDate(key)}
            >
              <Text style={[styles.dayLabel, { color: active ? colors.background : colors.textPrimary }]}>{format(date, 'EEE')}</Text>
              <Text style={[styles.dayNumber, { color: active ? colors.background : colors.textSecondary }]}>{format(date, 'd')}</Text>
              {count > 0 && <View style={[styles.countDot, { backgroundColor: active ? colors.background : settings.accentColor }]} />}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: colors.textTertiary }]}>Filter:</Text>
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
          <Text style={[styles.empty, { color: colors.textSecondary }]}>No tasks for {format(new Date(selectedDate), 'MMM d')}.</Text>
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
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        { borderColor: active ? accentColor : colors.border, backgroundColor: active ? accentColor : colors.card },
      ]}
    >
      <Text style={[styles.filterLabelText, { color: active ? colors.background : colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 118,
    flexGrow: 0,
  },
  title: {
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
