import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { appleTheme } from '../../components/ui/AppleTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { driverAPI } from '../../services/api';
const { getTodaySchedule: getDriverSchedule, updateLocation: broadcastLocation } = driverAPI;

export default function DriverDashboardScreen() {
    const { logout, isDemo } = useAuth();
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTripActive, setIsTripActive] = useState(false);
    const [locationSubscription, setLocationSubscription] = useState(null);
    const [busNumber, setBusNumber] = useState('');

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            if (isDemo) {
                // Mock Schedule
                setSchedule({
                    id: 999,
                    routeName: 'Demo Route 101',
                    busNumber: 'MP04-DEMO',
                    startTime: '09:00 AM'
                });
                setBusNumber('MP04-DEMO');
                setLoading(false);
                return;
            }

            const data = await getDriverSchedule();
            setSchedule(data);
            if (data?.busNumber) setBusNumber(data.busNumber);
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Could not fetch your schedule');
        } finally {
            setLoading(false);
        }
    };

    const startTrip = async () => {
        if (!schedule) return;
        if (!busNumber.trim()) {
            Alert.alert('Missing Info', 'Please enter your Bus Number before starting the trip.');
            return;
        }

        if (isDemo) {
            setIsTripActive(true);
            Alert.alert("Demo Mode", "Trip started! Location broadcasting is simulated.");
            return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location permission is needed to broadcast position.');
            return;
        }

        setIsTripActive(true);
        const sub = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 10,
            },
            (location) => {
                const { latitude, longitude, speed } = location.coords;
                broadcastLocation(schedule.id, latitude, longitude, speed, busNumber);
            }
        );
        setLocationSubscription(sub);
    };

    const stopTrip = () => {
        if (locationSubscription) {
            locationSubscription.remove();
            setLocationSubscription(null);
        }
        setIsTripActive(false);
    };

    return (
        <ScreenWrapper edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Driver Dashboard</Text>
                    <Text style={styles.subtext}>Welcome back, Captain</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color={theme.colors.danger} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                ) : schedule ? (
                    <GlassCard style={styles.card} intensity={20}>
                        <Text style={styles.cardTitle}>Today's Assignment</Text>
                        
                        <View style={styles.row}>
                            <Text style={styles.label}>Route</Text>
                            <Text style={styles.value}>{schedule.routeName || 'Route 101'}</Text>
                        </View>
                        
                        <View style={styles.row}>
                            <Text style={styles.label}>Bus No.</Text>
                            {isTripActive ? (
                                <Text style={styles.value}>{busNumber}</Text>
                            ) : (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Bus No"
                                    placeholderTextColor={theme.colors.text.muted}
                                    value={busNumber}
                                    onChangeText={setBusNumber}
                                />
                            )}
                        </View>
                        
                        <View style={styles.row}>
                            <Text style={styles.label}>Departure</Text>
                            <Text style={styles.value}>{schedule.startTime || '08:00 AM'}</Text>
                        </View>

                        <View style={styles.spacer} />

                        <GlassButton 
                            title={isTripActive ? "STOP TRIP" : "START TRIP"}
                            onPress={isTripActive ? stopTrip : startTrip}
                            variant={isTripActive ? 'danger' : 'primary'}
                            style={isTripActive ? { backgroundColor: theme.colors.danger } : {}}
                        />

                        {isTripActive && (
                            <View style={styles.liveIndicator}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>Broadcasting Location...</Text>
                            </View>
                        )}
                    </GlassCard>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No schedule assigned for today.</Text>
                        <GlassButton title="Refresh" onPress={fetchSchedule} variant="secondary" />
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: appleTheme.spacing.l,
        paddingTop: appleTheme.spacing.xl,
        paddingBottom: appleTheme.spacing.m,
    },
    title: {
        ...appleTheme.typography.largeTitle,
        color: appleTheme.colors.text.primary,
    },
    subtext: {
        ...appleTheme.typography.subhead,
        color: appleTheme.colors.text.secondary,
        marginTop: 4,
    },
    logoutButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 59, 48, 0.1)', // iOS Red tint
        borderRadius: appleTheme.borderRadius.round,
    },
    content: {
        flex: 1,
        padding: appleTheme.spacing.l,
    },
    card: {
        // GlassCard handles the base style now
    },
    cardTitle: {
        ...appleTheme.typography.title2,
        color: appleTheme.colors.text.primary,
        marginBottom: appleTheme.spacing.l,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: appleTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: appleTheme.colors.border,
    },
    label: {
        ...appleTheme.typography.body,
        color: appleTheme.colors.text.secondary,
    },
    value: {
        ...appleTheme.typography.headline,
        color: appleTheme.colors.text.primary,
    },
    input: {
        ...appleTheme.typography.headline,
        color: appleTheme.colors.primary,
        textAlign: 'right',
        minWidth: 150,
        paddingVertical: 4,
    },
    spacer: {
        height: appleTheme.spacing.xl,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: appleTheme.spacing.l,
        backgroundColor: 'rgba(52, 199, 89, 0.1)', // iOS Green tint
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: appleTheme.borderRadius.l,
    },
    liveDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: appleTheme.colors.success,
        marginRight: 8,
    },
    liveText: {
        ...appleTheme.typography.subhead,
        color: appleTheme.colors.success,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        ...appleTheme.typography.body,
        color: appleTheme.colors.text.secondary,
        marginBottom: 24,
    },
});
