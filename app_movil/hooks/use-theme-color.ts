import { useColorScheme } from './use-color-scheme';
import { Colors } from '../constants/theme';

type ThemeColorName = keyof typeof Colors.light;

type ThemeProps = {
  light?: string;
  dark?: string;
};

export function useThemeColor(props: ThemeProps, colorName: ThemeColorName) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = theme === 'dark' ? props.dark : props.light;
  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[theme][colorName];
}
