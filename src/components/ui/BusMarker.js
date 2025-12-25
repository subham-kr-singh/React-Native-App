import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { theme } from './theme';

export const BusMarker = ({ busId, eta }) => {
    // Pulse animation
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        scale.value = withRepeat(
            withTiming(1.6, { duration: 1500 }),
            -1,
            true
        );
        opacity.value = withRepeat(
            withTiming(0, { duration: 1500 }),
            -1,
            true
        );
    }, []);

    const animatedRingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <View style={styles.container}>
            {/* ETA Bubble */}
            <View style={styles.etaBubble}>
                <Text style={styles.etaText}>{eta || 'Live'}</Text>
            </View>

            {/* Marker */}
            <View style={styles.markerWrapper}>
                <Animated.View style={[styles.pulseRing, animatedRingStyle]} />
                <View style={styles.busCircle}>
                    <Text style={styles.busIcon}>🚌</Text>
                </View>
                <View style={styles.point} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
    },
    markerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(99, 102, 241, 0.4)', // Primary color opacity
    },
    busCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        zIndex: 2,
    },
    busIcon: {
        fontSize: 18,
    },
    point: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderStyle: 'solid',
        backgroundColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: theme.colors.primary,
        marginTop: -2,
        zIndex: 1,
    },
    etaBubble: {
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    etaText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.text.primary, // This might be white on white if not careful, checking theme... text.primary is #F8FAFC (white).
        // Wait, etaBubble bg is #fff. Text should be dark.
        // Let's force dark text for this specific bubble.
        color: '#0F172A', 
    }
});
