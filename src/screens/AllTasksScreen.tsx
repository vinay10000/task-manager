import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

import { BaseScreen } from '../components/BaseScreen';
import { TaskCard } from '../components/TaskCard';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { TaskSort, TaskStatusFilter } from '../types/models';
import { canReorderAllTasks, filterTasks, sortTasks } from '../utils/tasks';

const SORT_OPTIONS: TaskSort[] = ['dueDate', 'priority', 'createdAt', 'alphabetical', 'custom'];
const STATUS_OPTIONS: TaskStatusFilter[] = ['all', 'active', 'completed'];

export function AllTasksScreen({ navigation }: any) {
  const { tasks, categories, settings, reorderTaskInstances, completeTask } = useAppState();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [status, setStatus] = useState<TaskStatusFilter>('all');
  const [sort, setSort] = useState<TaskSort>('dueDate');

  const filtered = sortTasks(filterTasks(tasks, status, categoryId, search), sort);
  const draggable = canReorderAllTasks(sort, categoryId, status, search);

  return (
    <BaseScreen style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>All Tasks</Text>
        <Pressable
          style={[styles.addButton, { borderColor: settings.accentColor }]}
          onPress={() => navigation.navigate('TaskEditor')}
        >
          <Text style={[styles.addButtonLabel, { color: settings.accentColor }]}>Add</Text>
        </Pressable>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search titles, descriptions, and tags"
        placeholderTextColor={COLORS.textTertiary}
        style={styles.search}
      />

      <View style={styles.filters}>
        <ChipRow
          options={STATUS_OPTIONS}
          active={status}
          accentColor={settings.accentColor}
          onSelect={(value) => setStatus(value as TaskStatusFilter)}
        />
        <ChipRow
          options={['all', ...categories.map((category) => category.id)]}
          labels={{ all: 'All', ...Object.fromEntries(categories.map((category) => [category.id, category.name])) }}
          active={categoryId}
          accentColor={settings.accentColor}
          onSelect={setCategoryId}
        />
        <ChipRow
          options={SORT_OPTIONS}
          labels={{ dueDate: 'Due', priority: 'Priority', createdAt: 'Created', alphabetical: 'A-Z', custom: 'Custom' }}
          active={sort}
          accentColor={settings.accentColor}
          onSelect={(value) => setSort(value as TaskSort)}
        />
      </View>

      {draggable ? (
        <DraggableFlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => reorderTaskInstances(data.map((item) => item.id))}
          contentContainerStyle={styles.list}
          renderItem={({ item, drag, isActive }) => (
            <ScaleDecorator>
              <View style={{ opacity: isActive ? 0.9 : 1 }}>
                <TaskCard
                  task={item}
                  category={categories.find((category) => category.id === item.categoryId)}
                  accentColor={settings.accentColor}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
                  onComplete={() => completeTask(item.id)}
                  onLongPress={drag}
                  showDragHandle
                />
              </View>
            </ScaleDecorator>
          )}
        />
      ) : (
        <View style={styles.list}>
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={categories.find((category) => category.id === task.categoryId)}
              accentColor={settings.accentColor}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              onComplete={() => completeTask(task.id)}
            />
          ))}
          {filtered.length === 0 ? <Text style={styles.empty}>No tasks match your current filters.</Text> : null}
          {!draggable && sort === 'custom' ? (
            <Text style={styles.helper}>Custom drag is available only when search is empty and all filters are set to All.</Text>
          ) : null}
        </View>
      )}
    </BaseScreen>
  );
}

function ChipRow({
  options,
  active,
  accentColor,
  onSelect,
  labels = {},
}: {
  options: string[];
  active: string;
  accentColor: string;
  onSelect: (value: string) => void;
  labels?: Record<string, string>;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const selected = option === active;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[
              styles.chip,
              { borderColor: selected ? accentColor : COLORS.border, backgroundColor: selected ? accentColor : COLORS.card },
            ]}
          >
            <Text style={[styles.chipLabel, { color: selected ? COLORS.background : COLORS.textPrimary }]}>
              {labels[option] ?? option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonLabel: {
    fontWeight: '800',
  },
  search: {
    backgroundColor: COLORS.input,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  filters: {
    gap: 10,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipLabel: {
    fontWeight: '700',
  },
  list: {
    gap: 12,
    paddingBottom: 140,
  },
  empty: {
    color: COLORS.textSecondary,
  },
  helper: {
    color: COLORS.textTertiary,
    fontSize: 12,
    lineHeight: 18,
  },
});
