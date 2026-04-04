import React from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { sty } from "../styles";

export function QRScreen({ route }) {

    const { appointment } = route.params;

    const qrValue = JSON.stringify({
        appointment
    });

    return (
        <View style={sty.container}>
            <Text>Check-in ready! Show this QR to the admin.</Text>

            <View style={sty.containerCentered}>
                <QRCode value={qrValue} size={250} />
            </View>
        </View>
    );
}