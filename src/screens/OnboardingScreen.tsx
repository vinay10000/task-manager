import { useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACCENT_OPTIONS, COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Task management, stripped to the essentials.',
    body: 'Pitch-black focus, zero signup friction, and your entire system offline by default.',
  },
  {
    title: 'Group by categories, break down into subtasks.',
    body: 'Hard categories for structure, lightweight tags for search, and nested checklists for detail.',
  },
  {
    title: 'Set repeating tasks and never miss a deadline.',
    body: 'Completion-based recurring tasks and local reminders keep routines moving even offline.',
  },
];

export function OnboardingScreen() {
  const { finishOnboarding } = useAppState();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [selectedAccent, setSelectedAccent] = useState<string>(ACCENT_OPTIONS[0].value);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {slides.map((slide) => (
          <View key={slide.title} style={styles.slide}>
            <View style={[styles.hero, { borderColor: selectedAccent }]}>
              <View style={[styles.heroGlyph, { backgroundColor: selectedAccent }]} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
        <View style={styles.slide}>
          <Text style={styles.eyebrow}>Choose your accent</Text>
          <Text style={styles.title}>Make it yours.</Text>
          <Text style={styles.body}>Pick one accent color to unlock the app and generate your starter categories.</Text>
          <View style={styles.accentGrid}>
            {ACCENT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setSelectedAccent(option.value)}
                style={[
                  styles.accentCircle,
                  { backgroundColor: option.value },
                  selectedAccent === option.value && styles.accentSelected,
                ]}
              />
            ))}
          </View>
          <Pressable style={[styles.primaryButton, { backgroundColor: selectedAccent }]} onPress={() => finishOnboarding(selectedAccent)}>
            <Text style={styles.primaryLabel}>Enter App</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === step ? selectedAccent : COLORS.border },
              ]}
            />
          ))}
        </View>
        {step < 3 ? (
          <Pressable
            style={[styles.primaryButton, { backgroundColor: selectedAccent }]}
            onPress={() => {
              const nextStep = step + 1;
              setStep(nextStep);
              scrollRef.current?.scrollTo({ x: nextStep * width, animated: true });
            }}
          >
            <Text style={styles.primaryLabel}>Next</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  slide: {
    width,
    paddingHorizontal: 24,
    paddingVertical: 36,
    justifyContent: 'center',
    gap: 18,
  },
  hero: {
    width: 128,
    height: 128,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  heroGlyph: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  eyebrow: {
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 12,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  accentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    paddingVertical: 16,
  },
  accentCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  accentSelected: {
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 18,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  primaryButton: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: COLORS.background,
    fontWeight: '800',
    fontSize: 16,
  },
});
