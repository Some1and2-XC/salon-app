import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from "../styles";
import { BackButton } from "../components/BackButton";

export function QRScreen({ route, navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const { appointment } = route.params;

    console.log(appointment);

    const qrValue = JSON.stringify({
        appointment
    });

    return (

        <View style={[commonUi.screen.pageMargins, commonUi.screen.pageInnerGaps, { alignItems: "center" }]}>

            <BackButton navigation={navigation} />

            <Text style={commonUi.card.kicker}>Check-in ready! Show this QR to the admin.</Text>

            <View style={commonUi.screen.centerWrap}>
                <QRCode value={qrValue} size={250} />
            </View>
        </View>
    );
}
