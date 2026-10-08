import { Platform } from 'react-native';
import { Palette } from './colors';

export const Colors = {
  light: {
    text: Palette.light.text,
    background: Palette.light.background,
    backgroundElement: Palette.light.surfaceSubtle,
    backgroundSelected: Palette.primaryLight,
    textSecondary: Palette.light.textSecondary,
    textMuted: Palette.light.textMuted,
    border: Palette.light.cardBorder,
    card: Palette.light.card,
    tint: Palette.primary,
  },
  dark: {
    text: Palette.dark.text,
    background: Palette.dark.background,
    backgroundElement: Palette.dark.surfaceSubtle,
    backgroundSelected: '#1E1B4B',
    textSecondary: Palette.dark.textSecondary,
    textMuted: Palette.dark.textMuted,
    border: Palette.dark.cardBorder,
    card: Palette.dark.card,
    tint: Palette.primaryMuted,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  // Backward compatibility with template
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;

export const Shadows = {
  subtle: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
    default: {
      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
    },
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: {
      elevation: 3,
    },
    default: {
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
    },
  }),
  floating: Platform.select({
    ios: {
      shadowColor: Palette.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {
      boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
    },
  }),
  modal: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 28,
    },
    android: {
      elevation: 10,
    },
    default: {
      boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
    },
  }),
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
