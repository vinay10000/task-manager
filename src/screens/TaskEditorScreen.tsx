import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { REMINDER_OPTIONS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { useThemeColors } from '../hooks/useThemeColors';
import { Priority, TaskDraft } from '../types/models';
import { openNotificationSettings } from '../services/notifications';
import { getDateKey, mergeLocalDateAndTime } from '../utils/tasks';
import { OptionPill, QuickChip, dateChipLabel, priorityAccent, timeChipLabel } from './TaskEditorParts';
import { CTA_GRADIENT, styles } from './taskEditorStyles';

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
  const colors = useThemeColors();
  const editingTask = tasks.find((task) => task.id === taskId);
  const editingSeries = series.find((item) => item.id === editingTask?.seriesId);
  const [scope, setScope] = useState<'single' | 'future'>(routeScope === 'future' ? 'future' : 'single');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(Boolean(editingTask));
  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');

  const initialDraft = useMemo<TaskDraft>(
    () => ({
      title: editingTask?.title ?? '',
      description: editingTask?.description ?? '',
      categoryId:
        editingTask?.categoryId ??
        categories.find((category) => category.systemType !== 'uncategorized')?.id ??
        categories[0]?.id ??
        '',
      tags: editingTask?.tags ?? [],
      priority: editingTask?.priority ?? 'medium',
      dueDate: editingTask?.dueDate ?? getDateKey(),
      dueTime: editingTask?.dueTime ?? '10:00',
      recurrenceRule: editingSeries?.recurrenceRule ?? 'none',
      recurrenceInterval: editingSeries?.recurrenceInterval ?? 1,
      hasReminder: editingTask?.hasReminder ?? false,
      reminderOffset: editingTask?.reminderOffset ?? 'exact',
      subtasks: editingTask?.subtasks ?? [],
    }),
    [categories, editingSeries, editingTask]
  );

  const [draft, setDraft] = useState<TaskDraft>(initialDraft);
  const isRecurringSingleEdit = Boolean(editingTask?.seriesId) && scope === 'single';
  const canReminder = !!draft.dueDate && !!draft.dueTime;

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  function onDateChange(_: DateTimePickerEvent, selected?: Date) {
    setShowDatePicker(false);
    if (!selected) {
      return;
    }
    setDraft((current) => ({ ...current, dueDate: selected.toISOString().slice(0, 10) }));
  }

  function onTimeChange(_: DateTimePickerEvent, selected?: Date) {
    setShowTimePicker(false);
    if (!selected) {
      return;
    }
    const hours = `${selected.getHours()}`.padStart(2, '0');
    const minutes = `${selected.getMinutes()}`.padStart(2, '0');
    setDraft((current) => ({ ...current, dueTime: `${hours}:${minutes}` }));
  }

  function addTag() {
    if (!tagInput.trim()) {
      return;
    }
    setDraft((current) => ({
      ...current,
      tags: [...new Set([...current.tags, tagInput.trim().toLowerCase()])],
    }));
    setTagInput('');
  }

  function addSubtask() {
    if (!subtaskInput.trim()) {
      return;
    }
    setDraft((current) => ({
      ...current,
      subtasks: [
        ...current.subtasks,
        { id: '', title: subtaskInput.trim(), completed: false, sortOrder: current.subtasks.length },
      ],
    }));
    setSubtaskInput('');
  }

  return (
    <SafeAreaView style={styles.overlay} edges={['left', 'right', 'bottom']}>
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardWrap}>
        <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{editingTask ? 'Edit Task' : 'New Task'}</Text>
            <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="close" size={28} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {editingTask?.seriesId ? (
              <View style={styles.scopeRow}>
                <OptionPill label="This Task" active={scope === 'single'} accentColor={settings.accentColor} onPress={() => setScope('single')} />
                <OptionPill label="This & Future" active={scope === 'future'} accentColor={settings.accentColor} onPress={() => setScope('future')} />
              </View>
            ) : null}

            <Text style={[styles.eyebrow, { color: colors.textTertiary }]}>WHAT'S THE MISSION?</Text>
            <TextInput
              autoFocus={!editingTask}
              multiline
              value={draft.title}
              onChangeText={(value) => setDraft((current) => ({ ...current, title: value }))}
              placeholder="Design the next evolution"
              placeholderTextColor="#2A2A31"
              selectionColor={settings.accentColor}
              style={[styles.titleInput, { color: colors.textPrimary }]}
            />

            <View style={styles.quickRow}>
              <QuickChip
                icon="flag-variant-outline"
                label="Priority"
                accentColor={priorityAccent(draft.priority)}
                onPress={() => setShowPriorityPicker((current) => !current)}
              />
              <QuickChip
                icon="calendar-month-outline"
                label={dateChipLabel(draft.dueDate)}
                accentColor="#17D8F0"
                onPress={() => setShowDatePicker(true)}
              />
              <QuickChip
                icon="tag-outline"
                label="Tag"
                accentColor="#E9C63C"
                onPress={() => setShowTagInput((current) => !current)}
              />
              <QuickChip
                icon="clock-outline"
                label={timeChipLabel(draft.dueTime)}
                accentColor="#D4D9DF"
                onPress={() => setShowTimePicker(true)}
              />
            </View>

            {showPriorityPicker ? (
              <View style={styles.rowWrap}>
                {(['low', 'medium', 'high'] as Priority[]).map((priority) => (
                  <OptionPill
                    key={priority}
                    label={priority}
                    active={draft.priority === priority}
                    accentColor={settings.accentColor}
                    onPress={() => setDraft((current) => ({ ...current, priority }))}
                  />
                ))}
              </View>
            ) : null}

            {showTagInput || draft.tags.length > 0 ? (
              <View style={[styles.inlineComposer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  placeholder="Add a tag"
                  placeholderTextColor={colors.textTertiary}
                  selectionColor={settings.accentColor}
                  style={[styles.inlineInput, { color: colors.textPrimary }]}
                />
                <Pressable style={[styles.miniButton, { backgroundColor: colors.input }]} onPress={addTag}>
                  <Text style={[styles.miniButtonLabel, { color: colors.textPrimary }]}>Add</Text>
                </Pressable>
              </View>
            ) : null}

            {draft.tags.length > 0 ? (
              <View style={styles.rowWrap}>
                {draft.tags.map((tag) => (
                  <Pressable
                    key={tag}
                    style={[styles.tagPill, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => setDraft((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }))}
                  >
                    <Text style={[styles.tagLabel, { color: colors.textSecondary }]}>{`#${tag}`}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <Pressable style={styles.toggleRow} onPress={() => setShowAdvanced((current) => !current)}>
              <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>
                {showAdvanced ? 'Hide details' : 'More options'}
              </Text>
              <MaterialCommunityIcons
                name={showAdvanced ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>

            {showAdvanced ? (
              <View style={[styles.advancedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Category</Text>
                <View style={styles.rowWrap}>
                  {categories.map((category) => (
                    <Pressable
                      key={category.id}
                      style={[
                        styles.categoryPill,
                        {
                          backgroundColor: colors.input,
                          borderColor: draft.categoryId === category.id ? settings.accentColor : colors.border,
                        },
                      ]}
                      onPress={() => setDraft((current) => ({ ...current, categoryId: category.id }))}
                    >
                      <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                      <Text style={[styles.categoryText, { color: colors.textPrimary }]}>{category.name}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Notes</Text>
                <TextInput
                  multiline
                  value={draft.description}
                  onChangeText={(value) => setDraft((current) => ({ ...current, description: value }))}
                  placeholder="Add context, links, or extra detail"
                  placeholderTextColor={colors.textTertiary}
                  selectionColor={settings.accentColor}
                  style={[styles.notesInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
                />

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Repeat</Text>
                <View style={styles.rowWrap}>
                  {RECURRENCE_OPTIONS.map((option) => (
                    <OptionPill
                      key={option.value}
                      label={option.label}
                      active={draft.recurrenceRule === option.value}
                      accentColor={settings.accentColor}
                      disabled={isRecurringSingleEdit}
                      onPress={() => setDraft((current) => ({ ...current, recurrenceRule: option.value }))}
                    />
                  ))}
                </View>
                {draft.recurrenceRule === 'customDays' ? (
                  <TextInput
                    keyboardType="number-pad"
                    value={`${draft.recurrenceInterval}`}
                    onChangeText={(value) => setDraft((current) => ({ ...current, recurrenceInterval: Number(value || 1) }))}
                    placeholder="Every N days"
                    placeholderTextColor={colors.textTertiary}
                    selectionColor={settings.accentColor}
                    style={[styles.smallInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
                  />
                ) : null}
                {isRecurringSingleEdit ? (
                  <Text style={[styles.hint, { color: colors.textSecondary }]}>
                    Recurrence cadence belongs to the series. Switch to "This & Future" to change it.
                  </Text>
                ) : null}

                <View style={styles.reminderHeader}>
                  <View style={styles.reminderText}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Reminder</Text>
                    <Text style={[styles.hint, { color: colors.textSecondary }]}>
                      {notificationGranted ? 'Schedule a local reminder.' : 'Enable notifications to use reminders.'}
                    </Text>
                  </View>
                  <Switch
                    value={draft.hasReminder && canReminder}
                    onValueChange={(value) => setDraft((current) => ({ ...current, hasReminder: value }))}
                    trackColor={{ false: colors.border, true: `${settings.accentColor}88` }}
                    thumbColor={draft.hasReminder ? '#DDF9FF' : '#C7CCD2'}
                    disabled={!canReminder || !notificationGranted}
                  />
                </View>
                {!notificationGranted ? (
                  <Pressable
                    style={[styles.secondaryButton, { backgroundColor: colors.input, borderColor: colors.border }]}
                    onPress={() =>
                      settings.notificationPermissionAsked ? void openNotificationSettings() : void requestNotifications()
                    }
                  >
                    <Text style={[styles.secondaryButtonLabel, { color: colors.textPrimary }]}>
                      {settings.notificationPermissionAsked ? 'Open notification settings' : 'Enable notifications'}
                    </Text>
                  </Pressable>
                ) : null}
                <View style={styles.rowWrap}>
                  {REMINDER_OPTIONS.map((option) => (
                    <OptionPill
                      key={option.value}
                      label={option.label}
                      active={draft.reminderOffset === option.value}
                      accentColor={settings.accentColor}
                      disabled={!draft.hasReminder || !canReminder || !notificationGranted}
                      onPress={() => setDraft((current) => ({ ...current, reminderOffset: option.value }))}
                    />
                  ))}
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Subtasks</Text>
                <View style={[styles.inlineComposer, { backgroundColor: colors.input, borderColor: colors.border }]}>
                  <TextInput
                    value={subtaskInput}
                    onChangeText={setSubtaskInput}
                    onSubmitEditing={addSubtask}
                    placeholder="Add a subtask"
                    placeholderTextColor={colors.textTertiary}
                    selectionColor={settings.accentColor}
                    style={[styles.inlineInput, { color: colors.textPrimary }]}
                  />
                  <Pressable style={[styles.miniButton, { backgroundColor: colors.card }]} onPress={addSubtask}>
                    <Text style={[styles.miniButtonLabel, { color: colors.textPrimary }]}>Add</Text>
                  </Pressable>
                </View>
                <View style={styles.subtaskList}>
                  {draft.subtasks.map((subtask) => (
                    <View key={`${subtask.id}-${subtask.title}`} style={[styles.subtaskRow, { backgroundColor: colors.input, borderColor: colors.border }]}>
                      <Text style={[styles.subtaskText, { color: colors.textPrimary }]} numberOfLines={1}>
                        {subtask.title}
                      </Text>
                      <Pressable
                        onPress={() =>
                          setDraft((current) => ({
                            ...current,
                            subtasks: current.subtasks.filter((item) => item !== subtask),
                          }))
                        }
                      >
                        <Text style={styles.removeText}>Remove</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <Pressable
              style={styles.ctaButton}
              onPress={() => {
                const saved = saveTask(draft, taskId ? { taskId, scope } : undefined);
                if (saved) {
                  navigation.goBack();
                }
              }}
            >
              <View style={styles.ctaGradient}>
                {CTA_GRADIENT.map((color) => (
                  <View key={color} style={[styles.ctaGradientStop, { backgroundColor: color }]} />
                ))}
              </View>
              <Text style={styles.ctaLabel}>{editingTask ? 'SAVE TASK' : 'CREATE TASK'}</Text>
              <MaterialCommunityIcons name="arrow-right" size={28} color="#051B20" />
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

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
          value={mergeLocalDateAndTime(draft.dueDate ?? getDateKey(), draft.dueTime) ?? new Date()}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      ) : null}
    </SafeAreaView>
  );
}
