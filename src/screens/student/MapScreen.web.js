import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { theme } from '../../components/ui/theme';
import { StatusBar } from 'expo-status-bar';

const MapScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.centerContent}>
                <Text style={styles.title}>Map View</Text>
                <Text style={styles.subtitle}>Maps are currently available on mobile devices only.</Text>
                <View style={styles.placeholderMap}>
                    <Text style={{fontSize: 50}}>🗺️</Text>
                </View>
                <Text style={styles.hint}>Please use the "Smart Commute" tab for the web prototype logic.</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: theme.colors.glass.background,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        width: '80%',
        maxWidth: 500,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: 20,
    },
    placeholderMap: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    hint: {
        fontSize: 12,
        color: theme.colors.text.muted,
        textAlign: 'center',
        fontStyle: 'italic',
    }
});

export default MapScreen;
