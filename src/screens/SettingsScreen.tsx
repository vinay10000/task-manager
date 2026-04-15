import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { BaseScreen } from '../components/BaseScreen';
import { ACCENT_OPTIONS, COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { useThemeColors } from '../hooks/useThemeColors';

export function SettingsScreen({ navigation }: any) {
  const { tasks, categories, settings, setAccentColor, setDisplayMode, setHapticsEnabled } = useAppState();
  const colors = useThemeColors();

  const visibleCategories = useMemo(
    () =>
      categories.filter((category) =>
        category.systemType === 'uncategorized' ? tasks.some((task) => task.categoryId === category.id) : true
      ),
    [categories, tasks]
  );

  return (
    <BaseScreen
      scroll
      contentContainerStyle={styles.content}
      style={{ backgroundColor: colors.background }}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Curate your digital workspace experience.</Text>
      </View>

      <SectionLabel label="Appearance" color={colors.textTertiary} />
      <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.input }]}>
            <MaterialCommunityIcons name="palette-outline" size={18} color={settings.accentColor} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Accent Color</Text>
            <Text style={[styles.rowBody, { color: colors.textSecondary }]}>Scrollable accent palette</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.accentScroller}
            style={styles.accentScrollerFrame}
          >
            {ACCENT_OPTIONS.map((option) => {
              const selected = settings.accentColor === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setAccentColor(option.value)}
                  style={[
                    styles.accentCircle,
                    { backgroundColor: option.value },
                    selected && styles.selectedAccent,
                    selected && { borderColor: colors.textPrimary },
                  ]}
                />
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.input }]}>
            <MaterialCommunityIcons name="theme-light-dark" size={18} color={settings.accentColor} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Display Mode</Text>
            <Text style={[styles.rowBody, { color: colors.textSecondary }]}>
              {settings.displayMode === 'oled' ? 'OLED Black (Pure)' : 'Normal Black'}
            </Text>
          </View>
          <View style={[styles.segmented, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Pressable
              onPress={() => setDisplayMode('oled')}
              style={[
                styles.segment,
                settings.displayMode === 'oled' && { backgroundColor: settings.accentColor },
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  { color: settings.displayMode === 'oled' ? colors.background : colors.textSecondary },
                ]}
              >
                OLED
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDisplayMode('black')}
              style={[
                styles.segment,
                settings.displayMode === 'black' && { backgroundColor: settings.accentColor },
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  { color: settings.displayMode === 'black' ? colors.background : colors.textSecondary },
                ]}
              >
                Black
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <SectionLabel label="Notifications" color={colors.textTertiary} />
      <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: colors.input }]}>
            <MaterialCommunityIcons name="vibrate" size={18} color={settings.accentColor} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Haptic Feedback</Text>
            <Text style={[styles.rowBody, { color: colors.textSecondary }]}>Tactile touch responses</Text>
          </View>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={setHapticsEnabled}
            thumbColor={settings.hapticsEnabled ? '#DDF9FF' : '#C9CDD1'}
            trackColor={{ false: colors.border, true: `${settings.accentColor}88` }}
          />
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <SectionLabel label="Categories" color={colors.textTertiary} />
        <Pressable onPress={() => navigation.navigate('CategoryManager')}>
          <Text style={[styles.newText, { color: settings.accentColor }]}>+ New</Text>
        </Pressable>
      </View>

      <View style={styles.categoryStack}>
        {visibleCategories.map((category) => {
          const count = tasks.filter((task) => task.categoryId === category.id).length;
          return (
            <Pressable
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('CategoryManager')}
            >
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={[styles.categoryName, { color: colors.textPrimary }]}>{category.name}</Text>
              <Text style={[styles.categoryCount, { color: settings.accentColor }]}>
                {String(count).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BaseScreen>
  );
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return <Text style={[styles.sectionLabel, { color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingBottom: 28,
    gap: 18,
  },
  header: {
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.1,
    textTransform: 'uppercase',
  },
  panel: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowBody: {
    fontSize: 12,
    lineHeight: 16,
  },
  accentScrollerFrame: {
    maxWidth: 114,
  },
  accentScroller: {
    gap: 8,
    paddingRight: 4,
  },
  accentCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  selectedAccent: {
    borderWidth: 2,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segment: {
    minWidth: 68,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryStack: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '700',
  },
});
