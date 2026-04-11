import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

import { BaseScreen } from '../components/BaseScreen';
import { Heatmap } from '../components/Heatmap';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { formatDateTimeLabel } from '../utils/tasks';

export function TaskDetailScreen({ route, navigation }: any) {
  const { taskId } = route.params;
  const { tasks, categories, settings, completeTask, toggleSubtask, reorderSubtasks, deleteTask, snoozeTask } =
    useAppState();
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return (
      <BaseScreen>
        <Text style={styles.empty}>Task not found.</Text>
      </BaseScreen>
    );
  }

  const category = categories.find((item) => item.id === task.categoryId);
  const previewActivity = task.seriesId
    ? tasks.filter((item) => item.seriesId === task.seriesId).flatMap((item) => item.activityLog)
    : task.activityLog;

  return (
    <BaseScreen scroll contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Pressable
          style={[styles.heroCheck, task.completed && { backgroundColor: settings.accentColor, borderColor: settings.accentColor }]}
          onPress={() => completeTask(task.id)}
        >
          <Text style={[styles.heroCheckLabel, { color: task.completed ? COLORS.background : COLORS.textPrimary }]}>
            {task.completed ? 'Done' : 'Open'}
          </Text>
        </Pressable>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description}>{task.description || 'No description added yet.'}</Text>
      </View>

      <View style={styles.metaCard}>
        <Text style={styles.metaLine}>Priority: {task.priority}</Text>
        <Text style={styles.metaLine}>Category: {category?.name ?? 'Uncategorized'}</Text>
        <Text style={styles.metaLine}>Due: {formatDateTimeLabel(task.dueDate, task.dueTime)}</Text>
        <Text style={styles.metaLine}>Tags: {task.tags.length ? task.tags.join(', ') : 'No tags'}</Text>
        <Text style={styles.metaLine}>{task.seriesId ? 'Repeats from a recurring series' : 'One-off task'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subtasks</Text>
        <DraggableFlatList
          data={[...task.subtasks].sort((a, b) => a.sortOrder - b.sortOrder)}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => reorderSubtasks(task.id, data.map((item) => item.id))}
          onDragBegin={() => {
            void Haptics.selectionAsync();
          }}
          scrollEnabled={false}
          renderItem={({ item, drag }) => (
            <ScaleDecorator>
              <Pressable style={styles.subtaskRow} onLongPress={drag} onPress={() => toggleSubtask(task.id, item.id)}>
                <View style={[styles.subtaskCheck, item.completed && { backgroundColor: settings.accentColor }]} />
                <Text style={[styles.subtaskText, item.completed && styles.strike]}>{item.title}</Text>
              </Pressable>
            </ScaleDecorator>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Preview</Text>
        <Heatmap accentColor={settings.accentColor} activityLog={previewActivity} />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, { borderColor: settings.accentColor }]}
          onPress={() => navigation.navigate('TaskEditor', { taskId: task.id })}
        >
          <Text style={[styles.actionLabel, { color: settings.accentColor }]}>Edit</Text>
        </Pressable>
        {task.seriesId ? (
          <Pressable
            style={[styles.actionButton, { borderColor: settings.accentColor }]}
            onPress={() => navigation.navigate('TaskEditor', { taskId: task.id, scope: 'future' })}
          >
            <Text style={[styles.actionLabel, { color: settings.accentColor }]}>Edit Future</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={[styles.actionButton, { borderColor: COLORS.border }]}
          onPress={() => navigation.navigate('ActivityHeatmap', { taskId: task.id })}
        >
          <Text style={styles.actionLabel}>Activity</Text>
        </Pressable>
        {task.hasReminder && !task.completed ? (
          <Pressable style={[styles.actionButton, { borderColor: settings.accentColor }]} onPress={() => snoozeTask(task.id)}>
            <Text style={[styles.actionLabel, { color: settings.accentColor }]}>Snooze 10m</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, { borderColor: COLORS.destructive }]}
          onPress={() => {
            deleteTask(task.id);
            navigation.goBack();
          }}
        >
          <Text style={[styles.actionLabel, { color: COLORS.destructive }]}>
            {task.seriesId ? 'Delete / Skip' : 'Delete'}
          </Text>
        </Pressable>
        {task.seriesId ? (
          <Pressable
            style={[styles.actionButton, { borderColor: COLORS.destructive }]}
            onPress={() => {
              deleteTask(task.id, 'future');
              navigation.goBack();
            }}
          >
            <Text style={[styles.actionLabel, { color: COLORS.destructive }]}>Delete Future</Text>
          </Pressable>
        ) : null}
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  empty: {
    color: COLORS.textSecondary,
  },
  hero: {
    gap: 12,
  },
  heroCheck: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  heroCheckLabel: {
    fontWeight: '800',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  description: {
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  metaCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  metaLine: {
    color: COLORS.textSecondary,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  subtaskCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subtaskText: {
    color: COLORS.textPrimary,
    flex: 1,
  },
  strike: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionLabel: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
});
