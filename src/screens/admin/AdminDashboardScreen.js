import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, SafeAreaView } from 'react-native';
import { theme } from '../../components/ui/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
const { getBuses, getRoutes, createSchedule, addBus } = adminAPI;
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';

export default function AdminDashboardScreen() {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('routes'); // 'routes' or 'buses'
    const [items, setItems] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [selectedBusId, setSelectedBusId] = useState(null);

    // Add Bus Modal State
    const [addBusModalVisible, setAddBusModalVisible] = useState(false);
    const [newBusNumber, setNewBusNumber] = useState('');

    useEffect(() => {
        fetchData();
        if (activeTab === 'routes') {
            fetchBusesOnly();
        }
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'routes') {
                const data = await getRoutes();
                setItems(data);
            } else {
                await fetchBusesOnly();
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Check server connectivity");
        } finally {
            setLoading(false);
        }
    };

    const fetchBusesOnly = async () => {
        try {
            const data = await getBuses();
            setBuses(data);
            if (activeTab === 'buses') setItems(data);
        } catch (e) {
            console.error("Failed to fetch buses");
        }
    };

    const handleAssign = async () => {
        if (!selectedRoute || !selectedBusId) return;
        try {
            await createSchedule(selectedRoute.id, selectedBusId, selectedRoute.direction);
            Alert.alert("Success", "Bus assigned to route");
            setAssignModalVisible(false);
            fetchData();
        } catch (e) {
            Alert.alert("Error", "Fail to assign");
        }
    };

    const handleAddBus = async () => {
        if (!newBusNumber) return;
        try {
            await addBus({ busNumber: newBusNumber, capacity: 40, status: 'IDLE' });
            setAddBusModalVisible(false);
            setNewBusNumber('');
            fetchBusesOnly();
        } catch (e) {
            Alert.alert("Error", "Fail to add bus");
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.title}>Network Intelligence</Text>
                <Text style={styles.subtitle}>Traffic Control Hub • Online</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                <Ionicons name="power" size={20} color={theme.colors.error} />
            </TouchableOpacity>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsRow}>
            <BlurView intensity={10} tint="dark" style={styles.statCard}>
                <Ionicons name="git-network-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.statVal}>{items.length}</Text>
                <Text style={styles.statLab}>{activeTab === 'routes' ? 'ACTIVE ROUTES' : 'TOTAL BUSES'}</Text>
            </BlurView>
            <BlurView intensity={10} tint="dark" style={styles.statCard}>
                <Ionicons name="pulse" size={20} color={theme.colors.success} />
                <Text style={styles.statVal}>84%</Text>
                <Text style={styles.statLab}>EFFICIENCY</Text>
            </BlurView>
        </View>
    );

    const renderRouteItem = ({ item }) => (
        <View style={styles.eliteCard}>
            <View style={styles.eliteCardIcon}>
                <Ionicons name="map-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.eliteCardContent}>
                <Text style={styles.eliteItemName}>{item.name}</Text>
                <Text style={styles.eliteItemMeta}>{item.direction} • {item.stops?.length || 0} active stops</Text>
            </View>
            <TouchableOpacity style={styles.eliteActionBtn} onPress={() => { setSelectedRoute(item); setAssignModalVisible(true); }}>
                <Text style={styles.eliteActionText}>ASSIGN</Text>
            </TouchableOpacity>
        </View>
    );

    const renderBusItem = ({ item }) => (
        <View style={styles.eliteCard}>
            <View style={[styles.eliteCardIcon, { backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                <Ionicons name="bus-outline" size={22} color="#FFF" />
            </View>
            <View style={styles.eliteCardContent}>
                <Text style={styles.eliteItemName}>{item.busNumber}</Text>
                <Text style={styles.eliteItemMeta}>Capacity: {item.capacity} • ID: {item.id}</Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: item.status === 'IDLE' ? theme.colors.text.muted : theme.colors.success }]}>
                <Text style={[styles.statusText, { color: item.status === 'IDLE' ? theme.colors.text.muted : theme.colors.success }]}>{item.status}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            {renderHeader()}
            
            <View style={styles.tabWrapper}>
                <TouchableOpacity 
                    style={[styles.eliteTab, activeTab === 'routes' && styles.eliteTabActive]} 
                    onPress={() => setActiveTab('routes')}
                >
                    <Text style={[styles.eliteTabText, activeTab === 'routes' && styles.eliteTabTextActive]}>TRANSIT ROUTES</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.eliteTab, activeTab === 'buses' && styles.eliteTabActive]} 
                    onPress={() => setActiveTab('buses')}
                >
                    <Text style={[styles.eliteTabText, activeTab === 'buses' && styles.eliteTabTextActive]}>FLEET ASSETS</Text>
                </TouchableOpacity>
            </View>

            {renderStats()}

            <View style={styles.mainContent}>
                {activeTab === 'buses' && (
                    <TouchableOpacity style={styles.addBtn} onPress={() => setAddBusModalVisible(true)}>
                        <Ionicons name="add" size={20} color="#000" />
                        <Text style={styles.addBtnText}>REGISTER NEW VEHICLE</Text>
                    </TouchableOpacity>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{marginTop: 50}} />
                ) : (
                    <FlatList
                        data={items}
                        renderItem={activeTab === 'routes' ? renderRouteItem : renderBusItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 150 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Premium Modals */}
            <Modal visible={assignModalVisible} transparent animationType="fade">
                <BlurView intensity={30} tint="dark" style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Assign Vehicle</Text>
                        <Text style={styles.modalSubtitle}>Route: {selectedRoute?.name}</Text>
                        
                        <FlatList
                            data={buses.filter(b => b.status === 'IDLE')}
                            keyExtractor={b => b.id.toString()}
                            style={{ maxHeight: 250, marginVertical: 20 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[styles.oPill, selectedBusId === item.id && styles.oPillSelected]}
                                    onPress={() => setSelectedBusId(item.id)}
                                >
                                    <Text style={[styles.oText, selectedBusId === item.id && {color: '#FFF'}]}>{item.busNumber}</Text>
                                    {selectedBusId === item.id && <Ionicons name="checkmark-circle" size={18} color="#FFF" />}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyMsg}>No idle buses available</Text>}
                        />

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.mBtnCancel} onPress={() => setAssignModalVisible(false)}>
                                <Text style={styles.mBtnText}>CLOSE</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.mBtnConfirm} onPress={handleAssign}>
                                <Text style={[styles.mBtnText, {color: '#000'}]}>CONFIRM</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>

            {/* Add Bus Modal */}
            <Modal visible={addBusModalVisible} transparent animationType="fade">
                <BlurView intensity={30} tint="dark" style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>New Vehicle</Text>
                        <TextInput 
                            placeholder="Vehicle Number (e.g. ORI-01)"
                            placeholderTextColor={theme.colors.text.muted}
                            style={styles.input}
                            value={newBusNumber}
                            onChangeText={setNewBusNumber}
                        />
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.mBtnCancel} onPress={() => setAddBusModalVisible(false)}>
                                <Text style={styles.mBtnText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.mBtnConfirm} onPress={handleAddBus}>
                                <Text style={[styles.mBtnText, {color: '#000'}]}>ADD</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingTop: 60,
        paddingBottom: 25,
    },
    title: {
        fontSize: 26,
        fontWeight: '300',
        color: theme.colors.text.primary,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 12,
        color: theme.colors.text.muted,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginTop: 4,
    },
    logoutBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    tabWrapper: {
        flexDirection: 'row',
        paddingHorizontal: 25,
        marginBottom: 25,
        gap: 12,
    },
    eliteTab: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    eliteTabActive: {
        backgroundColor: theme.colors.primary + '11',
        borderColor: theme.colors.primary,
    },
    eliteTabText: {
        fontSize: 11,
        fontWeight: '900',
        color: theme.colors.text.muted,
        letterSpacing: 1,
    },
    eliteTabTextActive: {
        color: theme.colors.primary,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 25,
        marginBottom: 30,
        gap: 15,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    statVal: {
        fontSize: 28,
        fontWeight: '300',
        color: theme.colors.text.primary,
        marginTop: 15,
        letterSpacing: -1,
    },
    statLab: {
        fontSize: 10,
        fontWeight: '900',
        color: theme.colors.text.muted,
        letterSpacing: 1.5,
        marginTop: 4,
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 25,
    },
    addBtn: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary,
        height: 54,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        boxShadow: '0 8px 20px rgba(0, 229, 255, 0.2)',
    },
    addBtnText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 1.5,
        marginLeft: 10,
    },
    eliteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    eliteCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(0, 229, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
    },
    eliteCardContent: {
        flex: 1,
    },
    eliteItemName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    eliteItemMeta: {
        fontSize: 13,
        color: theme.colors.text.muted,
        marginTop: 4,
        fontWeight: '500',
    },
    eliteActionBtn: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    eliteActionText: {
        fontSize: 11,
        fontWeight: '900',
        color: theme.colors.primary,
        letterSpacing: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        padding: 30,
    },
    modalContent: {
        backgroundColor: '#1c1c1e',
        borderRadius: 24,
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 25,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 20,
        color: '#FFF',
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    mBtnCancel: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
    },
    mBtnConfirm: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
    },
    mBtnText: {
        fontWeight: 'bold',
        fontSize: 13,
        color: theme.colors.text.secondary,
    },
    modalSubtitle: {
        fontSize: 13,
        color: theme.colors.text.muted,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 15
    },
    oPill: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        marginBottom: 8,
    },
    oPillSelected: {
        backgroundColor: theme.colors.primary,
    },
    oText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text.secondary,
    },
});
