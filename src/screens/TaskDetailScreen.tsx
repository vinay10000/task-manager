import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLayoutEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

import { BaseScreen } from '../components/BaseScreen';
import { Heatmap } from '../components/Heatmap';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { formatDateTimeLabel } from '../utils/tasks';

export function TaskDetailScreen({ route, navigation }: any) {
  const { taskId } = route.params;
  const [menuOpen, setMenuOpen] = useState(false);
  const { tasks, categories, settings, completeTask, toggleSubtask, reorderSubtasks, deleteTask, snoozeTask } =
    useAppState();
  const task = tasks.find((item) => item.id === taskId);

  useLayoutEffect(() => {
    if (!task) {
      navigation.setOptions({ headerRight: undefined });
      return;
    }
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setMenuOpen(true)}
          hitSlop={12}
          style={styles.headerOverflow}
          accessibilityLabel="Task actions"
        >
          <MaterialCommunityIcons name="dots-vertical" size={24} color={COLORS.textPrimary} />
        </Pressable>
      ),
    });
  }, [navigation, task]);

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <BaseScreen scroll contentContainerStyle={styles.content}>
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={closeMenu} accessibilityLabel="Close menu" />
          <View style={styles.menuSheet}>
            <Text style={styles.menuTitle}>Actions</Text>
            <MenuRow
              label="Edit this task"
              onPress={() => {
                closeMenu();
                navigation.navigate('TaskEditor', { taskId: task.id });
              }}
            />
            {task.seriesId ? (
              <MenuRow
                label="Edit this and future tasks"
                onPress={() => {
                  closeMenu();
                  navigation.navigate('TaskEditor', { taskId: task.id, scope: 'future' });
                }}
              />
            ) : null}
            <MenuRow
              label="Activity heatmap"
              onPress={() => {
                closeMenu();
                navigation.navigate('ActivityHeatmap', { taskId: task.id });
              }}
            />
            {task.hasReminder && !task.completed ? (
              <MenuRow
                label="Snooze 10 minutes"
                onPress={() => {
                  closeMenu();
                  snoozeTask(task.id);
                }}
              />
            ) : null}
            <MenuRow
              label={task.seriesId ? 'Delete this task' : 'Delete task'}
              danger
              onPress={() => {
                closeMenu();
                deleteTask(task.id);
                navigation.goBack();
              }}
            />
            {task.seriesId ? (
              <MenuRow
                label="Delete this and future tasks"
                danger
                onPress={() => {
                  closeMenu();
                  deleteTask(task.id, 'future');
                  navigation.goBack();
                }}
              />
            ) : null}
            <Pressable style={styles.menuCancel} onPress={closeMenu}>
              <Text style={styles.menuCancelLabel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
    </BaseScreen>
  );
}

function MenuRow({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <Text style={[styles.menuRowLabel, danger && styles.menuRowDanger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  headerOverflow: {
    marginRight: 4,
    padding: 8,
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
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  menuSheet: {
    backgroundColor: COLORS.modal,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  menuTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  menuRowLabel: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  menuRowDanger: {
    color: COLORS.destructive,
  },
  menuCancel: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  menuCancelLabel: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 16,
  },
});
