import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { COLORS } from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors';
import { Category, TaskInstance } from '../types/models';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { TaskCard } from './TaskCard';

const DELETE_BUTTON_WIDTH = 80;

interface SwipeableTaskCardProps {
  task: TaskInstance;
  category?: Category;
  accentColor: string;
  onPress?: () => void;
  onComplete?: () => void;
  onDelete: () => void;
  onLongPress?: () => void;
  onToggleSubtask?: (subtaskId: string) => void;
  showDragHandle?: boolean;
}

export function SwipeableTaskCard({
  task,
  category,
  accentColor,
  onPress,
  onComplete,
  onDelete,
  onLongPress,
  onToggleSubtask,
  showDragHandle = false,
}: SwipeableTaskCardProps) {
  const colors = useThemeColors();
  const translateX = useSharedValue(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDeleteConfirm = () => {
    setShowModal(false);
    onDelete();
  };

  const handleCancel = () => {
    setShowModal(false);
    translateX.value = withSpring(0, { stiffness: 400, damping: 25 });
    setIsSwiped(false);
  };

  const openDeleteModal = () => {
    setShowModal(true);
  };

  const gesture = Gesture.Pan()
    .activeOffsetX([-25, 25])
    .failOffsetY([-30, 30])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -DELETE_BUTTON_WIDTH);
      } else if (event.translationX > 0) {
        translateX.value = Math.min(event.translationX, 0);
      }
    })
    .onEnd(() => {
      if (translateX.value <= -DELETE_BUTTON_WIDTH / 2) {
        translateX.value = withSpring(-DELETE_BUTTON_WIDTH, { stiffness: 400, damping: 25 });
        runOnJS(setIsSwiped)(true);
      } else {
        translateX.value = withSpring(0, { stiffness: 400, damping: 25 });
        runOnJS(setIsSwiped)(false);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedDeleteStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -10 ? 1 : 0,
  }));

  return (
    <View style={styles.container}>
      {/* Swipeable card */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[animatedCardStyle, styles.cardWrapper, { backgroundColor: colors.background }]}>
          <TaskCard
            task={task}
            category={category}
            accentColor={accentColor}
            onPress={onPress}
            onComplete={onComplete}
            onLongPress={onLongPress}
            onToggleSubtask={onToggleSubtask}
            showDragHandle={showDragHandle}
          />
        </Animated.View>
      </GestureDetector>

      {/* Delete button background - placed after card in render order */}
      <Animated.View
        style={[
          styles.deleteButton,
          animatedDeleteStyle,
          { pointerEvents: translateX.value < -20 ? 'auto' : 'none' }
        ]}
      >
        <Pressable
          style={styles.deletePressable}
          onPress={openDeleteModal}
        >
          <MaterialCommunityIcons name="delete-outline" size={24} color={colors.background} />
          <Text style={[styles.deleteText, { color: colors.background }]}>Delete</Text>
        </Pressable>
      </Animated.View>

      <DeleteConfirmationModal
        visible={showModal}
        taskTitle={task.title}
        onCancel={handleCancel}
        onDelete={handleDeleteConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  cardWrapper: {
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BUTTON_WIDTH,
    backgroundColor: COLORS.destructive,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 5,
  },
  deletePressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
