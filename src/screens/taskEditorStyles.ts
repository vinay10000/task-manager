import { StyleSheet } from 'react-native';

import { COLORS } from '../constants/theme';

export const CTA_GRADIENT = ['#A6F1FF', '#61E6FA', '#19D7F0'];

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardWrap: {
    justifyContent: 'flex-end',
  },
  sheet: {
    minHeight: '72%',
    maxHeight: '88%',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  handle: {
    width: 56,
    height: 5,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeButton: {
    padding: 2,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 10,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  titleInput: {
    minHeight: 86,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    paddingVertical: 0,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  quickChipLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  inlineComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  inlineInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
  },
  miniButton: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  miniButtonLabel: {
    fontWeight: '700',
  },
  tagPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  tagLabel: {
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  advancedCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  categoryText: {
    fontWeight: '700',
  },
  notesInput: {
    minHeight: 92,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  smallInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  reminderText: {
    flex: 1,
    gap: 4,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonLabel: {
    fontWeight: '700',
  },
  subtaskList: {
    gap: 10,
  },
  subtaskRow: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subtaskText: {
    flex: 1,
    fontSize: 14,
  },
  removeText: {
    color: COLORS.destructive,
    fontWeight: '700',
  },
  optionPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionPillLabel: {
    fontWeight: '700',
    fontSize: 13,
  },
  ctaButton: {
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
    shadowColor: '#3FE6F6',
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  ctaGradient: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  ctaGradientStop: {
    flex: 1,
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: '900',
    color: '#051B20',
  },
});
