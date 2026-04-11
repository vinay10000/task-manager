import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BaseScreen } from '../components/BaseScreen';
import { ACCENT_OPTIONS, COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';

export function CategoryManagerScreen() {
  const { categories, tasks, addCategory, updateCategory, deleteCategory } = useAppState();
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
          <View key={category.id} style={styles.card}>
            <View style={styles.headerRow}>
              <View style={[styles.dot, { backgroundColor: category.color }]} />
              <View style={styles.textWrap}>
                <Text style={styles.name}>{category.name}</Text>
                <Text style={styles.count}>{count} task{count === 1 ? '' : 's'}</Text>
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
                  style={styles.input}
                  placeholder="Category name"
                  placeholderTextColor={COLORS.textTertiary}
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
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.card}>
        <Text style={styles.name}>Add Category</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="New category name"
          placeholderTextColor={COLORS.textTertiary}
          style={styles.input}
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
          <Text style={styles.addButtonLabel}>Add Category</Text>
        </Pressable>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  count: {
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.input,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    color: COLORS.textPrimary,
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
    borderColor: COLORS.textPrimary,
  },
  addButton: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonLabel: {
    color: COLORS.background,
    fontWeight: '800',
  },
});
