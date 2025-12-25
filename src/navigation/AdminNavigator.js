import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import RouteBuilder from '../screens/admin/RouteBuilder';
import { theme } from '../components/ui/theme';

const Stack = createNativeStackNavigator();

const AdminNavigator = () => {
    return (
        <Stack.Navigator 
            screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background }
            }}
        >
            <Stack.Screen name="Dashboard" component={AdminDashboardScreen} />
            <Stack.Screen 
                name="RouteBuilder" 
                component={RouteBuilder} 
                options={{ 
                    headerShown: true, 
                    title: 'New Route',
                    headerTintColor: theme.colors.text.primary,
                    headerTransparent: true,
                    headerTitleStyle: { fontWeight: '700' },
                }} 
            />
        </Stack.Navigator>
    );
};

export default AdminNavigator;
