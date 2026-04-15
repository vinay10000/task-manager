import { ReactNode } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '../hooks/useThemeColors';

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
  const colors = useThemeColors();
  const body = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]}>{children}</ScrollView>
  ) : (
    <View style={[styles.content, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }, style]} edges={['top', 'left', 'right']}>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
  },
});
