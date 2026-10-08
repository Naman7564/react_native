export const Palette = {
  primary: '#4F46E5', // Indigo 600
  primaryHover: '#4338CA', // Indigo 700
  primaryLight: '#EEF2FF', // Indigo 50
  primaryDark: '#312E81', // Indigo 900
  primaryMuted: '#818CF8', // Indigo 400

  // Priority accents
  priority: {
    high: {
      color: '#EF4444',
      bg: '#FEF2F2',
      border: '#FECACA',
      darkBg: '#450A0A',
      darkBorder: '#7F1D1D',
    },
    medium: {
      color: '#F59E0B',
      bg: '#FFFBEB',
      border: '#FDE68A',
      darkBg: '#451A03',
      darkBorder: '#78350F',
    },
    low: {
      color: '#10B981',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      darkBg: '#022C22',
      darkBorder: '#064E3B',
    },
  },

  // Success / Completed
  success: '#10B981',
  successLight: '#ECFDF5',
  
  // Danger / Delete
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  
  // Neutrals - Light Theme
  light: {
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9', // Slate 100
    card: '#FFFFFF',
    cardBorder: '#E2E8F0', // Slate 200
    divider: '#E2E8F0',
    text: '#0F172A', // Slate 900
    textSecondary: '#475569', // Slate 600
    textMuted: '#64748B', // Slate 500
    textPlaceholder: '#94A3B8', // Slate 400
    inputBg: '#F8FAFC',
    inputBorder: '#E2E8F0',
    shadowColor: '#0F172A',
  },

  // Neutrals - Dark Theme
  dark: {
    background: '#090D16', // Deep Obsidian Slate
    surface: '#111827', // Slate 900
    surfaceSubtle: '#1F2937', // Slate 800
    card: '#111827',
    cardBorder: '#1F2937',
    divider: '#1F2937',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1', // Slate 300
    textMuted: '#94A3B8', // Slate 400
    textPlaceholder: '#64748B', // Slate 500
    inputBg: '#111827',
    inputBorder: '#1F2937',
    shadowColor: '#000000',
  },
} as const;

export type ThemePalette = typeof Palette.light;
