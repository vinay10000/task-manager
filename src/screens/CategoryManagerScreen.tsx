import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BaseScreen } from '../components/BaseScreen';
import { ACCENT_OPTIONS, COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';
import { useThemeColors } from '../hooks/useThemeColors';

export function CategoryManagerScreen() {
  const { categories, tasks, addCategory, updateCategory, deleteCategory } = useAppState();
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(ACCENT_OPTIONS[0].value);

  const visibleCategories = useMemo(
    () =>
      categories.filter((category) =>
        category.systemType === 'uncategorized' ? tasks.some((task) => task.categoryId === category.id) : true
      ),
    [categories, tasks]
  );

  return (
    <BaseScreen scroll>
      {visibleCategories.map((category) => {
        const count = tasks.filter((task) => task.categoryId === category.id).length;
        return (
          <View key={category.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.headerRow}>
              <View style={[styles.dot, { backgroundColor: category.color }]} />
              <View style={styles.textWrap}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{category.name}</Text>
                <Text style={[styles.count, { color: colors.textSecondary }]}>{count} task{count === 1 ? '' : 's'}</Text>
              </View>
              {category.systemType === 'uncategorized' ? null : (
                <Pressable onPress={() => deleteCategory(category.id)}>
                  <Text style={styles.delete}>Delete</Text>
                </Pressable>
              )}
            </View>
            {category.systemType === 'uncategorized' ? null : (
              <View style={styles.editStack}>
                <TextInput
                  value={category.name}
                  onChangeText={(value) => updateCategory(category.id, { name: value })}
                  style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Category name"
                  placeholderTextColor={colors.textTertiary}
                />
                <View style={styles.swatches}>
                  {ACCENT_OPTIONS.map((option) => (
                    <Pressable
                      key={`${category.id}-${option.value}`}
                      onPress={() => updateCategory(category.id, { color: option.value })}
                      style={[
                        styles.swatch,
                        { backgroundColor: option.value },
                        category.color === option.value && styles.swatchSelected,
                        category.color === option.value && { borderColor: colors.textPrimary },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        );
      })}

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>Add Category</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="New category name"
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
        />
        <View style={styles.swatches}>
          {ACCENT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setColor(option.value)}
              style={[
                styles.swatch,
                { backgroundColor: option.value },
                color === option.value && styles.swatchSelected,
                color === option.value && { borderColor: colors.textPrimary },
              ]}
            />
          ))}
        </View>
        <Pressable
          style={[styles.addButton, { backgroundColor: color }]}
          onPress={() => {
            addCategory(name, color);
            setName('');
          }}
        >
          <Text style={[styles.addButtonLabel, { color: colors.background }]}>Add Category</Text>
        </Pressable>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  count: {
    fontSize: 13,
  },
  delete: {
    color: COLORS.destructive,
    fontWeight: '700',
  },
  editStack: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flex: 1,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  swatchSelected: {
    borderWidth: 2,
  },
  addButton: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonLabel: {
    fontWeight: '800',
  },
});
