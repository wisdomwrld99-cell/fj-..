/**
 * Plainly Design System Tokens
 * Strict adherence to:
 * - Accent: Soft blue-green (calm, medical-adjacent, not clinical)
 * - Typographic scale: 12 / 14 / 16 / 20 / 28
 * - Spacing scale: 4 / 8 / 12 / 16 / 24 / 32
 * - Radii: Card 12px, Input 10px, Pill 999px
 * - Min tap target: 44px
 */

export const THEME = {
  colors: {
    primary: {
      DEFAULT: '#2D7A78', // Soft blue-green
      hover: '#246664',
      light: '#E6F4F1',
      border: '#A7D7D2',
    },
    accent: '#3AAFA9',
    canvas: {
      light: '#F8FAFC',
      dark: '#0B1120',
    },
    surface: {
      light: '#FFFFFF',
      dark: '#1E293B',
      mutedLight: '#F1F5F9',
      mutedDark: '#0F172A',
    },
    border: {
      light: '#E2E8F0',
      dark: '#334155',
    },
    text: {
      primaryLight: '#0F172A',
      secondaryLight: '#475569',
      mutedLight: '#64748B',
      primaryDark: '#F8FAFC',
      secondaryDark: '#CBD5E1',
      mutedDark: '#94A3B8',
    },
    status: {
      clear: {
        bg: '#ECFDF5',
        border: '#A7F3D0',
        text: '#065F46',
        icon: '#059669',
      },
      partly_clear: {
        bg: '#FFFBEB',
        border: '#FDE68A',
        text: '#92400E',
        icon: '#D97706',
      },
      not_found: {
        bg: '#F8FAFC',
        border: '#E2E8F0',
        text: '#475569',
        icon: '#64748B',
      },
    },
  },
  typography: {
    xs: 'text-[12px] leading-4',
    sm: 'text-[14px] leading-5',
    base: 'text-[16px] leading-6',
    lg: 'text-[20px] leading-7 font-semibold',
    xl: 'text-[28px] leading-9 font-bold',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    base: '16px',
    lg: '24px',
    xl: '32px',
  },
  radius: {
    card: 'rounded-[12px]',
    input: 'rounded-[10px]',
    pill: 'rounded-full',
  },
  touchTarget: 'min-h-[44px] min-w-[44px]',
};
