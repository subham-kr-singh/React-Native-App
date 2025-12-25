export const appleTheme = {
  colors: {
    background: '#F2F2F7', // iOS System Gray 6 (Light)
    surface: '#FFFFFF',
    primary: '#007AFF', // iOS System Blue
    secondary: '#5856D6', // iOS System Indigo
    success: '#34C759', // iOS System Green
    warning: '#FF9500', // iOS System Orange
    danger: '#FF3B30', // iOS System Red
    text: {
      primary: '#000000',
      secondary: '#8E8E93', // iOS System Gray
      tertiary: '#C7C7CC', // iOS System Gray 4
      inverse: '#FFFFFF',
    },
    border: '#E5E5EA', // iOS System Gray 5
    glass: {
      background: 'rgba(255, 255, 255, 0.75)',
      darkBroadcast: 'rgba(28, 28, 30, 0.6)', // iOS System Gray 6 (Dark)
      stroke: 'rgba(255, 255, 255, 0.3)',
    }
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 20, // Standard iOS Card Radius
    xl: 32,
    round: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 10,
    },
  },
  typography: {
    largeTitle: {
      fontSize: 34,
      fontWeight: '700',
      letterSpacing: 0.37,
    },
    title1: {
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: 0.36,
    },
    title2: {
      fontSize: 22,
      fontWeight: '600',
      letterSpacing: 0.35,
    },
    title3: {
      fontSize: 20,
      fontWeight: '600',
      letterSpacing: 0.38,
    },
    headline: {
      fontSize: 17,
      fontWeight: '600',
      letterSpacing: -0.41,
    },
    body: {
      fontSize: 17,
      fontWeight: '400',
      letterSpacing: -0.41,
    },
    callout: {
      fontSize: 16,
      fontWeight: '400',
      letterSpacing: -0.32,
    },
    subhead: {
      fontSize: 15,
      fontWeight: '400',
      letterSpacing: -0.24,
    },
    footnote: {
      fontSize: 13,
      fontWeight: '400',
      letterSpacing: -0.08,
    },
    caption1: {
      fontSize: 12,
      fontWeight: '400',
      letterSpacing: 0,
    },
  }
};
