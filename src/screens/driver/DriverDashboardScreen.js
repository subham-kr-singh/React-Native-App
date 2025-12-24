import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { getDriverSchedule, broadcastLocation } from '../../api/driver';

export default function DriverDashboardScreen() {
    const { logout, userToken, isDemo } = useAuth();
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


        // Start watching position
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Driver Dashboard</Text>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#3b82f6" />
                ) : schedule ? (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Today's Schedule</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Route:</Text>
                            <Text style={styles.value}>{schedule.routeName || 'Route 101'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Bus:</Text>
                            {isTripActive ? (
                                <Text style={styles.value}>{busNumber}</Text>
                            ) : (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Bus No"
                                    value={busNumber}
                                    onChangeText={setBusNumber}
                                />
                            )}
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Time:</Text>
                            <Text style={styles.value}>{schedule.startTime || '08:00 AM'}</Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                isTripActive ? styles.stopButton : styles.startButton
                            ]}
                            onPress={isTripActive ? stopTrip : startTrip}
                        >
                            <Text style={styles.actionButtonText}>
                                {isTripActive ? 'STOP TRIP' : 'START TRIP'}
                            </Text>
                        </TouchableOpacity>

                        {isTripActive && (
                            <View style={styles.liveIndicator}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>Broadcasting Location...</Text>
                            </View>
                        )}

                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No schedule assigned for today.</Text>
                        <TouchableOpacity style={styles.refreshButton} onPress={fetchSchedule}>
                            <Text style={styles.refreshText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    logoutButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#fee2e2',
        borderRadius: 20,
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: '700',
        fontSize: 14,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 24,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 24,
        color: '#1e293b',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 0,
        borderBottomWidth: 0,
    },
    label: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '500',
    },
    value: {
        color: '#0f172a',
        fontSize: 18,
        fontWeight: '600',
    },
    actionButton: {
        marginTop: 32,
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    startButton: {
        backgroundColor: '#22c55e',
    },
    stopButton: {
        backgroundColor: '#ef4444',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
        marginBottom: 24,
    },
    refreshButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    refreshText: {
        color: '#2563eb',
        fontWeight: '600',
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        backgroundColor: '#fef2f2',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'center',
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        marginRight: 8,
    },
    liveText: {
        color: '#ef4444',
        fontWeight: '700',
        letterSpacing: 0.5
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        minWidth: 120,
        fontSize: 18,
        color: '#0f172a',
        paddingVertical: 4,
        textAlign: 'right'
    }
});
