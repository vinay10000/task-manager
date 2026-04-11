import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/theme';

export function ToastHost({
  messages,
  onDismiss,
}: {
  messages: string[];
  onDismiss: (message: string) => void;
}) {
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      onDismiss(messages[0]);
    }, 4200);

    return () => clearTimeout(timer);
  }, [messages, onDismiss]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.host}>
      {messages.slice(0, 3).map((message) => (
        <Pressable key={message} style={styles.toast} onPress={() => onDismiss(message)}>
          <Text style={styles.text}>{message}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 58,
    left: 16,
    right: 16,
    gap: 10,
    zIndex: 100,
  },
  toast: {
    backgroundColor: '#151515',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E2E2E',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  text: {
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
});
