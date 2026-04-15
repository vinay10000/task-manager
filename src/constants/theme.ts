import { DisplayMode } from '../types/models';

export const COLORS = {
  background: '#000000',
  card: '#0A0A0A',
  input: '#111111',
  modal: '#1A1A1A',
  border: '#222222',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#666666',
  destructive: '#FF4444',
  success: '#22C55E',
};

export type ThemeColors = typeof COLORS;

const OLED_COLORS: ThemeColors = {
  ...COLORS,
  background: '#000000',
  card: '#000000',
  input: '#050505',
  modal: '#050505',
  border: '#171717',
};

const BLACK_COLORS: ThemeColors = {
  ...COLORS,
  background: '#050505',
  card: '#111111',
  input: '#171717',
  modal: '#181818',
  border: '#252525',
};

export function getThemeColors(displayMode: DisplayMode): ThemeColors {
  return displayMode === 'oled' ? OLED_COLORS : BLACK_COLORS;
}

export const ACCENT_OPTIONS = [
  { name: 'Ice', value: '#C2F5FF' },
  { name: 'Electric Violet', value: '#8933F1' },
  { name: 'Mint', value: '#54D485' },
  { name: 'Sun', value: '#FFC215' },
  { name: 'Hot Pink', value: '#FF0088' },
  { name: 'Royal Purple', value: '#6511B7' },
  { name: 'Neon Green', value: '#38DD2D' },
  { name: 'Scarlet', value: '#F21649' },
  { name: 'Blue', value: '#125BC8' },
  { name: 'Gold', value: '#E2BC36' },
  { name: 'Silver', value: '#CFCFCF' },
  { name: 'Orchid', value: '#BB46CB' },
] as const;

export const DEFAULT_CATEGORY_NAMES = ['Personal', 'Work', 'Errands', 'Ideas'] as const;
export const PRIORITY_OPTIONS = ['high', 'medium', 'low'] as const;

export const REMINDER_OPTIONS = [
  { label: 'At time of task', value: 'exact' },
  { label: '5 minutes before', value: '5min' },
  { label: '15 minutes before', value: '15min' },
  { label: '1 hour before', value: '1hr' },
] as const;
