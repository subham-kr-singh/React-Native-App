import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { appleTheme } from './AppleTheme';

export const ScreenWrapper = ({ children, style }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={[styles.safeArea, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appleTheme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
});
