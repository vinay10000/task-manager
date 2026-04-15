import { getThemeColors } from '../constants/theme';
import { useAppState } from './useAppState';

export function useThemeColors() {
  const { settings } = useAppState();
  return getThemeColors(settings.displayMode);
}
