import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from "../styles";

export function QRScreen({ route }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const { appointment } = route.params;

    console.log(appointment);

    const qrValue = JSON.stringify({
        appointment
    });

    return (
        <View style={[commonUi.screen.pageMargins, commonUi.screen.pageInnerGaps, { flex: 1 }]}>
            <Text style={styles.label}>Check-in ready! Show this QR to the admin.</Text>

            <View style={commonUi.screen.centerWrap}>
                <QRCode value={qrValue} size={250} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
