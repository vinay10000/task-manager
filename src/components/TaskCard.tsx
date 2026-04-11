import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/theme';
import { Category, TaskInstance } from '../types/models';
import { formatDateTimeLabel } from '../utils/tasks';

export function TaskCard({
  task,
  category,
  accentColor,
  onPress,
  onComplete,
  onLongPress,
  onToggleSubtask,
  showDragHandle = false,
}: {
  task: TaskInstance;
  category?: Category;
  accentColor: string;
  onPress?: () => void;
  onComplete?: () => void;
  onLongPress?: () => void;
  onToggleSubtask?: (subtaskId: string) => void;
  showDragHandle?: boolean;
}) {
  const subtaskDone = task.subtasks.filter((subtask) => subtask.completed).length;

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      onLongPress={() => {
        if (onLongPress) {
          void Haptics.selectionAsync();
          onLongPress();
        }
      }}
    >
      <View style={styles.headerRow}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            if (onComplete) {
              void Haptics.selectionAsync();
              onComplete();
            }
          }}
          style={[
            styles.checkbox,
            task.completed && {
              borderColor: accentColor,
              backgroundColor: accentColor,
            },
          ]}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          {task.completed ? <MaterialCommunityIcons name="check" size={14} color={COLORS.background} /> : null}
        </Pressable>
        <View style={[styles.categoryDot, { backgroundColor: category?.color ?? COLORS.textTertiary }]} />
        <View style={styles.textWrap}>
          <Text style={[styles.title, task.completed && styles.completedText]} numberOfLines={1}>
            {task.title}
          </Text>
          <Text style={styles.meta} numberOfLines={2}>
            {formatDateTimeLabel(task.dueDate, task.dueTime)}
          </Text>
        </View>
        <View style={styles.icons}>
          {task.seriesId ? (
            <MaterialCommunityIcons name="autorenew" size={16} color={accentColor} />
          ) : null}
          {task.hasReminder ? <MaterialCommunityIcons name="bell-outline" size={16} color={accentColor} /> : null}
          {showDragHandle ? <MaterialCommunityIcons name="drag" size={18} color={COLORS.textTertiary} /> : null}
        </View>
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.meta}>{category?.name ?? 'Uncategorized'}</Text>
        {task.tags.length > 0 ? <Text style={styles.meta}>#{task.tags.join(' #')}</Text> : null}
      </View>

      {/* Subtasks List */}
      {task.subtasks.length > 0 && (
        <View style={styles.subtasksContainer}>
          <View style={styles.subtasksDivider} />
          <Text style={styles.subtasksHeader}>
            Subtasks ({subtaskDone}/{task.subtasks.length})
          </Text>
          {task.subtasks.map((subtask) => (
            <Pressable
              key={subtask.id}
              style={styles.subtaskRow}
              onPress={(e) => {
                e.stopPropagation();
                if (onToggleSubtask) {
                  void Haptics.selectionAsync();
                  onToggleSubtask(subtask.id);
                }
              }}
            >
              <View
                style={[
                  styles.subtaskCheckbox,
                  subtask.completed && {
                    borderColor: accentColor,
                    backgroundColor: accentColor,
                  },
                ]}
              >
                {subtask.completed ? (
                  <MaterialCommunityIcons name="check" size={12} color={COLORS.background} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.subtaskTitle,
                  subtask.completed && styles.subtaskCompletedText,
                ]}
                numberOfLines={1}
              >
                {subtask.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  completedText: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
  },
  subtaskMeta: {
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  icons: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  subtasksContainer: {
    marginTop: 8,
  },
  subtasksDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  subtasksHeader: {
    color: COLORS.textTertiary,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  subtaskCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  subtaskCompletedText: {
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
  },
});
