import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../components/ui/theme';
import { useAuth } from '../context/AuthContext';
import * as Haptics from 'expo-haptics';
import { GlassInput } from '../components/ui/GlassInput';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!email || !password) {
      Alert.alert('Incomplete', 'Credentials are required.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Access Denied', result.msg);
      }
    } catch (error) {
      Alert.alert('Connectivity Error', 'Remote server unreachable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.brandTitle}>RouteForge</Text>
              <View style={styles.brandUnderline} />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>ACCOUNT LOGIN</Text>
              
              <View style={styles.inputWrapper}>
                <GlassInput
                  placeholder="Email Address"
                  placeholderTextColor={theme.colors.text.muted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  style={styles.customInput}
                />
              </View>

              <View style={styles.inputWrapper}>
                <GlassInput
                  placeholder="Access Password"
                  placeholderTextColor={theme.colors.text.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.customInput}
                />
              </View>

              <TouchableOpacity 
                style={[styles.loginBtn, (!email || !password || loading) && styles.disabledBtn]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#000" /> : (
                  <Text style={styles.loginText}>CONTINUE</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Secure Access Portal • v2.0</Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inner: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  header: {
    paddingTop: 100,
    paddingBottom: 60,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '200',
    color: theme.colors.text.primary,
    letterSpacing: -1.5,
  },
  brandUnderline: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.text.muted,
    letterSpacing: 2,
    marginBottom: 20
  },
  inputWrapper: {
    marginBottom: 15,
  },
  customInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    height: 60,
    color: '#FFF',
  },
  loginBtn: {
    backgroundColor: theme.colors.primary,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    boxShadow: '0 8px 20px rgba(0, 229, 255, 0.2)',
  },
  disabledBtn: {
    backgroundColor: '#333',
    boxShadow: 'none',
  },
  loginText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  footer: {
    marginTop: 50,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 10,
    color: theme.colors.text.muted,
    letterSpacing: 1,
    fontWeight: 'bold'
  }
});
