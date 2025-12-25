import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Dimensions, TouchableOpacity, Text, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps'; // Using Default Provider (Free)
import { theme } from '../../components/ui/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Custom Dark Map Style (Free, no Google API Key needed for styles)
const DARK_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  // ... (keep full style array or truncate for brevity if known)
];

const MapScreen = () => {
    // Mock Data for now
    const [buses, setBuses] = useState([
        { busId: 'B101', latitude: 28.6139, longitude: 77.2090, heading: 45 }
    ]);

    const initialRegion = {
        latitude: 28.6139,
        longitude: 77.2090,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    if (Platform.OS === 'web') {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                 <StatusBar style="light" />
                 <Text style={{ color: theme.colors.text.primary, fontSize: 18, marginBottom: 10 }}>Map is not supported on Web</Text>
                 <Text style={{ color: theme.colors.text.secondary }}>Use the Smart Commute tab or a mobile device.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <MapView
                provider={PROVIDER_DEFAULT} 
                style={styles.map}
                initialRegion={initialRegion}
                customMapStyle={DARK_MAP_STYLE}
                showsUserLocation={true}
                showsCompass={false}
            >
                {buses.map(bus => (
                    <Marker 
                        key={bus.busId}
                        coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
                        title={`Bus #${bus.busId}`}
                        flat
                        rotation={bus.heading}
                    >
                         <View style={styles.busMarker}>
                            <Ionicons name="bus" size={20} color="#fff" />
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Floating Search Bar */}
            <View style={styles.topContainer}>
                <GlassCard style={styles.searchBar} intensity={40}>
                    <Ionicons name="search" size={20} color={theme.colors.text.secondary} style={{ marginRight: 10 }} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Where is my bus?"
                        placeholderTextColor={theme.colors.text.muted}
                        selectionColor={theme.colors.primary}
                    />
                </GlassCard>
            </View>

            {/* Bottom Card */}
            <View style={styles.bottomContainer}>
                <GlassCard style={styles.nearbyCard} intensity={80}>
                    <View style={styles.dragHandle} />
                    <Text style={styles.cardTitle}>Nearby Stops</Text>
                    
                    <TouchableOpacity style={styles.stopItem}>
                        <View style={styles.stopIconCircle}>
                            <Text style={{ fontSize: 18 }}>🚏</Text>
                        </View>
                        <View>
                            <Text style={styles.stopName}>Main Gate</Text>
                            <Text style={styles.stopDist}>200m • 2 min walk</Text>
                        </View>
                    </TouchableOpacity>
                </GlassCard>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    topContainer: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text.primary,
        fontWeight: '500',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 100, // Above TabBar
        left: 20,
        right: 20,
    },
    nearbyCard: {
        padding: 20,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 15,
    },
    stopItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    stopIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stopName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    stopDist: {
        fontSize: 13,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    busMarker: {
        backgroundColor: theme.colors.primary,
        padding: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    }
});

export default MapScreen;
