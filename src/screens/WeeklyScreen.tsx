import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';

import { BaseScreen } from '../components/BaseScreen';
import { TaskCard } from '../components/TaskCard';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { getWeeklyDates, sortTasks } from '../utils/tasks';

export function WeeklyScreen({ navigation }: any) {
  const { tasks, categories, settings } = useAppState();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState('all');
  const dates = getWeeklyDates(new Date());
  const selectedTasks = sortTasks(
    tasks.filter(
      (task) => task.dueDate === selectedDate && !task.completed && (categoryId === 'all' || task.categoryId === categoryId)
    ),
    'dueDate'
  );

  return (
    <BaseScreen scroll>
      <Text style={styles.title}>Weekly</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
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
              <Text style={[styles.dayDate, { color: active ? COLORS.background : COLORS.textSecondary }]}>{format(date, 'd')}</Text>
              <View style={[styles.countDot, { backgroundColor: active ? COLORS.background : settings.accentColor }]} />
              <Text style={[styles.dayDate, { color: active ? COLORS.background : COLORS.textSecondary }]}>{count}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        <CategoryChip label="All" active={categoryId === 'all'} accentColor={settings.accentColor} onPress={() => setCategoryId('all')} />
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            label={category.name}
            active={categoryId === category.id}
            accentColor={settings.accentColor}
            onPress={() => setCategoryId(category.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.list}>
        {selectedTasks.length === 0 ? (
          <Text style={styles.empty}>No dated tasks for this day.</Text>
        ) : (
          selectedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={categories.find((category) => category.id === task.categoryId)}
              accentColor={settings.accentColor}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
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
      <Text style={[styles.filterLabel, { color: active ? COLORS.background : COLORS.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  strip: {
    gap: 10,
    paddingRight: 20,
  },
  dayChip: {
    width: 78,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontWeight: '700',
  },
  dayDate: {
    fontSize: 12,
  },
  countDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  list: {
    gap: 12,
  },
  empty: {
    color: COLORS.textSecondary,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterLabel: {
    fontWeight: '700',
  },
});
