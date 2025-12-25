import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../../components/ui/theme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const StopsScreen = ({ navigation }) => {
    const mockStops = [
        { id: '1', name: 'Main Gate', dist: '0.2 km', time: '2 min' },
        { id: '2', name: 'Library Corner', dist: '0.8 km', time: '8 min' },
        { id: '3', name: 'Hostel Block A', dist: '1.5 km', time: '15 min' },
        { id: '4', name: 'Cafeteria South', dist: '1.9 km', time: '18 min' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Transit Network</Text>
            </View>
            
            <View style={styles.promo}>
                <Text style={styles.promoTitle}>NEARBY STOPS</Text>
            </View>

            <FlatList
                data={mockStops}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.item} activeOpacity={0.7}>
                        <View style={styles.iconBox}>
                            <Ionicons name="bus" size={20} color={theme.colors.primary} />
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.stopName}>{item.name}</Text>
                            <Text style={styles.stopDist}>{item.dist} • {item.time}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.1)" />
                    </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 25 },
    header: { 
        paddingTop: 60,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        marginRight: 20,
    },
    title: { 
        fontSize: 24, 
        fontWeight: '200', 
        color: theme.colors.text.primary,
        letterSpacing: -0.5
    },
    promo: {
        marginTop: 40,
        marginBottom: 20,
    },
    promoTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: theme.colors.text.muted,
        letterSpacing: 2,
    },
    item: { 
        paddingVertical: 20, 
        flexDirection: 'row', 
        alignItems: 'center',
    },
    iconBox: { 
        width: 48, 
        height: 48, 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    info: { flex: 1 },
    stopName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text.primary },
    stopDist: { color: theme.colors.text.muted, fontSize: 13, marginTop: 4 },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginLeft: 64
    }
});

export default StopsScreen;
