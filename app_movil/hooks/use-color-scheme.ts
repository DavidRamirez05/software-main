import { useColorScheme as nativeUseColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' | null {
  const colorScheme = nativeUseColorScheme();
  if (colorScheme === 'dark') return 'dark';
  if (colorScheme === 'light') return 'light';
  return null;
}
