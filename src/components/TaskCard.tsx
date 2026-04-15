import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { useThemeColors } from '../hooks/useThemeColors';
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
  const { settings } = useAppState();
  const colors = useThemeColors();
  const subtaskDone = task.subtasks.filter((subtask) => subtask.completed).length;

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      onLongPress={() => {
        if (onLongPress) {
          if (settings.hapticsEnabled) {
            void Haptics.selectionAsync();
          }
          onLongPress();
        }
      }}
    >
      <View style={styles.headerRow}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            if (onComplete) {
              if (settings.hapticsEnabled) {
                void Haptics.selectionAsync();
              }
              onComplete();
            }
          }}
          style={[
            styles.checkbox,
            task.completed && {
              borderColor: accentColor,
              backgroundColor: accentColor,
            },
            !task.completed && { borderColor: colors.border },
          ]}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          {task.completed ? <MaterialCommunityIcons name="check" size={14} color={colors.background} /> : null}
        </Pressable>
        <View style={[styles.categoryDot, { backgroundColor: category?.color ?? colors.textTertiary }]} />
        <View style={styles.textWrap}>
          <Text
            style={[
              styles.title,
              { color: colors.textPrimary },
              task.completed && styles.completedText,
              task.completed && { color: colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={2}>
            {formatDateTimeLabel(task.dueDate, task.dueTime)}
          </Text>
        </View>
        <View style={styles.icons}>
          {task.seriesId ? (
            <MaterialCommunityIcons name="autorenew" size={16} color={accentColor} />
          ) : null}
          {task.hasReminder ? <MaterialCommunityIcons name="bell-outline" size={16} color={accentColor} /> : null}
          {showDragHandle ? <MaterialCommunityIcons name="drag" size={18} color={colors.textTertiary} /> : null}
        </View>
      </View>
      <View style={styles.footerRow}>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{category?.name ?? 'Uncategorized'}</Text>
        {task.tags.length > 0 ? <Text style={[styles.meta, { color: colors.textSecondary }]}>#{task.tags.join(' #')}</Text> : null}
      </View>

      {/* Subtasks List */}
      {task.subtasks.length > 0 && (
        <View style={styles.subtasksContainer}>
          <View style={[styles.subtasksDivider, { backgroundColor: colors.border }]} />
          <Text style={[styles.subtasksHeader, { color: colors.textTertiary }]}>
            Subtasks ({subtaskDone}/{task.subtasks.length})
          </Text>
          {task.subtasks.map((subtask) => (
            <Pressable
              key={subtask.id}
              style={styles.subtaskRow}
              onPress={(e) => {
                e.stopPropagation();
                if (onToggleSubtask) {
                  if (settings.hapticsEnabled) {
                    void Haptics.selectionAsync();
                  }
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
                  !subtask.completed && { borderColor: colors.border },
                ]}
              >
                {subtask.completed ? (
                  <MaterialCommunityIcons name="check" size={12} color={colors.background} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.subtaskTitle,
                  { color: colors.textSecondary },
                  subtask.completed && styles.subtaskCompletedText,
                  subtask.completed && { color: colors.textTertiary },
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
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
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
    fontSize: 15,
    fontWeight: '700',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  meta: {
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
    marginVertical: 8,
  },
  subtasksHeader: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskTitle: {
    fontSize: 12,
    flex: 1,
  },
  subtaskCompletedText: {
    textDecorationLine: 'line-through',
  },
});
