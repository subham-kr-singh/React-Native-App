import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from './theme';
import { Ionicons } from '@expo/vector-icons';

export const GlassInput = ({ 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  icon, 
  label 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper, 
        isFocused && styles.focusedBorder
      ]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={styles.contentRow}>
          {icon && (
            <Ionicons 
              name={icon} 
              size={20} 
              color={theme.colors.text.secondary} 
              style={styles.icon} 
            />
          )}
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.muted}
            secureTextEntry={secureTextEntry}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  inputWrapper: {
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
    backgroundColor: 'rgba(0,0,0,0.2)',
    height: 56,
    justifyContent: 'center',
  },
  focusedBorder: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: 16,
  },
});
