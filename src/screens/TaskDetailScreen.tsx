import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLayoutEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

import { BaseScreen } from '../components/BaseScreen';
import { Heatmap } from '../components/Heatmap';
import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { useThemeColors } from '../hooks/useThemeColors';
import { formatDateTimeLabel } from '../utils/tasks';

export function TaskDetailScreen({ route, navigation }: any) {
  const { taskId } = route.params;
  const [menuOpen, setMenuOpen] = useState(false);
  const { tasks, categories, settings, completeTask, toggleSubtask, reorderSubtasks, deleteTask, snoozeTask } =
    useAppState();
  const colors = useThemeColors();
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
          <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.textPrimary} />
        </Pressable>
      ),
    });
  }, [colors.textPrimary, navigation, task]);

  if (!task) {
    return (
      <BaseScreen>
        <Text style={[styles.empty, { color: colors.textSecondary }]}>Task not found.</Text>
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
          <View style={[styles.menuSheet, { backgroundColor: colors.modal, borderColor: colors.border }]}>
            <Text style={[styles.menuTitle, { color: colors.textSecondary }]}>Actions</Text>
            <MenuRow
              label="Edit this task"
              colors={colors}
              onPress={() => {
                closeMenu();
                navigation.navigate('TaskEditor', { taskId: task.id });
              }}
            />
            {task.seriesId ? (
              <MenuRow
                label="Edit this and future tasks"
                colors={colors}
                onPress={() => {
                  closeMenu();
                  navigation.navigate('TaskEditor', { taskId: task.id, scope: 'future' });
                }}
              />
            ) : null}
            <MenuRow
              label="Activity heatmap"
              colors={colors}
              onPress={() => {
                closeMenu();
                navigation.navigate('ActivityHeatmap', { taskId: task.id });
              }}
            />
            {task.hasReminder && !task.completed ? (
              <MenuRow
                label="Snooze 10 minutes"
                colors={colors}
                onPress={() => {
                  closeMenu();
                  snoozeTask(task.id);
                }}
              />
            ) : null}
            <MenuRow
              label={task.seriesId ? 'Delete this task' : 'Delete task'}
              danger
              colors={colors}
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
                colors={colors}
                onPress={() => {
                  closeMenu();
                  deleteTask(task.id, 'future');
                  navigation.goBack();
                }}
              />
            ) : null}
            <Pressable style={styles.menuCancel} onPress={closeMenu}>
              <Text style={[styles.menuCancelLabel, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.hero}>
        <Pressable
          style={[
            styles.heroCheck,
            { borderColor: task.completed ? settings.accentColor : colors.border },
            task.completed && { backgroundColor: settings.accentColor, borderColor: settings.accentColor },
          ]}
          onPress={() => completeTask(task.id)}
        >
          <Text style={[styles.heroCheckLabel, { color: task.completed ? colors.background : colors.textPrimary }]}>
            {task.completed ? 'Done' : 'Open'}
          </Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{task.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{task.description || 'No description added yet.'}</Text>
      </View>

      <View style={[styles.metaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.metaLine, { color: colors.textSecondary }]}>Priority: {task.priority}</Text>
        <Text style={[styles.metaLine, { color: colors.textSecondary }]}>Category: {category?.name ?? 'Uncategorized'}</Text>
        <Text style={[styles.metaLine, { color: colors.textSecondary }]}>Due: {formatDateTimeLabel(task.dueDate, task.dueTime)}</Text>
        <Text style={[styles.metaLine, { color: colors.textSecondary }]}>Tags: {task.tags.length ? task.tags.join(', ') : 'No tags'}</Text>
        <Text style={[styles.metaLine, { color: colors.textSecondary }]}>{task.seriesId ? 'Repeats from a recurring series' : 'One-off task'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Subtasks</Text>
        <DraggableFlatList
          data={[...task.subtasks].sort((a, b) => a.sortOrder - b.sortOrder)}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => reorderSubtasks(task.id, data.map((item) => item.id))}
          onDragBegin={() => {
            if (settings.hapticsEnabled) {
              void Haptics.selectionAsync();
            }
          }}
          scrollEnabled={false}
          renderItem={({ item, drag }) => (
            <ScaleDecorator>
              <Pressable
                style={[styles.subtaskRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onLongPress={drag}
                onPress={() => toggleSubtask(task.id, item.id)}
              >
                <View
                  style={[
                    styles.subtaskCheck,
                    { backgroundColor: item.completed ? settings.accentColor : colors.input, borderColor: colors.border },
                  ]}
                />
                <Text
                  style={[
                    styles.subtaskText,
                    { color: colors.textPrimary },
                    item.completed && styles.strike,
                    item.completed && { color: colors.textSecondary },
                  ]}
                >
                  {item.title}
                </Text>
              </Pressable>
            </ScaleDecorator>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Activity Preview</Text>
        <Heatmap accentColor={settings.accentColor} activityLog={previewActivity} />
      </View>
    </BaseScreen>
  );
}

function MenuRow({
  label,
  onPress,
  danger,
  colors,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  colors: { textPrimary: string; border: string };
}) {
  return (
    <Pressable style={[styles.menuRow, { borderBottomColor: colors.border }]} onPress={onPress}>
      <Text style={[styles.menuRowLabel, { color: colors.textPrimary }, danger && styles.menuRowDanger]}>{label}</Text>
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
  },
  hero: {
    gap: 12,
  },
  heroCheck: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  heroCheckLabel: {
    fontWeight: '800',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
  description: {
    lineHeight: 22,
  },
  metaCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  metaLine: {
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  subtaskCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
  },
  subtaskText: {
    flex: 1,
  },
  strike: {
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderWidth: 1,
    gap: 4,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuRowLabel: {
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
    fontWeight: '700',
    fontSize: 16,
  },
});
