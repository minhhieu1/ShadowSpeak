export const colors = {
  bg: '#F7F5F0',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F5',
  primary: '#0E5A6A',
  primaryPressed: '#0A4652',
  secondary: '#D97706',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#D6D9DE',
  focus: '#2563EB',
  success: '#1F8A70',
  warning: '#D97706',
  error: '#C2410C',
  info: '#2563EB',
  disabled: '#A8B0B8',
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
} as const;

export const radii = {
  card: 8,
  control: 12,
  full: 999,
} as const;

export const typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
  },
  h1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyEmphasis: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  bodySmallEmphasis: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  captionEmphasis: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
} as const;
