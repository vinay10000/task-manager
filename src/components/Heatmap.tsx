import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/theme';
import { ActivityDay } from '../types/models';

function intensityColor(accentColor: string, score: number) {
  if (score <= 0) {
    return COLORS.input;
  }
  if (score === 1) {
    return `${accentColor}33`;
  }
  if (score === 2) {
    return `${accentColor}66`;
  }
  if (score === 3) {
    return `${accentColor}99`;
  }
  return accentColor;
}

export function Heatmap({
  accentColor,
  activityLog,
}: {
  accentColor: string;
  activityLog: ActivityDay[];
}) {
  const byDate = activityLog.reduce<Record<string, number>>((acc, entry) => {
    const score = (entry.wasCompleted ? 2 : 0) + Math.min(entry.subtasksCompleted, 2);
    acc[entry.date] = (acc[entry.date] ?? 0) + score;
    return acc;
  }, {});

  const last28Days = Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - index));
    const key = date.toISOString().slice(0, 10);
    return { key, score: Math.min(byDate[key] ?? 0, 4) };
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.grid}>
        {last28Days.map((cell) => (
          <View key={cell.key} style={[styles.cell, { backgroundColor: intensityColor(accentColor, cell.score) }]} />
        ))}
      </View>
      <Text style={styles.caption}>Last 28 days of activity</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cell: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  caption: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
