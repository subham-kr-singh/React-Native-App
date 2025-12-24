import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as loginApi } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isDemo, setIsDemo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const data = await loginApi(email, password);
            const token = data.token || data.accessToken;
            const role = data.role;

            if (token && role) {
                setUserToken(token);
                setUserRole(role);
                setIsDemo(false);
                await SecureStore.setItemAsync('userToken', token);
                await SecureStore.setItemAsync('userRole', role);
                await SecureStore.deleteItemAsync('isAppDemoMode'); // Clear demo flag
            } else {
                throw new Error("Invalid response from server");
            }

            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            if (e.message.includes("503") || e.message.includes("Network")) {
                Alert.alert("Server Unavailable", "The backend server appears to be down. Try Demo Mode.");
            } else {
                throw e;
            }
        }
    };

    const loginDemo = async (role) => {
        setIsLoading(true);
        const token = "demo-token-" + Math.random().toString(36).substr(2);
        setUserToken(token);
        setUserRole(role);
        setIsDemo(true);
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userRole', role);
        await SecureStore.setItemAsync('isAppDemoMode', 'true');
        setIsLoading(false);
    };

    const logout = async () => {
        setIsLoading(true);
        setUserToken(null);
        setUserRole(null);
        setIsDemo(false);
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userRole');
        await SecureStore.deleteItemAsync('isAppDemoMode');
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let token = await SecureStore.getItemAsync('userToken');
            let role = await SecureStore.getItemAsync('userRole');
            let demo = await SecureStore.getItemAsync('isAppDemoMode');

            if (token && role) {
                setUserToken(token);
                setUserRole(role);
                if (demo === 'true') setIsDemo(true);
            }
            setIsLoading(false);
        } catch (e) {
            console.log(`Login Error ${e}`);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, loginDemo, logout, isLoading, userToken, userRole, isDemo }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
