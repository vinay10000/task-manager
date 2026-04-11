import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';

import { BaseScreen } from '../components/BaseScreen';
import { SwipeableTaskCard } from '../components/SwipeableTaskCard';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';

export function MonthlyScreen({ navigation }: any) {
  const { tasks, categories, settings, deleteTask, toggleSubtask } = useAppState();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState('all');

  const uniqueTasks = useMemo(() => tasks.filter((task, index, self) => index === self.findIndex((t) => t.id === task.id)), [tasks]);

  const monthDays = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }),
    [currentMonth]
  );
  const dayTasks = uniqueTasks.filter(
    (task) => task.dueDate === selectedDate && !task.completed && (categoryId === 'all' || task.categoryId === categoryId)
  );

  return (
    <BaseScreen scroll contentContainerStyle={styles.screenContent}>
      <View style={styles.header}>
        <Pressable onPress={() => setCurrentMonth((current) => addMonths(current, -1))}>
          <Text style={styles.monthNav}>Prev</Text>
        </Pressable>
        <Text style={styles.title}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <Pressable onPress={() => setCurrentMonth((current) => addMonths(current, 1))}>
          <Text style={styles.monthNav}>Next</Text>
        </Pressable>
      </View>

      <View style={styles.calendarSection}>
        <View style={styles.weekDayLabels}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={index} style={styles.weekDayLabel}>{day}</Text>
          ))}
        </View>
        <View style={styles.grid}>
          {monthDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const count = uniqueTasks.filter(
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
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
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
        </ScrollView>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>{format(new Date(selectedDate), 'MMM d')} Tasks</Text>
        <View style={styles.taskList}>
          {dayTasks.length === 0 ? (
            <Text style={styles.empty}>No tasks for this day.</Text>
          ) : (
            dayTasks.map((task) => (
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
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  monthNav: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  calendarSection: {
    marginBottom: 2,
  },
  weekDayLabels: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.textTertiary,
    fontSize: 10,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: {
    width: '13.8%',
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  cellText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterLabel: {
    color: COLORS.textTertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipLabel: {
    fontWeight: '700',
    fontSize: 12,
  },
  sheet: {
    flex: 1,
    marginTop: 4,
  },
  sheetTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  taskList: {
    gap: 6,
  },
  empty: {
    color: COLORS.textSecondary,
    fontSize: 13,
    paddingVertical: 8,
  },
});
