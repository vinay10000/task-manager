import { useContext } from 'react';

import { AppContext } from '../context/AppProvider';

export function useAppState() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return value;
}
