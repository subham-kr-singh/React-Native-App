import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RouteBuilder = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Route Builder Screen</Text>
             <Text style={styles.subText}>Map interface to draw routes and assign stops would go here.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    text: { fontSize: 20, fontWeight: 'bold' },
    subText: { marginTop: 10, color: '#666' }
});

export default RouteBuilder;
