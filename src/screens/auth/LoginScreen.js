import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loginDemo, isLoading } = useAuth();

    const [activeDemo, setActiveDemo] = useState(null);

    const handleLogin = async (emailToUse, passToUse) => {
        const e = emailToUse || email;
        const p = passToUse || password;

        if (!e || !p) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            await login(e, p);
        } catch (error) {
            console.error(error);
            Alert.alert('Login Failed', error.message || 'Something went wrong');
        }
    };

    const fillDemo = (role) => {
        let e = '', p = 'password';
        if (role === 'student') e = 'student@example.com';
        if (role === 'driver') e = 'driver@example.com';
        if (role === 'admin') e = 'admin@example.com';

        setEmail(e);
        setPassword(p);
        setActiveDemo(role);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <React.Fragment>
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.contentContainer}>
                            <View style={styles.headerContainer}>
                                <View style={styles.iconCircle}>
                                    <Text style={styles.headerIcon}>🚍</Text>
                                </View>
                                <Text style={styles.title}>Bus Tracker</Text>
                                <Text style={styles.subtitle}>Welcome back, please sign in</Text>
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="name@example.com"
                                        placeholderTextColor="#94a3b8"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#94a3b8"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => handleLogin()}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.buttonText}>Sign In</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Offline Demo Access (Backend Down)</Text>
                                <View style={styles.demoRow}>
                                    <TouchableOpacity
                                        style={[styles.demoChip, activeDemo === 'student' && styles.demoChipActive]}
                                        onPress={() => { fillDemo('student'); loginDemo('STUDENT'); }}
                                    >
                                        <Text style={[styles.demoText, activeDemo === 'student' && styles.demoTextActive]}>🎓 Student</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.demoChip, activeDemo === 'driver' && styles.demoChipActive]}
                                        onPress={() => { fillDemo('driver'); loginDemo('DRIVER'); }}
                                    >
                                        <Text style={[styles.demoText, activeDemo === 'driver' && styles.demoTextActive]}>👮 Driver</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.demoChip, activeDemo === 'admin' && styles.demoChipActive]}
                                        onPress={() => { fillDemo('admin'); loginDemo('ADMIN'); }}
                                    >
                                        <Text style={[styles.demoText, activeDemo === 'admin' && styles.demoTextActive]}>👔 Admin</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </React.Fragment>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    keyboardView: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerIcon: {
        fontSize: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    formContainer: {
        width: '100%',
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 24,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#0f172a',
    },
    button: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center'
    },
    footerText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    demoRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
        flexWrap: 'wrap'
    },
    demoChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    demoChipActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#2563eb',
    },
    demoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    demoTextActive: {
        color: '#2563eb',
    }
});
