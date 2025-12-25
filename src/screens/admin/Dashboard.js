import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { GlassCard } from '../../components/ui/GlassCard';
import { COLORS, SHADOWS } from '../../components/ui/theme';

const AdminDashboard = ({ navigation }) => {
    const { logout } = useAuth();
    const [buses, setBuses] = React.useState([]);

    React.useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            const data = await adminAPI.getBuses();
            setBuses(data);
        } catch (e) {
            console.error("Failed to fetch buses", e);
        }
    };
    
    const renderBusItem = ({ item }) => (
        <GlassCard style={styles.card} intensity={30}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.busNumber}>{item.busNumber || 'BUS-01'}</Text>
                    <Text style={styles.routeText}>{item.numberPlate || 'DL-01-AB-1234'}</Text>
                </View>
                <View style={[styles.badge]}>
                    <Text style={styles.badgeText}>{item.capacity || 40} Seats</Text>
                </View>
            </View>
            <View style={styles.cardActions}>
                 <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>Edit</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.actionBtnDelete}>
                    <Text style={styles.actionTextDelete}>Delete</Text>
                 </TouchableOpacity>
            </View>
        </GlassCard>
    );

    return (
        <GradientBackground>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Control Center</Text>
                        <Text style={styles.title}>Fleet Manager</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>EXIT</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <GlassCard style={styles.statCard} intensity={20}>
                        <Text style={styles.statNumber}>{buses.length}</Text>
                        <Text style={styles.statLabel}>Active Fleet</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard} intensity={20}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Total Drivers</Text>
                    </GlassCard>
                </View>

                <Text style={styles.sectionTitle}>Manage Buses</Text>
                {buses.length > 0 ? (
                    <FlatList
                        data={buses}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderBusItem}
                        scrollEnabled={false}
                    />
                ) : (
                    <GlassCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No buses found in fleet.</Text>
                    </GlassCard>
                )}
            </ScrollView>

            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => navigation.navigate('RouteBuilder')}
                activeOpacity={0.9}
            >
                <Text style={styles.fabText}>+ NEW BUS</Text>
            </TouchableOpacity>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    scroll: { padding: 20, paddingBottom: 120 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 40 },
    greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    logoutBtn: { backgroundColor: 'rgba(231, 76, 60, 0.2)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    logoutText: { color: '#ff7675', fontWeight: 'bold', fontSize: 12 },
    
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statCard: { padding: 20, width: '48%', alignItems: 'center' },
    statNumber: { fontSize: 28, fontWeight: 'bold', color: COLORS.accent },
    statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 5, fontWeight: '600' },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#fff', opacity: 0.9 },
    card: { padding: 20, marginBottom: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    busNumber: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    badge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.accent },
    routeText: { marginTop: 4, color: 'rgba(255,255,255,0.6)', fontSize: 14 },
    cardActions: { flexDirection: 'row', marginTop: 20, gap: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 15 },
    actionBtn: { },
    actionBtnDelete: { },
    actionText: { color: COLORS.accent, fontWeight: 'bold' },
    actionTextDelete: { color: '#ff7675', fontWeight: 'bold' },

    emptyCard: { padding: 40, alignItems: 'center' },
    emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },

    fab: { 
        position: 'absolute', bottom: 40, right: 20, 
        backgroundColor: COLORS.accent, paddingVertical: 18, paddingHorizontal: 30, 
        borderRadius: 20, ...SHADOWS.glow,
    },
    fabText: { color: '#fff', fontWeight: '900', letterSpacing: 1 }
});

export default AdminDashboard;
