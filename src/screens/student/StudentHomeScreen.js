import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Dimensions, Platform, ScrollView, Animated, Switch } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../components/ui/theme";
import { StatusBar } from "expo-status-bar";
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { studentAPI } from '../../services/api';

const { width, height } = Dimensions.get("window");

const StudentHomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commuteData, setCommuteData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [manualLocationName, setManualLocationName] = useState('OUTSIDE');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(height * 0.4)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
          setError('Location access required');
          return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }).start();

      fetchCommuteStatus(loc.coords.latitude, loc.coords.longitude);
    })();
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

  const uberDarkMapStyle = [
    { "elementType": "geometry", "stylers": [{"color": "#212121"}] },
    { "elementType": "labels.icon", "stylers": [{"visibility": "off"}] },
    { "elementType": "labels.text.fill", "stylers": [{"color": "#757575"}] },
    { "elementType": "labels.text.stroke", "stylers": [{"color": "#212121"}] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{"color": "#757575"}] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{"color": "#121212"}] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{"color": "#2c2c2c"}] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{"color": "#000000"}] }
  ];

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
        <BlurView intensity={20} tint="dark" style={styles.glassCard}>
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
        </BlurView>
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
    if (!isIncoming && !selectedDestination) return null;

    const buses = commuteData.availableBuses || [];

    return (
        <View style={styles.section}>
            <Text style={styles.sectionHeader}>RECOMMENDED VEHICLES</Text>
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
      <StatusBar style="light" />
      
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            customMapStyle={uberDarkMapStyle}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0122,
              longitudeDelta: 0.0121,
            }}
          >
            <Marker coordinate={location}>
              <View style={styles.userMarker}>
                <View style={styles.userMarkerInner} />
              </View>
            </Marker>
            
            <Marker coordinate={{ latitude: 23.259933, longitude: 77.412615 }}>
               <View style={styles.collegeMarker}>
                  <Ionicons name="school" size={12} color={theme.colors.primary} />
               </View>
            </Marker>
          </MapView>
        ) : (
          <View style={styles.loader}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}
      </View>

      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity 
            style={styles.menuBtn}
            onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.interactionLayer}>
          <ScrollView showsVerticalScrollIndicator={false}>
              {renderPhaseTitle()}
              {renderRoutePanel()}
              {renderDestinationPicker()}
              {renderBusList()}

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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactionLayer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
    maxHeight: height * 0.55,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  phaseHeader: {
    paddingHorizontal: 25,
    paddingTop: 10,
    marginBottom: 5,
  },
  phaseMainTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: "#FFF",
    letterSpacing: -0.5,
  },
  phaseSubTitle: {
    fontSize: 12,
    color: theme.colors.text.muted,
    marginTop: 2,
    fontWeight: '600',
  },
  glassCard: {
    margin: 25,
    marginTop: 15,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  tripLineContainer: {
    flexDirection: 'row',
  },
  tripDots: {
    alignItems: 'center',
    paddingVertical: 10,
    marginRight: 15,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  square: {
    width: 6,
    height: 6,
  },
  tripDetails: {
    flex: 1,
  },
  tripPoint: {
    height: 40,
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    color: theme.colors.text.muted,
    fontWeight: '900',
    letterSpacing: 1,
  },
  value: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  activeValue: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 10,
  },
  section: {
    paddingHorizontal: 25,
    marginBottom: 20
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.text.muted,
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  horizScroll: {
    paddingRight: 20,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  pillActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  pillText: {
    color: theme.colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: theme.colors.primary,
  },
  busCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  busIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: "#FFF",
  },
  busTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  busRoute: {
    fontSize: 12,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.text.muted,
    fontSize: 12,
  },
  devSection: {
      padding: 25,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.05)',
      marginTop: 20
  },
  devHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  devLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.colors.text.muted,
      letterSpacing: 1
  },
  devRow: {
      flexDirection: 'row',
      marginTop: 15,
      gap: 10
  },
  devBtn: {
      flex: 1,
      height: 40,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.03)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'transparent'
  },
  devBtnActive: {
      borderColor: theme.colors.primary,
      backgroundColor: 'rgba(0, 229, 255, 0.05)'
  },
  devBtnText: {
      color: "#FFF",
      fontSize: 12,
      fontWeight: '600'
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    borderWidth: 1.5,
    borderColor: '#FFF'
  },
  collegeMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  }
});

export default StudentHomeScreen;