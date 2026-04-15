import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parse } from 'date-fns';
import { Pressable, Text } from 'react-native';

import { useThemeColors } from '../hooks/useThemeColors';
import { Priority } from '../types/models';
import { formatDateLabel, getDateKey } from '../utils/tasks';
import { styles } from './taskEditorStyles';

export function QuickChip({
  icon,
  label,
  accentColor,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  accentColor: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();

  return (
    <Pressable style={[styles.quickChip, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={16} color={accentColor} />
      <Text style={[styles.quickChipLabel, { color: colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

export function OptionPill({
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
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.optionPill,
        {
          backgroundColor: active ? accentColor : colors.input,
          borderColor: active ? accentColor : colors.border,
          opacity: disabled ? 0.42 : 1,
        },
      ]}
    >
      <Text style={[styles.optionPillLabel, { color: active ? colors.background : colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

export function dateChipLabel(date: string | null) {
  if (!date || date === getDateKey()) {
    return 'Today';
  }

  return formatDateLabel(date).replace(',', '');
}

export function timeChipLabel(time: string | null) {
  if (!time) {
    return '10:00 AM';
  }

  return format(parse(time, 'HH:mm', new Date()), 'hh:mm a');
}

export function priorityAccent(priority: Priority) {
  if (priority === 'high') {
    return '#F3A798';
  }
  if (priority === 'low') {
    return '#9CEFFF';
  }
  return '#E9C73F';
}
