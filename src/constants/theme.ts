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

export const ACCENT_OPTIONS = [
  { name: 'Cyan', value: '#06D6A0' },
  { name: 'Rose', value: '#FF6B8A' },
  { name: 'Lime', value: '#BFFF00' },
  { name: 'Violet', value: '#A78BFA' },
  { name: 'Amber', value: '#FFB627' },
  { name: 'Coral', value: '#FF7F50' },
  { name: 'Mint', value: '#2DD4BF' },
  { name: 'Peach', value: '#FBBF77' },
] as const;

export const DEFAULT_CATEGORY_NAMES = ['Personal', 'Work', 'Errands', 'Ideas'] as const;
export const PRIORITY_OPTIONS = ['high', 'medium', 'low'] as const;

export const REMINDER_OPTIONS = [
  { label: 'At time of task', value: 'exact' },
  { label: '5 minutes before', value: '5min' },
  { label: '15 minutes before', value: '15min' },
  { label: '1 hour before', value: '1hr' },
] as const;
