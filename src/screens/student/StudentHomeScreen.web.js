import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, ScrollView, Animated, Switch, ActivityIndicator } from 'react-native';
import { theme } from '../../components/ui/theme';
import { Ionicons } from '@expo/vector-icons';
import { studentAPI } from '../../services/api';

const { height } = Dimensions.get('window');

const StudentHomeScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [commuteData, setCommuteData] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [testMode, setTestMode] = useState(false);
    const [manualLocationName, setManualLocationName] = useState('OUTSIDE');
    
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        }).start();
        
        // Mocking user location for web
        fetchCommuteStatus(23.2324, 77.4303);
    }, []);

    useEffect(() => {
        if (testMode) {
            const lat = manualLocationName === 'INSIDE' ? 23.259933 : 23.2324;
            const lng = manualLocationName === 'INSIDE' ? 77.412615 : 77.4303;
            fetchCommuteStatus(lat, lng);
        }
    }, [testMode, manualLocationName]);

    const fetchCommuteStatus = async (lat, lng) => {
        setLoading(true);
        try {
            const data = await studentAPI.getCommuteStatus(lat, lng);
            setCommuteData(data);
            if (data.direction === 'INCOMING') {
                setSelectedDestination('College');
            }
        } catch (err) {
            console.error("Fetch status failed", err);
        } finally {
            setLoading(false);
        }
    };

    const renderPhaseTitle = () => {
        if (!commuteData) return null;
        const isIncoming = commuteData.direction === 'INCOMING';
        return (
            <View style={styles.phaseHeader}>
                <Text style={styles.phaseMainTitle}>
                    {isIncoming ? "Heading to College" : "Leave College"}
                </Text>
                <Text style={styles.phaseSubTitle}>
                    {isIncoming ? "Detecting arrival at your stop" : "Where are you heading?"}
                </Text>
            </View>
        );
    };

    const renderRoutePanel = () => {
        if (!commuteData) return null;
        const isIncoming = commuteData.direction === 'INCOMING';

        return (
            <View style={styles.glassCard}>
                <View style={styles.tripLineContainer}>
                    <View style={styles.tripDots}>
                        <View style={[styles.dot, { backgroundColor: isIncoming ? theme.colors.primary : theme.colors.success }]} />
                        <View style={styles.line} />
                        <View style={[styles.square, { backgroundColor: isIncoming ? theme.colors.success : theme.colors.primary }]} />
                    </View>
                    <View style={styles.tripDetails}>
                        <View style={styles.tripPoint}>
                            <Text style={styles.label}>PICKUP</Text>
                            <Text style={styles.value} numberOfLines={1}>
                                {isIncoming ? (commuteData.nearestStop?.name || "Current Location") : "Oriental College"}
                            </Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.tripPoint}>
                            <Text style={styles.label}>DROPOFF</Text>
                            <Text style={[styles.value, isIncoming ? { color: theme.colors.success, fontWeight: 'bold' } : styles.activeValue]} numberOfLines={1}>
                                {isIncoming ? "Oriental College" : (selectedDestination || "Select Dropoff")}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderDestinationPicker = () => {
        if (!commuteData || commuteData.direction === 'INCOMING') return null;

        return (
            <View style={styles.section}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizScroll}>
                    {['Indrapuri', 'MP Nagar', 'Anand Nagar', 'Station', 'Bridge'].map((dest) => (
                        <TouchableOpacity 
                            key={dest}
                            style={[styles.pill, selectedDestination === dest && styles.pillActive]}
                            onPress={() => setSelectedDestination(dest)}
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
        if (!isIncoming && !selectedDestination) return null;

        const buses = commuteData.availableBuses || [];

        return (
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>RECOMMENDED VEHICLES</Text>
                {buses.length > 0 ? (
                    buses.map((bus, idx) => (
                        <TouchableOpacity key={idx} style={styles.busCard}>
                            <View style={styles.busIconContainer}>
                                <Ionicons name="bus" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.busInfo}>
                                <View style={styles.busRow}>
                                    <Text style={styles.busNumber}>{bus.busNumber}</Text>
                                    <Text style={styles.busTime}>{idx * 2 + 5} min</Text>
                                </View>
                                <Text style={styles.busRoute}>{bus.routeName}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No active buses for this route</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Elite Dark Map Mockup */}
            <View style={styles.mapSurface}>
                 <View style={styles.gridOverlay} />
                 <View style={styles.roadH} />
                 <View style={styles.roadV} />
                 
                 {/* User Point */}
                 <View style={[styles.mapPoint, { top: testMode && manualLocationName === 'INSIDE' ? '20%' : '50%', left: testMode && manualLocationName === 'INSIDE' ? '65%' : '42%' }]}>
                    <View style={styles.userDotCircle}>
                        <View style={styles.userDotInner} />
                    </View>
                 </View>

                 {/* College Point */}
                 <View style={[styles.mapPoint, { top: '20%', left: '65%' }]}>
                    <View style={styles.collegeBadge}>
                        <Ionicons name="school" size={14} color={theme.colors.primary} />
                    </View>
                 </View>
            </View>

            {/* Top Minimalist Menu */}
            <TouchableOpacity style={styles.fabMenu}>
                <Ionicons name="menu" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* Bottom Interaction Sheet */}
            <Animated.View style={[styles.sheet, { opacity: fadeAnim }]}>
                <View style={styles.dragBar} />
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {loading && !commuteData ? (
                        <ActivityIndicator color={theme.colors.primary} style={{ margin: 20 }} />
                    ) : (
                        <>
                            {renderPhaseTitle()}
                            {renderRoutePanel()}
                            {renderDestinationPicker()}
                            {renderBusList()}
                        </>
                    )}

                    {/* Dev Toggle */}
                    <View style={styles.devSection}>
                        <View style={styles.devHeader}>
                            <Text style={styles.devLabel}>AUTO-DETECT OVERRIDE</Text>
                            <Switch value={testMode} onValueChange={setTestMode} trackColor={{ false: '#333', true: theme.colors.primary }} />
                        </View>
                        {testMode && (
                            <View style={styles.devRow}>
                                <TouchableOpacity style={[styles.devBtn, manualLocationName === 'OUTSIDE' && styles.devBtnActive]} onPress={() => setManualLocationName('OUTSIDE')}>
                                    <Text style={styles.devBtnText}>Outside</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.devBtn, manualLocationName === 'INSIDE' && styles.devBtnActive]} onPress={() => setManualLocationName('INSIDE')}>
                                    <Text style={styles.devBtnText}>Inside</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    mapSurface: {
        flex: 1,
        backgroundColor: '#0A0A0C',
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    roadH: {
        position: 'absolute',
        top: '48%',
        width: '100%',
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    roadV: {
        position: 'absolute',
        left: '48%',
        width: 60,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    mapPoint: {
        position: 'absolute',
        alignItems: 'center',
        transition: 'all 0.5s ease'
    },
    userDotCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 229, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    userDotInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        borderWidth: 2,
        borderColor: '#000'
    },
    collegeBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    fabMenu: {
        position: 'absolute',
        top: 60,
        left: 30,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 30,
        paddingTop: 15,
        maxHeight: height * 0.6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    dragBar: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    phaseHeader: {
        marginBottom: 15,
    },
    phaseMainTitle: {
        fontSize: 24,
        fontWeight: '300',
        color: "#FFF",
        letterSpacing: -0.5,
    },
    phaseSubTitle: {
        fontSize: 13,
        color: theme.colors.text.muted,
        marginTop: 4,
        fontWeight: '500',
    },
    glassCard: {
        borderRadius: 20,
        padding: 24,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 25,
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
        marginBottom: 25,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '900',
        color: theme.colors.text.muted,
        letterSpacing: 2,
        marginBottom: 20,
    },
    horizScroll: {
        paddingRight: 20,
    },
    pill: {
        paddingHorizontal: 22,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 30,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
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
        color: "#FFF",
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
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.text.muted,
        fontSize: 13,
    },
    devSection: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
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
        letterSpacing: 2,
    },
    devRow: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 12,
    },
    devBtn: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    devBtnActive: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(0, 229, 255, 0.05)',
    },
    devBtnText: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default StudentHomeScreen;
