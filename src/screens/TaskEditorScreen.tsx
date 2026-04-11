import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

import { BaseScreen } from '../components/BaseScreen';
import { COLORS, REMINDER_OPTIONS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { Priority, TaskDraft } from '../types/models';
import { openNotificationSettings } from '../services/notifications';
import { formatDateLabel, mergeLocalDateAndTime } from '../utils/tasks';

const RECURRENCE_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Every N Days', value: 'customDays' },
] as const;

export function TaskEditorScreen({ route, navigation }: any) {
  const { taskId, scope: routeScope } = route.params ?? {};
  const { tasks, series, categories, settings, saveTask, notificationGranted, requestNotifications } = useAppState();
  const editingTask = tasks.find((task) => task.id === taskId);
  const editingSeries = series.find((item) => item.id === editingTask?.seriesId);
  const [scope, setScope] = useState<'single' | 'future'>(routeScope === 'future' ? 'future' : 'single');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');

  const initialDraft = useMemo<TaskDraft>(
    () => ({
      title: editingTask?.title ?? '',
      description: editingTask?.description ?? '',
      categoryId: editingTask?.categoryId ?? categories.find((category) => category.systemType !== 'uncategorized')?.id ?? categories[0]?.id ?? '',
      tags: editingTask?.tags ?? [],
      priority: editingTask?.priority ?? 'medium',
      dueDate: editingTask?.dueDate ?? null,
      dueTime: editingTask?.dueTime ?? null,
      recurrenceRule: editingSeries?.recurrenceRule ?? 'none',
      recurrenceInterval: editingSeries?.recurrenceInterval ?? 1,
      hasReminder: editingTask?.hasReminder ?? false,
      reminderOffset: editingTask?.reminderOffset ?? 'exact',
      subtasks: editingTask?.subtasks ?? [],
    }),
    [categories, editingSeries, editingTask]
  );
  const [draft, setDraft] = useState<TaskDraft>(initialDraft);
  const isRecurringSingleEdit = !!editingTask?.seriesId && scope === 'single';

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  const canReminder = !!draft.dueDate && !!draft.dueTime;

  function onDateChange(_: DateTimePickerEvent, selected?: Date) {
    setShowDatePicker(false);
    if (!selected) {
      return;
    }
    setDraft((current) => ({
      ...current,
      dueDate: selected.toISOString().slice(0, 10),
    }));
  }

  function onTimeChange(_: DateTimePickerEvent, selected?: Date) {
    setShowTimePicker(false);
    if (!selected) {
      return;
    }
    const hours = `${selected.getHours()}`.padStart(2, '0');
    const minutes = `${selected.getMinutes()}`.padStart(2, '0');
    setDraft((current) => ({
      ...current,
      dueTime: `${hours}:${minutes}`,
    }));
  }

  return (
    <BaseScreen scroll contentContainerStyle={styles.content}>
      {editingTask?.seriesId ? (
        <View style={styles.scopeRow}>
          <ScopeButton label="This Task" active={scope === 'single'} accentColor={settings.accentColor} onPress={() => setScope('single')} />
          <ScopeButton label="This & Future" active={scope === 'future'} accentColor={settings.accentColor} onPress={() => setScope('future')} />
        </View>
      ) : null}

      <View style={styles.section}>
        <TextInput
          style={styles.titleInput}
          value={draft.title}
          onChangeText={(value) => setDraft((current) => ({ ...current, title: value }))}
          placeholder="Task title"
          placeholderTextColor={COLORS.textTertiary}
        />
        <TextInput
          style={[styles.titleInput, styles.descriptionInput]}
          multiline
          value={draft.description}
          onChangeText={(value) => setDraft((current) => ({ ...current, description: value }))}
          placeholder="Description"
          placeholderTextColor={COLORS.textTertiary}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.rowWrap}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryChip,
                { borderColor: draft.categoryId === category.id ? settings.accentColor : COLORS.border },
              ]}
              onPress={() => setDraft((current) => ({ ...current, categoryId: category.id }))}
            >
              <View style={[styles.dot, { backgroundColor: category.color }]} />
              <Text style={styles.categoryLabel}>{category.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.inlineRow}>
          <TextInput
            style={[styles.titleInput, styles.inlineInput]}
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={() => {
              if (!tagInput.trim()) {
                return;
              }
              setDraft((current) => ({ ...current, tags: [...new Set([...current.tags, tagInput.trim().toLowerCase()])] }));
              setTagInput('');
            }}
            placeholder="Type a tag and hit enter"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>
        <View style={styles.rowWrap}>
          {draft.tags.map((tag) => (
            <Pressable
              key={tag}
              style={styles.tagChip}
              onPress={() => setDraft((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }))}
            >
              <Text style={styles.tagLabel}>#{tag}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Priority</Text>
        <View style={styles.rowWrap}>
          {(['low', 'medium', 'high'] as Priority[]).map((priority) => (
            <ScopeButton
              key={priority}
              label={priority}
              active={draft.priority === priority}
              accentColor={settings.accentColor}
              onPress={() => setDraft((current) => ({ ...current, priority }))}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        <View style={styles.inlineRow}>
          <Pressable style={styles.secondaryButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.secondaryButtonText}>{formatDateLabel(draft.dueDate)}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.secondaryButtonText}>{draft.dueTime ?? 'Pick time'}</Text>
          </Pressable>
        </View>
        <View style={styles.rowWrap}>
          {RECURRENCE_OPTIONS.map((option) => (
            <ScopeButton
              key={option.value}
              label={option.label}
              active={draft.recurrenceRule === option.value}
              accentColor={settings.accentColor}
              onPress={() => {
                if (isRecurringSingleEdit) {
                  return;
                }
                setDraft((current) => ({ ...current, recurrenceRule: option.value }));
              }}
            />
          ))}
        </View>
        {isRecurringSingleEdit ? (
          <Text style={styles.hint}>Recurrence cadence belongs to the series. Switch to “This & Future” to change it.</Text>
        ) : null}
        {draft.recurrenceRule === 'customDays' ? (
          <TextInput
            style={styles.titleInput}
            keyboardType="number-pad"
            value={`${draft.recurrenceInterval}`}
            onChangeText={(value) => setDraft((current) => ({ ...current, recurrenceInterval: Number(value || 1) }))}
            placeholder="Every N days"
            placeholderTextColor={COLORS.textTertiary}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.sectionTitle}>Reminder</Text>
            <Text style={styles.hint}>
              {!canReminder
                ? 'Pick date and time first.'
                : notificationGranted
                  ? 'Reminder will be scheduled locally.'
                  : 'Notification permission is off. You can still save the task and enable reminders later.'}
            </Text>
          </View>
          <Switch
            value={draft.hasReminder && canReminder}
            onValueChange={(value) => setDraft((current) => ({ ...current, hasReminder: value }))}
            trackColor={{ true: settings.accentColor }}
            disabled={!canReminder || !notificationGranted}
          />
        </View>
        {!notificationGranted ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              settings.notificationPermissionAsked ? void openNotificationSettings() : void requestNotifications()
            }
          >
            <Text style={styles.secondaryButtonText}>
              {settings.notificationPermissionAsked ? 'Open notification settings' : 'Enable notifications'}
            </Text>
          </Pressable>
        ) : null}
        <View style={styles.rowWrap}>
          {REMINDER_OPTIONS.map((option) => (
            <ScopeButton
              key={option.value}
              label={option.label}
              active={draft.reminderOffset === option.value}
              accentColor={settings.accentColor}
              disabled={!canReminder || !notificationGranted}
              onPress={() => {
                if (!canReminder || !notificationGranted) {
                  return;
                }
                setDraft((current) => ({ ...current, reminderOffset: option.value }));
              }}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subtasks</Text>
        <View style={styles.inlineRow}>
          <TextInput
            style={[styles.titleInput, styles.inlineInput]}
            value={subtaskInput}
            onChangeText={setSubtaskInput}
            onSubmitEditing={() => {
              if (!subtaskInput.trim()) {
                return;
              }
              setDraft((current) => ({
                ...current,
                subtasks: [
                  ...current.subtasks,
                  { id: '', title: subtaskInput, completed: false, sortOrder: current.subtasks.length },
                ],
              }));
              setSubtaskInput('');
            }}
            placeholder="Add subtask and hit enter"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>
        <DraggableFlatList
          data={draft.subtasks}
          keyExtractor={(item, index) => `${item.id || item.title}-${index}`}
          scrollEnabled={false}
          onDragEnd={({ data }) => setDraft((current) => ({ ...current, subtasks: data }))}
          renderItem={({ item, drag }) => (
            <ScaleDecorator>
              <Pressable style={styles.subtaskRow} onLongPress={drag}>
                <Text style={styles.subtaskLabel}>{item.title}</Text>
                <Pressable
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      subtasks: current.subtasks.filter((subtask) => subtask !== item),
                    }))
                  }
                >
                  <Text style={styles.removeLabel}>Remove</Text>
                </Pressable>
              </Pressable>
            </ScaleDecorator>
          )}
        />
      </View>

      <Pressable
        style={[styles.saveButton, { backgroundColor: settings.accentColor }]}
        onPress={() => {
          const saved = saveTask(draft, taskId ? { taskId, scope } : undefined);
          if (saved) {
            navigation.goBack();
          }
        }}
      >
        <Text style={styles.saveLabel}>{editingTask ? 'Save Changes' : 'Save Task'}</Text>
      </Pressable>

      {showDatePicker ? (
        <DateTimePicker
          value={mergeLocalDateAndTime(draft.dueDate, draft.dueTime) ?? new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      ) : null}
      {showTimePicker ? (
        <DateTimePicker
          value={mergeLocalDateAndTime(draft.dueDate ?? new Date().toISOString().slice(0, 10), draft.dueTime) ?? new Date()}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      ) : null}
    </BaseScreen>
  );
}

function ScopeButton({
  label,
  active,
  accentColor,
  onPress,
  disabled = false,
}: {
  label: string;
  active: boolean;
  accentColor: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.scopeButton,
        {
          borderColor: active ? accentColor : COLORS.border,
          backgroundColor: active ? accentColor : COLORS.card,
          opacity: disabled ? 0.38 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.scopeLabel, { color: active ? COLORS.background : COLORS.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 36,
  },
  section: {
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  titleInput: {
    backgroundColor: COLORS.input,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  descriptionInput: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineInput: {
    flex: 1,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: COLORS.input,
  },
  categoryLabel: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagLabel: {
    color: COLORS.textSecondary,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scopeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  scopeLabel: {
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.input,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  subtaskRow: {
    backgroundColor: COLORS.input,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  subtaskLabel: {
    color: COLORS.textPrimary,
    flex: 1,
  },
  removeLabel: {
    color: COLORS.destructive,
    fontWeight: '700',
  },
  saveButton: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    color: COLORS.background,
    fontWeight: '800',
    fontSize: 16,
  },
});
