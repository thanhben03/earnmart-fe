// EarnMart Design System Tokens (UI/UX Pro Max)
// Spec reference: docs/specs/AGENT_SPEC_Virtual_Shop_React_Native.docx

export const Colors = {
  primary: '#FF6B35',
  primaryLight: '#FFF0EB',
  primaryDark: '#E0531F',
  
  darkInk: '#172033',
  
  accent: '#16B8A6',
  accentLight: '#E6F7F5',
  accentDark: '#0D9488',
  
  goldCoin: '#F5B942',
  goldCoinLight: '#FEF7E8',
  goldCoinDark: '#D99B26',
  
  background: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F3F9',
  surfaceAlt: '#F8FAFC',
  
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  
  textPrimary: '#172033',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  
  error: '#E45454',
  errorLight: '#FEE2E2',
  
  success: '#10B981',
  successLight: '#D1FAE5',
  
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  
  overlay: 'rgba(23, 32, 51, 0.5)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 40,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  modal: {
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const Typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  titleMedium: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  micro: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600' as const,
  },
};
