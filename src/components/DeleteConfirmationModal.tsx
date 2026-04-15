import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { useThemeColors } from '../hooks/useThemeColors';

interface DeleteConfirmationModalProps {
  visible: boolean;
  taskTitle: string;
  onCancel: () => void;
  onDelete: () => void;
}

export function DeleteConfirmationModal({
  visible,
  taskTitle,
  onCancel,
  onDelete,
}: DeleteConfirmationModalProps) {
  const { settings } = useAppState();
  const colors = useThemeColors();

  useEffect(() => {
    if (visible && settings.hapticsEnabled) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [settings.hapticsEnabled, visible]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Delete Task</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Are you sure you want to delete{' '}
            <Text style={[styles.taskName, { color: colors.textPrimary }]}>"{taskTitle}"</Text>?
          </Text>
          <Text style={styles.warning}>
            This action cannot be undone.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable style={[styles.cancelButton, { backgroundColor: colors.input }]} onPress={onCancel}>
              <Text style={[styles.cancelText, { color: colors.textPrimary }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.deleteButton}
              onPress={() => {
                if (settings.hapticsEnabled) {
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                onDelete();
              }}
            >
              <Text style={[styles.deleteText, { color: colors.background }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  taskName: {
    fontWeight: '600',
  },
  warning: {
    color: COLORS.destructive,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.destructive,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
