import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [role, setRole] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const storedRole = await AsyncStorage.getItem('role');
            const storedToken = await AsyncStorage.getItem('token');

            if (storedRole && storedToken) {
                setRole(storedRole);
                setToken(storedToken);
            }
        } catch (e) {
            console.error("Failed to load auth data", e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const data = await authAPI.login(email, password);
            
            // Response: { accessToken: "...", role: "..." }
            if (data && data.accessToken && data.role) {
                setRole(data.role);
                setToken(data.accessToken);
                await AsyncStorage.setItem('token', data.accessToken);
                await AsyncStorage.setItem('role', data.role);
                return { success: true };
            } else {
                 console.log("Invalid response structure:", data); // Debug log
                 return { success: false, msg: 'Invalid server response' };
            }
        } catch (error) {
            console.error('Login error helper:', error);
            let message = 'Login failed';
            if (!error.response) {
                message = 'Server not responding. Please check your internet or if the backend is UP.';
            } else if (error.response.status === 401 || error.response.status === 403) {
                message = 'Invalid email or password';
            } else if (error.response.data?.message) {
                message = error.response.data.message;
            }
            return { success: false, msg: message };
        }
    };

    const logout = async () => {
        setRole(null);
        setToken(null);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('role');
    };

    return (
        <AuthContext.Provider value={{ role, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
