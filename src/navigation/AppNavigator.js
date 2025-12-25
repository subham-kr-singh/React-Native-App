import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen'; 
import StudentNavigator from './StudentNavigator';
import DriverNavigator from './DriverNavigator';
import AdminNavigator from './AdminNavigator';
import { theme } from '../components/ui/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { token, role, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!token ? (
                    // No token found, user isn't signed in
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    // User is signed in
                    role === 'STUDENT' ? (
                        <Stack.Screen name="StudentStack" component={StudentNavigator} />
                    ) : role === 'DRIVER' ? (
                        <Stack.Screen name="DriverStack" component={DriverNavigator} />
                    ) : role === 'ADMIN' ? (
                        <Stack.Screen name="AdminStack" component={AdminNavigator} />
                    ) : (
                        // Fallback
                        <Stack.Screen name="Login" component={LoginScreen} />
                    )
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
