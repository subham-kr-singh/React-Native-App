import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { theme } from './theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassButton = ({ onPress, title, variant = 'primary', icon, style, loading }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  // Gradient Colors
  const colors = variant === 'primary' 
    ? [theme.colors.primary, '#4F46E5'] 
    : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'];

  const textColor = variant === 'primary' ? '#FFF' : theme.colors.text.primary;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle, style]}
      disabled={loading}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <Text style={[styles.text, { color: textColor }]}>
          {loading ? 'Processing...' : title}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
