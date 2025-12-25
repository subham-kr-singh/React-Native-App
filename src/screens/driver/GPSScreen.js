import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated as NativeAnimated } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import * as Location from 'expo-location';
import { driverAPI } from '../../services/api';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { GlassCard } from '../../components/ui/GlassCard';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../components/ui/theme';
import { StatusBar } from 'expo-status-bar';

const GPSScreen = () => {
    const { logout } = useAuth();
    const [isSharing, setIsSharing] = useState(false);
    const subscription = useRef(null);
    const [currentSpeed, setCurrentSpeed] = useState(0);

    // Animation for pulse
    const pulseAnim = useRef(new NativeAnimated.Value(1)).current;

    useEffect(() => {
        if (isSharing) {
            NativeAnimated.loop(
                NativeAnimated.sequence([
                    NativeAnimated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    NativeAnimated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }

        return () => {
            if (subscription.current) {
                subscription.current.remove();
            }
        };
    }, [isSharing]);

    const toggleSharing = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (isSharing) {
            stopSharing();
        } else {
            startSharing();
        }
    };

    const startSharing = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Allow location access to share GPS.');
            return;
        }

        setIsSharing(true);
        // Alert.alert("GPS Started", "Broadcasting location..."); // Removed alert for smoother UX
        
        try {
            subscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 2000,
                    distanceInterval: 5,
                },
                (location) => {
                     const speedKmh = (location.coords.speed || 0) * 3.6;
                     setCurrentSpeed(Math.round(speedKmh));
                     
                     driverAPI.updateLocation({
                         busNumber: "BH-01",
                         latitude: location.coords.latitude,
                         longitude: location.coords.longitude,
                         speed: speedKmh
                     }).catch(err => console.log("Upload failed"));
                }
            );
        } catch (e) {
            console.error(e);
            setIsSharing(false);
        }
    };

    const stopSharing = () => {
        if (subscription.current) {
            subscription.current.remove();
            subscription.current = null;
        }
        setIsSharing(false);
        setCurrentSpeed(0);
    };

    return (
        <GradientBackground>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good Evening,</Text>
                        <Text style={styles.driverName}>Driver Ramesh</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Action Area */}
                <View style={styles.mainActionContainer}>
                    <TouchableOpacity onPress={toggleSharing} activeOpacity={0.8}>
                        <NativeAnimated.View style={[
                            styles.pulseRing, 
                            { transform: [{ scale: pulseAnim }], opacity: isSharing ? 0.3 : 0 }
                        ]} />
                        <View style={[styles.mainButton, isSharing ? styles.btnStop : styles.btnStart]}>
                            <Text style={styles.btnIcon}>{isSharing ? '⬛' : '▶'}</Text>
                            <Text style={styles.btnLabel}>{isSharing ? 'STOP' : 'START'}</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.statusText}>
                        {isSharing ? 'YOU ARE LIVE' : 'OFFLINE'}
                    </Text>
                </View>

                {/* Metrics */}
                 <GlassCard style={styles.metricsCard} intensity={20}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>SPEED</Text>
                        <Text style={styles.metricValue}>{currentSpeed}</Text>
                        <Text style={styles.metricUnit}>km/h</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>NEXT STOP</Text>
                        <Text style={styles.metricValueSm}>Main Gate</Text>
                        <Text style={styles.metricUnit}>2.1 km</Text>
                    </View>
                 </GlassCard>
            </View>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 60,
    },
    greeting: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
    },
    driverName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    logoutBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    logoutText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    mainActionContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 60,
    },
    pulseRing: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: COLORS.error,
        top: -40,
        left: -40,
    },
    mainButton: {
        width: 220,
        height: 220,
        borderRadius: 110,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
    },
    btnStart: {
        backgroundColor: COLORS.success, // Emerald
        borderColor: 'rgba(255,255,255,0.2)',
    },
    btnStop: {
        backgroundColor: COLORS.error, // Red
        borderColor: 'rgba(255,255,255,0.2)',
    },
    btnIcon: {
        fontSize: 40,
        color: '#fff',
        marginBottom: 10,
    },
    btnLabel: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
    },
    statusText: {
        marginTop: 30,
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 3,
        opacity: 0.8,
    },
    metricsCard: {
        flexDirection: 'row',
        padding: 24,
        borderRadius: 24,
    },
    metricItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 10,
    },
    metricLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 5,
        letterSpacing: 1,
    },
    metricValue: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
    },
    metricValueSm: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    metricUnit: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    }
});

export default GPSScreen;
