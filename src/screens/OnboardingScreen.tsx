import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACCENT_OPTIONS, COLORS } from '../constants/theme';
import { useAppState } from '../hooks/useAppState';

const INFO_STEPS = [
  {
    title: 'Capture what matters.',
    body: 'Create tasks quickly, keep your lists focused, and let your chosen accent make the interface feel personal.',
  },
  {
    title: 'Stay organized your way.',
    body: 'Use categories, subtasks, and schedules to shape a system that stays clean without becoming heavy.',
  },
  {
    title: 'Ready when you are.',
    body: 'Your accent color carries through the app so every screen feels cohesive from the first tap onward.',
  },
];

const TOTAL_STEPS = INFO_STEPS.length + 1;
const CTA_GRADIENT = ['#9EEFFF', '#74EAF8', '#43DBF3'];

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function OnboardingScreen() {
  const { finishOnboarding } = useAppState();
  const [step, setStep] = useState(0);
  const [selectedAccent, setSelectedAccent] = useState<string>(ACCENT_OPTIONS[0].value);
  const isPaletteStep = step === 0;
  const isLastStep = step === TOTAL_STEPS - 1;
  const currentInfoStep = INFO_STEPS[Math.max(step - 1, 0)];

  const handleContinue = () => {
    if (isLastStep) {
      finishOnboarding(selectedAccent);
      return;
    }

    setStep((current) => current + 1);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.phoneShell}>
        <View style={styles.phoneFrame}>
          {isPaletteStep ? (
            <View style={styles.paletteLayout}>
              <View style={styles.paletteTitleWrap}>
                <Text style={styles.paletteTitle}>Make it yours.</Text>
              </View>

              <View style={styles.accentGrid}>
                {ACCENT_OPTIONS.map((option) => {
                  const selected = selectedAccent === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setSelectedAccent(option.value)}
                      style={styles.swatchButton}
                    >
                      <View
                        style={[
                          styles.swatchGlow,
                          {
                            backgroundColor: option.value,
                            opacity: selected ? 0.28 : 0.18,
                          },
                        ]}
                      />
                      {selected ? (
                        <View
                          style={[
                            styles.swatchRing,
                            {
                              borderColor: hexToRgba(option.value, 0.55),
                              shadowColor: option.value,
                            },
                          ]}
                        />
                      ) : null}
                      <View style={[styles.swatchCore, { backgroundColor: option.value }]} />
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.bottomBlock}>
                <Pressable style={styles.ctaButton} onPress={handleContinue}>
                  <View style={styles.ctaGradient}>
                    {CTA_GRADIENT.map((color) => (
                      <View key={color} style={[styles.ctaGradientStop, { backgroundColor: color }]} />
                    ))}
                  </View>
                  <Text style={styles.ctaLabel}>Continue</Text>
                  <MaterialCommunityIcons name="arrow-right" size={26} color="#0B6B7B" />
                </Pressable>
                <Text style={styles.stepLabel}>{`STEP ${step + 1} OF ${TOTAL_STEPS}`}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.infoLayout}>
              <Text style={styles.stepLabel}>{`STEP ${step + 1} OF ${TOTAL_STEPS}`}</Text>
              <View style={styles.infoHero}>
                <View style={[styles.infoHalo, { backgroundColor: hexToRgba(selectedAccent, 0.16) }]} />
                <View style={[styles.infoOrb, { backgroundColor: selectedAccent }]} />
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{currentInfoStep.title}</Text>
                <Text style={styles.infoBody}>{currentInfoStep.body}</Text>
                <View style={styles.featureRow}>
                  <View style={[styles.featureDot, { backgroundColor: selectedAccent }]} />
                  <Text style={styles.featureText}>Offline-first task tracking</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={[styles.featureDot, { backgroundColor: selectedAccent }]} />
                  <Text style={styles.featureText}>Fast category and reminder setup</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={[styles.featureDot, { backgroundColor: selectedAccent }]} />
                  <Text style={styles.featureText}>A cohesive accent across the app</Text>
                </View>
              </View>

              <View style={styles.bottomBlock}>
                <Pressable
                  style={[
                    styles.secondaryButton,
                    {
                      backgroundColor: selectedAccent,
                      shadowColor: selectedAccent,
                    },
                  ]}
                  onPress={handleContinue}
                >
                  <Text style={styles.secondaryButtonLabel}>{isLastStep ? 'Enter App' : 'Continue'}</Text>
                  <MaterialCommunityIcons name="arrow-right" size={24} color={COLORS.background} />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#12151A',
  },
  phoneShell: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  phoneFrame: {
    flex: 1,
    borderRadius: 44,
    borderWidth: 9,
    borderColor: '#B7BEC9',
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 32,
  },
  paletteLayout: {
    flex: 1,
    justifyContent: 'space-between',
  },
  paletteTitleWrap: {
    paddingTop: 140,
    alignItems: 'center',
  },
  paletteTitle: {
    color: '#B8B8BC',
    fontSize: 33,
    fontWeight: '300',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  accentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 34,
    columnGap: 18,
    paddingHorizontal: 4,
    marginTop: -12,
  },
  swatchButton: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchGlow: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    transform: [{ scale: 1.28 }],
  },
  swatchRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  swatchCore: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  bottomBlock: {
    alignItems: 'center',
    gap: 18,
    paddingBottom: 6,
  },
  ctaButton: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    shadowColor: '#4DE0F6',
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  ctaGradient: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  ctaGradientStop: {
    flex: 1,
  },
  ctaLabel: {
    color: '#045F70',
    fontSize: 17,
    fontWeight: '700',
  },
  stepLabel: {
    color: '#284651',
    fontSize: 13,
    letterSpacing: 2.1,
    textAlign: 'center',
  },
  infoLayout: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 18,
  },
  infoHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingBottom: 8,
  },
  infoHalo: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
  },
  infoOrb: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 10,
    borderColor: hexToRgba('#FFFFFF', 0.08),
  },
  infoCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#1D232C',
    backgroundColor: '#06080C',
    padding: 24,
    gap: 14,
  },
  infoTitle: {
    color: COLORS.textPrimary,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '700',
  },
  infoBody: {
    color: '#B4B8BE',
    fontSize: 16,
    lineHeight: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  featureText: {
    color: '#D5D7DB',
    fontSize: 14,
  },
  secondaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  secondaryButtonLabel: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
