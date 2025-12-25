import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, ActivityIndicator, SafeAreaView, Platform, Dimensions, Image, Animated } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../components/ui/theme';
import * as Haptics from 'expo-haptics';
import { studentAPI } from '../../services/api';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const SmartCommuteScreen = ({ navigation }) => {
    const [testMode, setTestMode] = useState(false);
    const [manualLocationName, setManualLocationName] = useState('OUTSIDE');
    const [loading, setLoading] = useState(false);
    const [commuteData, setCommuteData] = useState(null);
    const [error, setError] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchCommuteStatus();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start();
    }, [testMode, manualLocationName]);

    const fetchCommuteStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            let lat, lng;
            if (testMode) {
                lat = manualLocationName === 'INSIDE' ? 23.259933 : 23.2324;
                lng = manualLocationName === 'INSIDE' ? 77.412615 : 77.4303;
            } else {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setError('Location access required');
                    setLoading(false);
                    return;
                }
                let location = await Location.getCurrentPositionAsync({});
                lat = location.coords.latitude;
                lng = location.coords.longitude;
            }
            const data = await studentAPI.getCommuteStatus(lat, lng);
            setCommuteData(data);
            
            // Auto-select college as destination if incoming
            if (data.direction === 'INCOMING') {
                setSelectedDestination('College');
            }
        } catch (err) {
            setError("Server connection failed");
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="close" size={28} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Commute Status</Text>
            <TouchableOpacity onPress={fetchCommuteStatus} style={styles.refreshButton}>
                {loading ? <ActivityIndicator size="small" color={theme.colors.primary} /> : <Ionicons name="refresh" size={22} color={theme.colors.primary} />}
            </TouchableOpacity>
        </View>
    );

    const renderPhaseTitle = () => {
        if (!commuteData) return null;
        const isIncoming = commuteData.direction === 'INCOMING';
        return (
            <View style={styles.phaseHeader}>
                <Text style={styles.phaseMainTitle}>
                    {isIncoming ? "Heading to College" : "Leave College"}
                </Text>
                <Text style={styles.phaseSubTitle}>
                    {isIncoming ? "Buses arriving at your nearest stop" : "Pick your drop-off location"}
                </Text>
            </View>
        );
    };

    const renderRoutePanel = () => {
        if (!commuteData) return null;
        const isIncoming = commuteData.direction === 'INCOMING';

        return (
            <BlurView intensity={20} tint="dark" style={styles.glassCard}>
                <View style={styles.tripLineContainer}>
                    <View style={styles.tripDots}>
                        <View style={[styles.dot, { backgroundColor: isIncoming ? theme.colors.primary : theme.colors.success }]} />
                        <View style={styles.line} />
                        <View style={[styles.square, { backgroundColor: isIncoming ? theme.colors.success : theme.colors.primary }]} />
                    </View>
                    <View style={styles.tripDetails}>
                        <View style={styles.tripPoint}>
                            <Text style={styles.label}>FROM</Text>
                            <Text style={styles.value}>
                                {isIncoming ? (commuteData.nearestStop?.name || "Detecting Stop...") : "Oriental College"}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.tripPoint}>
                            <Text style={styles.label}>TO</Text>
                            <Text style={[styles.value, isIncoming ? { color: theme.colors.success, fontWeight: 'bold' } : styles.activeValue]}>
                                {isIncoming ? "Oriental College" : (selectedDestination || "Where to?")}
                            </Text>
                        </View>
                    </View>
                </View>
            </BlurView>
        );
    };

    const renderDestinationPicker = () => {
        // HIDE if incoming (destination is fixed to college)
        if (!commuteData || commuteData.direction === 'INCOMING') return null;

        return (
            <View style={styles.section}>
                <View style={styles.searchBarMock}>
                    <Ionicons name="search" size={18} color={theme.colors.primary} />
                    <Text style={styles.searchBarText}>Choose drop-off point</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizScroll}>
                    {['Indrapuri', 'MP Nagar', 'Anand Nagar', 'Bhopal Station', 'Chetak Bridge'].map((dest) => (
                        <TouchableOpacity 
                            key={dest}
                            style={[styles.pill, selectedDestination === dest && styles.pillActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSelectedDestination(dest);
                            }}
                        >
                            <Text style={[styles.pillText, selectedDestination === dest && styles.pillTextActive]}>{dest}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderBusList = () => {
        if (!commuteData) return null;
        const isIncoming = commuteData.direction === 'INCOMING';
        
        // Don't show buses until destination is picked (if outgoing)
        if (!isIncoming && !selectedDestination) {
            return (
                <View style={styles.hintContainer}>
                    <Ionicons name="bus-outline" size={48} color="rgba(255,255,255,0.05)" />
                    <Text style={styles.hintText}>Select a drop-off to view buses</Text>
                </View>
            );
        }

        const buses = commuteData.availableBuses || [];

        return (
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>
                    {isIncoming ? "INBOUND BUSES" : `BUSES TO ${selectedDestination?.toUpperCase()}`}
                </Text>
                {buses.length > 0 ? (
                    buses.map((bus, idx) => (
                        <TouchableOpacity key={idx} style={styles.busCard} onPress={() => Haptics.selectionAsync()}>
                            <View style={styles.busIconContainer}>
                                <Ionicons name="bus" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.busInfo}>
                                <View style={styles.busRow}>
                                    <Text style={styles.busNumber}>{bus.busNumber}</Text>
                                    <Text style={styles.busTime}>{idx * 2 + 5} min</Text>
                                </View>
                                <Text style={styles.busRoute}>{bus.routeName} • {bus.capacity} seats</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={theme.colors.text.muted} />
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No active buses detected</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {renderHeader()}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollView}>
                    {renderPhaseTitle()}
                    {renderRoutePanel()}
                    {renderDestinationPicker()}
                    {renderBusList()}

                    {/* Minimalist Dev Overlay */}
                    <View style={styles.devContainer}>
                        <View style={styles.devHeader}>
                            <Text style={styles.devLabel}>PROTOTYPE CONTROLS</Text>
                            <Switch 
                                value={testMode} 
                                onValueChange={setTestMode}
                                trackColor={{ false: '#333', true: theme.colors.primary }}
                                thumbColor="#FFF"
                            />
                        </View>
                        {testMode && (
                            <View style={styles.devToggles}>
                                <TouchableOpacity 
                                    style={[styles.devBtn, manualLocationName === 'OUTSIDE' && styles.devBtnActive]}
                                    onPress={() => setManualLocationName('OUTSIDE')}
                                >
                                    <Text style={styles.devBtnText}>At Home</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.devBtn, manualLocationName === 'INSIDE' && styles.devBtnActive]}
                                    onPress={() => setManualLocationName('INSIDE')}
                                >
                                    <Text style={styles.devBtnText}>At College</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </Animated.View>
            <TouchableOpacity style={styles.cta} activeOpacity={0.9}>
                <Text style={styles.ctaText}>START TRACKING</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 70,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        letterSpacing: 1,
    },
    refreshButton: {
        padding: 5,
    },
    scrollView: {
        paddingBottom: 120,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginBottom: 10,
    },
    statusPulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    statusText: {
        color: theme.colors.text.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    phaseHeader: {
        paddingHorizontal: 25,
        paddingTop: 10,
        marginBottom: 10,
    },
    phaseMainTitle: {
        fontSize: 24,
        fontWeight: '300',
        color: theme.colors.text.primary,
        letterSpacing: -0.5,
    },
    phaseSubTitle: {
        fontSize: 13,
        color: theme.colors.text.muted,
        marginTop: 4,
        fontWeight: '500',
    },
    glassCard: {
        margin: 25,
        marginTop: 15,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    tripLineContainer: {
        flexDirection: 'row',
    },
    tripDots: {
        alignItems: 'center',
        paddingVertical: 10,
        marginRight: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    line: {
        width: 1,
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 4,
    },
    square: {
        width: 8,
        height: 8,
    },
    tripDetails: {
        flex: 1,
    },
    tripPoint: {
        height: 45,
        justifyContent: 'center',
    },
    label: {
        fontSize: 10,
        color: theme.colors.text.muted,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    value: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginTop: 4,
        fontWeight: '500',
    },
    activeValue: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 12,
    },
    section: {
        marginTop: 10,
        paddingHorizontal: 25,
    },
    searchBarMock: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchBarText: {
        color: theme.colors.text.muted,
        marginLeft: 10,
        fontSize: 14,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '900',
        color: theme.colors.text.muted,
        letterSpacing: 2,
        marginBottom: 20,
        marginTop: 10,
    },
    horizScroll: {
        paddingRight: 20,
        paddingBottom: 10,
    },
    pill: {
        paddingHorizontal: 22,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 30,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    pillActive: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(0, 229, 255, 0.08)',
    },
    pillText: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        fontWeight: 'bold',
    },
    pillTextActive: {
        color: theme.colors.primary,
    },
    busCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    busIconContainer: {
        width: 52,
        height: 52,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
    },
    busIcon: {
        width: 35,
        height: 35,
        resizeMode: 'contain',
        tintColor: theme.colors.text.primary,
    },
    busInfo: {
        flex: 1,
    },
    busRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    busNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    busTime: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    busRoute: {
        fontSize: 13,
        color: theme.colors.text.muted,
        marginTop: 4,
    },
    cta: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: theme.colors.primary,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.premium,
    },
    ctaText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 2,
    },
    devContainer: {
        marginTop: 50,
        padding: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    devHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    devLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: theme.colors.text.muted,
        letterSpacing: 2.5,
    },
    devToggles: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 12,
    },
    devBtn: {
        flex: 1,
        height: 44,
        backgroundColor: '#1c1c1e',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    devBtnActive: {
        backgroundColor: theme.colors.primary + '22',
        borderColor: theme.colors.primary,
    },
    devBtnText: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    hintContainer: {
        padding: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hintText: {
        color: theme.colors.text.muted,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 15,
        lineHeight: 20,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.text.muted,
        fontSize: 14,
    }
});

export default SmartCommuteScreen;
