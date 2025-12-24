import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { getBuses, addBus, assignBusToSchedule } from '../../api/admin';

export default function AdminDashboardScreen() {
    const { logout, isDemo } = useAuth();
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newBusNumber, setNewBusNumber] = useState('');
    const [newRouteNumber, setNewRouteNumber] = useState('');

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            setLoading(true);
            if (isDemo) {
                // Mock Data
                setBuses([
                    { id: 1, busNumber: 'MP04-101', capacity: 40, status: 'IDLE' },
                    { id: 2, busNumber: 'MP04-202', capacity: 40, status: 'ACTIVE' },
                ]);
                setLoading(false);
                return;
            }

            const data = await getBuses();
            setBuses(data);
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Could not fetch buses');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBus = async () => {
        if (!newBusNumber) {
            Alert.alert("Error", "Please fill required fields");
            return;
        }

        if (isDemo) {
            const newBus = {
                id: Math.random(),
                busNumber: newBusNumber,
                capacity: 40,
                status: 'IDLE'
            };
            setBuses([...buses, newBus]);
            Alert.alert("Success", "Bus added (Demo)");
            setModalVisible(false);
            resetForm();
            return;
        }

        try {
            const busData = {
                busNumber: newBusNumber,
                capacity: 40, // Default capacity
                status: 'IDLE'
            };

            await addBus(busData);
            Alert.alert("Success", "Bus added successfully");

            setModalVisible(false);
            resetForm();
            fetchBuses();
        } catch (e) {
            Alert.alert("Error", "Failed to add bus");
        }
    };

    const openAddModal = () => {
        setNewBusNumber('');
        setNewRouteNumber('');
        setModalVisible(true);
    };

    const resetForm = () => {
        setNewBusNumber('');
        setNewRouteNumber('');
    };


    /* Assign Button */
    const handleAssignBus = async (busId) => {
        Alert.prompt(
            "Assign to Schedule",
            "Enter Schedule ID:",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Assign",
                    onPress: async (scheduleId) => {
                        try {
                            if (isDemo) {
                                Alert.alert("Success", `Bus ${busId} assigned to Schedule ${scheduleId} (Demo)`);
                                return;
                            }
                            await assignBusToSchedule(scheduleId, busId);
                            Alert.alert("Success", `Bus ${busId} assigned to Schedule ${scheduleId}`);
                            fetchBuses(); // Refresh to see status changes if any
                        } catch (e) {
                            Alert.alert("Error", e.message || "Failed to assign bus");
                        }
                    }
                }
            ],
            "plain-text"
        );
    };

    const renderBusItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.busIconContainer}>
                    <Text style={styles.busIcon}>🚌</Text>
                </View>
                <View style={styles.busInfo}>
                    <Text style={styles.busNumber}>{item.busNumber}</Text>
                    <Text style={styles.busSubtext}>Capacity: {item.capacity} • ID: {item.id}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive]}>
                    <Text style={styles.statusText}>{item.status || 'IDLE'}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.assignButton} onPress={() => handleAssignBus(item.id)}>
                <Text style={styles.assignButtonText}>Assign to Schedule</Text>
            </TouchableOpacity>
        </View>
    );


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Admin Dashboard</Text>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.actions}>
                    <Text style={styles.subtitle}>Fleet Management</Text>
                    <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                        <Text style={styles.addButtonText}>+ Add Bus</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#3b82f6" />
                ) : (
                    <FlatList
                        data={buses}
                        renderItem={renderBusItem}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={styles.emptyText}>No buses found.</Text>}
                    />
                )}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Bus</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Bus Number (e.g. MP04-1234)"
                            value={newBusNumber}
                            onChangeText={setNewBusNumber}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Route Number (e.g. 12, 23)"
                            value={newRouteNumber}
                            onChangeText={setNewRouteNumber}
                            keyboardType="numeric"
                        />


                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveBus}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#334155'
    },
    addButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14
    },
    list: {
        paddingBottom: 20
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    busNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b'
    },
    busIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    busIcon: {
        fontSize: 24
    },
    busInfo: {
        flex: 1
    },
    busSubtext: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '500'
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#f1f5f9'
    },
    statusActive: {
        backgroundColor: '#dcfce7'
    },
    statusInactive: {
        backgroundColor: '#f1f5f9'
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569'
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 40,
        fontSize: 16
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        padding: 24
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 24,
        textAlign: 'center',
        color: '#0f172a'
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        color: '#0f172a'
    },
    modalActions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 12
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        alignItems: 'center'
    },
    saveButton: {
        flex: 1,
        padding: 16,
        backgroundColor: '#2563eb',
        borderRadius: 12,
        alignItems: 'center'
    },
    cancelButtonText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 16
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16
    },
    assignButton: {
        marginTop: 16,
        backgroundColor: '#8b5cf6',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center'
    },
    assignButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
        marginRight: 4
    },
    iconButton: {
        padding: 10,
        marginLeft: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    iconButtonText: {
        fontSize: 16
    }
});

