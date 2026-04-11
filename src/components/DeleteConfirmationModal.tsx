import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/theme';

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
  useEffect(() => {
    if (visible) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Delete Task</Text>
          <Text style={styles.message}>
            Are you sure you want to delete{' '}
            <Text style={styles.taskName}>"{taskTitle}"</Text>?
          </Text>
          <Text style={styles.warning}>
            This action cannot be undone.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.deleteButton}
              onPress={() => {
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onDelete();
              }}
            >
              <Text style={styles.deleteText}>Delete</Text>
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
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  taskName: {
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.input,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textPrimary,
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
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700',
  },
});
