import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';

import { BaseScreen } from '../components/BaseScreen';
import { TaskCard } from '../components/TaskCard';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';

export function MonthlyScreen({ navigation }: any) {
  const { tasks, categories, settings } = useAppState();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState('all');

  const monthDays = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }),
    [currentMonth]
  );
  const dayTasks = tasks.filter(
    (task) => task.dueDate === selectedDate && !task.completed && (categoryId === 'all' || task.categoryId === categoryId)
  );

  return (
    <BaseScreen scroll>
      <View style={styles.header}>
        <Pressable onPress={() => setCurrentMonth((current) => addMonths(current, -1))}>
          <Text style={styles.monthNav}>Prev</Text>
        </Pressable>
        <Text style={styles.title}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <Pressable onPress={() => setCurrentMonth((current) => addMonths(current, 1))}>
          <Text style={styles.monthNav}>Next</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {monthDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const count = tasks.filter(
            (task) => task.dueDate === key && !task.completed && (categoryId === 'all' || task.categoryId === categoryId)
          ).length;
          const active = key === selectedDate;
          return (
            <Pressable
              key={key}
              style={[
                styles.cell,
                { borderColor: active ? settings.accentColor : COLORS.border, backgroundColor: active ? `${settings.accentColor}22` : COLORS.card },
              ]}
              onPress={() => setSelectedDate(key)}
            >
              <Text style={styles.cellText}>{format(day, 'd')}</Text>
              {count > 0 ? <View style={[styles.dot, { backgroundColor: settings.accentColor }]} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.filterRow}>
        <FilterChip label="All" active={categoryId === 'all'} accentColor={settings.accentColor} onPress={() => setCategoryId('all')} />
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            label={category.name}
            active={categoryId === category.id}
            accentColor={settings.accentColor}
            onPress={() => setCategoryId(category.id)}
          />
        ))}
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>Tasks on {selectedDate}</Text>
        {dayTasks.length === 0 ? (
          <Text style={styles.empty}>No dated tasks for this day.</Text>
        ) : (
          dayTasks.map((task) => (
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

function FilterChip({
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
      <Text style={[styles.filterChipLabel, { color: active ? COLORS.background : COLORS.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  monthNav: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cellText: {
    color: COLORS.textPrimary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sheet: {
    gap: 12,
    paddingTop: 8,
  },
  sheetTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  empty: {
    color: COLORS.textSecondary,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipLabel: {
    fontWeight: '700',
  },
});
