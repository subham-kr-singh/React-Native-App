export const theme = {
  colors: {
    // Elite Dark Palette
    background: "#0E0E11", // Deepest midnight
    surface: "#1C1C1E",    // Secondary surface
    
    // Premium Glass tokens
    glass: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.12)",
    
    // Elite Accents
    primary: "#00E5FF",    // Electric Cyan
    secondary: "#007AFF",  // iOS Blue
    accent: "#00E5FF",
    
    // Status
    success: "#2EE6A6",    // Mint Emerald
    warning: "#FF6A3D",    // Sunset Orange
    error: "#FF453A",      // Apple Red
    
    // Typography
    text: {
      primary: "#F5F7FA",
      secondary: "#9AA4B2",
      muted: "#6B7280",
      inverse: "#000000"
    },
    
    divider: "rgba(255, 255, 255, 0.05)",
    mapOverlay: "rgba(14, 14, 17, 0.8)",
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
    m: 16,
    l: 24,
    xl: 32,
    round: 100,
    none: 0
  },
  
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5
    },
    premium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.5,
      shadowRadius: 30,
      elevation: 20,
    }
  }
};

export const COLORS = theme.colors;
