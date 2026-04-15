import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parse,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

import { BaseScreen } from '../components/BaseScreen';
import { useAppState } from '../hooks/useAppState';
import { useThemeColors } from '../hooks/useThemeColors';
import { Category, TaskInstance } from '../types/models';

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function MonthlyScreen({ navigation }: any) {
  const { tasks, categories, settings } = useAppState();
  const colors = useThemeColors();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const uniqueTasks = useMemo(
    () => tasks.filter((task, index, self) => index === self.findIndex((candidate) => candidate.id === task.id)),
    [tasks]
  );

  const calendarDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth)),
      }),
    [currentMonth]
  );

  const pendingTasks = useMemo(
    () =>
      uniqueTasks
        .filter((task) => task.dueDate === selectedDate && !task.completed)
        .sort((left, right) => (left.dueTime ?? '99:99').localeCompare(right.dueTime ?? '99:99')),
    [selectedDate, uniqueTasks]
  );

  const selectedDateLabel = format(parseISO(selectedDate), 'MMM d');

  return (
    <BaseScreen scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.textTertiary }]}>SCHEDULE</Text>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>{format(currentMonth, 'MMMM')}</Text>
            <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>{format(currentMonth, 'yyyy')}</Text>
          </View>
          <View style={styles.arrowRow}>
            <Pressable style={styles.arrowButton} onPress={() => setCurrentMonth((value) => addMonths(value, -1))}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#D7F8FF" />
            </Pressable>
            <Pressable style={styles.arrowButton} onPress={() => setCurrentMonth((value) => addMonths(value, 1))}>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#D7F8FF" />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.calendarWrap}>
        <View style={styles.weekHeader}>
          {WEEK_DAYS.map((label) => (
            <Text key={label} style={[styles.weekLabel, { color: colors.textTertiary }]}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {calendarDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const taskCount = uniqueTasks.filter((task) => task.dueDate === dateKey && !task.completed).length;
            const selected = dateKey === selectedDate;
            const inMonth = isSameMonth(day, currentMonth);

            return (
              <Pressable key={dateKey} style={styles.dayCell} onPress={() => setSelectedDate(dateKey)}>
                <View
                  style={[
                    styles.dayBubble,
                    selected && {
                      borderColor: settings.accentColor,
                      shadowColor: settings.accentColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      { color: inMonth ? colors.textPrimary : '#2B2B2E' },
                      selected && { color: '#E6FBFF' },
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                </View>
                {taskCount > 0 ? (
                  <View style={styles.dotRow}>
                    {Array.from({ length: Math.min(taskCount, 3) }).map((_, index) => (
                      <View key={index} style={[styles.dot, { backgroundColor: selected ? '#BFF7FF' : '#7D8E96' }]} />
                    ))}
                  </View>
                ) : (
                  <View style={styles.dotSpacer} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{`Tasks for ${selectedDateLabel}`}</Text>
        <View style={[styles.pendingBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.pendingText, { color: '#9DEEFF' }]}>{`${pendingTasks.length} PENDING`}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {pendingTasks.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nothing scheduled</Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>Pick another day or create a task for this date.</Text>
          </View>
        ) : (
          pendingTasks.map((task) => (
            <AgendaTaskCard
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

function AgendaTaskCard({
  task,
  category,
  accentColor,
  onPress,
}: {
  task: TaskInstance;
  category?: Category;
  accentColor: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const meta = formatAgendaTime(task.dueTime);
  const railColor = category?.color ?? accentColor;
  const iconColor = task.priority === 'high' ? '#FFB6AB' : task.priority === 'low' ? '#9DEEFF' : '#F6D165';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.taskCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: railColor,
        },
      ]}
    >
      <View style={[styles.taskIconWrap, { backgroundColor: colors.input }]}>
        <MaterialCommunityIcons
          name={task.priority === 'high' ? 'flag-variant-outline' : task.seriesId ? 'creation-outline' : 'star-four-points-outline'}
          size={20}
          color={iconColor}
        />
      </View>

      <View style={styles.taskTextWrap}>
        <Text style={[styles.taskTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={[styles.taskBody, { color: colors.textSecondary }]} numberOfLines={2}>
          {task.description || category?.name || 'Task'}
        </Text>
      </View>

      <View style={styles.timeWrap}>
        <Text style={[styles.timeValue, { color: '#A6EFFF' }]}>{meta.time}</Text>
        <Text style={[styles.timeValue, { color: '#A6EFFF' }]}>{meta.period}</Text>
        <View style={[styles.timeDot, { backgroundColor: colors.textTertiary }]} />
      </View>
    </Pressable>
  );
}

function formatAgendaTime(dueTime: string | null) {
  if (!dueTime) {
    return { time: '--:--', period: '' };
  }

  const parsed = parse(dueTime, 'HH:mm', new Date());
  return {
    time: format(parsed, 'hh-mm'),
    period: format(parsed, 'a'),
  };
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 118,
    gap: 18,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '800',
  },
  arrowRow: {
    flexDirection: 'row',
    gap: 14,
  },
  arrowButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarWrap: {
    gap: 14,
  },
  weekHeader: {
    flexDirection: 'row',
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  dayCell: {
    width: '14.285%',
    alignItems: 'center',
    gap: 4,
  },
  dayBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  dotRow: {
    minHeight: 6,
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  dotSpacer: {
    minHeight: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  pendingBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '800',
  },
  list: {
    gap: 14,
  },
  taskCard: {
    minHeight: 92,
    borderRadius: 28,
    borderWidth: 1,
    borderLeftWidth: 3,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  taskIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTextWrap: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  taskBody: {
    fontSize: 13,
    lineHeight: 17,
  },
  timeWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 12,
  },
  timeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
  emptyCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 18,
  },
});
