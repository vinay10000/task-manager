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
  showDragHandle = false,
}: {
  task: TaskInstance;
  category?: Category;
  accentColor: string;
  onPress?: () => void;
  onComplete?: () => void;
  onLongPress?: () => void;
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
          onPress={() => {
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
        >
          {task.completed ? <MaterialCommunityIcons name="check" size={16} color={COLORS.background} /> : null}
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
            <MaterialCommunityIcons name="autorenew" size={18} color={accentColor} />
          ) : null}
          {task.hasReminder ? <MaterialCommunityIcons name="bell-outline" size={18} color={accentColor} /> : null}
          {showDragHandle ? <MaterialCommunityIcons name="drag" size={20} color={COLORS.textTertiary} /> : null}
        </View>
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.meta}>{category?.name ?? 'Uncategorized'}</Text>
        {task.tags.length > 0 ? <Text style={styles.meta}>#{task.tags.join(' #')}</Text> : null}
      </View>
      {task.subtasks.length > 0 ? (
        <Text style={[styles.meta, styles.subtaskMeta]}>
          {subtaskDone}/{task.subtasks.length} subtasks done
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  completedText: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  subtaskMeta: {
    color: COLORS.textTertiary,
  },
  icons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
});
