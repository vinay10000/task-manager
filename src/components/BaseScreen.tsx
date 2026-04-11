import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { COLORS } from '../constants/theme';

export function BaseScreen({
  children,
  scroll = false,
  contentContainerStyle,
  style,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]}>{children}</ScrollView>
  ) : (
    <View style={[styles.content, contentContainerStyle]}>{children}</View>
  );

  return <SafeAreaView style={[styles.screen, style]}>{body}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
  },
});
