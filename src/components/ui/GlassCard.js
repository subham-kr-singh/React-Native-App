import React from 'react';
import { View, StyleSheet } from 'react-native';
import { appleTheme } from './AppleTheme';

export const GlassCard = ({ children, style, variant = 'default' }) => {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: appleTheme.colors.surface,
    borderRadius: appleTheme.borderRadius.l,
    padding: appleTheme.spacing.l,
    // Typical iOS Card Shadow
    shadowColor: appleTheme.shadows.medium.shadowColor,
    shadowOffset: appleTheme.shadows.medium.shadowOffset,
    shadowOpacity: appleTheme.shadows.medium.shadowOpacity,
    shadowRadius: appleTheme.shadows.medium.shadowRadius,
    elevation: appleTheme.shadows.medium.elevation,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)', // Very subtle border
  },
  glass: {
     // Optional: For actual blur cases (like dynamic island)
     backgroundColor: 'rgba(255,255,255,0.85)',
  }
});
