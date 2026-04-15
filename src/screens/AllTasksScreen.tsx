import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

import { BaseScreen } from '../components/BaseScreen';
import { SwipeableTaskCard } from '../components/SwipeableTaskCard';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { useThemeColors } from '../hooks/useThemeColors';
import { TaskSort, TaskStatusFilter } from '../types/models';
import { canReorderAllTasks, filterTasks, sortTasks } from '../utils/tasks';

const SORT_LABELS: Record<TaskSort, string> = {
  dueDate: 'Due Date',
  priority: 'Priority',
  createdAt: 'Created',
  alphabetical: 'A-Z',
  custom: 'Custom',
};

export function AllTasksScreen({ navigation }: any) {
  const { tasks, categories, settings, reorderTaskInstances, completeTask, deleteTask, toggleSubtask } = useAppState();
  const colors = useThemeColors();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [status, setStatus] = useState<TaskStatusFilter>('all');
  const [sort, setSort] = useState<TaskSort>('dueDate');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = sortTasks(filterTasks(tasks, status, categoryId, search), sort);

  const uniqueFiltered = filtered.filter((task, index, self) => index === self.findIndex((t) => t.id === task.id));

  const draggable = canReorderAllTasks(sort, categoryId, status, search);

  const activeFilterCount = (status !== 'all' ? 1 : 0) + (categoryId !== 'all' ? 1 : 0);

  return (
    <BaseScreen style={styles.screen}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>All Tasks</Text>
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
        placeholder="Search..."
        placeholderTextColor={colors.textTertiary}
        style={[styles.search, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
      />

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusRow}>
          <StatusPill
            label="All"
            active={status === 'all'}
            accentColor={settings.accentColor}
            onPress={() => setStatus('all')}
          />
          <StatusPill
            label="Active"
            active={status === 'active'}
            accentColor={settings.accentColor}
            onPress={() => setStatus('active')}
          />
          <StatusPill
            label="Completed"
            active={status === 'completed'}
            accentColor={settings.accentColor}
            onPress={() => setStatus('completed')}
          />
        </ScrollView>

        <Pressable style={styles.sortButton} onPress={() => setShowFilters(!showFilters)}>
          <MaterialCommunityIcons name="sort-variant" size={18} color={colors.textSecondary} />
          <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>{SORT_LABELS[sort]}</Text>
          {activeFilterCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: settings.accentColor }]}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {showFilters && (
        <View style={[styles.expandedFilters, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionLabel, { color: colors.textTertiary }]}>Sort by</Text>
            <View style={styles.chipRow}>
              {(Object.keys(SORT_LABELS) as TaskSort[]).map((option) => (
                <FilterChip
                  key={option}
                  label={SORT_LABELS[option]}
                  active={sort === option}
                  accentColor={settings.accentColor}
                  onPress={() => setSort(option)}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionLabel, { color: colors.textTertiary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
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

          {(categoryId !== 'all' || sort !== 'dueDate') && (
            <Pressable style={styles.clearButton} onPress={() => { setCategoryId('all'); setSort('dueDate'); }}>
              <Text style={[styles.clearText, { color: settings.accentColor }]}>Reset Filters</Text>
            </Pressable>
          )}
        </View>
      )}

      {draggable ? (
        <DraggableFlatList
          data={uniqueFiltered}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => reorderTaskInstances(data.map((item) => item.id))}
          contentContainerStyle={styles.list}
          renderItem={({ item, drag, isActive }) => (
            <ScaleDecorator>
              <View style={{ opacity: isActive ? 0.9 : 1 }}>
                <SwipeableTaskCard
                  task={item}
                  category={categories.find((category) => category.id === item.categoryId)}
                  accentColor={settings.accentColor}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
                  onComplete={() => completeTask(item.id)}
                  onDelete={() => deleteTask(item.id)}
                  onToggleSubtask={(subtaskId) => toggleSubtask(item.id, subtaskId)}
                  onLongPress={drag}
                  showDragHandle
                />
              </View>
            </ScaleDecorator>
          )}
        />
      ) : (
        <View style={styles.list}>
          {uniqueFiltered.map((task) => (
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
          {uniqueFiltered.length === 0 ? <Text style={[styles.empty, { color: colors.textSecondary }]}>No tasks match your filters.</Text> : null}
          {!draggable && sort === 'custom' ? (
            <Text style={[styles.helper, { color: colors.textTertiary }]}>Custom drag requires all filters to be "All".</Text>
          ) : null}
        </View>
      )}
    </BaseScreen>
  );
}

function StatusPill({
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
      style={[styles.statusPill, { backgroundColor: active ? accentColor : colors.card, borderColor: active ? accentColor : colors.border }]}
    >
      <Text style={[styles.statusPillLabel, { color: active ? colors.background : colors.textPrimary }]}>{label}</Text>
    </Pressable>
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
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        { borderColor: active ? accentColor : colors.border, backgroundColor: active ? accentColor : colors.card },
      ]}
    >
      <Text style={[styles.filterChipLabel, { color: active ? colors.background : colors.textPrimary }]}>{label}</Text>
    </Pressable>
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
    fontSize: 28,
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
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    marginBottom: 12,
    fontSize: 14,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillLabel: {
    fontWeight: '700',
    fontSize: 13,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  sortLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: '700',
  },
  expandedFilters: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 12,
    marginBottom: 10,
  },
  filterSection: {
    gap: 8,
  },
  filterSectionLabel: {
    color: COLORS.textTertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipLabel: {
    fontWeight: '700',
    fontSize: 12,
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  clearText: {
    fontWeight: '700',
    fontSize: 13,
  },
  list: {
    gap: 8,
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
