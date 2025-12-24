import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import StudentHomeScreen from '../screens/student/StudentHomeScreen';

import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { userToken, userRole, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {userToken == null ? (
                    // No token found, user isn't signed in
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    // User is signed in
                    userRole === 'STUDENT' ? (
                        <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
                    ) : userRole === 'DRIVER' ? (
                        <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
                    ) : userRole === 'ADMIN' ? (
                        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                    ) : (

                        // Fallback
                        <Stack.Screen name="Login" component={LoginScreen} />
                    )
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
