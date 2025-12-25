import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { GlassCard } from '../../components/ui/GlassCard';

const ScheduleScreen = () => {
    return (
        <GradientBackground>
            <View style={styles.container}>
                <Text style={styles.header}>Dispatch Schedule</Text>
                
                <GlassCard style={styles.card} intensity={40}>
                    <Text style={styles.route}>#42 • Morning Pickup</Text>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeLabel}>DEPARTURE</Text>
                        <Text style={styles.timeValue}>07:30 AM</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statusRow}>
                        <View style={styles.dot} />
                        <Text style={styles.statusText}>On Track</Text>
                    </View>
                </GlassCard>

                <View style={styles.upcomingHeader}>
                    <Text style={styles.upcomingTitle}>Upcoming Today</Text>
                </View>
                
                <GlassCard style={styles.minorCard} intensity={20}>
                    <Text style={styles.minorRoute}>#89 • Evening Dropoff</Text>
                    <Text style={styles.minorTime}>04:30 PM</Text>
                </GlassCard>
            </View>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 60 },
    header: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
    card: { padding: 25, borderRadius: 24 },
    route: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
    timeContainer: { marginBottom: 20 },
    timeLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    timeValue: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#55efc4', marginRight: 10 },
    statusText: { color: '#55efc4', fontWeight: 'bold', fontSize: 14 },
    
    upcomingHeader: { marginTop: 40, marginBottom: 15 },
    upcomingTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 'bold' },
    minorCard: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    minorRoute: { color: '#fff', fontWeight: '600', fontSize: 16 },
    minorTime: { color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }
});

export default ScheduleScreen;
