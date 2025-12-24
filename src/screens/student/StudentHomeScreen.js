import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Alert, ScrollView, Animated, PanResponder, Dimensions, Platform, StatusBar } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { getNearbyStops, getMorningBuses } from "../../api/student";
import { connectWebSocket, subscribeToBus } from "../../utils/websocket";

const { width, height } = Dimensions.get("window");
const SHEET_MAX_HEIGHT = height * 0.6;
const SHEET_MIN_HEIGHT = 80;
const SNAP_THRESHOLD = 50;

const LOCATION_COORDS = {
  minal: { latitude: 23.268104, longitude: 77.457846 },
  narela: { latitude: 23.270561, longitude: 77.467675 },
  indrapuri: { latitude: 23.249997, longitude: 77.466901 },
  oriental: { latitude: 23.248846, longitude: 77.502161 },
};

const PICKUP_LOCATIONS = [
  { label: "Minal Residency", value: "minal", sub: "Pickup Point" },
  { label: "Narela Shankari", value: "narela", sub: "Pickup Point" },
  { label: "Indrapuri Sector C", value: "indrapuri", sub: "Pickup Point" },
  { label: "Oriental College", value: "oriental", sub: "Drop-off Point" },
];

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImYzN2QyMzQyYWZlZTRjZTJiZmI1ZWI3YjdjOGQ0NmM4IiwiaCI6Im11cm11cjY0In0=";

async function fetchORSRoute(start, end) {
  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start.longitude},${start.latitude}&end=${end.longitude},${end.latitude}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`ORS API error: ${response.status}`);
    const data = await response.json();
    if (!data.features || !data.features[0] || !data.features[0].geometry) throw new Error("Invalid response from ORS");
    return data.features[0].geometry.coordinates.map(coord => ({ latitude: coord[1], longitude: coord[0] }));
  } catch (error) {
    console.warn("Routing failed, using straight line:", error);
    return [start, end];
  }
}

const LocationSelector = ({ selectedValue, onSelect, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <View style={styles.topBarContainer}>
      <View style={styles.searchBar}>
        <TouchableOpacity style={styles.searchButton} onPress={() => setIsOpen(!isOpen)} activeOpacity={0.8}>
          <View style={styles.searchIconBg}>
            <Text style={styles.searchIcon}>📍</Text>
          </View>
          <View style={styles.searchTextContainer}>
            <Text style={styles.searchLabel}>Current Location</Text>
            <Text style={styles.searchValue}>{selectedOption ? selectedOption.label : "Select Pickup Point"}</Text>
          </View>
          <Text style={styles.dropdownIcon}>{isOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>
      </View>

      {isOpen && (
        <View style={styles.dropdownContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.dropdownItem, selectedValue === option.value && styles.dropdownItemActive]}
              onPress={() => { onSelect(option.value); setIsOpen(false); }}
            >
              <View style={[styles.dropdownIconParams, selectedValue === option.value ? styles.iconActive : styles.iconInactive]} />
              <View>
                <Text style={[styles.dropdownItemText, selectedValue === option.value && styles.activeText]}>{option.label}</Text>
                <Text style={styles.dropdownItemSub}>{option.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function StudentHomeScreen() {
  const { logout, isDemo } = useAuth();
  const mapRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickupLocation, setPickupLocation] = useState("");
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState({});
  const [expandedBusId, setExpandedBusId] = useState(null);

  const panY = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);

  const bottomSheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        panY.setOffset(lastGestureDy.current);
        panY.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        panY.flattenOffset();
        let currentPos = lastGestureDy.current + gestureState.dy;

        let targetPos = 0;
        if (currentPos > -SNAP_THRESHOLD) {
          targetPos = 0;
        } else {
          targetPos = -SHEET_MAX_HEIGHT + SHEET_MIN_HEIGHT;
        }

        if (currentPos > 0) targetPos = 0;

        Animated.spring(panY, {
          toValue: targetPos,
          tension: 50,
          friction: 8,
          useNativeDriver: false
        }).start(() => {
          lastGestureDy.current = targetPos;
        });
      }
    })
  ).current;

  const bottomSheetStyle = {
    transform: [{
      translateY: panY.interpolate({
        inputRange: [-SHEET_MAX_HEIGHT + SHEET_MIN_HEIGHT, 0],
        outputRange: [-SHEET_MAX_HEIGHT + SHEET_MIN_HEIGHT, 0],
        extrapolate: 'clamp'
      })
    }]
  };

  const getUserLocation = async () => {
    try {
      if (isDemo) {
        const mockLoc = { latitude: 23.2599, longitude: 77.4126 };
        setUserLocation(mockLoc);
        setLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location needed for navigation.");
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation(location.coords);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => { getUserLocation(); }, []);

  useEffect(() => {
    if (pickupLocation) {
      const today = new Date().toISOString().split('T')[0];
      getMorningBuses(pickupLocation, today)
        .then(data => {
          if (Array.isArray(data)) {
            if (data.length === 0 && isDemo) {
              setBuses([
                { id: 101, name: 'MP04-Demo-1', eta: 12, distance: 4.5, latitude: 23.268104, longitude: 77.457846, hasLeftPickup: false },
                { id: 102, name: 'MP04-Demo-2', eta: 5, distance: 1.2, latitude: 23.250000, longitude: 77.460000, hasLeftPickup: true },
              ]);
            } else {
              const mapped = data.map(b => ({
                id: b.busId || b.id || Math.random(),
                name: b.busNumber,
                eta: b.etaMinutes || 0,
                latitude: b.latitude,
                longitude: b.longitude,
                distance: 0,
                hasLeftPickup: false
              }));
              setBuses(mapped);
            }
          } else {
            setBuses([]);
          }
        })
        .catch(err => setBuses([]));
    } else {
      setBuses([]);
    }
  }, [pickupLocation]);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!pickupLocation || buses.length === 0) return;
      const newRoutes = {};
      for (const bus of buses) {
        const pickup = LOCATION_COORDS[pickupLocation] || userLocation;
        if (pickup && bus.latitude) {
          const route = await fetchORSRoute(pickup, { latitude: bus.latitude, longitude: bus.longitude });
          newRoutes[bus.id] = route;
        }
      }
      setRoutes(newRoutes);
    };
    fetchRoutes();
  }, [buses, pickupLocation]);

  const handleLocateMe = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015
      });
    }
  };

  const handleBusPress = (bus) => {
    setExpandedBusId(expandedBusId === bus.id ? null : bus.id);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: bus.latitude,
        longitude: bus.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Locating you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude || 23.2599,
          longitude: userLocation?.longitude || 77.4126,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
        showsUserLocation={!isDemo}
        showsMyLocationButton={false}
      >
        {userLocation && isDemo && <Marker coordinate={userLocation} title="You" pinColor="#3b82f6" />}

        {pickupLocation && LOCATION_COORDS[pickupLocation] && (
          <Marker coordinate={LOCATION_COORDS[pickupLocation]} title="Pickup" pinColor="#10b981" />
        )}

        {buses.map(bus => (
          <React.Fragment key={bus.id}>
            <Marker
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              title={bus.name}
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerIcon}>🚌</Text>
              </View>
            </Marker>
            {routes[bus.id] && (
              <Polyline coordinates={routes[bus.id]} strokeColor="#3b82f6" strokeWidth={4} />
            )}
          </React.Fragment>
        ))}
      </MapView>

      <SafeAreaView style={styles.safeAreaTop} pointerEvents="box-none">
        <LocationSelector
          selectedValue={pickupLocation}
          onSelect={setPickupLocation}
          options={PICKUP_LOCATIONS}
        />

        <TouchableOpacity style={styles.profileButton} onPress={logout}>
          <Text style={styles.profileIcon} >🚪</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleLocateMe}>
          <Text style={styles.fabIcon}>🎯</Text>
        </TouchableOpacity>
      </View>


      {buses.length > 0 && (
        <Animated.View style={[styles.bottomSheet, bottomSheetStyle]}>
          <View {...bottomSheetPanResponder.panHandlers} style={styles.dragHandleArea}>
            <View style={styles.dragIndicator} />
          </View>

          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>{buses.length} Buses Available</Text>

            <ScrollView
              style={styles.busList}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {buses.map(bus => (
                <TouchableOpacity
                  key={bus.id}
                  style={styles.busCard}
                  activeOpacity={0.9}
                  onPress={() => handleBusPress(bus)}
                >
                  <View style={styles.busHeader}>
                    <View style={styles.busIconBadge}>
                      <Text>🚌</Text>
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 12 }}>
                      <Text style={styles.busName}>{bus.name}</Text>
                      <Text style={styles.busRoute}>Towards College</Text>
                    </View>
                    <View style={[styles.statusBadge, bus.hasLeftPickup ? styles.statusLeft : styles.statusOnTime]}>
                      <Text style={[styles.statusText, bus.hasLeftPickup ? styles.textLeft : styles.textOnTime]}>
                        {bus.hasLeftPickup ? "Departed" : "On Time"}
                      </Text>
                    </View>
                  </View>

                  {expandedBusId === bus.id && (
                    <View style={styles.busDetails}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>ETA</Text>
                        <Text style={styles.detailValue}>{bus.eta} min</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Distance</Text>
                        <Text style={styles.detailValue}>{bus.distance ? bus.distance + ' km' : 'Calculating...'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <Text style={styles.detailValue}>Live 🟢</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      )}

      {pickupLocation && buses.length === 0 && (
        <View style={styles.emptyToast}>
          <Text style={styles.emptyToastText}>⚠️ No buses active for this route yet.</Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  map: { width: '100%', height: '100%' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748b', fontWeight: '500' },

  safeAreaTop: { position: 'absolute', top: Platform.OS === 'ios' ? 0 : 20, left: 0, right: 0, paddingHorizontal: 16, zIndex: 100 },

  topBarContainer: { marginTop: 10, flexDirection: 'column' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10,
    elevation: 5,
    marginRight: 60
  },
  searchButton: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  searchIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  searchIcon: { fontSize: 18 },
  searchTextContainer: { flex: 1 },
  searchLabel: { fontSize: 10, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  searchValue: { fontSize: 15, color: '#0f172a', fontWeight: '700' },
  dropdownIcon: { fontSize: 12, color: '#94a3b8' },

  dropdownContainer: {
    backgroundColor: 'white', marginTop: 8, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
    marginRight: 60
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemActive: { backgroundColor: '#f8fafc' },
  dropdownIconParams: { width: 10, height: 10, borderRadius: 5, marginRight: 16 },
  iconActive: { backgroundColor: '#2563eb' },
  iconInactive: { backgroundColor: '#cbd5e1' },
  dropdownItemText: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  activeText: { color: '#2563eb', fontWeight: '700' },
  dropdownItemSub: { fontSize: 12, color: '#94a3b8' },

  profileButton: {
    position: 'absolute', right: 16, top: 10,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  profileIcon: { fontSize: 20 },

  fabContainer: { position: 'absolute', right: 16, bottom: SHEET_MIN_HEIGHT + 140, alignItems: 'center', gap: 12 },
  fab: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6
  },
  fabIcon: { fontSize: 24 },

  bottomSheet: {
    position: 'absolute', left: 0, right: 0, bottom: -SHEET_MAX_HEIGHT + SHEET_MIN_HEIGHT + 85,
    height: SHEET_MAX_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 15,
  },
  dragHandleArea: { height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  dragIndicator: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#cbd5e1', marginTop: 8 },
  sheetContent: { flex: 1, paddingHorizontal: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 16, marginTop: 8 },
  busList: { flex: 1 },

  busCard: {
    backgroundColor: 'white', borderRadius: 20, marginBottom: 16, padding: 16,
    borderWidth: 1, borderColor: '#f1f5f9',
    shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2
  },
  busHeader: { flexDirection: 'row', alignItems: 'center' },
  busIconBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  busName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  busRoute: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusOnTime: { backgroundColor: '#dcfce7' },
  statusLeft: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 12, fontWeight: '700' },
  textOnTime: { color: '#166534' },
  textLeft: { color: '#991b1b' },

  busDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  detailItem: { alignItems: 'center', flex: 1 },
  detailLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '700', color: '#0f172a' },

  markerContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', borderWidth: 3, borderColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  markerIcon: { fontSize: 18 },

  emptyToast: { position: 'absolute', bottom: 120, alignSelf: 'center', backgroundColor: 'rgba(15,23,42,0.9)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  emptyToastText: { color: 'white', fontWeight: '600', fontSize: 14 }
});