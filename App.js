import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import AdminNavigator from './src/navigation/AdminNavigator';
import StudentNavigator from './src/navigation/StudentNavigator';
import DriverNavigator from './src/navigation/DriverNavigator';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const AppContent = () => {
    const { role, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    if (!role) {
        return <LoginScreen />;
    }

    return (
        <NavigationContainer>
            {role === 'ADMIN' && <AdminNavigator />}
            {role === 'STUDENT' && <StudentNavigator />}
            {role === 'DRIVER' && <DriverNavigator />}
        </NavigationContainer>
    );
};

export default function App() {
  return (
    <SafeAreaProvider>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </SafeAreaProvider>
  );
}